const hre = require("hardhat");

async function main() {
  console.log("Deploying GogAndMagog to", hre.network.name);
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const GogAndMagog = await hre.ethers.getContractFactory("GogAndMagog");
  const contract = await GogAndMagog.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("GogAndMagog deployed to:", address);
  console.log("Update GOG_CONTRACT_CELO in lib/contracts/celo.ts");
}

main().catch(console.error);
