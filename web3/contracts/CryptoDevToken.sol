// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import '../node_modules/@openzeppelin/contracts/access/Ownable.sol';
import '../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol';
import './ICryptoDevs.sol';

contract CryptoDevToken is ERC20, Ownable{
    uint public tokenPrice = 0.00001 ether;
    uint public maxTotalSupply = 1000 * 10 **18;
    uint public tokenPerNft = 10 * 10 ** 18;
    mapping (uint=>bool) tokenIdsClaimed;

    ICryptoDevs cryptoDevs;
    constructor(address _icryptoDevs) ERC20('Crypto Dev Token', 'CD'){
        cryptoDevs = ICryptoDevs(_icryptoDevs);
    }

    function mint(uint amount) public payable {
        uint totalAmount = amount * tokenPrice;
        require(msg.value >= totalAmount, "Not Sufficient ethers");
         // total tokens + amount <= 10000, otherwise revert the transaction
        uint256 amountWithDecimals = amount * 10**18;
        require((totalSupply() + amountWithDecimals) <= maxTotalSupply,
            "Exceeds the max total supply available.");
        
        _mint(msg.sender, amountWithDecimals);
    }

    function claim() public payable {
        address sender = msg.sender;
        uint balance = cryptoDevs.balanceOf(sender);
        require(balance > 0, "You dont have any NFT");

        uint amount = 0;
        for(uint i=0; i<balance; i++){
            uint tokenId = cryptoDevs.tokenOfOwnerByIndex(sender, i);
            if(!tokenIdsClaimed[tokenId]){
                amount += 1;
                tokenIdsClaimed[i] = true;
            }
        require(amount > 0, "You already claimed all tokens");
        _mint(msg.sender, amount * tokenPerNft);
        }
    }

    function withdraw() public payable onlyOwner {
        uint amount = address(this).balance;
        require(amount > 0, "You don't have any amount to withdraw");
        address _owner = owner();
        (bool sent, ) = _owner.call{value : amount}("");
        require(sent, "Amount not sent");
    }

    receive() external payable {}
    fallback() external payable {}
}