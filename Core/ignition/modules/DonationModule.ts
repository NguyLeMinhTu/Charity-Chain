import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DonationModule", (m) => {
    const donation = m.contract("Donation");

    return { donation };
});
