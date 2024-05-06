const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    
    console.log("creating new token")
    // console.log("Deploying ApeFactory...");

    // const apeFactoryContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

    //localhost factory address
    // 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
    const apeFactoryContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

    const ApeFactory = await ethers.getContractAt("ApeFactory", apeFactoryContractAddress);

    const tokenName = "ApeCoin";
    const tokenSymbol = "APE";
    const imageURL = "https://www.google.com/url?sa=i&url=https%3A%2F%2Fkrita-artists.org%2Ft%2Fdone-with-this-random-anime-character%2F15439&psig=AOvVaw2SVJCXvDk9yvxSlKMP_00w&ust=1714212675921000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCOji-v7R34UDFQAAAAAdAAAAABAE";

    let createdToken = await ApeFactory.createToken(tokenName, tokenSymbol, imageURL)
    console.log('createdToken',createdToken);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });


// "npx hardhat run scripts/createToken.js --network hardhat"
// "npx hardhat run scripts/deployApeFactory.js --network baseSepolia"
// "npx hardhat run scripts/createToken.js --network localhost"
