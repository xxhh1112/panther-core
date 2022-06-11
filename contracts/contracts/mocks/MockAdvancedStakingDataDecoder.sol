// SPDX-License-Identifier: UNLICENSED
// solhint-disable-next-line compiler-fixed, compiler-gt-0_8
pragma solidity ^0.8.0;

import "../actions/AdvancedStakingDataDecoder.sol";

contract MockAdvancedStakingDataDecoder is AdvancedStakingDataDecoder {
    function internalUnpackStakingData(bytes memory data)
        external
        pure
        returns (
            G1Point[3] memory pubSpendingKeys,
            uint256[3][3] memory secrets
        )
    {
        return unpackStakingData(data);
    }
}