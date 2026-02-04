// SPDX-License-Identifier: MIT
// SPDX-License-Identifier: MIT // Khai báo license theo chuẩn SPDX
pragma solidity ^0.8.20;
// Chỉ định phiên bản Solidity yêu cầu (>= 0.8.20 < 0.9.0)

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// Import chuẩn ERC20 từ OpenZeppelin để kế thừa chức năng token

contract Team7 is ERC20 {
    // Khai báo hợp đồng Team7 kế thừa ERC20
    constructor() ERC20("Team7", "T7") {
        // Khởi tạo tên token "Team7" và ký hiệu "T7"
        _mint(msg.sender, 1000000 * (10 ** uint256(decimals())));
        // Mint 1,000,000 token theo đơn vị thập phân (decimals) cho địa chỉ triển khai (msg.sender)
    }
    // Kết thúc hàm khởi tạo
}
// Kết thúc hợp đồng Team7