// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * Simple Paymaster-like contract (placeholder)
 * This contract allows owner to deposit/withdraw funds and sponsor address transfers.
 * Note: For real ERC-4337 Paymaster logic, integrate EntryPoint and proper validation.
 */
contract Paymaster is Ownable {
    event Funded(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);
    event Sponsored(address indexed to, uint256 amount);

    receive() external payable {
        emit Funded(msg.sender, msg.value);
    }

    function sponsor(address payable _to, uint256 _amount) external onlyOwner {
        require(address(this).balance >= _amount, "insufficient funds");
        (bool ok, ) = _to.call{value: _amount}("");
        require(ok, "transfer failed");
        emit Sponsored(_to, _amount);
    }

    function withdraw(address payable _to, uint256 _amount) external onlyOwner {
        require(address(this).balance >= _amount, "insufficient funds");
        (bool ok, ) = _to.call{value: _amount}("");
        require(ok, "withdraw failed");
        emit Withdrawn(_to, _amount);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
