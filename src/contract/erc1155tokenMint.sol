// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MyNFT is ERC1155URIStorage {
  
  constructor(string memory uri_) ERC1155(uri_){
    // _setBaseURI("https://ipfs.io/ipfs/QmRiLKmhizpnwqpHGeiJnL4G6fsPAxdEdCiDkuJpt7xHPH/");
  }

  // mint NFT
  function mint(uint256 amount, string memory uri) public {
   for(uint256 i = 1 ; i<=31 ; i ++) {
      _mint(msg.sender, i, amount,"");
      _setURI(i, string(abi.encodePacked(uri, Strings.toString(i), ".json")));
   }
  }

  // get NFT metadata
  function getNFTMetadata(uint256 id) public view returns (string memory) {
    return uri(id);
  }

  // function bytes32ToString (bytes32 data) returns (string) {
  //   bytes memory bytesString = new bytes(32);
  //   for (uint j=0; j<32; j++) {
  //     byte char = byte(bytes32(uint(data) * 2 ** (8 * j)));
  //     if (char != 0) {
  //       bytesString[j] = char;
  //     }
  //   }

  //   return string(bytesString);
  // }
}