const hre = require("hardhat");
const ethers = hre.ethers;

const { LooksRareExchangeAbi  } = require("@looksrare/sdk/abis");

async function sweepNft(nftSweepAddress, orderDatas, value) {
  const nftSweepContract = await ethers.getContractAt("NFTSweep", nftSweepAddress);
  return await nftSweepContract.batchBuyFromMarkets(orderDatas, { value: value, gasLimit: "10000000" });
}

function getLooksRareOrderFromAPI(nftAddress, tokenId) {
  // const url = `https://api-goerli.looksrare.org/api/v1/orders?isOrderAsk=true&collection=${nftAddress}&tokenId=${tokenId}'`;
  // const response = await fetch(url, {headers: {'accept': 'application/json'}})
  return({
      "hash": "0x63662da1a7669651371a1dde392bf6234553c3da367b8c835e88bf488ecd3bec",
      "collectionAddress": "0x317a8Fe0f1C7102e7674aB231441E485c64c178A",
      "tokenId": "534952",
      "isOrderAsk": true,
      "signer": "0x367941bE1aE6738c046EEd338739A6a1a5d2e9B0",
      "strategy": "0x6ACbeb7f6E225FbC0D1CEe27a40ADC49E7277E57",
      "currencyAddress": "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
      "amount": "1",
      "price": "20000000000000000",
      "nonce": "2",
      "startTime": 1677160613,
      "endTime": 1679752605,
      "minPercentageToAsk": 9800,
      "params": null,
      "status": "VALID",
      "signature": "0x5679bdcd65f5501692a59f913280363013a72ef981ee0160bdda7e5e8e11c5dd392ca4f4b60e4da42b41501cd046be953155500b803cb89228cc4f6dbf1020df1c",
      "v": 28,
      "r": "0x5679bdcd65f5501692a59f913280363013a72ef981ee0160bdda7e5e8e11c5dd",
      "s": "0x392ca4f4b60e4da42b41501cd046be953155500b803cb89228cc4f6dbf1020df"
    })
}

async function generateLooksRareOrderCalldata() {
  const signer = await ethers.getSigner();
  const signerAddress = signer.address;

  const orderResponse = getLooksRareOrderFromAPI("0x317a8Fe0f1C7102e7674aB231441E485c64c178A", "534952")

  const makerOrder = {
      collection: orderResponse.collectionAddress,
      tokenId: orderResponse.tokenId,
      isOrderAsk: orderResponse.isOrderAsk,
      signer: orderResponse.signer,
      strategy: orderResponse.strategy,
      currency: orderResponse.currencyAddress,
      amount: orderResponse.amount,
      price: orderResponse.price,
      nonce: orderResponse.nonce,
      startTime: orderResponse.startTime,
      endTime: orderResponse.endTime,
      minPercentageToAsk: orderResponse.minPercentageToAsk,
      params: [],
      v: orderResponse.v,
      r: orderResponse.r,
      s: orderResponse.s
  }

  const takerOrder = {
    isOrderAsk: false,
    taker: signerAddress,
    price: makerOrder.price,
    tokenId: makerOrder.tokenId,
    minPercentageToAsk: makerOrder.minPercentageToAsk,
    params: [],
  };

  const exchangeInterface = new ethers.utils.Interface(LooksRareExchangeAbi);

  let orderData = exchangeInterface.encodeFunctionData("matchAskWithTakerBidUsingETHAndWETH", [takerOrder, makerOrder])
  return orderData
}

function generateOpenseaOrderCalldata() {
  return("0xe7acab24000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000005800000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000000000000000000000000000f849d39d20e1e789068d000a9c4f279efeacbadf00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000046000000000000000000000000000000000000000000000000000000000000004e00000000000000000000000006c34328d7cc56e6665c4c837347ff49208cf6c7700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000063d0ce050000000000000000000000000000000000000000000000000000000063f9ac850000000000000000000000000000000000000000000000000000000000000000360c6ebe000000000000000000000000000000000000000070dfdfe132eccd8c0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000317a8fe0f1c7102e7674ab231441e485c64c178a000000000000000000000000000000000000000000000000000000000006481e000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004547258d1ec000000000000000000000000000000000000000000000000000004547258d1ec0000000000000000000000000006c34328d7cc56e6665c4c837347ff49208cf6c770000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c6bf526340000000000000000000000000000000000000000000000000000001c6bf526340000000000000000000000000000000a26b00c1f0df003000390027140000faa7190000000000000000000000000000000000000000000000000000000000000041e88bd5164b6004932d7275dab3a9b9a20a90ba0770689c2297f93e7d208c98614a88fdd54a54716bfb2a380011feecee51761452acc3031dd2b47d36b2f86ad31c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c5d24601")
}

async function main() {
  let orderData1 = await generateLooksRareOrderCalldata();
  let orderData2 = generateOpenseaOrderCalldata();

  let orders = [ { marketId: 1, value: ethers.utils.parseEther("0.02"), orderData: orderData1 },
    { marketId: 0, value: ethers.utils.parseEther("0.02"), orderData: orderData2 },
  ];
  let value = orders.map((order) => { return order.value }).reduce((value, acc) => { return acc.add(value) })

  const contractAddr = "0xff633585E090F84F5a2C19CF73DAE2eD2f66dd49";
  const tx = await sweepNft(contractAddr, orders, value);
  console.log(tx)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
