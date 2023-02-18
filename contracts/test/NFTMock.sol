// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMock is ERC721 {
  using Counters for Counters.Counter;

  Counters.Counter private _currentTokenId;

  constructor() ERC721("NFTMOCK", "NM")  {
  }

  function mintTo(address to) public {
    _currentTokenId.increment();
    _mint(to, _currentTokenId.current());
  }

  function tokenURI(uint256) override public pure returns (string memory) {
    return "";
  }
}
