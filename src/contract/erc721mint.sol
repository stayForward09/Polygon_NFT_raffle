// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

// import "./erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ApeGalacticClubMint is ERC721Enumerable, Ownable {
    using Strings for uint256;

    string private baseURI;
    string public baseExtension = ".json";
    uint256 public cost = 5000000000000000 wei; /// 0.005 eth
    uint256 public maxFreeMintAmount = 10;
    uint256 public maxPayMintAmount = 50;
    uint256 public teamMintAmount = 30;

    uint256 public constant MAX_BATCH_SIZE = 100;
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public freeSupply = 2500;

    uint256 public contributorProfit = 75; // 7.5%
    uint256 public developerProfit = 15; // 1.5%

    address public ownerAddress = 0xEe2Cf9b7A9B97BF9FE8d9aD32F8e498d3257Fc4F;
    address public contributorAddress =
        0xc3C891b96AFa15ABa58b7D91359f76DCA77fc427;
    address public developerAddress =
        0xBeF32f6bf96800d31f2B04C0e787C1a590f31837;

    bool public paused = false;
    bool public teamMinted = false;

    uint public preSaleDate = 1661561700;
    uint public publicSaleDate = preSaleDate + 300;
    mapping(address => uint256) public freeMintPerWallet;
    mapping(address => bool) public whitelisted;

    constructor(string memory _initBaseURI) ERC721("TheHexagon", "Honey") {
        setBaseURI(_initBaseURI);
    }

    // internal
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function teamMint() public payable onlyOwner {
        // require(!paused, "Paused");
        // require(!teamMinted, "Already minted");

        // uint256 supply = totalSupply();
        // require(supply + teamMintAmount <= freeSupply, "Max free supply exceeded");
        // _safeMint(msg.sender, teamMintAmount);
        for (uint256 idx = 0; idx < teamMintAmount; ++idx) {
            // whitelistMintNumber[msg.sender]++;
            _safeMint(msg.sender, idx);
        }
        // teamMinted = true;
    }

    function setBaseURI(string memory _newURI) public onlyOwner {
        baseURI = _newURI;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Does not exist.");

        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        tokenId.toString(),
                        baseExtension
                    )
                )
                : "";
    }
}
