// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ApeFormula} from "./ApeFormula.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IApeFactory} from "./interfaces/IApeFactory.sol";
import {IUniswapV2Router02} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import {IUniswapV2Factory} from "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import {IUniswapV2Pair} from "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


import "hardhat/console.sol";

contract BondingCurve is ApeFormula, ReentrancyGuard {
    // mapping(address => uint256) public poolBalances;
    uint256 public poolBalance;
    uint256 public reserveRatio;

    IERC20 private token;

    uint256 private immutable INITIAL_POOL_BALANCE;
    uint256 private immutable INITIAL_TOKEN_SUPPLY;
    uint256 private immutable LP_TRANSFER_ETH_AMOUNT;
    uint256 private immutable LP_TRANSFER_FEE_AMOUNT;

    IUniswapV2Router02 public uniswapV2Router;
    IApeFactory public factory;
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
        address indexed tokenAddress,
        address indexed liquidityPoolAddress
    );

    constructor(
        address _tokenAddress,
        uint256 _reserveRatio,
        uint256 _initialSupply,
        uint256 _initialPoolBalance,
        uint256 _ethAmountToLP,
        uint256 _feeAmountAtCurveComplete,
        address _uniswapRouter
    ) {
        INITIAL_TOKEN_SUPPLY = _initialSupply;
        INITIAL_POOL_BALANCE = _initialPoolBalance;
        poolBalance = _initialPoolBalance;

        reserveRatio = _reserveRatio;

        token = IERC20(_tokenAddress);

        LP_TRANSFER_ETH_AMOUNT = _ethAmountToLP;
        LP_TRANSFER_FEE_AMOUNT = _feeAmountAtCurveComplete;

        factory = IApeFactory(msg.sender);
        uniswapV2Router = IUniswapV2Router02(_uniswapRouter);
    }

    function getCirculatingSupply() public view returns (uint256) {
        uint256 totalSupply = token.totalSupply();
        uint256 balanceOfBondingCurve = token.balanceOf(address(this));
        return totalSupply - balanceOfBondingCurve + INITIAL_TOKEN_SUPPLY;
    }

    function deActivateBondingCurve() internal {
        active = false;
    }

    // function buy(address buyer) public payable nonReentrant returns (bool) {
    //     require(active, "bonding curve must be active");
    //     require(msg.value > 0);

    //     uint256 FEE_DENOMINATOR = factory.FEE_DENOMINATOR();
    //     uint256 fee = msg.value / FEE_DENOMINATOR;
    //     uint256 netValue = msg.value - fee;
    //     uint256 refund = 0;
    //     bool bondingCurveComplete = false;

    //     uint256 requiredPoolBalanceToCompleteBondingCurve = amountToCompleteBondingCurve();

    //     if (netValue >= requiredPoolBalanceToCompleteBondingCurve) {
    //         uint256 usableMsgValue = (requiredPoolBalanceToCompleteBondingCurve *
    //                 FEE_DENOMINATOR) / 100;
    //         fee = usableMsgValue / FEE_DENOMINATOR;
    //         netValue = usableMsgValue - fee;
    //         refund = msg.value - usableMsgValue;
    //         bondingCurveComplete = true;
    //         deActivateBondingCurve();
    //     }

    //     uint256 currentCirculatingSupply = getCirculatingSupply();

    //     uint256 tokensToTransfer = calculatePurchaseReturn(
    //         currentCirculatingSupply,
    //         poolBalance,
    //         reserveRatio,
    //         netValue
    //     );
    //     console.log("tokensToTransfer", tokensToTransfer);

    //     poolBalance += netValue;
    //     require(
    //         token.transfer(buyer, tokensToTransfer),
    //         "ERC20 transfer failed"
    //     );

    //     // Transfer fees to the fee recipient
    //     address feeTo = factory.feeTo();
    //     payable(feeTo).transfer(fee);

    //     if (refund > 0) {
    //         payable(msg.sender).transfer(refund);
    //     }
    //     // emit LogBuy(tokensToTransfer, msg.value, msg.sender);
    //     emit LogBuy(tokensToTransfer, netValue, buyer);

    //     if (bondingCurveComplete) {
    //         completeBondingCurve();
    //         payable(factory.liquidityFeeTo()).transfer(address(this).balance);
    //     }
    //     return true;
    // }

    function buyFor(address buyer) internal returns (bool) {
        require(active, "bonding curve must be active");
        require(msg.value > 0);

        uint256 FEE_DENOMINATOR = factory.FEE_DENOMINATOR();
        uint256 fee = msg.value / FEE_DENOMINATOR;
        uint256 netValue = msg.value - fee;
        uint256 refund = 0;
        bool bondingCurveComplete = false;

        uint256 requiredPoolBalanceToCompleteBondingCurve = amountToCompleteBondingCurve();

        if (netValue >= requiredPoolBalanceToCompleteBondingCurve) {
            uint256 usableMsgValue = (requiredPoolBalanceToCompleteBondingCurve *
                    FEE_DENOMINATOR) / 100;
            fee = usableMsgValue / FEE_DENOMINATOR;
            netValue = usableMsgValue - fee;
            refund = msg.value - usableMsgValue;
            bondingCurveComplete = true;
            deActivateBondingCurve();
        }

        uint256 currentCirculatingSupply = getCirculatingSupply();

        uint256 tokensToTransfer = calculatePurchaseReturn(
            currentCirculatingSupply,
            poolBalance,
            reserveRatio,
            netValue
        );
        console.log("tokensToTransfer", tokensToTransfer);

        poolBalance += netValue;
        require(
            token.transfer(buyer, tokensToTransfer),
            "ERC20 transfer failed"
        );

        // Transfer fees to the fee recipient
        address feeTo = factory.feeTo();
        payable(feeTo).transfer(fee);

        if (refund > 0) {
            payable(buyer).transfer(refund);
        }
        // emit LogBuy(tokensToTransfer, msg.value, msg.sender);
        emit LogBuy(tokensToTransfer, netValue, buyer);

        if (bondingCurveComplete) {
            completeBondingCurve();
            payable(factory.liquidityFeeTo()).transfer(address(this).balance);
        }
        return true;
    }

    function buy(address buyer) public payable nonReentrant returns (bool) {
        require(msg.sender == address(factory),"You are not factory");
        return buyFor(buyer);
    }


    function buy() public payable nonReentrant returns (bool) {
        return buyFor(msg.sender);
    }

    function sell(uint256 sellAmount) public nonReentrant returns (bool) {
        require(active, "bonding curve must be active");
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

        uint256 FEE_DENOMINATOR = factory.FEE_DENOMINATOR();
        uint256 fee = ethAmount / FEE_DENOMINATOR;
        uint256 netValue = ethAmount - fee;

        poolBalance -= ethAmount;
        payable(msg.sender).transfer(netValue);

        require(token.transferFrom(msg.sender, address(this), sellAmount));

        // Transfer fees to the fee recipient
        address feeTo = factory.feeTo();
        payable(feeTo).transfer(fee);

        emit LogSell(sellAmount, ethAmount, msg.sender);
        return true;
    }

    function completeBondingCurve() internal {

        uint256 ethAmountToSendLP = LP_TRANSFER_ETH_AMOUNT;
        uint256 tokenAmountToSendLP = token.balanceOf(address(this));

        require(
            token.approve(address(uniswapV2Router), tokenAmountToSendLP),
            "Approve failed"
        );
        require(
            address(this).balance >= ethAmountToSendLP,
            "Insufficient ETH balance"
        );

        uniswapV2Router.addLiquidityETH{value: ethAmountToSendLP}(
            address(token),
            tokenAmountToSendLP,
            0,
            0,
            address(this),
            block.timestamp
        );

        // Burn the LP tokens
        address WETH = uniswapV2Router.WETH();
        IUniswapV2Factory uniswapV2Factory = IUniswapV2Factory(
            uniswapV2Router.factory()
        );
        IERC20 lpToken = IERC20(uniswapV2Factory.getPair(WETH, address(token)));

        bool success = lpToken.transfer(
            address(0),
            lpToken.balanceOf(address(this))
        );
        require(success, "Liquidity Pool burning failed");

        emit BondingCurveComplete(address(token), address(lpToken));
    }

    function amountToCompleteBondingCurve() public view returns (uint256) {
        return LP_TRANSFER_ETH_AMOUNT + LP_TRANSFER_FEE_AMOUNT - poolBalance;
    }
}
