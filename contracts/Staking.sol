// SPDX-License-Identifier: UNLICENSED
// solhint-disable-next-line compiler-fixed, compiler-gt-0_8
pragma solidity ^0.8.0;

import "./interfaces/IErc20Min.sol";
import "./interfaces/IVotingPower.sol";
import "./utils/Utils.sol";

/// @title Staking
contract Staking is Utils, IVotingPower {

    /// @notice Staking token
    IErc20Min public immutable TOKEN;

    /// @notice {Delegator} contract
    address public immutable OWNER;

    /// @notice Block the contract deployed in
    uint256 public immutable START_BLOCK;

    /// @notice Minimum staking period in seconds
    uint32 public minStakingTime = 7 days;

    /// @notice Total token amount staked
    /// @dev Staking token has max total supply of 1e27
    uint96 public totalStaked = 0;

    // Special address to store global state with
    address private constant GLOBAL_ACCOUNT = address(0);

    // Stake
    struct Stake {
        address delegatee; // Address stake voting power is delegated to
        uint96 amount; // Amount of tokens on this stake
        uint32 stakeAt; // Time this stake was created at
        uint32 lockedTill; // Time this stake can be claimed at
        uint32 claimedAt; // Time this stake was claimed at (if 0, stake hasn't been claimed)
    }

    /// @dev Mapping from the staker address to stakes of the staker
    mapping(address => Stake[]) public stakes;

    /// @dev Voting power integrants for each account
    mapping(address => Power) public power;

    mapping(address => Snapshot[]) private snapshots;

    /// @dev New stake created
    event Stake(
        address indexed account,
        uint256 indexed stakeID,
        uint256 amount
    );

    /// @dev Stake claimed (i.e. "unstaked")
    event Claim(address indexed account, uint256 indexed stakeID);

    /// @dev Voting power delegated
    event Delegation(
        address indexed owner,
        address indexed _from,
        address indexed to,
        uint256 stakeID,
        uint256 amount
    );

    /// @dev {minStakingTime} updated
    event MinStakingTimeUpdated(uint256 _minStakingTime);

    /**
     * @notice Sets staking token, owner and
     * @param _stakingToken - Address of the {ZKPToken} contract
     * @param _owner - Address of the owner account
     */
    constructor(address _stakingToken, address _owner) {
        require(
            _stakingToken != address(0) && _owner != address(0),
            "Staking:C1"
        );
        TOKEN = IErc20Min(_stakingToken);
        OWNER = _owner;
        START_BLOCK = blockNow();
    }

    /**
     * @notice Stakes tokens
     * @dev This contract should be approve()'d for _amount
     * @param _amount - Amount to stake
     * @return stake ID
     */
    function stake(uint256 _amount) public returns (uint256) {
        return _stake(msg.sender, _amount);
    }

    /**
     * @notice Approves this contract to transfer _amount from _staker and stakes tokens
     * @dev This contract does not need to be approve()'d in advance - see EIP-2612
     * @param _staker - Address of the staker account
     * @param _amount - Amount to stake
     * @param v - signature from `staker`
     * @param r - signature from `staker`
     * @param s - signature from `staker`
     * @return stake ID
     */
    function permitAndStake(
        address _staker,
        uint256 _amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        TOKEN.permit(_staker, address(this), _amount, deadline, v, r, s);
        _stake(_staker, _amount);
    }

    /**
     * @notice Claims staked token
     * @param _stakeID - Stake to claim
     */
    function unstake(uint256 _stakeID) external {
        Stake memory stake = stakes[msg.sender][_stakeID];

        require(stake.stakeAt != 0, "Staking: Stake doesn't exist");
        require(stake.lockedTill < safe32TimeNow(), "Staking: Stake locked");
        require(stale.claimedAt == 0, "Staking: Stake claimed");

        if (stake.delegatee != address(0)) {
            _undelegatePower(stake.delegatee, msg.sender, stake.amount);
        }
        _removePower(msg.sender, stake.amount);

        stakes[msg.sender][_stakeID].claimedAt = safe32TimeNow();

        totalStaked = safe96(uint256(totalStaked) - uint256(stake.amount));

        emit Claim(msg.sender, _stakeID);

        // known contract - reentrancy guard and `safeTransfer` unneeded
        require(
            TOKEN.transfer(msg.sender, stake.amount),
            "Staking: transfer failed"
        );
    }

    /**
     * @notice Updates vote delegation
     * @param _stakeID - stake to delegate
     * @param _to - address to delegate to
     */
    function delegate(uint256 _stakeID, address _to) public {
        require(_to != GLOBAL_ACCOUNT, "Staking: Can't delegate to GLOBAL_ACCOUNT");

        Stake memory stake = stakes[msg.sender][_stakeID];
        require(stake.stakeAt != 0, "Staking: Stake doesn't exist");
        require(stake.claimedAt == 0, "Staking: Stake claimed");
        require(stake.delegatee != _to, "Staking: Already delegated");

        if (stake.delegatee == address(0)) {
            _delegatePower(msg.sender, _to, _stake.amount);
        } else {
            if (_to == msg.sender) {
                _undelegatePower(_stake.delegatee, msg.sender, _stake.amount);
            } else {
                _reDelegatePower(_stake.delegatee, _to, _stake.amount);
            }
        }

        emit Delegation(
            msg.sender,
            _stake.delegatee,
            _to,
            _stakeID,
            _stake.amount
        );

        stakes[msg.sender][_stakeID].delegatee = _to;
    }

    /**
     * @notice Delegates voting power of stake back to self
     * @param _stakeID - stake to delegate back to self
     */
    function undelegate(uint256 _stakeID) external {
        delegate(_stakeID, msg.sender);
    }

    /// @notice Returns number of stakes of given _account
    function stakesNum(address _account) external view returns (uint256) {
        return stakes[_account].length;
    }

    /// @inheritdoc IVotingPower
    function totalVotingPower() external view override returns (uint256) {
        Power memory _power = power[GLOBAL_ACCOUNT];
        return _power.own + _power.delegated;
    }

    /// @inheritdoc IVotingPower
    function totalPower() external view returns (Power memory) {
        return power[GLOBAL_ACCOUNT];
    }

    /// @inheritdoc IVotingPower
    function latestGlobalsSnapshotBlock() public view returns (uint256) {
        return latestAccountSnapshotBlockNum(GLOBAL_ACCOUNT);
    }

    /// @inheritdoc IVotingPower
    function latestSnapshotBlock(address _account)
        public
        view
        returns (uint256)
    {
        if (snapshots[_account].length == 0) return 0;

        return snapshots[_account][
                    snapshots[_account].length - 1
                ].beforeBlock;
    }

    /// @inheritdoc IVotingPower
    function globalsSnapshotLength() external view returns (uint256) {
        return snapshots[GLOBAL_ACCOUNT].length;
    }

    /// @inheritdoc IVotingPower
    function snapshotLength(address _account) external view returns (uint256) {
        return snapshots[_account].length;
    }

    /// @inheritdoc IVotingPower
    function globalsSnapshot(uint256 _index)
        external
        view
        returns (Snapshot memory)
    {
        return snapshots[GLOBAL_ACCOUNT][_index];
    }

    /// @inheritdoc IVotingPower
    function snapshot(address _account, uint256 _index)
        external
        view
        returns (Snapshot memory)
    {
        return snapshots[_account][_index];
    }

    /// @inheritdoc IVotingPower
    function globalsSnapshotAt(uint256 _blockNum, uint256 _hint)
        external
        view
        override
        returns (Snapshot memory)
    {
        return _snapshotAt(GLOBAL_ACCOUNT, _blockNum, _hint);
    }

    /// @inheritdoc IVotingPower
    function snapshotAt(
        address _account,
        uint256 _blockNum,
        uint256 _hint
    ) external view override returns (Snapshot memory) {
        return _snapshotAt(_account, _blockNum, _hint);
    }

    /**
     * @notice Updates the stake lock time with the given value
     * @dev May be only called by the {DELEGATOR_CONTRACT}
     */
    function updateMinStakingTime(uint32 _minStakingTime) external override {
        require(msg.sender == OWNER, "Staking: Unauthorized");
        minStakingTime = _minStakingTime;
        emit MinStakingTimeUpdated(_minStakingTime);
    }

    /// Internal and private functions follow

    function _stake(address _account, uint256 _amount) internal returns (uint256) {
        require(_amount > 0, "Staking: Amount not set");

        uint256 _totalStake = _amount + uint256(totalStaked);
        require(_totalStake < 2**96, "Staking: Too big amount");

        // known contract - reentrancy guard and `safeTransferFrom` unneeded
        require(
            TOKEN.transferFrom(_account, address(this), _amount),
            "Staking: transferFrom failed"
        );

        uint256 stakeID = stakes[_account].length;
        stakes[_account].push(
            Stake(
                address(0), // no delegatee
                uint96(_amount),
                safe32TimeNow(),
                safe32(timeNow() + minStakingTime),
                0
            )
        );

        totalStaked = uint96(_totalStake);
        _addPower(_account, _amount);
        emit Stake(_account, stakeID, _amount);

        return stakeID;
    }

    function _addPower(
        address _to,
        uint256 _amount
    ) private {
        _takeSnapshot(GLOBAL_ACCOUNT);
        _takeSnapshot(_to);
        power[GLOBAL_ACCOUNT].own += _amount;
        power[_to].own += _amount;
    }

    function _removePower(
        address _from,
        uint256 _amount
    ) private {
        _takeSnapshot(GLOBAL_ACCOUNT);
        _takeSnapshot(_from);
        power[GLOBAL_ACCOUNT].own -= _amount;
        power[_from].own -= _amount;
    }

    function _delegatePower(
        address _from,
        address _to,
        uint256 _amount
    ) private {
        _takeSnapshot(GLOBAL_ACCOUNT);
        _takeSnapshot(_to);
        _takeSnapshot(_from);
        power[GLOBAL_ACCOUNT].own -= _amount;
        power[_from].own -= _amount;
        power[GLOBAL_ACCOUNT].delegated += _amount;
        power[_to].delegated += _amount;
    }

    function _reDelegatePower(
        address _from,
        address _to,
        uint256 _amount
    ) private {
        _takeSnapshot(_to);
        _takeSnapshot(_from);
        power[_from].delegated -= _amount;
        power[_to].delegated += _amount;
    }

    function _undelegatePower(
        address _from,
        address _to,
        uint256 _amount
    ) private {
        power[GLOBAL_ACCOUNT].delegated -= _amount;
        power[_from].delegated -= _amount;
        power[GLOBAL_ACCOUNT].own += _amount;
        power[_to].own += _amount;
    }

    function _takeSnapshot(address _account) internal {
        uint32 curBlockNum = safe32blockNow();
        if (
            latestAccountSnapshotBlockNum(_account) < curBlockNum
        ) {
            // make new snapshot as the latest one taken before current block
            snapshots[_account].push(
                Snapshot(
                    curBlockNum,
                    power[_account].own,
                    power[_account].delegated
                )
            );
        }
    }

    function _snapshotAt(
        address _account,
        uint256 _blockNum,
        uint256 _hint
    ) internal view returns (Snapshot memory) {
        _sanitizeBlockNum(_blockNum);

        Snapshot[] storage snapshots = snapshots[_account];
        blockNum = int32(_blockNum);

        if ( // hint is correct?
            _hint <= snapshots.length &&
            (_hint == 0 || snapshots[_hint - 1].beforeBlock < blockNum) &&
            (_hint == snapshots.length ||
            snapshots[_hint].beforeBlock >= blockNum)
        ) {
            // yes, return the hinted snapshot
            if (_hint < snapshots.length) return snapshots[_hint];
            else
                return Snapshot(
                    blockNum,
                    power[_account].own,
                    power[_account].delegated
                );
        } else
            // no, fall back to binary search
            return _snapshotAt(_account, blockNum);
    }

    function _snapshotAt(address _account, uint256 _blockNum)
        internal
        view
        returns (Snapshot memory)
    {
        _sanitizeBlockNum(_blockNum);

        // https://en.wikipedia.org/wiki/Binary_search_algorithm
        Snapshot[] storage snapshots = snapshots[_account];
        uint256 index;
        uint256 low = 0;
        uint256 high = snapshots.length;

        while (low < high) {
            uint256 mid = (low + high) / 2;

            if (snapshots[mid].beforeBlock > _blockNum) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }

        // `low` is the exclusive upper bound. Find the inclusive upper bounds and set to index
        if (low > 0 && snapshots[low - 1].beforeBlock == _blockNum) {
            return snapshots[low - 1];
        } else {
            index = low;
        }

        // If index is equal to snapshot array length, then no update made after the requested blockNum.
        // This means the latest value is the right one.
        if (index == snapshots.length) {
            return
                Snapshot(
                    uint32(_blockNum),
                    uint96(power[_account].own),
                    uint96(power[_account].delegated)
                );
        } else {
            return snapshots[index];
        }
    }

    function _sanitizeBlockNum(uint256 _blockNum) private view {
        require(
            _blockNum <= safe32blockNow(),
            "Staking: Too big block number"
        );
    }
}
