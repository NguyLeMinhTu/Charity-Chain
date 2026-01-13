import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Team7Module", (m) => {
  const counter = m.contract("Team7");
  return { counter };
});
