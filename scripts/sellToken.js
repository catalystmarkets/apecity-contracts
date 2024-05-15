
const { ethers } = require("hardhat");

async function main() {
    const bondingCurveContractAddress = "0x4947afad612795cd4c642b81b978964dbb961f21"
    const tokenContractAddress = "0x20e01ed6caac5b486d2f147c468155ecf48279a4"
    const apeFactoryContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

    const [deployer] = await ethers.getSigners();
    let seller = deployer

    const ApeFactory = await ethers.getContractAt("ApeFactory", apeFactoryContractAddress);
    const bondingCurve = await ethers.getContractAt("BondingCurve", bondingCurveContractAddress);
    const token = await ethers.getContractAt("ERC20FixedSupply", tokenContractAddress);

    let sellerTokenBalance = await token.balanceOf(seller)
    console.log('sellerTokenBalance before sell',sellerTokenBalance)

    let amountToSell = sellerTokenBalance/2n
    await token.connect(seller).approve(bondingCurve.target, amountToSell)
    let tokenAllowances = await token.allowance(seller, bondingCurve.target)
    console.log('tokenAllowances', tokenAllowances)
    
    let sold = await bondingCurve.connect(seller).sell(amountToSell)
    console.log('sold',sold)

    sellerTokenBalance = await token.balanceOf(seller)
    console.log('sellerTokenBalance after sell', sellerTokenBalance)

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// "npx hardhat run scripts/sellToken.js --network baseIdTenderly"
