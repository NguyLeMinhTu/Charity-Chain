// SPDX-License-Identifier: MIT
// SPDX-License-Identifier: MIT // Khai báo license theo chuẩn SPDX
pragma solidity ^0.8.28;
// Chỉ định phiên bản Solidity yêu cầu (>= 0.8.28 < 0.9.0)

contract Donation {
    // Hợp đồng quản lý các chiến dịch quyên góp
    struct Campaign {
        address payable owner;    // Chủ sở hữu chiến dịch, có thể nhận ETH
        uint256 goalAmount;       // Mục tiêu gây quỹ
        uint256 raisedAmount;     // Số tiền đã quyên góp được
        bool isActive;            // Trạng thái hoạt động của chiến dịch
    }

    mapping(uint256 => Campaign) public campaigns; // Lưu trữ chiến dịch theo ID
    uint256 public nextCampaignId;                 // ID tiếp theo cho chiến dịch mới

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed owner,
        uint256 goalAmount
    );
    // Sự kiện phát khi tạo chiến dịch mới

    event Donated(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount
    );
    // Sự kiện phát khi có một khoản quyên góp

    event Withdrawn(
        uint256 indexed campaignId,
        address indexed owner,
        uint256 amount
    );
    // Sự kiện phát khi chủ chiến dịch rút tiền

    modifier onlyOwner(uint256 _campaignId) {
        require(
            campaigns[_campaignId].owner == msg.sender,
            "Not campaign owner"
        );
        _;
    }
    // Chỉ cho phép chủ sở hữu chiến dịch tiếp tục thực thi hàm

    modifier campaignActive(uint256 _campaignId) {
        require(campaigns[_campaignId].isActive, "Campaign not active");
        _;
    }
    // Chỉ cho phép nếu chiến dịch đang hoạt động

    function createCampaign(uint256 _goalAmount) external returns (uint256) {
        require(_goalAmount > 0, "Goal must be > 0");
        // Mục tiêu gây quỹ phải lớn hơn 0

        uint256 campaignId = nextCampaignId;
        // Lấy ID hiện tại để gán cho chiến dịch mới
        campaigns[campaignId] = Campaign({
            owner: payable(msg.sender),
            goalAmount: _goalAmount,
            raisedAmount: 0,
            isActive: true
        });
        // Khởi tạo và lưu chiến dịch với owner là người gọi hàm

        nextCampaignId++;
        // Tăng ID cho lần tạo chiến dịch tiếp theo

        emit CampaignCreated(campaignId, msg.sender, _goalAmount);
        // Phát sự kiện thông báo đã tạo chiến dịch
        return campaignId;
        // Trả về ID chiến dịch vừa tạo
    }

    function donate(uint256 _campaignId)
        external
        payable
        campaignActive(_campaignId)
    {
        require(msg.value > 0, "Amount must be > 0");
        // Số tiền quyên góp phải > 0
        Campaign storage campaign = campaigns[_campaignId];
        // Lấy tham chiếu đến chiến dịch tương ứng

        campaign.raisedAmount += msg.value;
        // Cộng thêm số tiền quyên góp vào tổng số tiền đã gây quỹ

        emit Donated(_campaignId, msg.sender, msg.value);
        // Phát sự kiện ghi nhận khoản quyên góp
    }

    function withdraw(uint256 _campaignId)
        external
        onlyOwner(_campaignId)
        campaignActive(_campaignId)
    {
        Campaign storage campaign = campaigns[_campaignId];
        uint256 amount = campaign.raisedAmount;
        require(amount > 0, "Nothing to withdraw");
        // Chỉ rút nếu có tiền

        campaign.raisedAmount = 0;
        campaign.isActive = false;
        // Đặt lại số tiền và đánh dấu chiến dịch không còn hoạt động

        (bool success, ) = campaign.owner.call{value: amount}("");
        require(success, "Transfer failed");
        // Chuyển toàn bộ số tiền đến chủ sở hữu chiến dịch

        emit Withdrawn(_campaignId, msg.sender, amount);
        // Phát sự kiện rút tiền
    }

    function getCampaign(uint256 _campaignId)
        external
        view
        returns (
            address owner,
            uint256 goalAmount,
            uint256 raisedAmount,
            bool isActive
        )
    {
        Campaign storage c = campaigns[_campaignId];
        // Lấy dữ liệu chiến dịch theo ID
        return (c.owner, c.goalAmount, c.raisedAmount, c.isActive);
        // Trả về thông tin chiến dịch
    }
}
