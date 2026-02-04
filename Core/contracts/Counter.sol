// SPDX-License-Identifier: UNLICENSED
// SPDX-License-Identifier: UNLICENSED // Không chỉ định license cụ thể
pragma solidity ^0.8.28;
// Yêu cầu phiên bản Solidity (>= 0.8.28 < 0.9.0)

contract Counter {
  uint public x; // Biến đếm công khai, sinh getter tự động

  event Increment(uint by); // Sự kiện phát khi tăng, mang giá trị tăng

  function inc() public {
    x++;                // Tăng biến đếm lên 1
    emit Increment(1);  // Phát sự kiện với giá trị tăng là 1
  }

  function incBy(uint by) public {
    require(by > 0, "incBy: increment should be positive"); // Ràng buộc số tăng phải dương
    x += by;                                                 // Tăng biến đếm lên 'by'
    emit Increment(by);                                      // Phát sự kiện với giá trị tăng 'by'
  }
}
