import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Team7Module", (m) => {
    const team7 = m.contract("Team7");

    return { team7 };
});
