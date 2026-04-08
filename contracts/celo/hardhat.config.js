require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.24",
  networks: {
    celo_alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001"],
      chainId: 44787,
    },
    celo_mainnet: {
      url: "https://forno.celo.org",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001"],
      chainId: 42220,
    },
  },
};
