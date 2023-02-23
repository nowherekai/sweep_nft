const hre = require("hardhat");

async function main() {
  const NFTSweep = await hre.ethers.getContractFactory("NFTSweep");
  const nftSweep = await NFTSweep.deploy();

  await nftSweep.deployed();

  console.log(
    `NFTSweep deployed to ${nftSweep.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
