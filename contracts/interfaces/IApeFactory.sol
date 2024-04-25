// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

interface IApeFactory{

    function FEE_DENOMINATOR() external returns (uint256);
    function feeTo() external returns (address);
    function liquidityFeeTo() external returns (address);

    event TokenCreated(address indexed token, address indexed bondingCurve, uint256 reserveRatio);

    function allTokensLength() external view returns (uint256);
    // function setReserveRatio(uint256 _reserveRatio) onlyOwner ;

    function createToken(string memory name, string memory symbol, uint256 totalSupply) external payable returns(address);

    function setFeeTo(address _feeTo) external ;

    function setFeeToSetter(address _feeToSetter) external ;
}
