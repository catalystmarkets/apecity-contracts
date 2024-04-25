// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ApeFormula} from "./ApeFormula.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IApeFactory} from "./interfaces/IApeFactory.sol";
import {IUniswapV2Router02} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import {IUniswapV2Factory} from "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";

import "hardhat/console.sol";

contract BondingCurve is ApeFormula {
    // mapping(address => uint256) public poolBalances;
    uint256 public poolBalance;
    uint256 public reserveRatio;

    IERC20 public token;

    uint256 private immutable INITIAL_POOL_BALANCE;
    uint256 private immutable INITIAL_TOKEN_SUPPLY;
    uint256 private immutable LP_TRANSFER_ETH_AMOUNT;
    uint256 private immutable LP_TRANSFER_FEE_AMOUNT;

    // address public constant uniswapV2Router = 0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24;

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
    event BondingCurveComplete(address indexed tokenAddress, address indexed liquidityPoolAddress);

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
        uint256 balanceOfBondingCurve = token.balanceOf(
            address(this)
        );
        return totalSupply - balanceOfBondingCurve + INITIAL_TOKEN_SUPPLY;
    }
    // TODO: create new pool of token and eth

    function buy() public payable returns (bool) {
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

            console.log("usableMsgValue", usableMsgValue);
            console.log("fee", fee);
            console.log("netValue", netValue);
            console.log("refund", refund);
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
            token.transfer(msg.sender, tokensToTransfer),
            "ERC20 transfer failed"
        );
        poolBalance += netValue;

        // Transfer fees to the fee recipient
        address feeTo = factory.feeTo();
        payable(feeTo).transfer(fee);

        if (refund > 0) {
            payable(msg.sender).transfer(refund);
        }
        emit LogBuy(tokensToTransfer, msg.value, msg.sender);

        if (bondingCurveComplete) {
            console.log("address(this).balance",address(this).balance);
            completeBondingCurve();
            console.log("address(this).balance",address(this).balance);
            payable(factory.liquidityFeeTo()).transfer(address(this).balance);
        }
        return true;
    }

    function sell(uint256 sellAmount) public returns (bool) {
        require(active, "bonding curve must be active");
        require(sellAmount > 0);

        uint256 currentCirculatingSupply = getCirculatingSupply();

        uint256 ethAmount = calculateSaleReturn(
            currentCirculatingSupply,
            poolBalance,
            reserveRatio,
            sellAmount
        );
// 10000.021199998279718957
// 10000.211999998279718957
        require(
            ethAmount <= poolBalance,
            "Bonding curve does not have sufficient funds"
        );

        uint256 FEE_DENOMINATOR = factory.FEE_DENOMINATOR();
        uint256 fee = ethAmount / FEE_DENOMINATOR;
        uint256 netValue = ethAmount - fee;

        payable(msg.sender).transfer(netValue);
        poolBalance -= ethAmount;

        require(
           token.transferFrom(
                msg.sender,
                address(this),
                sellAmount
            )
        );

        // Transfer fees to the fee recipient
        address feeTo = factory.feeTo();
        payable(feeTo).transfer(fee);

        emit LogSell(sellAmount, ethAmount, msg.sender);
        return true;
    }

    function completeBondingCurve()
        internal
    {
        uint256 ethAmountToSendLP = LP_TRANSFER_ETH_AMOUNT;
        uint256 tokenAmountToSendLP = token.balanceOf(address(this));

        require(
            token.approve(address(uniswapV2Router), tokenAmountToSendLP),
            "Approve failed"
        );
        require(address(this).balance >= ethAmountToSendLP, "Insufficient ETH balance");

        uniswapV2Router.addLiquidityETH{
            value: ethAmountToSendLP
        }(address(token), tokenAmountToSendLP, 0, 0, address(this), block.timestamp);


        // Burn the LP tokens
        address WETH = uniswapV2Router.WETH();
        IUniswapV2Factory uniswapV2Factory = IUniswapV2Factory(uniswapV2Router.factory());
        IERC20 lpToken = IERC20(uniswapV2Factory.getPair(WETH, address(token)));
        
        bool success = lpToken.transfer(address(0), lpToken.balanceOf(address(this)));
        require(success, "Liquidity Pool burning failed");

        active = false;
        emit BondingCurveComplete(address(token), address(lpToken));
    }


    // function transferLiquidityToLP(uint256 ethAmount)
    //     internal
    // {
    //     uint256 tokenAmount = token.balanceOf(address(this));

    //     require(
    //         token.approve(address(uniswapV2Router), tokenAmount),
    //         "Approve failed"
    //     );
    //     require(address(this).balance >= ethAmount, "Insufficient ETH balance");

    //     (amountToken, amountETH, liquidity) = uniswapV2Router.addLiquidityETH{
    //         value: ethAmount
    //     }(tokenAddress, tokenAmount, 0, 0, address(this), block.timestamp);
    // }

    // function burnLPTokens()
    // internal
    // returns(address)
    // {
    //     // Burn the LP tokens
    //     address WETH = uniswapV2Router.WETH();
    //     IUniswapV2Factory uniswapV2Factory = IUniswapV2Factory(uniswapV2Router.factory());
    //     IERC20 lpToken = IERC20(uniswapV2Factory.getPair(WETH, tokenAddress));

        
    //     bool success = lpToken.transfer(address(0), lpToken.balanceOf(address(this)));
    //     require(success, "Liquidity Pool burning failed");

    //     return address(lpToken);
    // }

    //     function transferLiquidityToUniswap() internal view returns(bool){
    //         uint256 tokenBalance = IERC20(tokenAddress).balanceOf(address(this));

    //         // Approve the Uniswap router to spend the token balance
    //         // IERC20(tokenAddress).approve(address(uniswapV2Router), tokenBalance);
    //         // console.log("hahaha");
    //         // address uniswapFactoryAddress = uniswapV2Router.factory();
    //         console.log("yyyeee");

    //         // address uniswapFactoryAddress = IUniswapV2Router02(address(0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24)).factory();
    //     // Initialize the uniswapV2Router variable
    //     // IUniswapV2Router02 uniswapV2Router = IUniswapV2Router02(0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24);

    //     address uniswapFactoryAddress = uniswapV2Router.factory();
    //     console.log("uniswapFactoryAddress", uniswapFactoryAddress);
    //     // (bool success, bytes memory data) = address(uniswapV2Router).call(abi.encodeWithSignature("factory()"));
    //     // require(success, "Call to Uniswap router failed");
    //     // console.log("sss");
    //     // address uniswapFactoryAddress = abi.decode(data, (address));
    //     // console.log("uniswapFactoryAddress", uniswapFactoryAddress);

    // // (bool success, bytes memory data) = address(0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24).call(abi.encodeWithSignature("factory()"));
    // // require(success, "Factory address retrieval failed");
    // // // console.log("data",data);

    // // address uniswapFactoryAddress = abi.decode(data, (address));
    //         console.log("uniswapFactoryAddress",uniswapFactoryAddress);
    //         console.log("eee");
    //         // console.log("uniswapFactoryAddress",uniswapFactoryAddress);
    //         // // Add liquidity to Uniswap
    //         // uniswapV2Router.addLiquidityETH{value: 4 ether}(
    //         //     tokenAddress,
    //         //     tokenBalance,
    //         //     0, // Slippage tolerance for token amount
    //         //     0, // Slippage tolerance for ETH amount
    //         //     address(this),
    //         //     block.timestamp + 1800 // Deadline for the transaction (e.g., 30 minutes from now)
    //         // );
    //         return true;
    //     }

    function amountToCompleteBondingCurve() public view returns (uint256) {
        return LP_TRANSFER_ETH_AMOUNT + LP_TRANSFER_FEE_AMOUNT - poolBalance;
    }
}
