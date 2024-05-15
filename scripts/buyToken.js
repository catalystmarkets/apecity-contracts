
const { ethers } = require("hardhat");

async function main() {
    // const bondingCurveContractAddress = "0x4947afad612795cd4c642b81b978964dbb961f21"
    // const tokenContractAddress = "0x20e01ed6caac5b486d2f147c468155ecf48279a4"
    const bondingCurveContractAddress = "0xa92c4c49553e4aa4ef5278c527cfd6cd28b0ebd7"
    const tokenContractAddress = "0x78b12ed913a73b58ca2339bb2c5a1370d6a521d0"
    const apeFactoryContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

    const [deployer] = await ethers.getSigners();
    let buyer = deployer

    const ApeFactory = await ethers.getContractAt("ApeFactory", apeFactoryContractAddress);
    const bondingCurve = await ethers.getContractAt("BondingCurve", bondingCurveContractAddress);
    const token = await ethers.getContractAt("ERC20FixedSupply", tokenContractAddress);


    let buyerEthBalance = await ethers.provider.getBalance(buyer); 
    console.log('buyerEthBalance',buyerEthBalance)

    // let amountToBuy = await bondingCurve.amountToCompleteBondingCurve() + ethers.parseEther("1")
    let amountToBuy = ethers.parseEther("1.01")
    console.log('amountToBuy',amountToBuy)
    let bought = await bondingCurve.connect(buyer).buy({ value: amountToBuy })
    console.log('bought', bought)

    let buyerTokenBalance = await token.balanceOf(buyer)
    console.log('buyerTokenBalance after buy', buyerTokenBalance)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// "npx hardhat run scripts/buyToken.js --network baseIdTenderly"
// 1000000000000000000n
// 1010000000000000000n
// 341564036.918951881273237000n