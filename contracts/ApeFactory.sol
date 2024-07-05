// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {ERC20FixedSupply} from "./ERC20FixedSupply.sol";
import {BondingCurve} from "./BondingCurve.sol";

import "hardhat/console.sol";

contract ApeFactory is Ownable {
    mapping(address => address) public getBondingCurve;
    mapping(address => uint256) public getReserveRatio;
    address[] public allTokens;

    address public feeTo;
    address public liquidityFeeTo;
    address public feeToSetter;

    uint256 public FEE_DENOMINATOR = 101;

    uint256 private TOTAL_TOKEN_SUPPLY;
    uint256 private INITIAL_TOKEN_SUPPLY;
    uint256 private INITIAL_POOL_BALANCE;
    uint256 private STANDARD_RESERVE_RATIO;
    uint256 private LP_TRANSFER_ETH_AMOUNT;
    uint256 private LP_TRANSFER_FEE_AMOUNT;
    uint256 private LP_TRANSFER_DEV_REWARD;
    
    address private UNISWAPV2_ROUTER_ADDRESS;

    event TokenCreated(
        address indexed token,
        address indexed bondingCurve,
        uint256 reserveRatio
    );

    constructor(
        address _feeToSetter,
        address _feeTo,
        address _liquidityFeeTo,
        uint256 _totalTokenSupply,
        uint256 _initialTokenSupply,
        uint256 _initialPoolBalance,
        uint256 _standardReserveRatio,
        uint256 _lpTransferEthAmount,
        uint256 _lpTransferFeeAmount,
        uint256 _lpTransferDevReward,
        address _uniswapV2RouterAddress
    ) Ownable(msg.sender) {
        feeToSetter = _feeToSetter;
        feeTo = _feeTo;
        liquidityFeeTo = _liquidityFeeTo;

        TOTAL_TOKEN_SUPPLY = _totalTokenSupply;
        INITIAL_TOKEN_SUPPLY = _initialTokenSupply;
        INITIAL_POOL_BALANCE = _initialPoolBalance;
        STANDARD_RESERVE_RATIO = _standardReserveRatio;
        LP_TRANSFER_ETH_AMOUNT = _lpTransferEthAmount;
        LP_TRANSFER_FEE_AMOUNT = _lpTransferFeeAmount;
        LP_TRANSFER_DEV_REWARD = _lpTransferDevReward;
        UNISWAPV2_ROUTER_ADDRESS = _uniswapV2RouterAddress;
    }

    function allTokensLength() external view returns (uint256) {
        return allTokens.length;
    }

    // function getTokensInRange(
    //     uint256 startIndex,
    //     uint256 endIndex
    // ) external view returns (address[] memory) {
    //     require(startIndex < endIndex, "Invalid range");
    //     require(endIndex <= allTokens.length, "End index out of bounds");

    //     uint256 length = endIndex - startIndex;
    //     address[] memory tokensInRange = new address[](length);

    //     for (uint256 i = 0; i < length; i++) {
    //         tokensInRange[i] = allTokens[startIndex + i];
    //     }

    //     return tokensInRange;
    // }

    function createToken(
        string memory name,
        string memory symbol,
        string memory tokenURI
    ) external payable returns (address) {
        ERC20FixedSupply token = new ERC20FixedSupply(
            name,
            symbol,
            TOTAL_TOKEN_SUPPLY,
            tokenURI
        );
        BondingCurve bondingCurve = new BondingCurve(
            address(msg.sender),
            address(token),
            STANDARD_RESERVE_RATIO,
            INITIAL_TOKEN_SUPPLY,
            INITIAL_POOL_BALANCE,
            LP_TRANSFER_ETH_AMOUNT,
            LP_TRANSFER_FEE_AMOUNT,
            LP_TRANSFER_DEV_REWARD,
            UNISWAPV2_ROUTER_ADDRESS
        );

        require(
            token.transfer(address(bondingCurve), token.totalSupply()),
            "ERC20 transfer failed"
        );

        getBondingCurve[address(token)] = address(bondingCurve);
        getReserveRatio[address(bondingCurve)] = STANDARD_RESERVE_RATIO;
        allTokens.push(address(token));

        emit TokenCreated(
            address(token),
            address(bondingCurve),
            STANDARD_RESERVE_RATIO
        );

        if (msg.value > 0) {
            bondingCurve.buy{value: msg.value}(msg.sender);
        }
        return address(token);
    }

    function setFeeToSetter(address _feeToSetter) external {
        require(msg.sender == feeToSetter, "APEV1: FORBIDDEN");
        feeToSetter = _feeToSetter;
    }

    function setFeeTo(address _feeTo) external {
        require(msg.sender == feeToSetter, "APEV1: FORBIDDEN");
        feeTo = _feeTo;
    }

    function setLiquidityFeeTo(address _liquidityFeeTo) external {
        require(msg.sender == feeToSetter, "APEV1: FORBIDDEN");
        liquidityFeeTo = _liquidityFeeTo;
    }

    function setfeeDenominator(uint256 _feeDenominator) external {
        require(msg.sender == feeToSetter, "APEV1: FORBIDDEN");
        FEE_DENOMINATOR = _feeDenominator;
    }

    function setBondingCurveVariables(
        uint256 _totalTokenSupply,
        uint256 _initialTokenSupply,
        uint256 _initialPoolBalance,
        uint256 _standardReserveRatio,
        uint256 _lpTransferEthAmount,
        uint256 _lpTransferFeeAmount,
        uint256 _lpTransferDevReward
    ) external onlyOwner {
        TOTAL_TOKEN_SUPPLY = _totalTokenSupply;
        INITIAL_TOKEN_SUPPLY = _initialTokenSupply;
        INITIAL_POOL_BALANCE = _initialPoolBalance;
        STANDARD_RESERVE_RATIO = _standardReserveRatio;
        LP_TRANSFER_ETH_AMOUNT = _lpTransferEthAmount;
        LP_TRANSFER_FEE_AMOUNT = _lpTransferFeeAmount;
        LP_TRANSFER_DEV_REWARD = _lpTransferDevReward;
    }

    function setLPRouterAddress(
        address _uniswapV2RouterAddress
    ) external onlyOwner {
        UNISWAPV2_ROUTER_ADDRESS = _uniswapV2RouterAddress;
    }
}
