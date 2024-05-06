const { expect } = require("chai");
const { ethers } = require("hardhat");

// const UNISWAPV2_ROUTER_CONTRACT = 0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24

describe.only("BondingCurve", function () {
    let bondingCurve;
    let token;
    // let owner;
    let otherAccounts;
    let tokenAddress;

    let _feeToSetter;
    let _feeTo;
    let _liquidityFeeTo;
    let _totalTokenSupply;
    let _initialTokenSupply;
    let _initialPoolBalance;
    let _reserveRatio;
    let _lpTransferEthAmount;
    let _lpTransferFeeAmount;
    let _uniswapV2RouterAddress;

    let ApeFactory;
    let uniswapV2Router;
    let uniswapV2Factory;

    beforeEach(async function () {
        let [owner, feeToSetter, feeTo, liquidityFeeTo, ..._otherAccounts] = await ethers.getSigners();
        otherAccounts = _otherAccounts
        _feeToSetter = feeToSetter.address;
        _feeTo = feeTo.address;
        _liquidityFeeTo = liquidityFeeTo.address;
        // _totalTokenSupply = ethers.parseEther('1000000000');
        // _initialTokenSupply = ethers.parseEther('1000');
        // _initialPoolBalance = 1720281043;
        // _reserveRatio = 607071;
        // _lpTransferEthAmount = ethers.parseEther('4');
        // _lpTransferFeeAmount = ethers.parseEther('0.212');
        // _uniswapV2RouterAddress = "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24";

        _totalTokenSupply = '1000000000';
        _initialTokenSupply = ethers.parseEther('1000');
        _initialPoolBalance = 8571428;
        _reserveRatio = 500000;
        _lpTransferEthAmount = ethers.parseEther('4');
        _lpTransferFeeAmount = ethers.parseEther('0.200001');
        _uniswapV2RouterAddress = "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24";

        const ApeFactoryContract = await ethers.getContractFactory("ApeFactory");

        console.log(
            _reserveRatio,
            _feeToSetter,
            _feeTo,
            _liquidityFeeTo,
            _totalTokenSupply,
            _initialTokenSupply,
            _initialPoolBalance,
            _lpTransferEthAmount,
            _lpTransferFeeAmount,
            _uniswapV2RouterAddress
        )
        ApeFactory = await ApeFactoryContract.deploy(
            _feeToSetter,
            _feeTo,
            _liquidityFeeTo,
            _totalTokenSupply,
            _initialTokenSupply,
            _initialPoolBalance,
            _reserveRatio,
            _lpTransferEthAmount,
            _lpTransferFeeAmount,
            _uniswapV2RouterAddress
        );
        await ApeFactory.waitForDeployment();


        await ApeFactory.setBondingCurveCurveVariables(
            _totalTokenSupply,
            _initialTokenSupply,
            _initialPoolBalance,
            _reserveRatio,
            _lpTransferEthAmount,
            _lpTransferFeeAmount
        )

        const tokenName = "ApeCoin";
        const tokenSymbol = "APE";
        const imageURL = "APE";

        let createdToken = await ApeFactory.createToken(tokenName, tokenSymbol, imageURL)

        tokenAddress = await ApeFactory.allTokens(0);
        const ERC20FixedSupply = await ethers.getContractFactory("ERC20FixedSupply");
        token = ERC20FixedSupply.attach(tokenAddress);

        const bondingCurveAddress = await ApeFactory.getBondingCurve(tokenAddress);
        const BondingCurve = await ethers.getContractFactory("BondingCurve");
        bondingCurve = BondingCurve.attach(bondingCurveAddress);
        
        const uniswapV2RouterAddress = await bondingCurve.uniswapV2Router();
        uniswapV2Router = await ethers.getContractAt("IUniswapV2Router02", uniswapV2RouterAddress);

        const uniswapV2FactoryAddress = await uniswapV2Router.factory();        
        uniswapV2Factory = await ethers.getContractAt("IUniswapV2Factory", uniswapV2FactoryAddress);
    });

    function getFeeAmount(totalAmount) {
        return totalAmount / 101n;
    }

    it("8. should handle over buy and complete bonding curve ", async function () {
        // buyer is buying here
        let buyer = otherAccounts[0];
        let buyAmount = ethers.parseEther("3.03");
        await expect(bondingCurve.connect(buyer).buy({ value: buyAmount }))
            .to.emit(bondingCurve, "LogBuy");

        let requireAmountToCompleteBondingCurve = await bondingCurve.amountToCompleteBondingCurve();
        let excessAmount = ethers.parseEther("1");
        buyAmount = requireAmountToCompleteBondingCurve + excessAmount;

        let userEthBalanceBeforeBuy = await ethers.provider.getBalance(buyer);
        let liquidityFeeToBalanceBC = await ethers.provider.getBalance(_liquidityFeeTo);
        console.log("liquidityFeeToBalanceBC",liquidityFeeToBalanceBC)
        // bonding curve will be completed on this buy
        await bondingCurve.connect(buyer).buy({ value: buyAmount })

        let userEthBalanceAfterBuy = await ethers.provider.getBalance(buyer);
        console.log("userEthBalanceAfterBuy", ethers.formatEther(userEthBalanceAfterBuy))

        expect(userEthBalanceAfterBuy).to.be.lt(userEthBalanceBeforeBuy - requireAmountToCompleteBondingCurve);
        expect(userEthBalanceAfterBuy).to.be.gt(userEthBalanceBeforeBuy - buyAmount);

        console.log("WETH", await uniswapV2Router.WETH());
        console.log("tokenAddress", tokenAddress);
        const lpTokenAddress = await uniswapV2Factory.getPair(await uniswapV2Router.WETH(), tokenAddress);
        console.log('lpTokenAddress', lpTokenAddress)

        let liquidityFeeToBalanceAC = await ethers.provider.getBalance(_liquidityFeeTo);
        console.log("liquidityFeeToBalanceAC",liquidityFeeToBalanceAC)
        expect(liquidityFeeToBalanceAC).to.be.gt(liquidityFeeToBalanceBC)
        // expect(liquidityFeeToBalanceAC).to.be.eq(liquidityFeeToBalanceBC + _lpTransferFeeAmount)

        let lpTokenContract = await ethers.getContractAt("ERC20", lpTokenAddress);
        let lpTokenBalanceOfBondingCurveAfterCurveCompletion = await lpTokenContract.balanceOf(bondingCurve.target)
        console.log("lpTokenBalanceOfBondingCurveAfterCurveCompletion",lpTokenBalanceOfBondingCurveAfterCurveCompletion)
        expect(lpTokenBalanceOfBondingCurveAfterCurveCompletion).to.be.eq(0n);

        let tokenBalanceOfBondingCurveAfterCompletion = await token.balanceOf(bondingCurve.target)
        console.log("tokenBalanceOfBondingCurveAfterCompletion", tokenBalanceOfBondingCurveAfterCompletion)
        expect(tokenBalanceOfBondingCurveAfterCompletion).to.be.eq(0n);

        let ethBalanceOfBondingCurveAfterCompletion = await ethers.provider.getBalance(bondingCurve.target)
        console.log("ethBalanceOfBondingCurveAfterCompletion",ethBalanceOfBondingCurveAfterCompletion)
        expect(tokenBalanceOfBondingCurveAfterCompletion).to.be.eq(0n);

    })

    function getFeeAmount(totalAmount) {
        return totalAmount / 101n;
    }

    function addFeeAmount(totalAmount) {
        return (totalAmount* 101n)/ 100n;
    }

    it("9. should handle exact buy and complete bonding curve ", async function () {
        // buyer is buying here
        let buyer = otherAccounts[0];
        let buyAmount = ethers.parseEther("3.03");
        await expect(bondingCurve.connect(buyer).buy({ value: buyAmount }))
            .to.emit(bondingCurve, "LogBuy");

        let requireAmountToCompleteBondingCurve = await bondingCurve.amountToCompleteBondingCurve();
        buyAmount = addFeeAmount(requireAmountToCompleteBondingCurve);
        console.log('buyAmount',buyAmount);

        let userEthBalanceBeforeBuy = await ethers.provider.getBalance(buyer);
        let liquidityFeeToBalanceBC = await ethers.provider.getBalance(_liquidityFeeTo);
        console.log("liquidityFeeToBalanceBC", liquidityFeeToBalanceBC)
        // bonding curve will be completed on this buy
        // await bondingCurve.connect(buyer).buy({ value: buyAmount })

        

        await expect(await bondingCurve.connect(buyer).buy({ value: buyAmount }))
            .to.emit(bondingCurve, "BondingCurveComplete");

        let userEthBalanceAfterBuy = await ethers.provider.getBalance(buyer);
        console.log("userEthBalanceAfterBuy", ethers.formatEther(userEthBalanceAfterBuy))
        expect(userEthBalanceAfterBuy).to.be.lt(userEthBalanceBeforeBuy - buyAmount);

        const lpTokenAddress = await uniswapV2Factory.getPair(await uniswapV2Router.WETH(), tokenAddress);
        console.log('lpTokenAddress', lpTokenAddress)

        let liquidityFeeToBalanceAC = await ethers.provider.getBalance(_liquidityFeeTo);
        console.log("liquidityFeeToBalanceAC", liquidityFeeToBalanceAC)
        console.log("liquidityFeeToBalanceAC - liquidityFeeToBalanceBC",liquidityFeeToBalanceAC - liquidityFeeToBalanceBC)
        expect(liquidityFeeToBalanceAC).to.be.gt(liquidityFeeToBalanceBC)
        // expect(liquidityFeeToBalanceAC).to.be.eq(liquidityFeeToBalanceBC + _lpTransferFeeAmount)

        let lpTokenContract = await ethers.getContractAt("ERC20", lpTokenAddress);
        let lpPairContract = await ethers.getContractAt("IUniswapV2Pair", lpTokenAddress);
        let lpTokenBalanceOfBondingCurveAfterCurveCompletion = await lpTokenContract.balanceOf(bondingCurve.target)
        console.log("lpTokenBalanceOfBondingCurveAfterCurveCompletion", lpTokenBalanceOfBondingCurveAfterCurveCompletion)
        expect(lpTokenBalanceOfBondingCurveAfterCurveCompletion).to.be.eq(0n);

        let tokenBalanceOfBondingCurveAfterCompletion = await token.balanceOf(bondingCurve.target)
        console.log("tokenBalanceOfBondingCurveAfterCompletion", tokenBalanceOfBondingCurveAfterCompletion)
        expect(tokenBalanceOfBondingCurveAfterCompletion).to.be.eq(0n);

        let ethBalanceOfBondingCurveAfterCompletion = await ethers.provider.getBalance(bondingCurve.target)
        console.log("ethBalanceOfBondingCurveAfterCompletion", ethBalanceOfBondingCurveAfterCompletion)
        expect(tokenBalanceOfBondingCurveAfterCompletion).to.be.eq(0n);
        
        console.log("token.balanceOf(lpTokenContract.target) ", await token.balanceOf(lpTokenContract.target))
        // console.log("ether balanceOf(lpTokenContract.target) ", await ethers.provider.getBalance(lpTokenContract.target))
        console.log("token.balanceOf(lpTokenContract.target) ", await lpPairContract.getReserves())


        await expect(bondingCurve.connect(buyer).buy({ value: buyAmount }))
            .to.be.revertedWith('bonding curve must be active');

        await expect(bondingCurve.connect(buyer).sell(ethers.parseEther('1')))
            .to.be.revertedWith('bonding curve must be active');
    })
});
