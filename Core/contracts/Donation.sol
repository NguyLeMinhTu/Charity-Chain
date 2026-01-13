// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Donation {
    struct Campaign {
        address payable owner;
        uint256 goalAmount;
        uint256 raisedAmount;
        bool isActive;
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public nextCampaignId;

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed owner,
        uint256 goalAmount
    );

    event Donated(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount
    );

    event Withdrawn(
        uint256 indexed campaignId,
        address indexed owner,
        uint256 amount
    );

    modifier onlyOwner(uint256 _campaignId) {
        require(
            campaigns[_campaignId].owner == msg.sender,
            "Not campaign owner"
        );
        _;
    }

    modifier campaignActive(uint256 _campaignId) {
        require(campaigns[_campaignId].isActive, "Campaign not active");
        _;
    }

    function createCampaign(uint256 _goalAmount) external returns (uint256) {
        require(_goalAmount > 0, "Goal must be > 0");

        uint256 campaignId = nextCampaignId;
        campaigns[campaignId] = Campaign({
            owner: payable(msg.sender),
            goalAmount: _goalAmount,
            raisedAmount: 0,
            isActive: true
        });

        nextCampaignId++;

        emit CampaignCreated(campaignId, msg.sender, _goalAmount);
        return campaignId;
    }

    function donate(uint256 _campaignId)
        external
        payable
        campaignActive(_campaignId)
    {
        require(msg.value > 0, "Amount must be > 0");
        Campaign storage campaign = campaigns[_campaignId];

        campaign.raisedAmount += msg.value;

        emit Donated(_campaignId, msg.sender, msg.value);
    }

    function withdraw(uint256 _campaignId)
        external
        onlyOwner(_campaignId)
        campaignActive(_campaignId)
    {
        Campaign storage campaign = campaigns[_campaignId];
        uint256 amount = campaign.raisedAmount;
        require(amount > 0, "Nothing to withdraw");

        campaign.raisedAmount = 0;
        campaign.isActive = false;

        (bool success, ) = campaign.owner.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(_campaignId, msg.sender, amount);
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
        return (c.owner, c.goalAmount, c.raisedAmount, c.isActive);
    }
}
