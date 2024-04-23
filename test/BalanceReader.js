import { Signer } from 'ethers';
import { ethers } from 'hardhat';

import { BalanceReader, BalanceReader__factory } from '../typechain-types';

describe('BalanceReader tests', () => {

    let instance;
    let accounts;
    // Configure the addresses we can to check balances for
    const USDC_MAINNET_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'; // https://etherscan.io/token/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
    const ARBITRUM_ONE_GATEWAY = '0xcEe284F754E854890e311e3280b767F80797180d';
    const USDC_DECIMALS = 6;

    it('gets arbitrum gateway balance', async () => {
        // We get signers as in a normal test
        accounts = await ethers.getSigners();
        const factory = new BalanceReader__factory(accounts[0]);

        // We deploy the contract to our local test environment
        instance = await factory.deploy();

        // Our contract will be able to check the balances of the mainnet deployed contracts and address
        const balance = await instance.getERC20BalanceOf(ARBITRUM_ONE_GATEWAY, USDC_MAINNET_ADDRESS);
        const balanceAsString = ethers.formatUnits(balance, USDC_DECIMALS);

        console.log(
            'The USDC Balance of Arbitrum Gateway is $',
            Number(balanceAsString).toLocaleString(),
        );
    });
});