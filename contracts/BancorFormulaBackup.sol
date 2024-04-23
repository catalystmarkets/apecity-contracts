// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { UD60x18, ud } from "@prb/math/src/UD60x18.sol";

import "hardhat/console.sol";

contract BancorFormulaBackup {
    string public version = '0.3';

    uint256 private constant ONE = 1;
    uint256 private constant MAX_WEIGHT = 1000000;
    uint8 private constant MIN_PRECISION = 32;
    uint8 private constant MAX_PRECISION = 127;

    function calculatePurchaseReturn(uint256 _supply, uint256 _connectorBalance, uint256 _connectorWeight, uint256 _depositAmount) public pure returns (uint256) {
        require(_supply > 0 && _connectorBalance > 0 && _connectorWeight > 0 && _connectorWeight <= MAX_WEIGHT);

        if (_depositAmount == 0)
            return 0;
        
        if (_connectorWeight == MAX_WEIGHT)
            return ud(_supply).mul(ud(_depositAmount)).div(ud(_connectorBalance)).unwrap();

        // uint256 result;
        // uint8 precision;
        // uint256 baseN = safeAdd(_depositAmount, _connectorBalance);
        // (result, precision) = power(baseN, _connectorBalance, _connectorWeight, MAX_WEIGHT);
        // uint256 temp = safeMul(_supply, result) >> precision;
        // return temp - _supply;

        UD60x18 result;

        UD60x18 base = (ud(_depositAmount).add(ud(_connectorBalance))).div(ud(_connectorBalance));
        UD60x18 exp = ud(_connectorWeight).div(ud(MAX_WEIGHT));

        result = base.pow(exp);

        return (ud(_supply).mul(result)).sub(ud(_supply)).unwrap();
    }

    function calculateSaleReturn(uint256 _supply, uint256 _connectorBalance, uint256 _connectorWeight, uint256 _sellAmount) public pure returns (uint256) {
        console.log('hey1');
        require(_supply > 0 && _connectorBalance > 0 && _connectorWeight > 0 && _connectorWeight <= MAX_WEIGHT && _sellAmount <= _supply);

        console.log('hey2');
        if (_sellAmount == 0)
            return 0;

        console.log('hey3');
        if (_sellAmount == _supply)
            return _connectorBalance;

        UD60x18 result;
        UD60x18 base = ud(_supply).div((ud(_supply).sub(ud(_sellAmount))));
        console.log('base', base.unwrap());

        UD60x18 exp = ud(MAX_WEIGHT).div(ud(_connectorWeight));
        console.log('exp', exp.unwrap());

        result = base.pow(exp);
        console.log('result', result.unwrap());

        UD60x18 temp1 = ud(_connectorBalance).mul(result);
        console.log('temp1', temp1.unwrap());

        UD60x18 temp2 = ud(_connectorBalance);
        console.log('temp2', temp2.unwrap());
        
        return (temp1.sub(temp2)).div(result).unwrap();
    }
}