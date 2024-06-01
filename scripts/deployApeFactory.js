const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // const _tokenURI = "https://ipfs.io/ipfs/"
    // const hash = "Qma5qWGCsB9CPLFxp6DmrzvwHGWfmQUWnYA63KPbWZ8iVj"

    // Replace these values with your desired parameters
    const _feeToSetter = deployer.address;
    const _feeTo = "0xdd0D4b40D8dCfB8741634b7432f53D36EAc1792B";
    const _liquidityFeeTo = "0xdd0D4b40D8dCfB8741634b7432f53D36EAc1792B";
    const _totalTokenSupply = '1000000000';
    const _initialTokenSupply = ethers.parseEther('1000');
    const _initialPoolBalance = 8571428;
    const _reserveRatio = 500000;
    const _lpTransferEthAmount = ethers.parseEther('4');
    const _lpTransferFeeAmount = ethers.parseEther('0.200001');
    // const _uniswapV2RouterAddress = "0x1689E7B1F10000AE47eBfE339a4f69dECd19F602";//base-sepolia
    // const _uniswapV2RouterAddress = "0x1689E7B1F10000AE47eBfE339a4f69dECd19F602";//base-sepolia
    const _uniswapV2RouterAddress = "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24";//base-tenderly (same as base)

    console.log("Deploying ApeFactory...");
    const ApeFactoryContract = await ethers.getContractFactory("ApeFactory");
    const apeFactory = await ApeFactoryContract.deploy(
        _feeToSetter,
        _feeTo,
        _liquidityFeeTo,
        _totalTokenSupply,
        _initialTokenSupply,
        _initialPoolBalance,
        _reserveRatio,
        _lpTransferEthAmount,
        _lpTransferFeeAmount,
        _uniswapV2RouterAddress
    );

    await apeFactory.waitForDeployment();
    console.log("ApeFactory deployed to:", apeFactory.target);

    // await tenderly.verify({
    //     address : apeFactory.target,
    //     name: "ApeFactory",
    // });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log("errorrrr",error);
        console.error(error);
        process.exit(1);
    });

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
// 0x43bbaC1E810E19C1608a26626FCc04D45f5918f5
// 0xb4FBc25204d26C4a937F4CBa67087F70B21bb6c5   14142579


// "npx hardhat run scripts/deployApeFactory.js --network base"
// 0x7722B77e691ceA11047f030f1b128432A1a6FfCA