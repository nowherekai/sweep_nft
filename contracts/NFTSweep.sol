// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract NFTSweep is Ownable {
  address private constant SEAPORT = 0x00000000006c3852cbEf3e08E8dF289169EdE581;

  event BuyLog(address marketAddr, bool success);

  struct OpenseaOrder {
    uint256 value;
    bytes orderData;
  }

  struct Market {
    address marketAddr;
  }

  Market[] public markets;

  function addMarket(address marketAddr) external onlyOwner {
    markets.push(Market(marketAddr));
  }

  function updateMarket(uint256 marketId, address newAddr) external onlyOwner {
    Market storage market = markets[marketId];
    market.marketAddr = newAddr;
  }

  //从Opensea 批量购买, orderData 是seaport所需数据
  function batchBuyOpenSea(
    OpenseaOrder[] memory openseaOrders
  ) payable external {
    for (uint256 i = 0; i < openseaOrders.length; i++) {
      // seaport 1.1
      address(SEAPORT).call{value:openseaOrders[i].value}(openseaOrders[i].orderData);
    }
  }

  struct GeneralOrder {
    uint256 marketId;
    uint256 value;
    bytes orderData;
  }


  //从不同NFT市场购买,需要先注册好对应市场的合约地址(使用addMarket)
  function batchBuyFromMarkets(GeneralOrder[] memory orders) payable external {
    console.log("batchBuyFromMarkets");
    for (uint256 i = 0; i < orders.length; i++) {
      address marketAddr = markets[orders[i].marketId].marketAddr;
      (bool success, ) = marketAddr.call{value: orders[i].value}(orders[i].orderData);
      //测试用
      emit BuyLog(marketAddr, success);
      //TODO return remain mgs.value to user
    }
  }
}
