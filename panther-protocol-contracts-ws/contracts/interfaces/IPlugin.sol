// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

interface IPlugin {
    function callPlugin(
        address plugin,
        uint256 value,
        bytes calldata calldata
    ) public returns (bool success);
}
