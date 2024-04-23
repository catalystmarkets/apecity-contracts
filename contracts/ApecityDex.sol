// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.25;

// import {BancorFormula} from './BancorFormula.sol';
// // import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// // contract ERC20FixedSupply is ERC20 {
// //     constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
// //         _mint(msg.sender, initialSupply);
// //     }
// // }

// contract BondingCurve is BancorFormula {

//     mapping(address => uint256) public poolBalances;
//     uint256 poolBalance;
//     uint256 reserveRatio;
//     address tokenAddress;

//     constructor(address _tokenAddress,uint256 _reserveRatio) payable {
//         require(msg.value > 0);
//         poolBalance += msg.value;

//         reserveRatio = _reserveRatio;
//         tokenAddress = _tokenAddress;
//     }

//     // function createToken(string memory name, string memory symbol, uint256 totalSupply) public onlyOwner returns (address) {
//     //     ERC20FixedSupply token = new ERC20FixedSupply(name, symbol, totalSupply);
//     //     tokenList[address(token)] = address(token);
//     //     return address(token);
//     // }

//     function getCirculatingSupply() public view returns(uint256){
//         uint256 totalSupply = IERC20(tokenAddress).totalSupply();
//         uint256 balanceOfBondingCurve = IERC20(tokenAddress).balanceOf(address(this));
//         return totalSupply - balanceOfBondingCurve;
//     }


//     // function buy() public payable returns(bool) {
//     //     require(msg.value > 0);
//     //     uint256 tokensToMint = calculatePurchaseReturn(totalSupply_, poolBalance, reserveRatio, msg.value);
//     //     totalSupply_ = totalSupply_.add(tokensToMint);
//     //     balances[msg.sender] = balances[msg.sender].add(tokensToMint);
//     //     poolBalance = poolBalance.add(msg.value);
//     //     LogMint(tokensToMint, msg.value);
//     //     return true;
//     // }
//     function buy() public payable returns(bool) {
//         require(msg.value > 0);
//         IERC20 erc20Token = IERC20(tokenAddress);

//         uint256 tokenTotalSupply = erc20Token.totalSupply();
//         uint256 bondingCurveTokenBalance = erc20Token.balanceOf(address(this));
//         uint256 currentCirculatingSupply = tokenTotalSupply - bondingCurveTokenBalance;
    
//         uint256 tokensToTransfer = calculatePurchaseReturn(currentCirculatingSupply, poolBalance, reserveRatio, msg.value);

//         require(tokensToTransfer <= bondingCurveTokenBalance, "INSUFFICIENT TOKEN BALANCE");
//         require(erc20Token.transfer(msg.sender, tokensToTransfer), "ERC20 transfer failed");
//         poolBalance += msg.value;

//         emit LogBuy(tokensToTransfer, msg.value);
//         return true;
//     }

// //   function sell(uint256 sellAmount) public validGasPrice returns(bool) {
// //     require(sellAmount > 0 && balances[msg.sender] >= sellAmount);
// //     uint256 ethAmount = calculateSaleReturn(totalSupply_, poolBalance, reserveRatio, sellAmount);
// //     msg.sender.transfer(ethAmount);
// //     poolBalance = poolBalance.sub(ethAmount);
// //     balances[msg.sender] = balances[msg.sender].sub(sellAmount);
// //     totalSupply_ = totalSupply_.sub(sellAmount);
// //     LogWithdraw(sellAmount, ethAmount);
// //     return true;
// //   }
//     function sell(uint256 sellAmount) public returns(bool) {
//         require(sellAmount > 0);

//         IERC20 erc20Token = IERC20(tokenAddress);
//         require(erc20Token.balanceOf(msg.sender) >= sellAmount, "Insufficient token balance of user");

//         // uint256 tokenTotalSupply = erc20Token.totalSupply();
//         // uint256 bondingCurveTokenBalance = erc20Token.balanceOf(address(this));
//         // uint256 currentCirculatingSupply = tokenTotalSupply - bondingCurveTokenBalance;

//         uint256 currentCirculatingSupply = getCirculatingSupply();

//         uint256 ethAmount = calculateSaleReturn(currentCirculatingSupply, poolBalance, reserveRatio, sellAmount);
// //      uint256 ethAmount = calculateSaleReturn(totalSupply_, poolBalance, reserveRatio, sellAmount);


//         require(ethAmount <= poolBalance, "Bonding curve does not have sufficient funds");
//         payable(msg.sender).transfer(ethAmount);
//         poolBalance -= ethAmount;
// //      msg.sender.transfer(ethAmount);
// //      poolBalance = poolBalance.sub(ethAmount);

//         require(erc20Token.transferFrom(msg.sender, address(this), sellAmount));
// //      balances[msg.sender] = balances[msg.sender].sub(sellAmount);
// //      totalSupply_ = totalSupply_.sub(sellAmount);


//         emit LogSell(sellAmount, ethAmount);
//         return true;
// //     LogWithdraw(sellAmount, ethAmount);
// //     return true;
//     }

//   event LogBuy(uint256 amountBought, uint256 totalCost);
//   event LogSell(uint256 amountSell, uint256 reward);
// }



// // contract ApecityDex is BancorFormula ,Ownable{
// //     mapping(address => address) public tokenList;
// //     mapping(address => uint256) public poolBalances;

// //     uint256 reserveRatio;

// //     constructor(uint256 _reserveRatio) Ownable(msg.sender){
// //         reserveRatio = _reserveRatio;
// //     }

// //     function createToken(string memory name, string memory symbol, uint256 totalSupply) public onlyOwner returns (address) {
// //         ERC20FixedSupply token = new ERC20FixedSupply(name, symbol, totalSupply);
// //         tokenList[address(token)] = address(token);
// //         return address(token);
// //     }

// //     function getCirculatingSupply(address memory tokenAddress) public returns(uint256){
// //         require(tokenAddress != address(0),"");
// //         uint256 memory totalSupply = IERC20(tokenAddress).totalSupply();
// //         uint256 memory balanceOfBondingCurve = IERC20(tokenAddress).balanceOf(this);
// //         return totalSupply - balanceOfBondingCurve;
// //     }

// //     function buy(address memory tokenAddress) public payable returns(bool) {
// //         require(msg.value > 0);

// //         IERC20 erc20Token = IERC20(tokenAddress);

// //         uint256 memory currentCirculatingSupply = getCirculatingSupply(tokenAddress);
// //         uint256 memory poolBalanceOfToken = poolBalances[tokenAddress];
// //         uint256 memory poolBalanceOfToken = poolBalances[tokenAddress];
// //         // tokenSupply
// //         uint256 tokensToMint = calculatePurchaseReturn(currentCirculatingSupply, poolBalanceOfToken, reserveRatio, msg.value);

// //         require()
// //         erc20Token.transfer()
// //         totalSupply_ = totalSupply_.add(tokensToMint);
// //         balances[msg.sender] = balances[msg.sender].add(tokensToMint);
        
// //         poolBalance[tokenAddress] += msg.value;
// //         LogMint(tokensToMint, msg.value);
// //         return true;
// //     }

// //     // function buy() public payable returns(bool) {
// //     //     require(msg.value > 0);
// //     //     uint256 tokensToMint = calculatePurchaseReturn(totalSupply_, poolBalance, reserveRatio, msg.value);
// //     //     totalSupply_ = totalSupply_.add(tokensToMint);
// //     //     balances[msg.sender] = balances[msg.sender].add(tokensToMint);
// //     //     poolBalance = poolBalance.add(msg.value);
// //     //     LogMint(tokensToMint, msg.value);
// //     //     return true;
// //     // }

// // }

// // // pragma solidity ^0.4.18;

// // // import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
// // // import "zeppelin-solidity/contracts/ownership/Ownable.sol";
// // // import "./BancorFormula.sol";


// // // /**
// // //  * @title Universal Bonding Curve
// // //  * @dev Bonding curve contract based on bacor formula
// // //  * inspired by bancor protocol and simondlr
// // //  * https://github.com/bancorprotocol/contracts
// // //  * https://github.com/ConsenSys/curationmarkets/blob/master/CurationMarkets.sol
// // //  * uses bancor formula
// // //  */
// // // contract BondingCurveUniversal is StandardToken, BancorFormula, Ownable {
// // //   uint256 public poolBalance;

// // //   /*
// // //     reserve ratio, represented in ppm, 1-1000000
// // //     1/3 corresponds to y= multiple * x^2
// // //     1/2 corresponds to y= multiple * x
// // //     2/3 corresponds to y= multiple * x^1/2
// // //     multiple will depends on contract initialization,
// // //     specificallytotalAmount and poolBalance parameters
// // //     we might want to add an 'initialize' function that will allow
// // //     the owner to send ether to the contract and mint a given amount of tokens
// // //   */
// // //   uint32 reserveRatio;

// // //   /*
// // //     - Front-running attacks are currently mitigated by the following mechanisms:
// // //     TODO - minimum return argument for each conversion provides a way to define a minimum/maximum price for the transaction
// // //     - gas price limit prevents users from having control over the order of execution
// // //   */
// // //   uint256 public gasPrice = 0 wei; // maximum gas price for bancor transactions

// // //   /**
// // //    * @dev default function
// // //    * gas price for this one is 128686 ~ $3 - too high for fallback fn
// // //    * do we need it?
// // //    */
// // //   function() public payable {
// // //     buy();
// // //   }

// // //   /**
// // //    * @dev buy tokens
// // //    * gas cost 77508
// // //    * @return {bool}
// // //    */
// // //   function buy() public validGasPrice payable returns(bool) {
// // //     require(msg.value > 0);
// // //     uint256 tokensToMint = calculatePurchaseReturn(totalSupply_, poolBalance, reserveRatio, msg.value);
// // //     totalSupply_ = totalSupply_.add(tokensToMint);
// // //     balances[msg.sender] = balances[msg.sender].add(tokensToMint);
// // //     poolBalance = poolBalance.add(msg.value);
// // //     LogMint(tokensToMint, msg.value);
// // //     return true;
// // //   }

// // //   /**
// // //    * @dev sell tokens
// // //    * gase cost 86454
// // //    * @param sellAmount amount of tokens to withdraw
// // //    * @return {bool}
// // //    */
// // //   function sell(uint256 sellAmount) public validGasPrice returns(bool) {
// // //     require(sellAmount > 0 && balances[msg.sender] >= sellAmount);
// // //     uint256 ethAmount = calculateSaleReturn(totalSupply_, poolBalance, reserveRatio, sellAmount);
// // //     msg.sender.transfer(ethAmount);
// // //     poolBalance = poolBalance.sub(ethAmount);
// // //     balances[msg.sender] = balances[msg.sender].sub(sellAmount);
// // //     totalSupply_ = totalSupply_.sub(sellAmount);
// // //     LogWithdraw(sellAmount, ethAmount);
// // //     return true;
// // //   }

// // //   // verifies that the gas price is lower than the universal limit
// // //   modifier validGasPrice() {
// // //     assert(tx.gasprice <= gasPrice);
// // //     _;
// // //   }

// // //   /**
// // //       @dev allows the owner to update the gas price limit
// // //       @param _gasPrice    new gas price limit
// // //   */
// // //   function setGasPrice(uint256 _gasPrice) public onlyOwner {
// // //     require(_gasPrice > 0);
// // //     gasPrice = _gasPrice;
// // //   }

// // //   event LogMint(uint256 amountMinted, uint256 totalCost);
// // //   event LogWithdraw(uint256 amountWithdrawn, uint256 reward);
// // //   event LogBondingCurve(string logString, uint256 value);
// // // }

