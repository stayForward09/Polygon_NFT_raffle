// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract nft1155Auction is Ownable, Pausable, ReentrancyGuard {
    // Events
    event AuctionCreated(uint256 itemId, address nftContract, uint256 tokenId, uint256 tokenAmount, uint256 minPrice, uint256 startDate, uint256 endDate);
    event AuctionUpdate(uint256 itemId, address nftContract, uint256 tokenId, uint256 minPrice, uint256 startDate, uint256 endDate);
    event AuctionCancelled(uint256 itemId);
    event AuctionFinish(uint256 itemId, uint256 price, address winner);

    event BidCreated(uint256 itemId, uint256 bidAmount, address bidder);
    event BidUpdated(uint256 itemId, uint256 bidAmount, address bidder);
    event BidCancelled(uint256 itemId, address bidder);

    event WinnerClaimed(address nftContract, uint256 tokenId, address winner);
    event BidClaimed(address nftContract, uint256 tokenId, address bidder);

    using Counters for Counters.Counter;
    Counters.Counter private _items;

    // sale fee is 3%
    uint fee = 3;

    // interface of Auction Item
    struct AuctionItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        uint256 tokenAmount;
        uint256 minPrice;
        uint256 startDate;
        uint256 endDate;
        address payable seller;
        address payable winner;
        uint256 winPrice;
        uint256 bidCount;
        uint256 largestBidPrice;
        address payable largestBidAddr;
        bool sold;
    }

    struct BidItem {
        uint256 auctionId;
        uint256 bidPrice;
        bool isClaimed;
    }

    struct BidDetail {
        address bidder;
        uint256 bidPrice;
        bool isClaimed;
    } 

    mapping(uint256 => mapping(address => uint)) private bidAmounts;
    mapping(uint256 => mapping(address => bool)) private isClaimed;
    mapping(uint256 => address[]) private idToBidderList;
    mapping(uint256 => AuctionItem) private idToAuctionItem;

    constructor() {}

    function _isAuctionOpen(AuctionItem storage _auction)
        internal
        view
        returns (bool)
    {
        return (_auction.startDate < block.timestamp && block.timestamp < _auction.endDate);
    }

    function _isAuctionFinish(AuctionItem storage _auction)
        internal
        view
        returns (bool)
    {
        return (_auction.endDate <= block.timestamp);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function createAuction(
        address nftContract,
        uint256 tokenId,
        uint256 amount,
        uint256 minPrice,
        uint256 startDate,
        uint256 endDate
    ) external whenNotPaused {
        // Check Overflow
        require(minPrice == uint256(uint128(minPrice)),"Error MinPrice");
        require(startDate > block.timestamp, "Start Time is bigger than current time" );
        require(endDate > startDate, "End Time is bigger than start time" );

        uint256 nftBalance = IERC1155(nftContract).balanceOf(msg.sender, tokenId);
        require(nftBalance > 0, "Not Authorized");

        // Escrow NFT
        IERC1155(nftContract).safeTransferFrom(msg.sender, address(this), tokenId, amount, "");

         _items.increment();
        uint256 itemId = _items.current();


        idToAuctionItem[itemId] = AuctionItem(
            itemId,
            nftContract,
            tokenId,
            amount,
            minPrice,
            startDate,
            endDate,
            payable(msg.sender),
            payable(address(0)),
            0,
            0,
            0,
            payable(address(0)),
            false
        );

        emit AuctionCreated(
            uint256(itemId),
            address(nftContract),
            uint256(tokenId),
            uint256(amount),
            uint256(minPrice),
            uint256(startDate),
            uint256(endDate)
        );
    }

    function updateAuction(
        uint256 itemId,
        uint256 minPrice,
        uint256 startDate,
        uint256 endDate
    ) external whenNotPaused {
        // Check Overflow
        require(minPrice == uint256(uint128(minPrice)));
        require(startDate > block.timestamp);
        require(endDate > startDate);

        AuctionItem storage auction = idToAuctionItem[itemId];
        require(block.timestamp < auction.startDate, "Auction Revert: Auction is started already!");
        require(msg.sender == auction.seller, "Only seller can update");

        idToAuctionItem[itemId].minPrice = minPrice;
        idToAuctionItem[itemId].startDate = startDate;
        idToAuctionItem[itemId].endDate = endDate;


        emit AuctionUpdate(
            uint256(itemId),
            address(idToAuctionItem[itemId].nftContract),
            uint256(idToAuctionItem[itemId].tokenId),
            uint256(minPrice),
            uint256(startDate),
            uint256(endDate)
        );
    }

    function cancelAuction(uint256 itemId)
        external
        whenNotPaused
        nonReentrant
    {
        AuctionItem storage auction = idToAuctionItem[itemId];
        require(msg.sender == auction.seller, "Only seller can cancel");

        if(block.timestamp > auction.endDate && auction.largestBidPrice == 0) {
            IERC1155(auction.nftContract).safeTransferFrom(address(this), msg.sender, auction.tokenId, auction.tokenAmount, "");
            auction.sold = true;
             isClaimed[itemId][msg.sender] = true;
        }
        else if(block.timestamp < auction.startDate){

            IERC1155(auction.nftContract).safeTransferFrom(address(this), msg.sender, auction.tokenId, auction.tokenAmount, "");

            delete idToAuctionItem[itemId];
            _items.decrement();

            emit AuctionCancelled(itemId);
        }
    }

    function createBid(uint256 itemId)
        external
        payable
        whenNotPaused
        nonReentrant
    {
        uint256 newBidAmount = msg.value;

        AuctionItem storage auction = idToAuctionItem[itemId];
        require(newBidAmount > auction.minPrice, "Bid Revert: Bid amount should bigger than min price of auction!");
        require(_isAuctionOpen(auction), "Bid Revert: Invalid Auction Item!");
        require(bidAmounts[itemId][msg.sender] == 0, "Bid Revert: You created bid already!");

        bidAmounts[itemId][msg.sender] = newBidAmount;
        idToBidderList[itemId].push(msg.sender);
        //update largest bid
        if (newBidAmount > auction.largestBidPrice) {
            auction.largestBidAddr = payable(msg.sender);
            auction.largestBidPrice = newBidAmount;
        }
        auction.bidCount += 1;

        emit BidCreated(
            uint256(itemId),
            uint256(newBidAmount),
            address(msg.sender)
        );
    }

    function updateBid(uint256 itemId)
        external
        payable
        whenNotPaused
        nonReentrant
    {
        uint256 newBidAmount = msg.value;
        
        AuctionItem storage auction = idToAuctionItem[itemId];
        require(bidAmounts[itemId][msg.sender] > 0, "Bid Revert: Bid isn't exist!");
        newBidAmount += bidAmounts[itemId][msg.sender];

        require(newBidAmount > auction.minPrice, "Bid Revert: Bid amount should be larger than min price of auction!");
        require(_isAuctionOpen(auction), "Bid Revert: Invalid Auction Item!");

        bidAmounts[itemId][msg.sender] = newBidAmount;
        isClaimed[itemId][msg.sender] = false;

        if (newBidAmount > auction.largestBidPrice) {
            auction.largestBidAddr = payable(msg.sender);
            auction.largestBidPrice = newBidAmount;
        }
        emit BidUpdated(
            uint256(itemId),
            uint256(newBidAmount),
            address(msg.sender)
        );
    }

    function cancelBid(uint256 itemId) 
        external
        whenNotPaused
        nonReentrant
    {
        AuctionItem storage auction = idToAuctionItem[itemId];
        require(_isAuctionOpen(auction), "Bid Revert: Invalid Auction Item!");
        require(bidAmounts[itemId][msg.sender] > 0, "Bid Revert: Bid isn't exist!");

        uint256 _bidAmount = bidAmounts[itemId][msg.sender];

        delete bidAmounts[itemId][msg.sender];

        uint256 bidderIndex;
        for (uint i = 0; i < idToBidderList[itemId].length; i ++)
        {
            if (idToBidderList[itemId][i] == msg.sender) {
                bidderIndex = i;
                // return;
                break;
            }
        }
        delete idToBidderList[itemId][bidderIndex];

        auction.bidCount -= 1;
        // Returen Eth to the bidder
        (bool sent,) = payable(msg.sender).call{value: _bidAmount}("");

        if(sent) emit BidCancelled(uint256(itemId), address(msg.sender));
    }

    function claimAuction(uint256 itemId)
        external
        whenNotPaused
        nonReentrant
    {
        AuctionItem storage auction = idToAuctionItem[itemId];
        require(_isAuctionFinish(auction), "Claim Revert: The Auction is not finished yet!");
        require(bidAmounts[itemId][msg.sender] > 0 && isClaimed[itemId][msg.sender] == false, "Bid Revert: Bid isn't exist!");
        // require(isClaimed[itemId][msg.sender] == false, "Bid Revert: You have already claimed to NFT!");

        if(auction.largestBidAddr == msg.sender){
            // Flag Bid item of winner  to "Claimed"
            isClaimed[itemId][msg.sender] = true;

            // Send NFT to the auction winner
            IERC1155(auction.nftContract).safeTransferFrom(address(this), msg.sender, auction.tokenId, auction.tokenAmount, "");
            
            auction.winner = payable(msg.sender);
            auction.winPrice = bidAmounts[itemId][msg.sender];
            auction.sold = true;
            
            emit WinnerClaimed(address(auction.nftContract), uint256(auction.tokenId), address(auction.winner));
        }
        else {
            uint256 _bidAmount = bidAmounts[itemId][msg.sender];

            // Flag Bid item of bidder  to "Claimed"
            isClaimed[itemId][msg.sender] = true;
            // Returen Eth to the bidder
            (bool sent,) = payable(msg.sender).call{value: _bidAmount}("");
           
            if(sent)  emit BidClaimed(address(auction.nftContract), uint256(auction.tokenId), payable(msg.sender));
        }
    }

    function fetchAuctionItems()
        public
        view
        returns (AuctionItem[] memory)
    {
        uint256 totalItemCount = _items.current();
        uint256 currentIndex = 0;

        AuctionItem[] memory auctionItems = new AuctionItem[](totalItemCount);

        for (uint256 i = 0; i < totalItemCount; i++) {

            uint256 currentId = i + 1;
            AuctionItem storage currentItem = idToAuctionItem[
                currentId
            ];
            auctionItems[currentIndex] = currentItem;
            
            currentIndex += 1;
        }

        return auctionItems;
    }

    function fetchMyBidItems()
        public
        view
        returns (BidItem[] memory)
    {
        uint256 totalItemCount = _items.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i ++) {

            uint256 currentId = i + 1;

            if (bidAmounts[currentId][msg.sender] > 0) {
                itemCount += 1;
            }
        }

        BidItem[] memory bidItems = new BidItem[](itemCount);

        for (uint256 i = 0; i < totalItemCount; i ++) {

            uint256 currentId = i + 1;

            if (bidAmounts[currentId][msg.sender] > 0) {
                // itemCount += 1;
                bidItems[currentIndex] = BidItem(currentId, bidAmounts[currentId][msg.sender], isClaimed[i][msg.sender]);
                currentIndex += 1;
            }
        } 

        return bidItems;
    }

    function fetchBidItemsByID(uint256 itemId)
        public
        view
        returns (BidDetail[] memory)
    {
        uint256 totalCount = idToBidderList[itemId].length;
       
        BidDetail[] memory bidDetails = new BidDetail[](totalCount);

        for (uint256 i = 0; i < totalCount; i ++) {
            address bidder = idToBidderList[itemId][i];
            bidDetails[i].bidder = bidder;
            bidDetails[i].bidPrice = bidAmounts[itemId][bidder];
            bidDetails[i].isClaimed = isClaimed[itemId][bidder];
        } 

        return bidDetails;
    }

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public virtual returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public virtual returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}