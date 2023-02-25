require('dotenv').config({path : '.env'});
const NFT_COLLECT_ADDR = process.env.NFT_COLLECT_ADDR;

async function main() {
  const nft_collection = NFT_COLLECT_ADDR;

  const Lock = await hre.ethers.getContractFactory("CryptoDevToken");
  const lock = await Lock.deploy(nft_collection);

  await lock.deployed();

  console.log("Contract deployed on address: ", lock.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


// 0xE229c4Ac3E0502dD8cC4Ed3B2976973490a85462
// Deployed on BSC