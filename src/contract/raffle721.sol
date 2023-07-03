// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./VRFv2DirectFundingConsumer.sol";


contract nft721Raffle is Ownable, Pausable, ReentrancyGuard, VRFv2DirectFundingConsumer {
    // Events
    event RaffleCreated(uint256 itemId, address nftContract, uint256 tokenId, uint256 ticketPrice, uint max_ticketAmount, uint256 startDate, uint256 endDate);
    event RaffleUpdate(uint256 itemId, address nftContract, uint256 tokenId, uint256 ticketPrice, uint max_ticketAmount, uint256 startDate, uint256 endDate);
    event RaffleCancelled(uint256 itemId);
    event RaffleFinish(uint256 itemId, uint256 price, address winner);

    event BuyTicket(uint256 itemId, uint256 ticketAmount, address buyer);

    event WinnerClaimed(address nftContract, uint256 tokenId, address winner);

    using Counters for Counters.Counter;
    Counters.Counter private _items;

    // sale fee is 3%
    uint fee = 3;

    // interface of Raffle Item
    struct RaffleItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        uint256 ticketPrice;
        uint256 max_ticketAmount;
        uint256 startDate;
        uint256 endDate;
        address payable seller;
        address payable winner;
        uint256 soldTicketAmount;
        bool sold;
    }

    struct TicketItem {
        uint256 raffleId;
        uint256 ticketAmount;
        address buyer;
    }

    mapping(uint256 => mapping(address => uint)) private ticketAmounts;
    mapping (uint256 => uint256) private randomIDtoItemID;
    mapping(uint256 => RaffleItem) private idToRaffleItem;
    mapping(uint256 => address[]) private idToBuyerList;

    constructor() {}

    function _isRaffleOpen(RaffleItem storage _raffle)
        internal
        view
        returns (bool)
    {
        return (_raffle.startDate < block.timestamp && block.timestamp < _raffle.endDate);
    }

    function _isRaffleFinish(RaffleItem storage _raffle)
        internal
        view
        returns (bool)
    {
        return (_raffle.endDate <= block.timestamp);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function createRaffle(
        address nftContract,
        uint256 tokenId,
        uint256 ticketPrice,
        uint256 max_ticketAmount,
        uint256 startDate,
        uint256 endDate
    ) external whenNotPaused {
        // Check Overflow
        require(ticketPrice == uint256(uint128(ticketPrice)), "Error Ticket Price");   
        require(max_ticketAmount > 0, "Max amount of ticket should be larger that zero!");
        require(startDate > block.timestamp, "Start Time is bigger than current time" );
        require(endDate > startDate, "End Time is bigger than start time" );

        address nftOwner = IERC721(nftContract).ownerOf(tokenId);
        require(
            msg.sender == owner() || msg.sender == nftOwner,
            "Not Authorized"
        );

        // Escrow NFT
        IERC721(nftContract).transferFrom(nftOwner, address(this), tokenId);

         _items.increment();
        uint256 itemId = _items.current();


        idToRaffleItem[itemId] = RaffleItem(
            itemId,
            nftContract,
            tokenId,
            ticketPrice,
            max_ticketAmount,
            startDate,
            endDate,
            payable(msg.sender),
            payable(address(0)),
            0,
            false
        );

        emit RaffleCreated(
            uint256(itemId),
            address(nftContract),
            uint256(tokenId),
            uint256(ticketPrice),
            uint256(max_ticketAmount),
            uint256(startDate),
            uint256(endDate)
        );
    }

    function updateRaffle(
        uint256 _itemId,
        uint256 _ticketPrice,
        uint256 _max_ticketAmount,
        uint256 _startDate,
        uint256 _endDate
    ) external whenNotPaused {
        // Check Overflow
        require(_ticketPrice == uint256(uint128(_ticketPrice)));
        require(_startDate > block.timestamp);
        require(_endDate > _startDate);


        RaffleItem storage _raffle = idToRaffleItem[_itemId];
        require(block.timestamp < _raffle.startDate, "Raffle Revert: Raffle is started already!");
        require(_max_ticketAmount > 0, "Max amount of ticket should be larger that zero!");
        require(msg.sender == _raffle.seller, "Only seller can cancel");

        idToRaffleItem[_itemId].ticketPrice = _ticketPrice;
        idToRaffleItem[_itemId].max_ticketAmount = _max_ticketAmount;
        idToRaffleItem[_itemId].startDate = _startDate;
        idToRaffleItem[_itemId].endDate = _endDate;


        emit RaffleUpdate(
            uint256(_itemId),
            address(idToRaffleItem[_itemId].nftContract),
            uint256(idToRaffleItem[_itemId].tokenId),
            uint256(_ticketPrice),
            uint256(_max_ticketAmount),
            uint256(_startDate),
            uint256(_endDate)
        );
    }

    function cancelRaffle(uint256 _itemId)
        external
        whenNotPaused
        nonReentrant
    {
        RaffleItem storage _raffle = idToRaffleItem[_itemId];
        require(msg.sender == _raffle.seller, "Only seller can cancel");

        if(block.timestamp > _raffle.endDate && _raffle.soldTicketAmount == 0) {
            IERC721(_raffle.nftContract).transferFrom(address(this), _raffle.seller, _raffle.tokenId);
            delete idToRaffleItem[_itemId];
            _items.decrement();
        }
        else {
            require(block.timestamp < _raffle.startDate, "Raffle Revert: Raffle is started already!");

            IERC721(_raffle.nftContract).transferFrom(address(this), _raffle.seller, _raffle.tokenId);

            delete idToRaffleItem[_itemId];
            _items.decrement();

            emit RaffleCancelled(_itemId);
        }
    }

    function buyTicket(uint256 _itemId, uint256 _ticketAmount)
        external
        payable
        whenNotPaused
        nonReentrant
    {
        RaffleItem storage _raffle = idToRaffleItem[_itemId];
        _raffle.soldTicketAmount += _ticketAmount;
        require(_raffle.soldTicketAmount <= _raffle.max_ticketAmount, "Revert: Exceeds Max ticket amount!");
        uint256 totalPrice = _raffle.ticketPrice * _ticketAmount;
        
        require(totalPrice <= msg.value, "Revert: Insufficient  Funds!");
        require(_isRaffleOpen(_raffle), "Revert: Raffle is not opened!");
        
        idToRaffleItem[_itemId].soldTicketAmount = _raffle.soldTicketAmount;
        ticketAmounts[_itemId][msg.sender] += _ticketAmount;
    }

    function completeRaffle(uint256 _itemId)
        external
        whenNotPaused
        nonReentrant
        onlyOwner
    {
        RaffleItem storage _raffle = idToRaffleItem[_itemId];
        require(_isRaffleFinish(_raffle), "Raffle Revert: The Raffle is not finished yet!");
        require(idToRaffleItem[_itemId].sold == false, "Raffle Revert: This raffle is completed already");
        
        uint256 requestID = requestRandomWords();
        randomIDtoItemID[requestID] = _itemId;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        require(s_requests[_requestId].paid > 0, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        emit RequestFulfilled(
            _requestId,
            _randomWords,
            s_requests[_requestId].paid
        );

        address winner = address(0);
        uint256 _itemId = randomIDtoItemID[_requestId];
        
        TicketItem[] memory ticketDetails = fetchTicketItemsByID(_itemId);
        
        for (uint i = 0; i < ticketDetails.length; i ++) {
            if (_randomWords[0] % idToRaffleItem[_itemId].soldTicketAmount < ticketDetails[i].ticketAmount) {
                winner = ticketDetails[i].buyer;
                IERC721(idToRaffleItem[i].nftContract).transferFrom(address(this), winner, idToRaffleItem[i].tokenId);
               
                idToRaffleItem[_itemId].sold = true;
                idToRaffleItem[_itemId].winner = payable(winner);
                // return; 
                break;
            }
        }

        
    }

    function fetchRaffleItems()
        public
        view
        returns (RaffleItem[] memory)
    {
        uint256 totalItemCount = _items.current();
        uint256 currentIndex = 0;

        RaffleItem[] memory raffleItems = new RaffleItem[](totalItemCount);

        for (uint256 i = 0; i < totalItemCount; i++) {

            uint256 currentId = i + 1;
            RaffleItem storage currentItem = idToRaffleItem[
                currentId
            ];
            raffleItems[currentIndex] = currentItem;
            currentIndex += 1;
        }

        return raffleItems;
    }

    function fetchMyTicketItems()
        public
        view
        returns (TicketItem[] memory)
    {
        uint256 totalItemCount = _items.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i ++) {

            uint256 currentId = i + 1;

            if (ticketAmounts[currentId][msg.sender] > 0) {
                itemCount += 1;
            }
        }

        TicketItem[] memory ticketItems = new TicketItem[](itemCount);

        for (uint256 i = 0; i < totalItemCount; i ++) {

            uint256 currentId = i + 1;

            if (ticketAmounts[currentId][msg.sender] > 0) {
                ticketItems[currentIndex] = TicketItem(currentId, ticketAmounts[currentId][msg.sender], msg.sender);
                currentIndex += 1;
            }
        } 

        return ticketItems;
    }

    function fetchTicketItemsByID(uint256 _itemId)
        public
        view
        returns (TicketItem[] memory)
    {
        uint256 totalCount = idToBuyerList[_itemId].length;
       
        TicketItem[] memory ticketDetails = new TicketItem[](totalCount);

        for (uint256 i = 0; i < totalCount; i ++) {
            address buyer = idToBuyerList[_itemId][i];
            ticketDetails[i].raffleId = _itemId;
            ticketDetails[i].buyer = buyer;
            ticketDetails[i].ticketAmount = ticketAmounts[_itemId][buyer];
        } 

        return ticketDetails;
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(linkAddress);
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }
}
