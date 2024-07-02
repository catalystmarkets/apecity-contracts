const { ethers } = require("hardhat");

const numberOfTransaction = 10
const timeBetweenTwoTx = 10


async function main() {
    const bondingCurveContractAddress = "0xe4d1d1c08e544ca117c53257ed64a6566c81cfaa";
    const tokenContractAddress = "0x679bdf22560fa9314824000119746aaf1196bff6";
    const apeFactoryContractAddress = "0x7722B77e691ceA11047f030f1b128432A1a6FfCA";


    await new Promise(resolve => setTimeout(resolve, 2000));

    const [deployer] = await ethers.getSigners();
    let buyer = deployer;

    const bondingCurve = await ethers.getContractAt("BondingCurve", bondingCurveContractAddress);
    const token = await ethers.getContractAt("ERC20FixedSupply", tokenContractAddress);

    for (let i = 0; i < numberOfTransaction; i++) {
        let randomAmount = (Math.random() * (0.3 - 0.01) + 0.01).toFixed(2); // Generate random amount between 0.01 and 0.3
        let amountToBuy = ethers.parseEther(randomAmount);

        // Perform buy operation
        console.log(`Attempting to buy with ${randomAmount} ETH (iteration ${i + 1})`);
        // let buyTx = await bondingCurve.connect(buyer).buy({ value: amountToBuy });

        // let buyTx = await bondingCurve.functions["buy()"]({ value: amountToBuy });
        let buyTx = await bondingCurve["buy()"]({ value: amountToBuy });

        await buyTx.wait();
        console.log(`Buy transaction ${i + 1} completed`);

        // Check buyer's token balance after buying
        let buyerTokenBalance = await token.balanceOf(buyer.address);
        console.log(`Buyer token balance after buy (iteration ${i + 1}):`, ethers.formatEther(buyerTokenBalance));

        // Perform sell operation
        let amountToSell = ethers.parseUnits((Math.random() * (parseFloat(ethers.formatEther(buyerTokenBalance)))).toFixed(2), 18);
        // if (amountToSell.gt(0)) {
            let approveTx = await token.approve(bondingCurveContractAddress, amountToSell);
            await approveTx.wait();
            console.log(`Approval transaction ${i + 1} completed`);

            console.log(`Attempting to sell ${ethers.formatEther(amountToSell)} tokens (iteration ${i + 1})`);
            let sellTx = await bondingCurve.connect(buyer).sell(amountToSell);
            await sellTx.wait();
            console.log(`Sell transaction ${i + 1} completed`);

            // Check buyer's token balance after selling
            buyerTokenBalance = await token.balanceOf(buyer.address);
            console.log(`Buyer token balance after sell (iteration ${i + 1}):`, ethers.formatEther(buyerTokenBalance));
        // }

        // Wait for 5 seconds before next iteration
        await new Promise(resolve => setTimeout(resolve, timeBetweenTwoTx));
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// Run the script using: npx hardhat run scripts/randomBuySell.js --network baseIdTenderly
