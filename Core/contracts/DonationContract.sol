// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DonationContract is Ownable {
    // Event được emit khi có donation
    event DonationReceived(address indexed donor, uint256 amount, uint256 timestamp);
    
    // Event được emit khi withdraw
    event Withdrawal(address indexed owner, uint256 amount, uint256 timestamp);
    
    // Tổng số tiền đã nhận
    uint256 public totalDonations;
    
    // Mapping để track donation của từng địa chỉ
    mapping(address => uint256) public donations;
    
    constructor() Ownable(msg.sender) {}
    
    // Hàm nhận donation (ETH)
    receive() external payable {
        require(msg.value > 0, "Donation must be greater than 0");
        
        donations[msg.sender] += msg.value;
        totalDonations += msg.value;
        
        emit DonationReceived(msg.sender, msg.value, block.timestamp);
    }
    
    // Hàm donate với tên rõ ràng
    function donate() external payable {
        require(msg.value > 0, "Donation must be greater than 0");
        
        donations[msg.sender] += msg.value;
        totalDonations += msg.value;
        
        emit DonationReceived(msg.sender, msg.value, block.timestamp);
    }
    
    // Lấy balance của contract
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // Lấy donation của một địa chỉ cụ thể
    function getDonationByAddress(address donor) external view returns (uint256) {
        return donations[donor];
    }
    
    // Withdraw toàn bộ - chỉ owner
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdraw failed");
        
        emit Withdrawal(owner(), balance, block.timestamp);
    }
    
    // Withdraw một lượng cụ thể - chỉ owner
    function withdrawAmount(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= amount, "Insufficient balance");
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Withdraw failed");
        
        emit Withdrawal(owner(), amount, block.timestamp);
    }
}
