const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ApeCityFactory", function () {
  let apeCityFactory;
  let owner;
  let feeToSetter;
  let reserveRatio;
  let otherAccounts;
//  529947368.
//  31875
//  318753745477408764000000
//          1000000000000000000
//   1000000000000000000
//    999999999999999973
//    999999999999999999

// +      66061499365000
// = 1000066061499365000
//   343833686662750781741000000
// +   1000000000000000000000000
// = 344833686662750781741000000
//  798991926
// 298850850664000000
//  798991926298850850664000000
//      34198161893553790158948
//  61021780
//  25159232
//  251592327845330686389444500
// 674732325967436538109217
//  70579
//  705797793118816016000000
//  0.000000000894000

  // 29383391
  // 30430310.362856
  // 59072080.306828
  // 86078490
  // 239138883.696465 GAYBIN

  beforeEach(async function () {
    [owner, feeToSetter, ...otherAccounts] = await ethers.getSigners();
    reserveRatio = 333333;

    const ApeCityFactory = await ethers.getContractFactory("ApeCityFactory");
    apeCityFactory = await ApeCityFactory.deploy(reserveRatio, feeToSetter.address);
    await apeCityFactory.waitForDeployment();

    console.log(apeCityFactory.target)
  });

  it("1. should set the reserve ratio and fee to setter correctly", async function () {
    expect(await apeCityFactory.reserveRatio()).to.equal(reserveRatio);
    console.log("await apeCityFactory.feeToSetter()", await apeCityFactory.feeToSetter())
    expect(await apeCityFactory.feeToSetter()).to.equal(feeToSetter.address);
  });

  it("2. should create a new token and bonding curve", async function () {
    const tokenName = "ApeCoin";
    const tokenSymbol = "APE";
    const totalSupply = ethers.parseEther("1000000000");
    const etherToSend = ethers.parseEther("1"); // Amount of Ether to send with the call

    let createdToken = await apeCityFactory.createToken(tokenName, tokenSymbol, totalSupply,{
      value: etherToSend
    })
    console.log('createdToken transaction hash', createdToken.hash)

    const allTokensLength = await apeCityFactory.allTokensLength();
    expect(allTokensLength).to.equal(1);

    const tokenAddress = await apeCityFactory.allTokens(0);
    console.log('allTokens[0]',tokenAddress);
    const bondingCurveAddress = await apeCityFactory.getBondingCurve(tokenAddress);
    console.log('bondingCurveAddress', bondingCurveAddress);
    const tokenReserveRatio = await apeCityFactory.getReserveRatio(bondingCurveAddress);
    console.log('tokenReserveRatio', tokenReserveRatio);

    expect(tokenReserveRatio).to.equal(reserveRatio);
    
    const ERC20FixedSupply = await ethers.getContractFactory("ERC20FixedSupply");
    const token = ERC20FixedSupply.attach(tokenAddress);
    // const token = await ethers.getContractAt("ERC20FixedSupply", tokenAddress);

    expect(await token.name()).to.equal(tokenName);
    expect(await token.symbol()).to.equal(tokenSymbol);
    expect(await token.totalSupply()).to.equal(totalSupply);
    expect(await token.balanceOf(bondingCurveAddress)).to.equal(totalSupply);
  });
  it("3. should set the reserve ratio correctly", async function () {
    const newReserveRatio = 750000; // 75%

    await apeCityFactory.setReserveRatio(newReserveRatio);
    expect(await apeCityFactory.reserveRatio()).to.equal(newReserveRatio);
  });

  it("4. should set the fee to address correctly", async function () {
    const newFeeTo = otherAccounts[0];

    await apeCityFactory.connect(feeToSetter).setFeeTo(newFeeTo.address);
    expect(await apeCityFactory.feeTo()).to.equal(newFeeTo.address);
  });

  it("5. should set the fee to setter address correctly", async function () {
    const newFeeToSetter = await otherAccounts[1];

    await apeCityFactory.connect(feeToSetter).setFeeToSetter(newFeeToSetter.address);
    expect(await apeCityFactory.feeToSetter()).to.equal(newFeeToSetter.address);
  });

  it("6. should not allow non-owner to set the reserve ratio", async function () {
    const nonOwner = await otherAccounts[1];
    const newReserveRatio = 600000; // 60%

    await expect(apeCityFactory.connect(nonOwner).setReserveRatio(newReserveRatio))
      .to.be.revertedWithCustomError(
        apeCityFactory
        ,"OwnableUnauthorizedAccount");
  });

  it("7. should not allow non-fee to setter to set the fee to address", async function () {
    const nonFeeToSetter = await otherAccounts[5];
    const newFeeTo = await otherAccounts[6];

    await expect(apeCityFactory.connect(nonFeeToSetter).setFeeTo(newFeeTo.address))
      .to.be.revertedWith("APECITYV1: FORBIDDEN");
  });

  it("8. should not allow non-fee to setter to set the fee to setter address", async function () {
    const nonFeeToSetter = await otherAccounts[7];
    const newFeeToSetter = await otherAccounts[8];

    await expect(apeCityFactory.connect(nonFeeToSetter).setFeeToSetter(newFeeToSetter.address))
      .to.be.revertedWith("APECITYV1: FORBIDDEN");
  });
});