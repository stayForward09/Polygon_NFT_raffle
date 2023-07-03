// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.4;

interface IRandomNumberGenerator {
    function viewRandomResult() external view returns (uint256);

    function requestRandomWords() external;

    function setKeyHash(bytes32 _keyHash) external;
}