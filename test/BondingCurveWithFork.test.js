const { expect } = require("chai");
const { ethers } = require("hardhat");

// const UNISWAPV2_ROUTER_CONTRACT = 0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24

describe.only("BondingCurveWithFork", function () {
    let bondingCurve;
    let token;
    let owner;
    let feeToSetter;
    let otherAccounts;
    let reserveRatio;
    let ApeFactory;

    beforeEach(async function () {
        [owner, feeToSetter, feeTo, ...otherAccounts] = await ethers.getSigners();
        reserveRatio = 607071;

        const ApeFactoryContract = await ethers.getContractFactory("ApeFactory");
        ApeFactory = await ApeFactoryContract.deploy(reserveRatio, feeToSetter.address, feeTo.address);
        await ApeFactory.waitForDeployment();

        const tokenName = "ApeCoin";
        const tokenSymbol = "APE";
        const totalSupply = ethers.parseEther("1000000000");
        const etherToSend = ethers.parseEther("1");

        let createdToken = await ApeFactory.createToken(tokenName, tokenSymbol)

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

    function getFeeAmount(totalAmount){
        return totalAmount/101n;
    }

    it("8. should handle over buy and complete bonding curve ", async function () {
        //buyer is buying here
        let buyer = otherAccounts[0];
        let buyAmount = ethers.parseEther("3.03");
        await expect(bondingCurve.connect(buyer).buy({ value: buyAmount }))
            .to.emit(bondingCurve, "LogBuy");

        let requireAmountToCompleteBondingCurve = await bondingCurve.amountToCompleteBondingCurve();
        let excessAmount = ethers.parseEther("1");
        buyAmount = requireAmountToCompleteBondingCurve + excessAmount;

        let userEthBalanceBeforeBuy = await ethers.provider.getBalance(buyer);
        console.log("userEthBalanceBeforeBuy",ethers.formatEther(userEthBalanceBeforeBuy))

        await bondingCurve.connect(buyer).buy({ value: buyAmount })


        let userEthBalanceAfterBuy = await ethers.provider.getBalance(buyer);
        console.log("userEthBalanceAfterBuy", ethers.formatEther(userEthBalanceAfterBuy))

        expect(userEthBalanceAfterBuy).to.be.lt(userEthBalanceBeforeBuy - requireAmountToCompleteBondingCurve);
        // expect(userEthBalanceAfterBuy).to.be.gt(userEthBalanceBeforeBuy + excessAmount);
        // expect(userEthBalanceAfterBuy).to.be.lt(userEthBalanceBeforeBuy);

    })
    // it("3. should sell tokens to bonding curve", async function () {
    //     await token.transfer(bondingCurve.address, ethers.parseEther("100000"));

    //     const seller = otherAccounts[1];
    //     const sellAmount = ethers.parseEther("10000");

    //     await token.transfer(seller.address, sellAmount);
    //     await token.connect(seller).approve(bondingCurve.address, sellAmount);

    //     const initialPoolBalance = await ethers.provider.getBalance(bondingCurve.address);

    //     await expect(bondingCurve.connect(seller).sell(sellAmount))
    //         .to.emit(bondingCurve, "LogSell");

    //     const finalPoolBalance = await ethers.provider.getBalance(bondingCurve.address);
    //     expect(finalPoolBalance).to.be.lt(initialPoolBalance);
    // });

    // it("4. should not sell tokens if user has insufficient balance", async function () {
    //     const seller = otherAccounts[2];
    //     const sellAmount = ethers.parseEther("10000");

    //     await expect(bondingCurve.connect(seller).sell(sellAmount))
    //         .to.be.revertedWith("Insufficient token balance of user");
    // });

    // it("5. should not sell tokens if bonding curve has insufficient funds", async function () {
    //     await token.transfer(bondingCurve.address, ethers.parseEther("100000"));

    //     const seller = otherAccounts[3];
    //     const sellAmount = ethers.parseEther("100000");

    //     await token.transfer(seller.address, sellAmount);
    //     await token.connect(seller).approve(bondingCurve.address, sellAmount);

    //     await expect(bondingCurve.connect(seller).sell(sellAmount))
    //         .to.be.revertedWith("Bonding curve does not have sufficient funds");
    // });
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