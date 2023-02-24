// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract NFTSweep is Ownable, IERC721Receiver {
  address private constant SEAPORT = 0x00000000006c3852cbEf3e08E8dF289169EdE581;

  event BuyLog(address marketAddr, bool success);

  struct OpenseaOrder {
    uint256 value;
    bytes orderData;
  }

  struct Market {
    address marketAddr;
    bool useDelegate;
  }

  Market[] public markets;

  function addMarket(address marketAddr, bool useDelegate) external onlyOwner {
    markets.push(Market(marketAddr, useDelegate));
  }

  function updateMarket(uint256 marketId, address newAddr, bool useDelegate) external onlyOwner {
    Market storage market = markets[marketId];
    market.marketAddr = newAddr;
    market.useDelegate = useDelegate;
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
    // console.log("batchBuyFromMarkets");
    for (uint256 i = 0; i < orders.length; i++) {
      bool success;
      Market storage market = markets[orders[i].marketId];
      if (market.useDelegate) {
        (success, ) = market.marketAddr.delegatecall(orders[i].orderData);
      } else {
        (success, ) = market.marketAddr.call{value: orders[i].value}(orders[i].orderData);
      }
      //测试用
      emit BuyLog(market.marketAddr, success);
      // if (!success) {
      //   assembly {
      //     returndatacopy(0, 0, returndatasize())
      //     revert(0, returndatasize())
      //   }
      // }
    }
  }


  function onERC721Received(
    address operator,
    address from,
    uint256 tokenId,
    bytes calldata data
  ) external returns (bytes4) {
    return this.onERC721Received.selector;
  }

}
