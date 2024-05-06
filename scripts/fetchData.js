const { ethers } = require("hardhat");

async function main() {

    //base-tenderly
    const apeFactoryContractAddress = "0x205f875c5f69b3ae4d6cf9f3962d5187ff18fafd"

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
