// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {ERC20FixedSupply} from "./ERC20FixedSupply.sol";
import {BondingCurve} from "./BondingCurve.sol";

import "hardhat/console.sol";

contract ApeFactory is Ownable{

    mapping(address => address) public getBondingCurve;
    mapping(address => uint256) public getReserveRatio;
    address[] public allTokens;

    uint256 public reserveRatio;

    address public feeTo;
    address public feeToSetter;

    uint256 public FEE_DENOMINATOR = 101;

    event TokenCreated(address indexed token, address indexed bondingCurve, uint256 reserveRatio);

    constructor(uint256 _reserveRatio, address _feeToSetter, address _feeTo) Ownable(msg.sender) {
        reserveRatio = _reserveRatio;
        feeToSetter = _feeToSetter;
        feeTo = _feeTo;
    }

    function allTokensLength() external view returns (uint256) {
        return allTokens.length;
    }

    function setReserveRatio(uint256 _reserveRatio) onlyOwner external {
        reserveRatio = _reserveRatio;
    }

    function createToken(string memory name, string memory symbol) external returns(address) {

        ERC20FixedSupply token = new ERC20FixedSupply(name, symbol, 1*10**27);
        BondingCurve bondingCurve = new BondingCurve(address(token), reserveRatio, 1000*10**18, 1720281043, 4212e15, 0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24);
        require(token.transfer(address(bondingCurve),token.totalSupply()), "ERC20 transfer failed");

        getBondingCurve[address(token)] = address(bondingCurve);
        getReserveRatio[address(bondingCurve)] = reserveRatio;
        allTokens.push(address(token));

        emit TokenCreated(address(token), address(bondingCurve), reserveRatio);
        return address(token);
    }

    function setFeeTo(address _feeTo) external {
        require(msg.sender == feeToSetter, 'APEV1: FORBIDDEN');
        feeTo = _feeTo;
    }

    function setFeeToSetter(address _feeToSetter) external {
        require(msg.sender == feeToSetter, 'APEV1: FORBIDDEN');
        feeToSetter = _feeToSetter;
    }

}
