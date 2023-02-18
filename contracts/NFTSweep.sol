// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract NFTSweep is Ownable {
  address private constant SEAPORT = 0x00000000006c3852cbEf3e08E8dF289169EdE581;

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

  function batchBuyOpenSea(
    OpenseaOrder[] memory openseaOrders
  ) payable external {
    for (uint256 i = 0; i < openseaOrders.length; i++) {
      // seaport 1.1
      SEAPORT.call{value:openseaOrders[i].value}(openseaOrders[i].orderData);
    }
  }

  struct GeneralOrder {
    uint256 marketId;
    uint256 value;
    bytes orderData;
  }

  function batchBuyFromMarkets(GeneralOrder[] memory orders) payable external {
    for (uint256 i = 0; i < orders.length; i++) {
      address marketAddr = markets[orders[i].marketId].marketAddr;
      (bool success, ) = marketAddr.call{value: orders[i].value}(orders[i].orderData);
      console.log(success);
      //TODO return remain mgs.value to user, if some order buy failed or user supply msg.value exceed needed ether
    }
  }
}
