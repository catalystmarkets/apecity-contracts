const hre = require("hardhat");

async function main() {

  const ERC20Demo = await hre.ethers.getContractFactory("ERC20Demo");
  const erc20Demo = await ERC20Demo.deploy("apecity first","apecy", "1000000000");

  await erc20Demo.waitForDeployment();

  console.log("erc20Demo deployed to:", erc20Demo.target);
}
// npx hardhat run scripts / ERC20Demo.js
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });