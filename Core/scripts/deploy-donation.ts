import * as hre from "hardhat";

async function main() {
    const ns = hre as any;
    const { ethers } = ns;

    const Donation = await ethers.getContractFactory("Donation");
    const donation = await Donation.deploy();
    await donation.deployed();

    console.log("Donation deployed to:", donation.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
