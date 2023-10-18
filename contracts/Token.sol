// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {

    constructor(uint totalSAupply) ERC20("TomioCoin", "TOM") {
        _mint(msg.sender, totalSAupply);
    }

}