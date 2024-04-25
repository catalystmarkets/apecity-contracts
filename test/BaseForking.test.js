const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ShibaInuTokenSupply", function () {
    let shibaInuToken;

    beforeEach(async function () {
        let shibaInuTokenAddress = "0x5243C3728C376D7ad748fB20E91c3555c209Ab14";
        shibaInuToken = await ethers.getContractAt("IERC20", shibaInuTokenAddress);
    });

    it("should get Shiba Inu token's total supply", async function () {

        console.log("getBlockNumber", await ethers.provider.getBlockNumber())
        let shibaInuTotalSupply = await shibaInuToken.totalSupply();
        console.log("Shiba Inu Total Supply:", ethers.formatUnits(shibaInuTotalSupply, 18));
    });
});
