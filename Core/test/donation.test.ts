import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("Donation", function () {
    it("should create a campaign and accept donations", async function () {
        const [owner, donor] = await ethers.getSigners();

        const donation = await ethers.deployContract("Donation");

        const goal = ethers.parseEther("1");
        await donation.connect(owner).createCampaign(goal);

        const campaignId = 0;
        const amount = ethers.parseEther("0.1");

        await donation.connect(donor).donate(campaignId, { value: amount });

        const c = await donation.getCampaign(campaignId);
        expect(c[2]).to.equal(amount);
    });

    it("owner can withdraw and raisedAmount resets", async function () {
        const [owner, donor] = await ethers.getSigners();

        const donation = await ethers.deployContract("Donation");

        const goal = ethers.parseEther("1");
        await donation.connect(owner).createCampaign(goal);

        const campaignId = 0;
        const amount = ethers.parseEther("0.5");

        await donation.connect(donor).donate(campaignId, { value: amount });

        await expect(donation.connect(owner).withdraw(campaignId))
            .to.emit(donation, "Withdrawn")
            .withArgs(campaignId, owner.address, amount);

        const c = await donation.getCampaign(campaignId);
        expect(c[2]).to.equal(0n);
        expect(c[3]).to.equal(false);
    });

    it("non-owner cannot withdraw", async function () {
        const [owner, donor, other] = await ethers.getSigners();

        const donation = await ethers.deployContract("Donation");

        const goal = ethers.parseEther("1");
        await donation.connect(owner).createCampaign(goal);

        const campaignId = 0;
        const amount = ethers.parseEther("0.1");

        await donation.connect(donor).donate(campaignId, { value: amount });

        await expect(donation.connect(other).withdraw(campaignId)).to.be.revertedWith("Not campaign owner");
    });
});
