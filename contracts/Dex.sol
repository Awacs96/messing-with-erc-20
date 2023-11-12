// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Dex {
    IERC20 public associatedToken;

    uint price;
    address owner;

    constructor(IERC20 _token, uint _price) {
        associatedToken = _token;
        price = _price;
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "You are not the owner.");
        _;
    }

    function sell() external onlyOwner {
        uint allowance = associatedToken.allowance(owner, address(this));
        require(allowance > 0, "There is no allowance set at this time. Make sure you set the allowance.");

        bool sent = associatedToken.transferFrom(owner, address(this), allowance);
        require(sent, "Transaction failed.");
    }

    function withdrawTokens() external onlyOwner {
        uint balance = associatedToken.balanceOf(address(this));
        associatedToken.transfer(owner, balance);
    }

    function withdrawFunds() external onlyOwner {
        (bool sent, ) = payable(owner).call{ value: address(this).balance }("");
        require(sent, "Transaction failed.");
    }

    function getPrice(uint numTokens) public view returns(uint) {
        return numTokens * price;
    }

    function buy(uint numTokens) external payable {
        require(getTokenBalance() >= numTokens, "Insufficient funds.");
        require(getPrice(numTokens) == msg.value, "The funds provided do not match the price.");

        associatedToken.transfer(msg.sender, numTokens);
    }

    function getTokenBalance() public view returns(uint) {
        return associatedToken.balanceOf(address(this));
    }
}