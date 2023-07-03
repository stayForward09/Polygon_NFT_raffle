// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./VRFv2DirectFundingConsumer.sol";

contract nft1155Raffle is Ownable, Pausable, ReentrancyGuard, VRFv2DirectFundingConsumer {
    // Events
    event RaffleCreated(
        uint256 itemId,
        address nftContract,
        uint256 tokenId,
        uint256 tokenAmount,
        uint256 ticketPrice,
        uint max_ticketAmount,
        uint256 startDate,
        uint256 endDate
    );
    event RaffleUpdate(
        uint256 itemId,
        address nftContract,
        uint256 tokenId,
        uint256 ticketPrice,
        uint max_ticketAmount,
        uint256 startDate,
        uint256 endDate
    );
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
        uint256 tokenAmount;
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

    function _isRaffleOpen(
        RaffleItem storage _raffle
    ) internal view returns (bool) {
        return (_raffle.startDate < block.timestamp &&
            block.timestamp < _raffle.endDate);
    }

    function _isRaffleFinish(
        RaffleItem storage _raffle
    ) internal view returns (bool) {
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
        uint256 tokenAmount,
        uint256 ticketPrice,
        uint256 max_ticketAmount,
        uint256 startDate,
        uint256 endDate
    ) external whenNotPaused {
        // Check Overflow
        require(
            ticketPrice == uint256(uint128(ticketPrice)),
            "Error Ticket Price"
        );
        require(
            max_ticketAmount > 0,
            "Max amount of ticket should be larger that zero!"
        );
        require(
            startDate > block.timestamp,
            "Start Time is bigger than current time"
        );
        require(endDate > startDate, "End Time is bigger than start time");

        uint256 nftBalance = IERC1155(nftContract).balanceOf(
            msg.sender,
            tokenId
        );
        require(nftBalance > 0, "Not Authorized");

        // Escrow NFT
        IERC1155(nftContract).safeTransferFrom(
            msg.sender,
            address(this),
            tokenId,
            tokenAmount,
            ""
        );

        _items.increment();
        uint256 itemId = _items.current();

        idToRaffleItem[itemId] = RaffleItem(
            itemId,
            nftContract,
            tokenId,
            tokenAmount,
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
            uint256(tokenAmount),
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
        require(
            block.timestamp < _raffle.startDate,
            "Raffle Revert: Raffle is started already!"
        );
        require(
            _max_ticketAmount > 0,
            "Max amount of ticket should be larger that zero!"
        );
        require(msg.sender == _raffle.seller, "Only seller can update");

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

    function cancelRaffle(uint256 _itemId) external whenNotPaused nonReentrant {
        RaffleItem storage _raffle = idToRaffleItem[_itemId];
        require(msg.sender == _raffle.seller, "Only seller can cancel");

        if (
            block.timestamp > _raffle.endDate && _raffle.soldTicketAmount == 0
        ) {
            IERC1155(_raffle.nftContract).safeTransferFrom(
                address(this),
                msg.sender,
                _raffle.tokenId,
                _raffle.tokenAmount,
                ""
            );
            delete idToRaffleItem[_itemId];
            _items.decrement();
        } else {
            require(
                block.timestamp < _raffle.startDate,
                "Raffle Revert: Raffle is started already!"
            );

            IERC1155(_raffle.nftContract).safeTransferFrom(
                address(this),
                msg.sender,
                _raffle.tokenId,
                _raffle.tokenAmount,
                ""
            );

            delete idToRaffleItem[_itemId];
            _items.decrement();

            emit RaffleCancelled(_itemId);
        }
    }

    function buyTicket(
        uint256 _itemId,
        uint256 _ticketAmount
    ) external payable whenNotPaused nonReentrant {
        RaffleItem storage _raffle = idToRaffleItem[_itemId];
        _raffle.soldTicketAmount += _ticketAmount;
        require(
            _raffle.soldTicketAmount <= _raffle.max_ticketAmount,
            "Revert: Exceeds Max ticket amount!"
        );
        uint256 totalPrice = _raffle.ticketPrice * _ticketAmount;
        require(totalPrice <= msg.value, "Revert: Insufficient  Funds!");
        require(_isRaffleOpen(_raffle), "Revert: Raffle is not opened!");

        idToRaffleItem[_itemId].soldTicketAmount = _raffle.soldTicketAmount;
        ticketAmounts[_itemId][msg.sender] += _ticketAmount;
    }

    function completeRaffle(
        uint256 _itemId
    ) external whenNotPaused nonReentrant onlyOwner {
        RaffleItem storage _raffle = idToRaffleItem[_itemId];
        require(
            _isRaffleFinish(_raffle),
            "Raffle Revert: The Raffle is not finished yet!"
        );
        require(
            idToRaffleItem[_itemId].sold == false,
            "Raffle Revert: This raffle is completed already"
        );

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
        RaffleItem storage _raffle = idToRaffleItem[_itemId];
        TicketItem[] memory ticketDetails = fetchTicketItemsByID(_itemId);

        for (uint i = 0; i < ticketDetails.length; i++) {
            if (
                _randomWords[0] % idToRaffleItem[_itemId].soldTicketAmount <
                ticketDetails[i].ticketAmount
            ) {
                winner = ticketDetails[i].buyer;
                IERC1155(_raffle.nftContract).safeTransferFrom(
                    address(this),
                    msg.sender,
                    _raffle.tokenId,
                    _raffle.tokenAmount,
                    ""
                );
                return;
            }
        }

        idToRaffleItem[_itemId].sold = true;
        idToRaffleItem[_itemId].winner = payable(winner);
    }

    function fetchRaffleItems() public view returns (RaffleItem[] memory) {
        uint256 totalItemCount = _items.current();
        uint256 currentIndex = 0;

        RaffleItem[] memory raffleItems = new RaffleItem[](totalItemCount);

        for (uint256 i = 0; i < totalItemCount; i++) {
            uint256 currentId = i + 1;
            RaffleItem storage currentItem = idToRaffleItem[currentId];
            raffleItems[currentIndex] = currentItem;

            currentIndex += 1;
        }

        return raffleItems;
    }

    function fetchMyTicketItems() public view returns (TicketItem[] memory) {
        uint256 totalItemCount = _items.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            uint256 currentId = i + 1;

            if (ticketAmounts[currentId][msg.sender] > 0) {
                itemCount += 1;
            }
        }

        TicketItem[] memory ticketItems = new TicketItem[](itemCount);

        for (uint256 i = 0; i < totalItemCount; i++) {
            uint256 currentId = i + 1;

            if (ticketAmounts[currentId][msg.sender] > 0) {
                ticketItems[currentIndex] = TicketItem(
                    currentId,
                    ticketAmounts[currentId][msg.sender],
                    msg.sender
                );
                currentIndex += 1;
            }
        }

        return ticketItems;
    }

    function fetchTicketItemsByID(
        uint256 _itemId
    ) public view returns (TicketItem[] memory) {
        uint256 totalCount = idToBuyerList[_itemId].length;

        TicketItem[] memory ticketDetails = new TicketItem[](totalCount);

        for (uint256 i = 0; i < totalCount; i++) {
            address buyer = idToBuyerList[_itemId][i];
            ticketDetails[i].raffleId = _itemId;
            ticketDetails[i].buyer = buyer;
            ticketDetails[i].ticketAmount = ticketAmounts[_itemId][buyer];
        }

        return ticketDetails;
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

    
    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(linkAddress);
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }
}
