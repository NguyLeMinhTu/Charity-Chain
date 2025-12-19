const hre = require("hardhat");

async function main() {
  console.log("Deploying DonationContract...");

  // Deploy contract
  const DonationContract = await hre.ethers.getContractFactory("DonationContract");
  const donationContract = await DonationContract.deploy();

  await donationContract.waitForDeployment();

  const address = await donationContract.getAddress();
  console.log(`DonationContract deployed to: ${address}`);
  
  // Lưu thông tin để verify sau
  console.log("\nTo verify contract, run:");
  console.log(`npx hardhat verify --network sepolia ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
