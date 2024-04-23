const { expect } = require('chai');
const { ethers } = require('hardhat');
const BigNumber = require('bignumber.js');
const Table = require('cli-table3');
const chalk = require('chalk');
const { formatNumber, formatNumberWithDecimals } = require('../utils/format');

describe('ApeFormulaExperiment', () => {
    let instance;
    let accounts;

    before(async () => {
        const ApeFormula = await ethers.getContractFactory('ApeFormula');
        instance = await ApeFormula.deploy();
        accounts = await ethers.getSigners();
    });

    it('should estimate price for token amount correctly', async () => {
        const allReserveRatios = ['333333', '607071']
        const units = {
            'initialSupply': 'APE',
            'initialPoolBalance': 'Gwei',
            'ethersIn': 'Ether',
            'estimate': 'APE'
        }
        const testCases = [
            {
                initialSupply: ethers.parseEther('1000'),
                initialPoolBalance: '1720281043',
                ethersIn: ethers.parseEther('1'),
            },
            {
                initialSupply: ethers.parseEther('1000'),
                initialPoolBalance: '1720281043',
                ethersIn: ethers.parseEther('2'),
            },
            {
                initialSupply: ethers.parseEther('1000'),
                initialPoolBalance: '1720281043',
                ethersIn: ethers.parseEther('3'),
            },
            {
                initialSupply: ethers.parseEther('1000'),
                initialPoolBalance: '1720281043',
                ethersIn: ethers.parseEther('4'),
            },
            {
                initialSupply: ethers.parseEther('1000'),
                initialPoolBalance: '1720281043',
                ethersIn: ethers.parseEther('4.2001'),
            },
        ];
        // 5000062272558704763069
        // const testCases = [
        //     {
        //         initialSupply: ethers.parseEther('1000000'),
        //         initialPoolBalance: '66061499365000',
        //         ethersIn: ethers.parseEther('1'),
        //     },
        //     {
        //         initialSupply: ethers.parseEther('1000000'),
        //         initialPoolBalance: '66061499365000',
        //         ethersIn: ethers.parseEther('2'),
        //     },
        //     {
        //         initialSupply: ethers.parseEther('1000000'),
        //         initialPoolBalance: '66061499365000',
        //         ethersIn: ethers.parseEther('3'),
        //     },
        //     {
        //         initialSupply: ethers.parseEther('1000000'),
        //         initialPoolBalance: '66061499365000',
        //         ethersIn: ethers.parseEther('4'),
        //     },
        // ];

        for (const reserveRatio of allReserveRatios) {

            const table = new Table({
                head: [
                    chalk.bold.green('Initial Supply'),
                    chalk.bold.blue('Initial Pool Balance'),
                    chalk.bold.yellow('Ethers In'),
                    chalk.bold.magenta('Estimate')
                ],
                colWidths: [25, 25, 20, 25]
            });


            for (const testCase of testCases) {
                const { initialSupply, initialPoolBalance, ethersIn} = testCase

                const estimate = await instance.calculatePurchaseReturn(
                    initialSupply,
                    initialPoolBalance,
                    reserveRatio,
                    ethersIn
                );

                // const estimateTokenEth = ethers.formatEther(estimate.toString())

                table.push([
                    `${formatNumberWithDecimals(initialSupply.toString(), 18)} ${units['initialSupply']}`,
                    `${formatNumberWithDecimals(initialPoolBalance.toString(), 9)} ${units['initialPoolBalance']}`,
                    `${formatNumberWithDecimals(ethersIn.toString(), 18)} ${units['ethersIn']}`,
                    estimate.toString()

                        // `${formatNumberWithDecimals(estimate.toString(), 18)} ${units['estimate']}`
                ]);
            }

            console.log('Bancor Formula Experiment');
            console.log('ReserveRatio: 0.' +reserveRatio)
            console.log(table.toString());
        }

    });

});