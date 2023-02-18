const hre = require("hardhat");
const abiJson = require("./abi/SeaportInterface.json").abi

//生成opensea seaport1.1 所需要的calldata
function generateOpenseaCalldata() {
  const iSeaPort = new hre.ethers.utils.Interface(abiJson);
  const orderParameters = {
    considerationToken: "0x0000000000000000000000000000000000000000",
    considerationIdentifier: 0,
    considerationAmount: "100562000000000000",
    offerer: "0x367941bE1aE6738c046EEd338739A6a1a5d2e9B0",
    zone: "0x0000000000000000000000000000000000000000",
    offerToken: "0xDaA3812B8FD34D01711105a6DFb669c50ab8fee3",
    offerIdentifier: 627,
    offerAmount: 1,
    basicOrderType: 0,
    startTime: "1676642049",
    endTime: "1679061249",
    zoneHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    salt: "24446860302761739304752683030156737591518664810215442929812498854179464244397",
    offererConduitKey: "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
    fulfillerConduitKey: "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
    totalOriginalAdditionalRecipients: 5,
    additionalRecipients: [
      ["2750000000000000","0x0000a26b00c1F0DF003000390027140000fAa719"],
      ["1562000000000000","0x66512B61F855478bfba669e32719dE5fD7a57Fa4"],
      ["1958000000000000","0x678e8bd1D8845399c8e3C1F946CB4309014456a5"],
      ["1276000000000000","0x8fDC86689f5F35F2b4d9f649c7bdc9C64f59e6bD"],
      ["1892000000000000","0xc424f13e0aC6c0D5C1ED43e73A5771a2356e898d"]],
    signature: "0x66b0f4972c16937f6c4cccd3a7fd4233998e3a46722fde6bd98e444fae080a1e14eb79c6da22de6f6123f69de18a1781225afe5125142bbdbf25a1854d1d42fe1c"
  }
  const calldata = iSeaPort.encodeFunctionData("fulfillBasicOrder", [orderParameters]);
  return calldata;
}

function decodeOpenseaCalldata(calldata) {
  const iSeaPort = new hre.ethers.utils.Interface(abiJson);
  const order = iSeaPort.decodeFunctionData("fulfillBasicOrder", calldata);
  return order
}

async function sweepNft(nftSweepAddress, orderDatas) {
  const nftSweepContract = await ethers.getContractAt("NFTSweep", nftSweepAddress);
  await nftSweepContract.batchBuyFromMarkets(orderDatas);
}

async function main() {
  let orderData1 = generateOpenseaCalldata();
  let orders = [ { marketId: 0, value: ethers.utils.parseEther("0.05"), orderData: orderData1 },
    { marketId: 0, value: ethers.utils.parseEther("0.05"), orderData: orderData1 },
  ];
  let value = orders.map((order) => order.value).reduce((acc, value) => { return acc.add(value) });

  await sweepNft("0x5fbdb2315678afecb367f032d93f642f64180aa3", orders, {value: value, gasLimit: "300000"});
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
