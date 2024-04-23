// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { UD60x18, ud } from "@prb/math/src/UD60x18.sol";

import "hardhat/console.sol";

contract BancorFormulaNew {
    // string public version = '0.3';

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

        UD60x18 result;

        UD60x18 base = (ud(_depositAmount).add(ud(_connectorBalance))).div(ud(_connectorBalance));
        UD60x18 exp = ud(_connectorWeight).div(ud(MAX_WEIGHT));

        result = base.pow(exp);

        return (ud(_supply).mul(result)).sub(ud(_supply)).unwrap();
    }

    function calculateSaleReturn(uint256 _supply, uint256 _connectorBalance, uint256 _connectorWeight, uint256 _sellAmount) public pure returns (uint256) {
        require(_supply > 0 && _connectorBalance > 0 && _connectorWeight > 0 && _connectorWeight <= MAX_WEIGHT && _sellAmount <= _supply);

        if (_sellAmount == 0)
            return 0;

        if (_sellAmount == _supply)
            return _connectorBalance;

        UD60x18 result;
        UD60x18 base = ud(_supply).div((ud(_supply).sub(ud(_sellAmount))));
        UD60x18 exp = ud(MAX_WEIGHT).div(ud(_connectorWeight));
        result = base.pow(exp);

        UD60x18 temp1 = ud(_connectorBalance).mul(result);
        UD60x18 temp2 = ud(_connectorBalance);
        
        return (temp1.sub(temp2)).div(result).unwrap();
    }
}