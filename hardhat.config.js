require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  defaultNetwork: 'hardhat',
  networks: {
    sepolia: {
      url: process.env.API_URI,
      accounts: [process.env.PRIVATE_KEY]
    },
    hardhat: {
      chainId: 1337, // Hardhat Network chain ID
    },
  }
  
};
