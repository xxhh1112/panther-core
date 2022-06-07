// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import { G1Point } from "../common/Types.sol";
import { CIPHERTEXT1_WORDS, OUT_UTXOs, PATH_ELEMENTS_NUM } from "../common/Constants.sol";

/**
 * @notice (Truncated) Interface of the PantherPoolV0
 * @dev Only those functions and events included which the `AdvancedStakeRewardController` contract uses
 */
interface IPantherPoolV0 {
    /**
     * @notice Increase the "unused grants" amount (in PRPs) of the given grantee by the amount
     * defined by the given "grant type"
     * @return prpAmount The amount (in PRPs) of the grant
     * @dev An authorized "curator" may call with the enabled (added) "grant type" only
     */
    function grant(address grantee, bytes4 grantType)
        external
        returns (uint256 prpAmount);

    /**
     * @notice Transfer assets from the msg.sender to the VAULT and generate UTXOs in the MASP
     * @param tokens Address of the token contract for every UTXO
     * @dev For PRP granted the address ot this contract (proxy) is supposed to be used
     * @param tokenIds For ERC-721 and ERC-1155 - token ID or subId of the token, 0 for ERC-20
     * @param extAmounts Token amounts (external) to be deposited
     * @param pubSpendingKeys Public Spending Key for every UTXO
     * @param secrets Encrypted opening values for every UTXO
     * @param  createdAt Optional, if 0 network time used
     * @dev createdAt must be less (or equal) the network time
     * @return leftLeafId The `leafId` of the first UTXO (leaf) in the batch
     */
    function generateDeposits(
        address[OUT_UTXOs] calldata tokens,
        uint256[OUT_UTXOs] calldata tokenIds,
        uint256[OUT_UTXOs] calldata extAmounts,
        G1Point[OUT_UTXOs] calldata pubSpendingKeys,
        uint256[CIPHERTEXT1_WORDS][OUT_UTXOs] calldata secrets,
        uint32 createdAt
    ) external returns (uint256 leftLeafId);

    function exit(
        address token,
        uint256 tokenId,
        uint256 amount,
        uint32 creationTime,
        uint256 privSpendingKey,
        uint256 leafId,
        bytes32[PATH_ELEMENTS_NUM] calldata pathElements,
        bytes32 merkleRoot,
        uint256 cacheIndexHint
    ) external;

    /**
     * @return Address of the Vault
     */
    // solhint-disable-next-line func-name-mixedcase
    function VAULT() external view returns (address);

    /**
     * @dev Emitted on a new batch of Commitments
     * @param leftLeafId The `leafId` of the first leaf in the batch
     * @dev `leafId = leftLeafId + 1` for the 2nd leaf (`leftLeafId + 2` for the 3rd leaf)
     * @param commitments Commitments hashes
     * @param utxoData opening values (encrypted and public) for UTXOs
     */
    event NewCommitments(
        uint256 indexed leftLeafId,
        uint256 creationTime,
        bytes32[OUT_UTXOs] commitments,
        bytes utxoData
    );

    /**
     * @dev PRP grant issued
     * @param grantType "Type" of the PRP grant
     * @param grantee User to whom the grant is issued
     * @param prpAmount Amount of the grant in PRP
     */
    event PrpGrantIssued(
        bytes4 indexed grantType,
        address grantee,
        uint256 prpAmount
    );

    /**
     * Nullifier is seen (i.e. UTXO is spent)
     */
    event Nullifier(bytes32 nullifier);
}
