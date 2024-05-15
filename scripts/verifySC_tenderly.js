const { ethers } = require("hardhat");

async function main() {
    const bondingCurveContractAddress = "0x4947afad612795cd4c642b81b978964dbb961f21"

    await tenderly.verify({
        address: bondingCurveContractAddress,
        name: "BondingCurve",
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

//     `
// TENDERLY_PRIVATE_VERIFICATION=true \
// TENDERLY_AUTOMATIC_VERIFICATION=true \
// npx hardhat run scripts/verifySC_tenderly.js --network baseIdTenderly
//     `

//     `
// TENDERLY_PRIVATE_VERIFICATION=true \
// TENDERLY_AUTOMATIC_VERIFICATION=true \
// npx hardhat run scripts/deployApeFactory.js --network baseTenderly
//     `

// "npx hardhat run scripts/deployApeFactory.js --network hardhat"
// "npx hardhat run scripts/deployApeFactory.js --network baseSepolia"
// "npx hardhat run scripts/deployApeFactory.js --network baseTenderly"
// "npx hardhat run scripts/deployApeFactory.js --network localhost"

// "npx hardhat run scripts/deployApeFactory.js --network baseIdTenderly"
// 0x7722b77e691cea11047f030f1b128432a1a6ffca

// base-tenderly ape factory address
// 0xDeca67A17195Db554BBa847AD8b5AcBb18e2C8a3

//localhost factory address
// 0x5FbDB2315678afecb367f032d93F642f64180aa3