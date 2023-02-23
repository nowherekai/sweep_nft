const hre = require("hardhat");

async function main() {
  const nftSweepContractAddr = "0xff633585E090F84F5a2C19CF73DAE2eD2f66dd49";
  const nftSweep = await hre.ethers.getContractAt("NFTSweep", nftSweepContractAddr);

  //opensea seaport
  await nftSweep.addMarket("0x00000000006c3852cbEf3e08E8dF289169EdE581", false)

  const LooksRareLogic = await hre.ethers.getContractFactory("LooksRareLogic");
  const looksRareLogic = await LooksRareLogic.deploy();

  await looksRareLogic.deployed();

  console.log(
    `LooksRareLogic deployed to ${looksRareLogic.address}`
  );

  await nftSweep.addMarket(looksRareLogic.address, true);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
