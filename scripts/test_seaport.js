//只是演示逻辑，依赖本地对opensea js的hack

const hre = require("hardhat");
const ethers = hre.ethers;

const Web3 = require('web3');

const { OpenSeaSDK, Network  } = require('opensea-js');
const { Seaport  } = require("@opensea/seaport-js");

require("dotenv").config()
const GOERLI_URL = process.env.GOERLI_URL;

const provider = new Web3.providers.HttpProvider(GOERLI_URL)
const openseaSDK = new OpenSeaSDK(provider, {
  networkName: Network.Goerli
})

// hack opensea-js, 增加fulfillOrderCalldata 方法，返回actions，actions可以获得calldata数据
// public async fulfillOrderCalldata({
//     order,
//     accountAddress,
//     recipientAddress,
//     domain,
//   }: {
//     order: OrderV2;
//     accountAddress: string;
//     recipientAddress?: string;
//     domain?: string;
//   }): Promise<any>
// {
//     switch (order.protocolAddress) {
//       case CROSS_CHAIN_SEAPORT_ADDRESS: {
//         const { actions } = await this.seaport.fulfillOrder({
//           order: order.protocolData,
//           accountAddress,
//           recipientAddress,
//           domain,
//         });
//         return actions;
//         //break;
//       }
//       default:
//         throw new Error("Unsupported protocol");
//     }
//   }
//

// 获取opensea订单数据
// recipientAddress  nft 接受地址
async function getOrderCallData(contractAddr, tokenId, recipientAddress) {
  let order = await openseaSDK.api.getOrder({ side: "ask", assetContractAddress, tokenId });

  //本机hack了opensea-js, 这里跑不同
  let actions = await openseaSDK.fulfillOrderCalldata({ order, accountAddress, recipientAddress: accountAddress });

  let action = actions[actions.length - 1];
  let buildTransaction = action.transactionMethods.buildTransaction;
  // {data: calldata, value: order.price }
  const data = await buildTransaction();
  return data
}

async function sweepNft(nftSweepAddress, orderDatas, value) {
  const nftSweepContract = await ethers.getContractAt("NFTSweep", nftSweepAddress);
  return await nftSweepContract.batchBuyFromMarkets(orderDatas, { value: value, gasLimit: "300000" });
}

async function main() {
  let orderData1 = await getOrderCallData(
    "0x317a8fe0f1c7102e7674ab231441e485c64c178a",
    342818,
    "0xf849D39d20e1e789068D000a9c4f279eFEACBadF"
  );

  let orderData2 = await getOrderCallData(
    "0x317a8fe0f1c7102e7674ab231441e485c64c178a",
    427210,
    "0xf849D39d20e1e789068D000a9c4f279eFEACBadF"
  );

  let orders = [ { marketId: 0, value: orderData1.value, orderData: orderData1.data },
    { marketId: 0, value: orderData2.value, orderData: orderData2.data },
  ];
  let value = orders.map((order) => { return order.value }).reduce((value, acc) => { return acc.add(value) })
  const contractAddr = "0xff633585E090F84F5a2C19CF73DAE2eD2f66dd49";
  const tx = await sweepNft(contractAddr, orders, value);
  console.log(tx)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
