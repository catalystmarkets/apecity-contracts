const { expect } = require('chai');
const { ethers } = require('hardhat');
const BigNumber = require('bignumber.js');

describe('BancorFormula', () => {
    let instance;
    let accounts;

    const xx = ethers.parseEther('1');
    const yy = ethers.formatEther(xx);

    const decimals = 18;
    const startSupply = ethers.parseEther('10');
    const startPoolBalance = ethers.parseEther('0.0001');
    const reserveRatio = Math.round(1 / 3 * 1000000) / 1000000;
    const solRatio = Math.floor(reserveRatio * 1000000);
    const gasPriceBad = ethers.parseEther('22');

    before(async () => {
        console.log('sss');
        const BancorFormula = await ethers.getContractFactory('BancorFormula');
        // instance = await BancorFormula.deploy(startSupply, startPoolBalance, solRatio);
        instance = await BancorFormula.deploy();
        // await instance.deployed();
        console.log('instance.address', instance.address);

        accounts = await ethers.getSigners();
    });

    // async function getRequestParams(amount) {
    //     let supply = await instance.totalSupply();
    //     supply = supply.toString();

    //     let poolBalance = await instance.poolBalance();
    //     poolBalance = poolBalance.toString();

    //     return {
    //         supply,
    //         poolBalance,
    //         solRatio
    //     };
    // }

    it('should estimate price for token amount correctly', async () => {

        let initialSupplyEth = '1000' 
        // let initialSupplyEth = '10' 
        console.log('initialSupplyEth',initialSupplyEth)
        let initialSupply = ethers.parseEther(initialSupplyEth)

        // let initialPoolBalance = ethers.parseEther('0.0001');
        let initialPoolBalance = ethers.parseEther('1000');
        let ethersIn = ethers.parseEther('1');

        console.log('initialSupply', initialSupply.toString());
        console.log('initialPoolBalance', initialPoolBalance.toString());
        console.log('solRatio', solRatio);
        console.log('ethersIn', ethersIn.toString());

        let estimate = await instance.calculatePurchaseReturn(
            initialSupply,
            initialPoolBalance,
            solRatio,
            ethersIn
        );

        console.log('estimate', estimate);
        console.log('estimate', estimate.toString());
        // return

        let newSupply = initialSupply + estimate;
        let newPoolBalance = initialPoolBalance + ethersIn;
        let sellAmount = estimate;

        console.log('newSupply', newSupply);
        console.log('newPoolBalance', newPoolBalance.toString());
        console.log('solRatio', solRatio);
        console.log('sellAmount', sellAmount);
        let saleReturn = await instance.calculateSaleReturn(
            newSupply,
            newPoolBalance,
            solRatio,
            sellAmount
        );

        console.log('saleReturn', saleReturn);
        console.log('saleReturn', saleReturn.toString());
        console.log('saleReturn - ethersIn', (saleReturn - ethersIn));
        console.log('saleReturn - ethersIn', ethers.formatEther((saleReturn - ethersIn).toString()));



        // console.log('at last final supply', ethers.formatEther((saleReturn - ethersIn).toString()));
        console.log('at last pool balance', ethers.formatEther((newPoolBalance - saleReturn).toString()));
        


    });
});