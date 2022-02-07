// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockVotingPowerSource {
    struct Power {
        uint96 own;
        uint96 delegated;
    }

    mapping(address => Power) private _powers;

    function power(address voter) external view returns (Power memory) {
        return _powers[voter];
    }

    function _setMockPower(address voter, Power memory _power) external {
        _powers[voter] = _power;
    }
}
