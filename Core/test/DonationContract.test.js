const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DonationContract", function () {
  let donationContract;
  let owner;
  let donor1;
  let donor2;

  beforeEach(async function () {
    // Lấy signers
    [owner, donor1, donor2] = await ethers.getSigners();

    // Deploy contract
    const DonationContract = await ethers.getContractFactory("DonationContract");
    donationContract = await DonationContract.deploy();
    await donationContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await donationContract.owner()).to.equal(owner.address);
    });

    it("Should start with zero balance", async function () {
      expect(await donationContract.getBalance()).to.equal(0);
    });

    it("Should start with zero total donations", async function () {
      expect(await donationContract.totalDonations()).to.equal(0);
    });
  });

  describe("Donations", function () {
    it("Should accept donations via donate function", async function () {
      const donationAmount = ethers.parseEther("1.0");

      await expect(
        donationContract.connect(donor1).donate({ value: donationAmount })
      )
        .to.emit(donationContract, "DonationReceived")
        .withArgs(donor1.address, donationAmount, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));

      expect(await donationContract.getBalance()).to.equal(donationAmount);
      expect(await donationContract.totalDonations()).to.equal(donationAmount);
    });

    it("Should accept donations via receive function", async function () {
      const donationAmount = ethers.parseEther("0.5");

      await donor1.sendTransaction({
        to: await donationContract.getAddress(),
        value: donationAmount
      });

      expect(await donationContract.getBalance()).to.equal(donationAmount);
    });

    it("Should track individual donations", async function () {
      const amount1 = ethers.parseEther("1.0");
      const amount2 = ethers.parseEther("2.0");

      await donationContract.connect(donor1).donate({ value: amount1 });
      await donationContract.connect(donor2).donate({ value: amount2 });

      expect(await donationContract.getDonationByAddress(donor1.address)).to.equal(amount1);
      expect(await donationContract.getDonationByAddress(donor2.address)).to.equal(amount2);
    });

    it("Should reject zero donations", async function () {
      await expect(
        donationContract.connect(donor1).donate({ value: 0 })
      ).to.be.revertedWith("Donation must be greater than 0");
    });

    it("Should accumulate multiple donations from same donor", async function () {
      const amount = ethers.parseEther("1.0");

      await donationContract.connect(donor1).donate({ value: amount });
      await donationContract.connect(donor1).donate({ value: amount });

      expect(await donationContract.getDonationByAddress(donor1.address)).to.equal(amount * 2n);
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      // Thêm một số donation trước
      await donationContract.connect(donor1).donate({ value: ethers.parseEther("5.0") });
    });

    it("Should allow owner to withdraw all funds", async function () {
      const balanceBefore = await ethers.provider.getBalance(owner.address);
      const contractBalance = await donationContract.getBalance();

      const tx = await donationContract.withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(owner.address);

      expect(await donationContract.getBalance()).to.equal(0);
      expect(balanceAfter).to.equal(balanceBefore + contractBalance - gasUsed);
    });

    it("Should allow owner to withdraw specific amount", async function () {
      const withdrawAmount = ethers.parseEther("2.0");
      const contractBalanceBefore = await donationContract.getBalance();

      await donationContract.withdrawAmount(withdrawAmount);

      expect(await donationContract.getBalance()).to.equal(contractBalanceBefore - withdrawAmount);
    });

    it("Should reject withdrawal from non-owner", async function () {
      await expect(
        donationContract.connect(donor1).withdraw()
      ).to.be.revertedWithCustomError(donationContract, "OwnableUnauthorizedAccount");
    });

    it("Should reject withdrawal when balance is zero", async function () {
      await donationContract.withdraw(); // Withdraw all

      await expect(
        donationContract.withdraw()
      ).to.be.revertedWith("No funds to withdraw");
    });

    it("Should reject withdrawal of amount greater than balance", async function () {
      await expect(
        donationContract.withdrawAmount(ethers.parseEther("10.0"))
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should emit Withdrawal event", async function () {
      const amount = ethers.parseEther("5.0");

      await expect(donationContract.withdraw())
        .to.emit(donationContract, "Withdrawal")
        .withArgs(owner.address, amount, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));
    });
  });
});
