// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.25;

// import "abdk-libraries-solidity/ABDKMath64x64.sol";

// contract ApeFormula {
//     uint256 private constant MAX_WEIGHT = 1e18;

//     function calculatePurchaseReturn(
//         uint256 _supply,
//         uint256 _connectorBalance,
//         uint256 _connectorWeight,
//         uint256 _depositAmount
//     ) public pure returns (uint256) {
//         require(_supply > 0, "ApeFormula: Supply must be greater than zero");
//         require(_connectorBalance > 0, "ApeFormula: Connector balance must be greater than zero");
//         require(_connectorWeight <= MAX_WEIGHT, "ApeFormula: Connector weight must be less than or equal to MAX_WEIGHT");

//         if (_depositAmount == 0) {
//             return 0;
//         }

//         if (_connectorWeight == MAX_WEIGHT) {
//             return ABDKMath64x64.mulu(_supply, _depositAmount) / _connectorBalance;
//         }

//         int128 baseN = ABDKMath64x64.fromUInt(_depositAmount + _connectorBalance);
//         int128 baseD = ABDKMath64x64.fromUInt(_connectorBalance);
//         int128 expN = ABDKMath64x64.fromUInt(_connectorWeight);
//         int128 expD = ABDKMath64x64.fromUInt(MAX_WEIGHT);
//         int128 pow = ABDKMath64x64.div(baseN, baseD);
//         pow = ABDKMath64x64.pow(pow, expN, expD);
//         int128 result = ABDKMath64x64.mulu(ABDKMath64x64.fromUInt(_supply), pow) - ABDKMath64x64.fromUInt(_supply);

//         return ABDKMath64x64.toUInt(result);
//     }

//     function calculateSaleReturn(
//         uint256 _supply,
//         uint256 _connectorBalance,
//         uint256 _connectorWeight,
//         uint256 _sellAmount
//     ) public pure returns (uint256) {
//         require(_supply > 0, "ApeFormula: Supply must be greater than zero");
//         require(_connectorBalance > 0, "ApeFormula: Connector balance must be greater than zero");
//         require(_connectorWeight <= MAX_WEIGHT, "ApeFormula: Connector weight must be less than or equal to MAX_WEIGHT");
//         require(_sellAmount <= _supply, "ApeFormula: Sell amount must be less than or equal to supply");

//         if (_sellAmount == 0) {
//             return 0;
//         }

//         if (_sellAmount == _supply) {
//             return _connectorBalance;
//         }

//         if (_connectorWeight == MAX_WEIGHT) {
//             return ABDKMath64x64.mulu(_connectorBalance, _sellAmount) / _supply;
//         }

//         int128 baseN = ABDKMath64x64.fromUInt(_supply);
//         int128 baseD = ABDKMath64x64.fromUInt(_supply - _sellAmount);
//         int128 expN = ABDKMath64x64.fromUInt(MAX_WEIGHT);
//         int128 expD = ABDKMath64x64.fromUInt(_connectorWeight);
//         int128 pow = ABDKMath64x64.div(baseN, baseD);
//         pow = ABDKMath64x64.pow(pow, expN, expD);
//         int128 result = ABDKMath64x64.fromUInt(_connectorBalance) - ABDKMath64x64.div(ABDKMath64x64.fromUInt(_connectorBalance), pow);

//         return ABDKMath64x64.toUInt(result);
//     }

//     function estimateEthInForExactTokensOut(
//         uint256 _supply,
//         uint256 _connectorBalance,
//         uint256 _connectorWeight,
//         uint256 _tokenAmountOut
//     ) public pure returns (uint256) {
//         require(_supply > 0, "ApeFormula: Supply must be greater than zero");
//         require(_connectorBalance > 0, "ApeFormula: Connector balance must be greater than zero");
//         require(_connectorWeight <= MAX_WEIGHT, "ApeFormula: Connector weight must be less than or equal to MAX_WEIGHT");

//         if (_tokenAmountOut == 0) {
//             return 0;
//         }

//         if (_connectorWeight == MAX_WEIGHT) {
//             return ABDKMath64x64.mulu(_connectorBalance, _tokenAmountOut) / _supply;
//         }

//         int128 baseN = ABDKMath64x64.fromUInt(_tokenAmountOut + _supply);
//         int128 baseD = ABDKMath64x64.fromUInt(_supply);
//         int128 expN = ABDKMath64x64.fromUInt(MAX_WEIGHT);
//         int128 expD = ABDKMath64x64.fromUInt(_connectorWeight);
//         int128 pow = ABDKMath64x64.div(baseN, baseD);
//         pow = ABDKMath64x64.pow(pow, expN, expD);
//         int128 result = ABDKMath64x64.mulu(ABDKMath64x64.fromUInt(_connectorBalance), pow) - ABDKMath64x64.fromUInt(_connectorBalance);

//         return ABDKMath64x64.toUInt(result);
//     }

//     function estimateTokenInForExactEthOut(
//         uint256 _supply,
//         uint256 _connectorBalance,
//         uint256 _connectorWeight,
//         uint256 _ethOut
//     ) public pure returns (uint256) {
//         require(_supply > 0, "ApeFormula: Supply must be greater than zero");
//         require(_connectorBalance > 0, "ApeFormula: Connector balance must be greater than zero");
//         require(_connectorWeight <= MAX_WEIGHT, "ApeFormula: Connector weight must be less than or equal to MAX_WEIGHT");

//         if (_ethOut == 0) {
//             return 0;
//         }

//         if (_connectorWeight == MAX_WEIGHT) {
//             return ABDKMath64x64.mulu(_supply, _ethOut) / _connectorBalance;
//         }

//         int128 baseN = ABDKMath64x64.fromUInt(_connectorBalance);
//         int128 baseD = ABDKMath64x64.fromUInt(_connectorBalance - _ethOut);
//         int128 expN = ABDKMath64x64.fromUInt(_connectorWeight);
//         int128 expD = ABDKMath64x64.fromUInt(MAX_WEIGHT);
//         int128 pow = ABDKMath64x64.div(baseN, baseD);
//         pow = ABDKMath64x64.pow(pow, expN, expD);
//         int128 result = ABDKMath64x64.mulu(ABDKMath64x64.fromUInt(_supply), pow) - ABDKMath64x64.fromUInt(_supply);

//         return ABDKMath64x64.toUInt(result);
//     }
// }
// // pragma solidity ^0.8.25;

// // import "abdk-libraries-solidity/ABDKMath64x64.sol";

// // contract ApeFormula {
// //     using ABDKMath64x64 for uint256;
// //     using ABDKMath64x64 for int128;

// //     uint256 private constant MAX_WEIGHT = 1e18;

// //     // function calculatePurchaseReturn(
// //     //     uint256 _supply,
// //     //     uint256 _connectorBalance,
// //     //     uint256 _connectorWeight,
// //     //     uint256 _depositAmount
// //     // ) public pure returns (uint256) {
// //     //     require(_supply > 0, "ApeFormula: Supply must be greater than zero");
// //     //     require(_connectorBalance > 0, "ApeFormula: Connector balance must be greater than zero");
// //     //     require(_connectorWeight <= MAX_WEIGHT, "ApeFormula: Connector weight must be less than or equal to MAX_WEIGHT");

// //     //     if (_depositAmount == 0) {
// //     //         return 0;
// //     //     }

// //     //     if (_connectorWeight == MAX_WEIGHT) {
// //     //         return _supply.mul(_depositAmount).div(_connectorBalance);
// //     //     }

// //     //     int128 baseN = _depositAmount.fromUInt().add(_connectorBalance.fromUInt());
// //     //     int128 baseD = _connectorBalance.fromUInt();
// //     //     int128 expN = _connectorWeight.fromUInt();
// //     //     int128 expD = MAX_WEIGHT.fromUInt();
// //     //     int128 pow = baseN.div(baseD).pow(expN, expD);
// //     //     int128 result = _supply.fromUInt().mul(pow).sub(_supply.fromUInt());

// //     //     return result.toUInt();
// //     // }

// //     function calculateSaleReturn(
// //         uint256 _supply,
// //         uint256 _connectorBalance,
// //         uint256 _connectorWeight,
// //         uint256 _sellAmount
// //     ) public pure returns (uint256) {
// //         require(_supply > 0, "ApeFormula: Supply must be greater than zero");
// //         require(_connectorBalance > 0, "ApeFormula: Connector balance must be greater than zero");
// //         require(_connectorWeight <= MAX_WEIGHT, "ApeFormula: Connector weight must be less than or equal to MAX_WEIGHT");
// //         require(_sellAmount <= _supply, "ApeFormula: Sell amount must be less than or equal to supply");

// //         if (_sellAmount == 0) {
// //             return 0;
// //         }

// //         if (_sellAmount == _supply) {
// //             return _connectorBalance;
// //         }

// //         if (_connectorWeight == MAX_WEIGHT) {
// //             return _connectorBalance.mul(_sellAmount).div(_supply);
// //         }

// //         int128 baseN = _supply.fromUInt();
// //         int128 baseD = _supply.fromUInt().sub(_sellAmount.fromUInt());
// //         int128 expN = MAX_WEIGHT.fromUInt();
// //         int128 expD = _connectorWeight.fromUInt();
// //         int128 pow = baseN.div(baseD).pow(expN, expD);
// //         int128 result = _connectorBalance.fromUInt().sub(_connectorBalance.fromUInt().div(pow));

// //         return result.toUInt();
// //     }

// //     function estimateEthInForExactTokensOut(
// //         uint256 _supply,
// //         uint256 _connectorBalance,
// //         uint256 _connectorWeight,
// //         uint256 _tokenAmountOut
// //     ) public pure returns (uint256) {
// //         require(_supply > 0, "ApeFormula: Supply must be greater than zero");
// //         require(_connectorBalance > 0, "ApeFormula: Connector balance must be greater than zero");
// //         require(_connectorWeight <= MAX_WEIGHT, "ApeFormula: Connector weight must be less than or equal to MAX_WEIGHT");

// //         if (_tokenAmountOut == 0) {
// //             return 0;
// //         }

// //         if (_connectorWeight == MAX_WEIGHT) {
// //             return _connectorBalance.mul(_tokenAmountOut).div(_supply);
// //         }

// //         int128 baseN = _tokenAmountOut.fromUInt().add(_supply.fromUInt());
// //         int128 baseD = _supply.fromUInt();
// //         int128 expN = MAX_WEIGHT.fromUInt();
// //         int128 expD = _connectorWeight.fromUInt();
// //         int128 pow = baseN.div(baseD).pow(expN, expD);
// //         int128 result = _connectorBalance.fromUInt().mul(pow).sub(_connectorBalance.fromUInt());

// //         return result.toUInt();
// //     }

// //     function estimateTokenInForExactEthOut(
// //         uint256 _supply,
// //         uint256 _connectorBalance,
// //         uint256 _connectorWeight,
// //         uint256 _ethOut
// //     ) public pure returns (uint256) {
// //         require(_supply > 0, "ApeFormula: Supply must be greater than zero");
// //         require(_connectorBalance > 0, "ApeFormula: Connector balance must be greater than zero");
// //         require(_connectorWeight <= MAX_WEIGHT, "ApeFormula: Connector weight must be less than or equal to MAX_WEIGHT");

// //         if (_ethOut == 0) {
// //             return 0;
// //         }

// //         if (_connectorWeight == MAX_WEIGHT) {
// //             return _supply.mul(_ethOut).div(_connectorBalance);
// //         }

// //         int128 baseN = _connectorBalance.fromUInt();
// //         int128 baseD = _connectorBalance.fromUInt().sub(_ethOut.fromUInt());
// //         int128 expN = _connectorWeight.fromUInt();
// //         int128 expD = MAX_WEIGHT.fromUInt();
// //         int128 pow = baseN.div(baseD).pow(expN, expD);
// //         int128 result = _supply.fromUInt().mul(pow).sub(_supply.fromUInt());

// //         return result.toUInt();
// //     }
// // }