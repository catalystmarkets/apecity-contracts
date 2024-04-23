// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ApeFormula} from "./ApeFormula.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IApeFactory} from "./interfaces/IApeFactory.sol";
import {IUniswapV2Router02} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

import "hardhat/console.sol";

contract BondingCurve is ApeFormula {
    // mapping(address => uint256) public poolBalances;
    uint256 public poolBalance;
    uint256 public reserveRatio;
    address public tokenAddress;

    uint256 private immutable INITIAL_POOL_BALANCE;
    uint256 private immutable INITIAL_TOKEN_SUPPLY;
    uint256 private immutable MAXIMUM_POOL_BALANCE;

    // address public constant uniswapV2Router = 0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24;

    IUniswapV2Router02 public uniswapV2Router;

    address public factory;
    bool public active = true;

    event LogBuy(
        uint256 indexed amountBought,
        uint256 indexed totalCost,
        address indexed buyer
    );
    event LogSell(
        uint256 indexed amountSell,
        uint256 indexed reward,
        address indexed seller
    );
    event BondingCurveComplete(
        address indexed tokenAddress
    );

    constructor(
        address _tokenAddress,
        uint256 _reserveRatio,
        uint256 _initialSupply,
        uint256 _initialPoolBalance,
        uint256 _maximumPoolBalance,
        address _uniswapRouter
    ) {
        INITIAL_TOKEN_SUPPLY = _initialSupply;
        INITIAL_POOL_BALANCE = _initialPoolBalance;
        poolBalance = _initialPoolBalance;

        reserveRatio = _reserveRatio;
        tokenAddress = _tokenAddress;

        MAXIMUM_POOL_BALANCE = _maximumPoolBalance;

        factory = msg.sender;
        uniswapV2Router = IUniswapV2Router02(_uniswapRouter);
    }

    function getCirculatingSupply() public view returns (uint256) {
        uint256 totalSupply = IERC20(tokenAddress).totalSupply();
        uint256 balanceOfBondingCurve = IERC20(tokenAddress).balanceOf(
            address(this)
        );
        return totalSupply - balanceOfBondingCurve + INITIAL_TOKEN_SUPPLY;
    }
    // TODO: create new pool of token and eth

    function buy() public payable returns (bool) {
        require(active,"bonding curve must be active");
        require(msg.value > 0);

        uint256 FEE_DENOMINATOR = IApeFactory(factory).FEE_DENOMINATOR();
        uint256 fee = msg.value / FEE_DENOMINATOR;
        uint256 netValue = msg.value - fee;
        uint256 refund = 0;
        bool transferToUniswap = false;

        uint256 requiredPoolBalanceToCompleteBondingCurve = MAXIMUM_POOL_BALANCE -
                poolBalance;

        if (netValue >= requiredPoolBalanceToCompleteBondingCurve) {

            uint256 usableMsgValue = (requiredPoolBalanceToCompleteBondingCurve *
                    FEE_DENOMINATOR) / 100;
            fee = usableMsgValue / FEE_DENOMINATOR;
            netValue = usableMsgValue - fee;
            refund = msg.value - usableMsgValue;
            transferToUniswap = true;

            console.log("usableMsgValue", usableMsgValue);
            console.log("fee", fee);
            console.log("netValue", netValue);
            console.log("refund", refund);
            console.log("transferToUniswap", transferToUniswap);
        }

        uint256 currentCirculatingSupply = getCirculatingSupply();

        console.log("currentCirculatingSupply", currentCirculatingSupply);
        console.log("poolBalance", poolBalance);
        console.log("reserveRatio", reserveRatio);
        console.log("netValue", netValue);

        uint256 tokensToTransfer = calculatePurchaseReturn(
            currentCirculatingSupply,
            poolBalance,
            reserveRatio,
            netValue
        );
        console.log("tokensToTransfer", tokensToTransfer);

        require(
            IERC20(tokenAddress).transfer(msg.sender, tokensToTransfer),
            "ERC20 transfer failed"
        );
        poolBalance += netValue;

        // Transfer fees to the fee recipient
        address feeTo = IApeFactory(factory).feeTo();
        payable(feeTo).transfer(fee);

        if (refund > 0) {
            payable(msg.sender).transfer(refund);
        }
        emit LogBuy(tokensToTransfer, msg.value, msg.sender);


        if (transferToUniswap) {
            transferLiquidityToUniswap();
            active = false;
            emit BondingCurveComplete(tokenAddress);
        }
        return true;
    }

    function sell(uint256 sellAmount) public returns (bool) {
        require(active,"bonding curve must be active");
        require(sellAmount > 0);

        uint256 currentCirculatingSupply = getCirculatingSupply();

        uint256 ethAmount = calculateSaleReturn(
            currentCirculatingSupply,
            poolBalance,
            reserveRatio,
            sellAmount
        );

        require(
            ethAmount <= poolBalance,
            "Bonding curve does not have sufficient funds"
        );

        uint256 FEE_DENOMINATOR = IApeFactory(factory).FEE_DENOMINATOR();
        uint256 fee = ethAmount / FEE_DENOMINATOR;
        uint256 netValue = ethAmount - fee;

        payable(msg.sender).transfer(netValue);
        poolBalance -= ethAmount;

        require(
            IERC20(tokenAddress).transferFrom(
                msg.sender,
                address(this),
                sellAmount
            )
        );

        // Transfer fees to the fee recipient
        address feeTo = IApeFactory(factory).feeTo();
        payable(feeTo).transfer(fee);

        emit LogSell(sellAmount, ethAmount, msg.sender);
        return true;
    }

    function transferLiquidityToUniswap() internal {
        uint256 tokenBalance = IERC20(tokenAddress).balanceOf(address(this));

        // Approve the Uniswap router to spend the token balance
        IERC20(tokenAddress).approve(address(uniswapV2Router), tokenBalance);

        // Add liquidity to Uniswap
        uniswapV2Router.addLiquidityETH{value: 4 ether}(
            tokenAddress,
            tokenBalance,
            0, // Slippage tolerance for token amount
            0, // Slippage tolerance for ETH amount
            address(this),
            block.timestamp + 1800 // Deadline for the transaction (e.g., 30 minutes from now)
        );
    }

    function amountToCompleteBondingCurve() public view returns (uint256) {
        return MAXIMUM_POOL_BALANCE - poolBalance;
    }
}
