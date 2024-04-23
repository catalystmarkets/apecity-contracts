// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {UD60x18, ud} from "@prb/math/src/UD60x18.sol";

import "hardhat/console.sol";

contract ApeFormula {
    uint256 private constant MAX_WEIGHT = 1000000;

    function calculatePurchaseReturn(
        uint256 _supply,
        uint256 _connectorBalance,
        uint256 _connectorWeight,
        uint256 _depositAmount
    ) public pure returns (uint256) {

        require(_supply > 0, "ApeFormula: Supply not > 0.");
        require(_connectorBalance > 0, "ApeFormula: ConnectorBalance not > 0");
        require(_connectorWeight > 0, "ApeFormula: Connector Weight not > 0");
        require(
            _connectorWeight <= MAX_WEIGHT,
            "ApeFormula: Connector Weight not <= MAX_WEIGHT"
        );

        if (_depositAmount == 0) return 0;

        if (_connectorWeight == MAX_WEIGHT)
            return
                ud(_supply)
                    .mul(ud(_depositAmount))
                    .div(ud(_connectorBalance))
                    .unwrap();

        UD60x18 result;

        UD60x18 base = (ud(_depositAmount).add(ud(_connectorBalance))).div(
            ud(_connectorBalance)
        );
        UD60x18 exp = ud(_connectorWeight).div(ud(MAX_WEIGHT));

        result = base.pow(exp);

        result = (ud(_supply).mul(result)).sub(ud(_supply));
        return result.unwrap() - 1000;
    }

    function calculateSaleReturn(
        uint256 _supply,
        uint256 _connectorBalance,
        uint256 _connectorWeight,
        uint256 _sellAmount
    ) public pure returns (uint256) {
        // validate input
        require(_supply > 0, "ApeFormula: Supply not > 0.");
        require(_connectorBalance > 0, "ApeFormula: ConnectorBalance not > 0");
        require(_connectorWeight > 0, "ApeFormula: Connector Weight not > 0");
        require(
            _connectorWeight <= MAX_WEIGHT,
            "ApeFormula: Connector Weight not <= MAX_WEIGHT"
        );
        require(
            _sellAmount <= _supply,
            "ApeFormula: Sell Amount not <= Supply"
        );

        if (_sellAmount == 0) return 0;

        if (_sellAmount == _supply) return _connectorBalance;

        if (_connectorWeight == MAX_WEIGHT) {
            return
                (ud(_connectorBalance).mul(ud(_sellAmount)).div(ud(_supply)))
                    .unwrap();
        }

        UD60x18 result;
        UD60x18 base = ud(_supply).div((ud(_supply).sub(ud(_sellAmount))));
        UD60x18 exp = ud(MAX_WEIGHT).div(ud(_connectorWeight));
        result = base.pow(exp);

        UD60x18 temp1 = ud(_connectorBalance).mul(result);
        UD60x18 temp2 = ud(_connectorBalance);

        result = (temp1.sub(temp2)).div(result);
        return result.unwrap();
    }

    function estimateEthInForExactTokensOut(
        uint256 _supply,
        uint256 _connectorBalance,
        uint256 _connectorWeight,
        uint256 _tokenAmountOut
    ) public pure returns (uint256) {
        require(_supply > 0, "ApeFormula: Supply not > 0.");
        require(_connectorBalance > 0, "ApeFormula: ConnectorBalance not > 0");
        require(_connectorWeight > 0, "ApeFormula: Connector Weight not > 0");
        require(
            _connectorWeight <= MAX_WEIGHT,
            "ApeFormula: Connector Weight not <= MAX_WEIGHT"
        );

        if (_tokenAmountOut == 0) return 0;

        if (_connectorWeight == MAX_WEIGHT)
            return
                ud(_tokenAmountOut)
                    .mul(ud(_connectorBalance))
                    .div(ud(_supply))
                    .unwrap();

        UD60x18 result;

        UD60x18 base = (ud(_tokenAmountOut).add(ud(_supply))).div(ud(_supply));
        UD60x18 exp = ud(MAX_WEIGHT).div(ud(_connectorWeight));

        result = base.pow(exp);

        result = (ud(_connectorBalance).mul(result)).sub(ud(_connectorBalance));
        return result.unwrap() + 1000;
    }

    function estimateTokenInForExactEthOut(
        uint256 _supply,
        uint256 _connectorBalance,
        uint256 _connectorWeight,
        uint256 _ethOut
    ) public pure returns (uint256) {
        require(_supply > 0, "ApeFormula: Supply not > 0.");
        require(_connectorBalance > 0, "ApeFormula: ConnectorBalance not > 0");
        require(_connectorWeight > 0, "ApeFormula: Connector Weight not > 0");
        require(
            _connectorWeight <= MAX_WEIGHT,
            "ApeFormula: Connector Weight not <= MAX_WEIGHT"
        );
        if (_ethOut == 0) return 0;

        uint256 effectiveEthOut = _ethOut + 1000;

        if (_connectorWeight == MAX_WEIGHT)
            return
                ud(_supply)
                    .mul(ud(effectiveEthOut))
                    .div(ud(_connectorBalance))
                    .unwrap();

        UD60x18 result;

        UD60x18 base = (ud(_connectorBalance)).div(
            ud(_connectorBalance).sub(ud(effectiveEthOut))
        );
        UD60x18 exp = ud(_connectorWeight).div(ud(MAX_WEIGHT));

        result = base.pow(exp);

        UD60x18 temp1 = ud(_supply).mul(result);
        UD60x18 temp2 = ud(_supply);

        result = ((temp1.sub(temp2)).div(result));
        return result.unwrap();

    }
}
