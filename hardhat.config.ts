import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";
const OPBNB_TESTNET_RPC = process.env.OPBNB_TESTNET_RPC || "https://opbnb-testnet-rpc.bnbchain.org";
const OPBNB_MAINNET_RPC = process.env.OPBNB_MAINNET_RPC || "https://opbnb-mainnet-rpc.bnbchain.org";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.23",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    "opbnb-testnet": {
      url: OPBNB_TESTNET_RPC,
      chainId: 5611,
      accounts: [PRIVATE_KEY],
      gasPrice: 1000000000, // 1 gwei
    },
    "opbnb-mainnet": {
      url: OPBNB_MAINNET_RPC,
      chainId: 204,
      accounts: [PRIVATE_KEY],
      gasPrice: 1000000000, // 1 gwei
    },
  },
  etherscan: {
    apiKey: {
      "opbnb-testnet": process.env.OPBNBSCAN_API_KEY || "",
      "opbnb-mainnet": process.env.OPBNBSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "opbnb-testnet",
        chainId: 5611,
        urls: {
          apiURL: "https://api-opbnb-testnet.bscscan.com/api",
          browserURL: "https://opbnb-testnet.bscscan.com",
        },
      },
      {
        network: "opbnb-mainnet",
        chainId: 204,
        urls: {
          apiURL: "https://api-opbnb.bscscan.com/api",
          browserURL: "https://opbnb.bscscan.com",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
