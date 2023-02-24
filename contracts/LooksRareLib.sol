// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "hardhat/console.sol";

struct MakerOrder {
  bool isOrderAsk; // true --> ask / false --> bid
  address signer; // signer of the maker order
  address collection; // collection address
  uint256 price; // price (used as )
  uint256 tokenId; // id of the token
  uint256 amount; // amount of tokens to sell/purchase (must be 1 for ERC721, 1+ for ERC1155)
  address strategy; // strategy for trade execution (e.g., DutchAuction, StandardSaleForFixedPrice)
  address currency; // currency (e.g., WETH)
  uint256 nonce; // order nonce (must be unique unless new maker order is meant to override existing one e.g., lower ask price)
  uint256 startTime; // startTime in timestamp
  uint256 endTime; // endTime in timestamp
  uint256 minPercentageToAsk; // slippage protection (9000 --> 90% of the final price must return to ask)
  bytes params; // additional parameters
  uint8 v; // v: parameter (27 or 28)
  bytes32 r; // r: parameter
  bytes32 s; // s: parameter
}

struct TakerOrder {
  bool isOrderAsk; // true --> ask / false --> bid
  address taker; // msg.sender
  uint256 price; // final price for the purchase
  uint256 tokenId;
  uint256 minPercentageToAsk; // // slippage protection (9000 --> 90% of the final price must return to ask)
  bytes params; // other params (e.g., tokenId)
}


interface ILooksRareExchange {
    function matchAskWithTakerBidUsingETHAndWETH(
        TakerOrder calldata takerBid,
        MakerOrder calldata makerAsk
    ) external payable;
}


contract LooksRareLogic {
  fallback() payable external {
    bytes4 selector = bytes4(msg.data[0:4]);
    if (selector == ILooksRareExchange.matchAskWithTakerBidUsingETHAndWETH.selector) {
      (TakerOrder memory takerBid, MakerOrder memory makerAsk) = abi.decode(
        msg.data[4:], (TakerOrder, MakerOrder)
      );
      console.log(takerBid.taker);
      console.log(makerAsk.signer);

      address orignalTaker = takerBid.taker;
      takerBid.taker = address(this);

      //looksrare exchange goerli address
      (bool success, ) = 0xD112466471b5438C1ca2D218694200e49d81D047.call{value: takerBid.price}(
        abi.encodeWithSelector(selector, takerBid, makerAsk)
      );
      if (success) {
        IERC721(makerAsk.collection).safeTransferFrom(address(this), orignalTaker, takerBid.tokenId);
      } else {
        // assembly {
        //   returndatacopy(0, 0, returndatasize())
        //   revert(0, returndatasize())
        // }
      }
    }
  }
}
