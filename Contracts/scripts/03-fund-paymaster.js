// scripts/03-fund-paymaster.js
// Usage: npx hardhat run scripts/03-fund-paymaster.js --network <network> --paymaster <address> --amount <ether>
const hre = require('hardhat');

async function main() {
    const args = process.argv.slice(2);
    const paymasterArgIndex = args.indexOf('--paymaster');
    const amountIndex = args.indexOf('--amount');

    if (paymasterArgIndex === -1 || amountIndex === -1) {
        console.error('Usage: --paymaster <address> --amount <ether>');
        process.exit(1);
    }

    const paymasterAddress = args[paymasterArgIndex + 1];
    const amount = args[amountIndex + 1];

    const [sender] = await ethers.getSigners();
    const tx = await sender.sendTransaction({ to: paymasterAddress, value: ethers.utils.parseEther(amount) });
    console.log('Funding tx hash:', tx.hash);
    await tx.wait();
    console.log('Funded', amount, 'ETH to', paymasterAddress);
}

main().catch((e) => { console.error(e); process.exit(1); });
