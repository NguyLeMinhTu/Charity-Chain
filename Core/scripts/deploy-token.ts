
import * as hre from "hardhat";

async function main() {
    const ns = hre as any;
    console.log('hre keys:', Object.keys(ns));
    console.log('hre.ethers type:', typeof ns.ethers);
    const { ethers } = ns;
    const Team7 = await ethers.getContractFactory("Team7");
    const team7 = await Team7.deploy();
    await team7.deployed();

    console.log("Team7 deployed to:", team7.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
