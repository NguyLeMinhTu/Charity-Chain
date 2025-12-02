// scripts/01-deploy.js
async function main() {
    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with account:', deployer.address);

    const Attendance = await ethers.getContractFactory('Attendance');
    const attendance = await Attendance.deploy();
    await attendance.deployed();
    console.log('Attendance deployed to:', attendance.address);

    const Paymaster = await ethers.getContractFactory('Paymaster');
    const paymaster = await Paymaster.deploy();
    await paymaster.deployed();
    console.log('Paymaster deployed to:', paymaster.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
