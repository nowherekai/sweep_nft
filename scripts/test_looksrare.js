const hre = require("hardhat");
const ethers = hre.ethers;

const { BigNumber  } = require("ethers");
const { addressesByNetwork, SupportedChainId } = require("@looksrare/sdk");
const { LooksRareExchangeAbi  } = require("@looksrare/sdk/abis");

async function sweepNft(nftSweepAddress, orderDatas, value) {
  const nftSweepContract = await ethers.getContractAt("NFTSweep", nftSweepAddress);
  return await nftSweepContract.batchBuyFromMarkets(orderDatas, { value: value, gasLimit: "300000" });
}

function getLooksRareOrderFromAPI(nftAddress, tokenId) {
  // const url = `https://api-goerli.looksrare.org/api/v1/orders?isOrderAsk=true&collection=${nftAddress}&tokenId=${tokenId}'`;
  // const response = await fetch(url, {headers: {'accept': 'application/json'}})
  return({
      "hash": "0x0011373c3316c1911222b6e6fc3aff0d90a941e8c0c08510919558c4ba7d2fb4",
      "collectionAddress": "0x317a8Fe0f1C7102e7674aB231441E485c64c178A",
      "tokenId": "534952",
      "isOrderAsk": true,
      "signer": "0x367941bE1aE6738c046EEd338739A6a1a5d2e9B0",
      "strategy": "0x6ACbeb7f6E225FbC0D1CEe27a40ADC49E7277E57",
      "currencyAddress": "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
      "amount": "1",
      "price": "20000000000000000",
      "nonce": "1",
      "startTime": 1677157557,
      "endTime": 1679749546,
      "minPercentageToAsk": 9800,
      "params": null,
      "status": "VALID",
      "signature": "0xc05e59496e69e886253a622960cde2dfe0a9e4dc4c7332c0ae818e9fb3f9286d353b7033eac8803c39abd10e8ef49db5d4340e823a65b4c3ae84e3811e337fc41b",
      "v": 27,
      "r": "0xc05e59496e69e886253a622960cde2dfe0a9e4dc4c7332c0ae818e9fb3f9286d",
      "s": "0x353b7033eac8803c39abd10e8ef49db5d4340e823a65b4c3ae84e3811e337fc4"
    })
}

async function main() {
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
  let orders = [ { marketId: 1, value: makerOrder.price, orderData: orderData } ];
  let value = makerOrder.price
  const contractAddr = "0xff633585E090F84F5a2C19CF73DAE2eD2f66dd49";
  const tx = await sweepNft(contractAddr, orders, value);
  console.log(tx)

  // const chainId = SupportedChainId.GOERLI;
  // const addresses = addressesByNetwork[chainId];
  // const exchangeContract = new ethers.Contract(addresses.EXCHANGE, exchangeInterface, signer);
  // let tx = exchangeContract.populateTransaction.matchAskWithTakerBid(takerOrder, makerOrder)
  // console.log(tx)
  // let tx = await signer.sendTransaction({
  //   from: signerAddress,
  //   to: addresses.EXCHANGE,
  //   value: value,
  //   data: orderData,
  // })
  // console.log(tx)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
