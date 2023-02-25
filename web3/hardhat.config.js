require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config({path : '.env'});
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const HTTP_URL = process.env.HTTP_URL;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  defaultNetwork : "bnb",
  networks : {
    hardhat : {},
    "bnb" : {
      url : HTTP_URL,
      chainId : 97,
      accounts : [PRIVATE_KEY],
    }
  }
};
