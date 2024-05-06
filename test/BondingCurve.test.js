const { expect } = require("chai");
const { ethers } = require("hardhat");

// const UNISWAPV2_ROUTER_CONTRACT = 0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24

describe.only("BondingCurve", function () {
    let bondingCurve;
    let token;
    let owner;
    let otherAccounts;
    let ApeFactory;
    // let uniswapV2Router02
    // IUniswapV2Router02

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
        _lpTransferFeeAmount = ethers.parseEther('0.2');
        _uniswapV2RouterAddress = "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24";

        const ApeFactoryContract = await ethers.getContractFactory("ApeFactory");

        console.log(
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


        const tokenName = "ApeCoin";
        const tokenSymbol = "APE";
        const imageURL = "APE";

        let createdToken = await ApeFactory.createToken(tokenName, tokenSymbol, imageURL)

        const tokenLength = await ApeFactory.allTokensLength();
        const tokenAddress = await ApeFactory.allTokens(0);

        const bondingCurveAddress = await ApeFactory.getBondingCurve(tokenAddress);

        const ERC20FixedSupply = await ethers.getContractFactory("ERC20FixedSupply");
        token = ERC20FixedSupply.attach(tokenAddress);

        const BondingCurve = await ethers.getContractFactory("BondingCurve");
        bondingCurve = BondingCurve.attach(bondingCurveAddress);

        // console.log("ApeFactory.target", ApeFactory.target)
        // console.log('createdToken transaction hash', createdToken.hash)
        // console.log('tokenLength', tokenLength)
        // console.log('tokenAddress', tokenAddress)
        // console.log('bondingCurveAddress', bondingCurveAddress);
    });

    it("1. should create bonding curve with initial funds", async function () {
        const poolBalance = await ethers.provider.getBalance(bondingCurve.target);
        expect(poolBalance).to.equal(ethers.parseEther("0"));

        const tokenBalanceOfBondingContract = await token.balanceOf(bondingCurve.target);
        expect(tokenBalanceOfBondingContract).to.equal(ethers.parseEther("1000000000"));

        const tokenCirculatingSupply = await bondingCurve.getCirculatingSupply();
        expect(tokenCirculatingSupply).to.equal(ethers.parseEther("1000"));
    });


    function getFeeAmount(totalAmount){
        return totalAmount/101n;
    }

    it("2. should buy tokens from bonding curve", async function () {

        let buyer = otherAccounts[0];
        let platformFeeTo = ApeFactory.feeTo();
        let buyAmount = ethers.parseEther("1.01");
        let platformFees = getFeeAmount(buyAmount);
        let buyAmountNetValue = buyAmount - platformFees;
        let tokenCirculatingSupply = await bondingCurve.getCirculatingSupply();
        let poolBalance = await bondingCurve.poolBalance();
        let reserveRatio = await bondingCurve.reserveRatio();

        // console.log('tokenCirculatingSupply', tokenCirculatingSupply)
        // console.log('poolBalance', poolBalance)
        // console.log('reserveRatio', reserveRatio)
        // console.log('buyAmountNetValue', buyAmountNetValue)

        let expectedBuyReturn = await bondingCurve.calculatePurchaseReturn(
            tokenCirculatingSupply,
            poolBalance,
            reserveRatio,
            buyAmountNetValue
        )
        console.log('expectedBuyReturn', expectedBuyReturn)
        let buyerBalance;

        buyerBalance = await token.balanceOf(buyer.address);
        expect(buyerBalance).to.eq(0);

        let platformFeeToAccountBalanceBeforeBuy = await ethers.provider.getBalance(platformFeeTo); 
        console.log('platformFeeToAccountBalanceBeforeBuy',platformFeeToAccountBalanceBeforeBuy)

        await expect(bondingCurve.connect(buyer).buy({ value: buyAmount }))
            .to.emit(bondingCurve, "LogBuy");

        buyerBalance = await token.balanceOf(buyer.address);
        expect(buyerBalance).to.be.eq(expectedBuyReturn);

        let platformFeeToAccountBalanceAfterBuy = await ethers.provider.getBalance(platformFeeTo);
        console.log('platformFeeToAccountBalanceAfterBuy', platformFeeToAccountBalanceAfterBuy)
        expect(platformFeeToAccountBalanceAfterBuy).to.be.eq(platformFeeToAccountBalanceBeforeBuy + platformFees)
    });

    it("3. should sell tokens from bonding curve", async function () {
        //buyer is buying here
        let buyer = otherAccounts[0];
        let buyAmount = ethers.parseEther("1.01");
        await expect(bondingCurve.connect(buyer).buy({ value: buyAmount }))
            .to.emit(bondingCurve, "LogBuy");

        // all selling tests
        let seller = buyer;
        let factoryAddress = await bondingCurve.factory();
        let platformFeeTo = ApeFactory.feeTo();
        let sellerTokenBalanceBeforeSell = await token.balanceOf(seller)
        let sellAmount = sellerTokenBalanceBeforeSell;
        let tokenCirculatingSupply = await bondingCurve.getCirculatingSupply();
        let poolBalance = await bondingCurve.poolBalance();
        let reserveRatio = await bondingCurve.reserveRatio();

        let sellerEthBalanceBeforeSell = await ethers.provider.getBalance(seller.address);

        console.log('tokenCirculatingSupply', tokenCirculatingSupply)
        console.log('poolBalance', poolBalance)
        console.log('reserveRatio', reserveRatio)
        console.log('sellAmount', sellAmount)

        let expectedSellReturn = await bondingCurve.calculateSaleReturn(
            tokenCirculatingSupply,
            poolBalance,
            reserveRatio,
            sellAmount
        )
        console.log('expectedSellReturn', expectedSellReturn)

        let platformFees = getFeeAmount(expectedSellReturn);
        console.log('platformFees',platformFees)

        let sellAmountNetReturn = expectedSellReturn - platformFees;
        console.log('sellAmountNetReturn',sellAmountNetReturn)

        let platformFeeToAccountBalanceBeforeSell = await ethers.provider.getBalance(platformFeeTo);
        console.log('platformFeeToAccountBalanceBeforeSell', platformFeeToAccountBalanceBeforeSell)

        await token.connect(seller).approve(bondingCurve.target, sellAmount)
        tokenAllowances = await token.allowance(seller, bondingCurve.target)
        console.log('tokenAllowances',tokenAllowances)
        expect(tokenAllowances).to.be.gte(sellAmount)

        console.log("bondingCurve.target", bondingCurve.target)
        await expect(bondingCurve.connect(seller).sell(sellAmount))
            .to.emit(bondingCurve, "LogSell");

        let sellerEthBalanceAfterSell = await ethers.provider.getBalance(seller.address);
        expect(sellerEthBalanceAfterSell).to.be.gt(sellerEthBalanceBeforeSell);
        // expect(sellerEthBalanceAfterSell).to.be.eq(sellerEthBalanceBeforeSell + sellAmountNetReturn);

        let sellerTokenBalanceAfterSell = await token.balanceOf(seller.address);
        expect(sellerTokenBalanceAfterSell).to.be.eq(sellerTokenBalanceBeforeSell - sellAmount);

        let platformFeeToAccountBalanceAfterSell = await ethers.provider.getBalance(platformFeeTo);
        console.log('platformFeeToAccountBalanceAfterSell', platformFeeToAccountBalanceAfterSell)
        expect(platformFeeToAccountBalanceAfterSell).to.be.eq(platformFeeToAccountBalanceBeforeSell + platformFees)

        let bondingcurvePoolBalanceOnTotalSold = await bondingCurve.poolBalance();
        console.log('bondingcurvePoolBalanceOnTotalSold', bondingcurvePoolBalanceOnTotalSold)

        let bondingcurveBalanceOnTotalSold = await ethers.provider.getBalance(bondingCurve.target);
        console.log('bondingcurveBalanceOnTotalSold', bondingcurveBalanceOnTotalSold)
    });

    it("4. should estimate eth in for exact token out", async function(){

        let tokenCirculatingSupply = await bondingCurve.getCirculatingSupply();
        let poolBalance = await bondingCurve.poolBalance();
        let reserveRatio = await bondingCurve.reserveRatio();
        let buyAmount = ethers.parseEther("1.01");
        let platformFees = getFeeAmount(buyAmount);
        let buyAmountNetValue = buyAmount - platformFees;
        let actualEthIn = buyAmountNetValue;

        console.log('buyAmountNetValue',buyAmountNetValue)
        let tokenAmountOut = await bondingCurve.calculatePurchaseReturn(
            tokenCirculatingSupply,
            poolBalance,
            reserveRatio,
            actualEthIn
        )
        console.log('actualEthIn', actualEthIn)

        let estimatedEthIn = await bondingCurve.estimateEthInForExactTokensOut(
            tokenCirculatingSupply,
            poolBalance,
            reserveRatio,
            tokenAmountOut
        )

        console.log('estimatedEthIn',estimatedEthIn)

        expect(estimatedEthIn).to.be.gt(actualEthIn)
        expect(estimatedEthIn - actualEthIn).to.be.gt(0n)
        expect(estimatedEthIn - actualEthIn).to.be.lt(1000n)
    })

    it("5. should estimate token in for exact eth out", async function () {
        //this test says that estimateTokenInForExactEth always predicts or estimate token in in a way that can yield more than or equal to token required.

        //buyer is buying here
        let buyer = otherAccounts[0];
        let buyAmount = ethers.parseEther("3.03");
        await expect(bondingCurve.connect(buyer).buy({ value: buyAmount }))
            .to.emit(bondingCurve, "LogBuy");

        // all selling tests
        let seller = buyer;
        let sellerTokenBalanceBeforeSell = await token.balanceOf(seller)
        let sellAmount = sellerTokenBalanceBeforeSell;
        let tokenCirculatingSupply = await bondingCurve.getCirculatingSupply();
        let poolBalance = await bondingCurve.poolBalance();
        let reserveRatio = await bondingCurve.reserveRatio();

        console.log('tokenCirculatingSupply', tokenCirculatingSupply)
        console.log('poolBalance', poolBalance)
        console.log('reserveRatio', reserveRatio)
        console.log('sellAmount', sellAmount)

        let wantedEthOut = ethers.parseEther("3")

        let estimatedTokenIn = await bondingCurve.estimateTokenInForExactEthOut(
            tokenCirculatingSupply,
            poolBalance,
            reserveRatio,
            wantedEthOut
        )
        console.log('estimatedTokenIn', estimatedTokenIn)

        let actualEthOut = await bondingCurve.calculateSaleReturn(
            tokenCirculatingSupply,
            poolBalance,
            reserveRatio,
            estimatedTokenIn
        )
        console.log('actualEthOut', actualEthOut)
        console.log('wantedEthOut', wantedEthOut)
        expect(actualEthOut).to.be.gt(wantedEthOut)
    })

    // it("6. complete bonding curve (50% supply)", async function () {
    //     //this test says that estimateTokenInForExactEth always predicts or estimate token in in a way that can yield more than or equal to token required.

    //     //buyer is buying here
    //     let buyer = otherAccounts[0];
    //     let buyAmount = ethers.parseEther("3.03");
    //     await expect(bondingCurve.connect(buyer).buy({ value: buyAmount }))
    //         .to.emit(bondingCurve, "LogBuy");

    //     let tokenCirculatingSupply = await bondingCurve.getCirculatingSupply();
    //     let poolBalance = await bondingCurve.poolBalance();
    //     let reserveRatio = await bondingCurve.reserveRatio();
    //     let tatalSupply = await token.totalSupply();

    //     console.log('tokenCirculatingSupply', tokenCirculatingSupply)
    //     console.log('poolBalance', poolBalance)
    //     console.log('reserveRatio', reserveRatio)

    //     const fullBondingCurveRequirementSupply = ethers.parseEther("500009000")
    //     const remainingSupply = fullBondingCurveRequirementSupply - tokenCirculatingSupply

    //     const requiredEthIn = await bondingCurve.estimateEthInForExactTokensOut(
    //         tokenCirculatingSupply,
    //         poolBalance,
    //         reserveRatio,
    //         remainingSupply
    //     )
    //     console.log('requiredEthIn', requiredEthIn)

    //     let atMostPoolBalance = ethers.parseEther('4.212')
    //     let easyEthIn = atMostPoolBalance - poolBalance
    //     console.log("easyEthIn", easyEthIn)
            
    //     await expect(bondingCurve.connect(buyer).buy({ value: easyEthIn }))
    //     .to.emit(bondingCurve, "LogBuy");

    //     console.log("bonding curve balance", await ethers.provider.getBalance(bondingCurve.target)) 

    //     let newTokenCirculatingSupply = await bondingCurve.getCirculatingSupply();
    //     let newPoolBalance = await bondingCurve.poolBalance();
    //     let actualLeftSupply = await token.balanceOf(bondingCurve.target)
    //     // let leftSupply = tatalSupply - newTokenCirculatingSupply
    //     console.log('actual leftSupply', actualLeftSupply)
    //     console.log('newTokenCirculatingSupply', newTokenCirculatingSupply)
    //     console.log('newPoolBalance', newPoolBalance)
        
    // })

    // it("7. should create uniswap contract at completion of bonding curve (50% supply)(certain pool balance !!)", async function () {
    //     //this test says that estimateTokenInForExactEth always predicts or estimate token in in a way that can yield more than or equal to token required.

    //     //buyer is buying here
    //     let buyer = otherAccounts[0];
    //     let buyAmount = ethers.parseEther("3.03");
    //     await expect(bondingCurve.connect(buyer).buy({ value: buyAmount }))
    //         .to.emit(bondingCurve, "LogBuy");

    //     let amountToCompleteBondingCurve = await bondingCurve.amountToCompleteBondingCurve()
    //     console.log("amountToCompleteBondingCurve", amountToCompleteBondingCurve)

    //     await expect(bondingCurve.connect(buyer).buy({ value: amountToCompleteBondingCurve }))
    //         .to.emit(bondingCurve, "LogBuy");

    //     console.log("bonding curve balance", await ethers.provider.getBalance(bondingCurve.target))
    //     console.log("bonding curve balance", await bondingCurve.active())

    //     // expect(await bondingCurve.active()).to.be.false;

    // })

    // it("8. should handle over buy and complete bonding curve ", async function () {
    //     //buyer is buying here
    //     let buyer = otherAccounts[0];
    //     let buyAmount = ethers.parseEther("3.03");
    //     await expect(bondingCurve.connect(buyer).buy({ value: buyAmount }))
    //         .to.emit(bondingCurve, "LogBuy");

    //     let requireAmountToCompleteBondingCurve = await bondingCurve.amountToCompleteBondingCurve();
    //     let excessAmount = ethers.parseEther("1");
    //     buyAmount = requireAmountToCompleteBondingCurve + excessAmount;

    //     let userEthBalanceBeforeBuy = await ethers.provider.getBalance(buyer);
    //     console.log("userEthBalanceBeforeBuy",ethers.formatEther(userEthBalanceBeforeBuy))

    //     await bondingCurve.connect(buyer).buy({ value: buyAmount })


    //     let userEthBalanceAfterBuy = await ethers.provider.getBalance(buyer);
    //     console.log("userEthBalanceAfterBuy", ethers.formatEther(userEthBalanceAfterBuy))

    //     expect(userEthBalanceAfterBuy).to.be.lt(userEthBalanceBeforeBuy - requireAmountToCompleteBondingCurve);
    //     // expect(userEthBalanceAfterBuy).to.be.gt(userEthBalanceBeforeBuy + excessAmount);
    //     // expect(userEthBalanceAfterBuy).to.be.lt(userEthBalanceBeforeBuy);

    // })
});

// describe("BancorFormula", function () {
//     let bancorFormula;

//     beforeEach(async function () {
//         const BancorFormula = await ethers.getContractFactory("BancorFormula");
//         bancorFormula = await BancorFormula.deploy();
//         await bancorFormula.waitForDeployment();
//     });

//     it("should calculate purchase return correctly", async function () {
//         const supply = ethers.parseEther("1000000");
//         const connectorBalance = ethers.parseEther("500000");
//         const connectorWeight = 500000; // 50%
//         const depositAmount = ethers.parseEther("100000");

//         const purchaseReturn = await bancorFormula.calculatePurchaseReturn(
//             supply,
//             connectorBalance,
//             connectorWeight,
//             depositAmount
//         );

//         expect(purchaseReturn).to.be.gt(0);
//     });

//     it("should calculate sale return correctly", async function () {
//         const supply = ethers.parseEther("1000000");
//         const connectorBalance = ethers.parseEther("500000");
//         const connectorWeight = 500000; // 50%
//         const sellAmount = ethers.parseEther("100000");

//         const saleReturn = await bancorFormula.calculateSaleReturn(
//             supply,
//             connectorBalance,
//             connectorWeight,
//             sellAmount
//         );

//         expect(saleReturn).to.be.gt(0);
//     });
// });