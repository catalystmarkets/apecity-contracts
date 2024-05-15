
const { ethers } = require("hardhat");

async function main() {
    const bondingCurveContractAddress = "0x4947afad612795cd4c642b81b978964dbb961f21"
    const tokenContractAddress = "0x20e01ed6caac5b486d2f147c468155ecf48279a4"
    const apeFactoryContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

    const [deployer] = await ethers.getSigners();
    let buyer = deployer

    const ApeFactory = await ethers.getContractAt("ApeFactory", apeFactoryContractAddress);
    const bondingCurve = await ethers.getContractAt("BondingCurve", bondingCurveContractAddress);
    const token = await ethers.getContractAt("ERC20FixedSupply", tokenContractAddress);


    // let buyerEthBalance = await ethers.provider.getBalance(buyer);
    // console.log('buyerEthBalance', buyerEthBalance)

    // let amountToBuy = await bondingCurve.amountToCompleteBondingCurve() + ethers.parseEther("1")
    // console.log('amountToBuy', amountToBuy)
    // let bought = await bondingCurve.connect(buyer).buy({ value: amountToBuy })
    // console.log('bought', bought)

    // let buyerTokenBalance = await token.balanceOf(buyer)
    // console.log('buyerTokenBalance after buy', buyerTokenBalance)

    let circulatingSupply = await bondingCurve.getCirculatingSupply();
    console.log('circulatingSupply',circulatingSupply.toString());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// "npx hardhat run scripts/tokenInfo.js --network baseIdTenderly"
