const { ethers } = require("hardhat");

async function main() {

    const apeFactoryContractAddress = "0x89de37F99A0eA5A6594Eda4eE567d97e1b8111D9"

    const ApeFactory = await ethers.getContractAt("ApeFactory", apeFactoryContractAddress);

    let allTokensLength = await ApeFactory.allTokensLength()
    console.log('allTokensLength', allTokensLength);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });


// "npx hardhat run scripts/fetchData.js --network baseTenderly"
