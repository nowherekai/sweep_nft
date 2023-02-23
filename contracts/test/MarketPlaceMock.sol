// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "hardhat/console.sol";

contract MarketPlaceMock {

  using Counters for Counters.Counter;

  struct MarketItem {
    uint256 id;
    address nftContractAddress;
    uint256 tokenId;
    uint256 price;
    address payable seller;
    address payable buyer;
    State state;
  }

  enum State { CREATED, SUCCESS, DEACTIVE }

  Counters.Counter private _currentItemId;
  mapping(uint256 => MarketItem) public _marketItems;

  function listItem(address nftContract, uint256 tokenId, uint256 price) public {
    require(price > 0);
    require(IERC721(nftContract).ownerOf(tokenId) == msg.sender);
    require(IERC721(nftContract).getApproved(tokenId) == address(this));

    _currentItemId.increment();

    uint256 id = _currentItemId.current();

    _marketItems[id] = MarketItem(id,
                                  nftContract,
                                  tokenId,
                                  price,
                                  payable(msg.sender),
                                  payable(address(0)),
                                  State.CREATED);

    // console.log("id: %s", id);
    // console.log(_marketItems[id].nftContractAddress);
  }

  function unlistItem(uint256 itemId) public {
    require(itemId <= _currentItemId.current());
    MarketItem storage item = _marketItems[itemId];

    require(item.state == State.CREATED);
    require(item.seller == msg.sender);

    item.state = State.CREATED;
  }

  function buyItem(uint256 itemId, address to) public payable {
    require(itemId <= _currentItemId.current());
    MarketItem storage item = _marketItems[itemId];

    require(item.state == State.CREATED);
    require(msg.value >= item.price);

    IERC721(item.nftContractAddress).safeTransferFrom(item.seller, to, item.tokenId);
    (item.seller).transfer(item.price);
    //不支持其他合约调用
    // payable(msg.sender).transfer(msg.value - item.price);

    item.state = State.SUCCESS;
    item.buyer = payable(msg.sender);
  }

  function buyItemV2(address _tokenAddr, uint256 _tokenId, uint256 itemId, uint256 price, address to) public payable {
    require(to == msg.sender, "Invalid Order");
    require(itemId <= _currentItemId.current());
    MarketItem storage item = _marketItems[itemId];

    require(item.state == State.CREATED);
    require(msg.value >= item.price);

    IERC721(item.nftContractAddress).safeTransferFrom(item.seller, to, item.tokenId);
    (item.seller).transfer(item.price);

    item.state = State.SUCCESS;
    item.buyer = payable(msg.sender);
  }

  function fetchActiveItems() public view returns (MarketItem[] memory) {

    uint count = 0;
    for (uint i = 1; i <= _currentItemId.current(); i += 1) {
      if (_marketItems[i].state == State.CREATED) {
        count += 1;
      }
    }

    MarketItem[] memory activeItems = new MarketItem[](count);

    uint index = 0;
    for (uint i = 1; i <= _currentItemId.current(); i += 1) {
      if (_marketItems[i].state == State.CREATED) {
        activeItems[index] = _marketItems[i];
        index += 1;
      }
    }

    return activeItems;
  }

  function fetchMyCreatedItems() public view returns (MarketItem[] memory) {
    uint count = 0;
    for (uint i = 1; i <= _currentItemId.current(); i += 1) {
      MarketItem storage item = _marketItems[i];
      if (item.state == State.CREATED && item.seller == msg.sender) {
        count += 1;
      }
    }

    MarketItem[] memory myCreatedItems = new MarketItem[](count);

    uint index = 0;
    for (uint i = 0; i < _currentItemId.current(); i += 1) {
      MarketItem storage item = _marketItems[i];
      if (item.state == State.CREATED && item.seller == msg.sender) {
        myCreatedItems[index] = _marketItems[i];
        index += 1;
      }
    }

    return myCreatedItems;
  }

}
