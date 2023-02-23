// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";

interface IMarketPlaceMock {
  function buyItemV2(address _tokenAddr, uint256 _tokenId, uint256 itemId, uint256 price, address to) external payable;
}

contract MarketPlaceMockLogic {

  fallback() payable external {
    bytes4 selector = bytes4(msg.data[0:4]);
    if (selector == IMarketPlaceMock.buyItemV2.selector) {
      (address tokenAddr, uint256 tokenId, uint256 itemId, uint256 price, address to) = abi.decode(
        msg.data[4:],
        (address, uint256, uint256, uint256, address)
      );

      //hack address
      (bool success, bytes memory data) = address(0x5FC8d32690cc91D4c39d9d3abcBD16989F875707).call{value: price}(
        abi.encodeWithSelector(selector, tokenAddr, tokenId, itemId, price, address(this))
      );
      if (success) {
        IERC721(tokenAddr).safeTransferFrom(address(this), to, tokenId);
      } else {
        // assembly {
        //   returndatacopy(0, 0, returndatasize())
        //   revert(0, returndatasize())
        // }
      }
    }
  }
}

