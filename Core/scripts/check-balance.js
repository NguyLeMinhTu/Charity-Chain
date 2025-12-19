const hre = require("hardhat");

async function main() {
    try {
        const signers = await hre.ethers.getSigners();

        if (signers.length === 0) {
            console.log("❌ Không tìm thấy account. Kiểm tra lại PRIVATE_KEY trong .env");
            return;
        }

        const deployer = signers[0];
        const balance = await hre.ethers.provider.getBalance(deployer.address);

        console.log("✅ Địa chỉ ví:", deployer.address);
        console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH");

        if (balance === 0n) {
            console.log("\n⚠️  Ví chưa có ETH. Hãy lấy test ETH từ faucet:");
            console.log("   - https://www.alchemy.com/faucets/ethereum-sepolia");
            console.log("   - https://sepolia-faucet.pk910.de");
        }
    } catch (error) {
        console.error("❌ Lỗi:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
