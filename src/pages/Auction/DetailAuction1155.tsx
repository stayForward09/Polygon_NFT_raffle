import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Countdown, { CountdownApi } from 'react-countdown'

import CONFIG from "../../config";
import { getAuctionById } from "../../services/api";
import VerificationIcon from "../../assets/Verification-icon-2.png";
import ReturnIcon from "../../assets/return-icon.png";
import TimingIcon from "../../assets/Subtract-timing-icon.png";
import TicketIcon from "../../assets/Subtract-ticket-icon.png";
import DateIcon from "../../assets/Subtract.-date-icon.png";
import ShareIcon from "../../assets/Share-icon.png";
import BidIcon from "../../assets/Subtract-bid-icon.png";
import CurrentBidIcon from "../../assets/Subtract-sol-price-icon.png";
import TimingAuctionIcon from "../../assets/Subtract-tiiming-auction.png";
import Navbar from "../../components/Navbar";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CancelAuction1155Contract, cancelBidAuction1155, claimBidAuction1155, createBidAuction1155, fetchAuction1155Items, fetchBidItemsById1155, fetchMyBidItems1155, getSoldNftStatus1155, updateBidAuction1155 } from "../../services/contracts/auction1155";

const DetailAuction1155 = () => {
  const { id } = useParams();
  const storeData: any = useSelector((status) => status)
  const [isLoading, setLoading] = useState(false);
  const [nftInfo, setNftInfo] = useState<any>([]);
  const [amount, setAmount] = useState(0);

  const [biddingStatus, setBiddingStatus] = useState(0);
  const [auctionStatus, setAuctionStatus] = useState(0);
  const [auctionInfo, setAuctionInfo] = useState()
  const [raffleInfo, showraffleInfo] = useState<string>("raffleinfo");
  const [bidderLists, setBidderLists] = useState<any>([])
  const [currentBid, setCurrentBid] = useState(0)
  const [auctionWinner, setAuctionWinner] = useState(false)
  const [currentItemId, setCurrentItemId] = useState<any>(0)
  const [isSold, setSold] = useState(false)
  const [isNoBidder, setNoBidder] = useState(false)

  let countdownStartApi: CountdownApi | null = null
  let countdownEndApi: CountdownApi | null = null

  const setStartCountdownRef = (countdown: Countdown | null) => {
    if (countdown) {
      countdownEndApi = countdown.getApi()
    }
  }

  const setEndCountdownRef = (countdown: Countdown | null) => {
    if (countdown) {
      countdownEndApi = countdown.getApi()
    }
  }

  const startCountdownRenderer = ({ api, days, hours, minutes, seconds, completed }: any) => {
    if (api.isPaused()) api.start()
    return (
      completed ?
        <Countdown
          ref={setEndCountdownRef}
          date={nftInfo.end_date * 1000}
          zeroPadTime={3}
          onComplete={handleTimeFinish}
          renderer={endCountdownRenderer}
        />
        :
        <div >
          <p className="text-[#878787]" >Starts In</p>
          <p>
            {days.toString().length === 1 ? `0${days}` : days}:
            {hours.toString().length === 1 ? `0${hours}` : hours}:
            {minutes.toString().length === 1 ? `0${minutes}` : minutes}:
            {seconds.toString().length === 1 ? `0${seconds}` : seconds}
          </p>
        </div>
    )
  }

  const endCountdownRenderer = ({ api, days, hours, minutes, seconds, completed }: any) => {
    if (api.isPaused()) api.start()
    return (
      completed ?
        <div>
          <p className="text-[#878787]" >Currently</p>
          <p>Ended</p>
        </div>
        :
        <div className="" >
          <p className="text-[#878787]" >Live</p>
          <p>
            {days.toString().length === 1 ? `0${days}` : days}:
            {hours.toString().length === 1 ? `0${hours}` : hours}:
            {minutes.toString().length === 1 ? `0${minutes}` : minutes}:
            {seconds.toString().length === 1 ? `0${seconds}` : seconds}
          </p>
        </div>
    )
  }

  const handleCreateOrUpdateBid = async () => {
    try {
      if (storeData.wallet !== 'connected') {
        toast.error(`Please connect your wallet`)
        return
      }
      if (Date.now() < nftInfo.start_date * 1000 || Date.now() > nftInfo.end_date * 1000) {
        toast.error(`Currently You can't Bid `)
        return
      }
      if (amount <= nftInfo.price) {
        toast.error(`NFT Bidding Amount is bigger than Min Price`)
        return
      }

      setLoading(true)

      if (biddingStatus === 0) {
        const createBidTx = await createBidAuction1155(currentItemId, amount);
        if (createBidTx) {
          setBiddingStatus(1)
          setCurrentBid(amount)
          toast.success('Successfully Bidding is created.')
          const findIdx = bidderLists.findIndex((item: any) =>
            item?.bidder.toLowerCase() === storeData.address)
          if (findIdx === -1) {

            setBidderLists([...bidderLists, {
              bidder: storeData.address,
              bidPrice: amount * CONFIG.DECIMAL
            }])
          } else {
            const new_buyerLists = bidderLists.map((item: any, idx: any) => {
              return idx === findIdx ? { ...bidderLists[findIdx], bidPrice: Number(amount) * CONFIG.DECIMAL } : item
            })
            setBidderLists(new_buyerLists)
          }

        }
        setLoading(false)
      } else if (biddingStatus === 1) {
        const updateBidTx = await updateBidAuction1155(currentItemId, amount);
        if (updateBidTx) {
          toast.success('Successfully Bidding is updated.')
          setCurrentBid(amount)
          const findIdx = bidderLists.findIndex((item: any) =>
            item?.bidder.toLowerCase() === storeData.address)
          const new_buyerLists = bidderLists.map((item: any, idx: any) => {
            return idx === findIdx ? { ...bidderLists[findIdx], bidPrice: Number(amount) * CONFIG.DECIMAL } : item
          })
          setBidderLists(new_buyerLists)
        }
        setLoading(false)
      }

    } catch (error) {
      console.log('error', error)
      setLoading(false)
      toast.error('Error Bidding ')
    }
  };

  const handleDeleteBid = async () => {
    try {
      if (auctionStatus !== 1) {
        return
      }
      setLoading(true)
      const cancelBidTx = await cancelBidAuction1155(currentItemId);
      if (cancelBidTx) {
        setBiddingStatus(0)
        setCurrentBid(0)
        toast.success(`Successfully canceled`)
        const findIdx = bidderLists.findIndex((item: any) =>
          item?.bidder.toLowerCase() === storeData.address
        )
        const remove_bidder = bidderLists.splice(findIdx, 1)
        const final_bidderLists = bidderLists.filter((item: any) =>
          item.bidder !== remove_bidder[0].bidder
        )
        setBidderLists(final_bidderLists)
      }
      setLoading(false)
    } catch (error) {
      console.log('error', error)
      setLoading(false)
    }
  };

  const handleClaimPrize = async () => {
    try {
      if (!auctionWinner && auctionStatus !== 2) {
        return
      }
      if (isSold) {
        toast.error(`Already sold`)
        return
      }
      setLoading(true)
      const claimPrizeTx = await claimBidAuction1155(currentItemId);
      if (claimPrizeTx) {
        toast.success('Successfully NFT claimed');
        setSold(true)
      }
      setLoading(false)
    } catch (error) {
      console.log('error', error)
      setLoading(false)
    }
  };

  const handleClaimBid = async () => {
    try {
      if (auctionStatus !== 2) {
        return
      }
      if (isSold) {
        toast.error(`Already sold`)
        return
      }
      setLoading(true)
      const claimBidTx = await claimBidAuction1155(currentItemId);
      if (claimBidTx) {
        toast.success('Successfully NFT claimed ')
        setSold(true)
      }
      setLoading(false)
    } catch (error) {
      console.log('error', error)
    }
  };

  const handleCancelClaimPrize = async () => {
    try {
      if (isSold) {
        toast.error(`Already Sold`)
        return
      }
      setLoading(true)

      const tx = await CancelAuction1155Contract(currentItemId)
      if (tx) {
        setSold(true)
        toast.success(`Successfully Claim Prize`)
      }
      setLoading(false)

    } catch (error) {
      toast.error(`Claiming Error`)
      console.log('error', error)
      setLoading(false)

    }
  }

  const getAuctionStatus = (nftInfo: any) => {
    const currentTime = Math.floor(Date.now() / 1000);
    let status = 0;
    if (currentTime > nftInfo.end_date) status = 2;
    else if (currentTime >= nftInfo.start_date) status = 1;
    setAuctionStatus(status);
  };

  const getWinnerInfo = (bidderLists: any, getAuctionInfo: any) => {
    if (storeData.wallet === 'connected') {
      if (nftInfo.walletAddress === storeData.address && getAuctionInfo?.largestPrice === 0 && Date.now() / 1000 > nftInfo.end_date) {
        setNoBidder(true)
        return
      }
      let winner_buyerLists = [];
      for (let i = 0; i < bidderLists.length; i++) {
        winner_buyerLists.push(bidderLists[i].bidPrice.toNumber())
      }
      const high = Math.max.apply(Math, winner_buyerLists);
      const result: any = bidderLists.find((item: any) => item.bidPrice.toNumber() === high)
      if (result && result?.bidder?.toLowerCase() === storeData.address) {
        setAuctionWinner(true)
      } else {
        setAuctionWinner(false)
      }
    }
  }

  const handleTimeFinish = () => {
    getWinnerInfo(bidderLists, auctionInfo)
    setAuctionStatus(2)
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const nftInfoById: any = await getAuctionById(id);
        const dateFormat = new Date(nftInfoById.start_date * 1000)
        const result_date = dateFormat.getDate() +
          "/" + (dateFormat.getMonth() + 1) +
          "/" + dateFormat.getFullYear() +
          " " + dateFormat.getHours() +
          ":" + dateFormat.getMinutes() +
          ":" + dateFormat.getSeconds()
        setNftInfo({
          ...nftInfo,
          name: nftInfoById.name,
          image: nftInfoById.image,
          project: nftInfoById.project,
          start: result_date,
          price: nftInfoById.price,
          start_date: nftInfoById.start_date,
          end_date: nftInfoById.end_date,
          walletAddress: nftInfoById.walletAddress
        })

        const getAuctionInfo: any = await fetchAuction1155Items(nftInfoById.tokenId, nftInfoById.tokenAddress, nftInfoById.start_date)
        setAuctionInfo(getAuctionInfo)
        setCurrentItemId(getAuctionInfo.itemId + 1)

        const get_biddingInfo = await fetchMyBidItems1155();
        const find_bidding = get_biddingInfo.find((item: any) => item.auctionId.toNumber() === getAuctionInfo.itemId + 1)

        if (find_bidding) {
          setBiddingStatus(1)
          setCurrentBid(find_bidding.bidPrice.toNumber() / CONFIG.DECIMAL)
        } else {
          setBiddingStatus(0)
        }

        getAuctionStatus(nftInfoById)
        if (nftInfoById.walletAddress === storeData.address && getAuctionInfo.largestPrice === 0 && Date.now() / 1000 > nftInfoById.end_date) {
          setNoBidder(true)
        }

        const getBiddingLists = await fetchBidItemsById1155(getAuctionInfo.itemId + 1);
        let new_biddingLists: any = []
        getBiddingLists.map((item: any) =>
          new_biddingLists.push({ ...item })
        )
        if (storeData.wallet === 'connected') {
          const isClaimedStatus = new_biddingLists.find((item: any) => item.bidder.toLowerCase() === storeData.address)

          if (isClaimedStatus?.isClaimed === true) {
            setSold(true)
          } else {
            setSold(false)
          }
        }

        setBidderLists(new_biddingLists)
        getWinnerInfo(new_biddingLists, getAuctionInfo)

        setLoading(false);

      } catch (error) {
        console.log("error", error);
        setLoading(false)
      }
    })();
  }, [storeData, raffleInfo]);

  return (
    <>
      {
        isLoading ?
          <div id="preloader"></div> :
          <div id="preloader" style={{ display: "none" }}></div>
      }
      <div className="bg-black">
        <Navbar />
        <div className="max-w-[1240px] m-auto pt-8 pb-16 px-4">
          <div className="xl:flex justify-between block">
            <div className="xl:basis-[35%] max-w-[450px] m-auto xl:max-w-auto xl:m-0 pb-6 xl:pb-0">
              <div className="rounded-[0.9rem] overflow-hidden border-4 border-[#606060] transition duration-1000">
                <div className="relative">
                  <img
                    src={nftInfo?.image}
                    alt="CoodeImage"
                    className="h-[450px] w-full object-cover"
                  />
                </div>
              </div>
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    name="solValue"
                    value={amount}
                    onChange={(e: any) => setAmount(e.target.value)}
                    className="w-[38%] block text-white text-base text-center outline-none bg-[#82828240] border border-[#606060] rounded-[0.7rem] py-3 px-5"
                    disabled={auctionStatus !== 1}
                  />

                  <button
                    type="button"
                    className={`basis-[38%]  text-black bg-white rounded-[0.7rem]  py-3 sm:px-5 ${auctionStatus === 1 ? 'cursor-pointer' : 'cursor-no-drop'}`}
                    onClick={handleCreateOrUpdateBid}
                  >
                    <span className={` sm:text-lg text-sm text-black`}>
                      {biddingStatus === 1 ? 'Update Bid' : 'Create Bid'}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="text-black bg-white rounded-[0.7rem] flex items-center justify-center py-3 px-5"
                  >
                    <img
                      src={ShareIcon}
                      alt="Pricetag-icon"
                      className="w-[22px]"
                    />
                  </button>
                </div>

                {
                  biddingStatus === 1 ?
                    <div className="btn-gradient rounded-full p-[1px] mb-3">
                      <div className="btn-background-absolute rounded-full">
                        <p className={`text-[1.25rem] text-center py-2 px-8 block text-[#15BFFD] my-0 mx-auto ${auctionStatus === 1 ? 'cursor-pointer' : 'cursor-no-drop'} max-w-fit `}
                          onClick={handleDeleteBid}
                        >
                          Cancel Bid
                        </p>
                      </div>
                    </div> :
                    <div></div>
                }
              </div>


              <div className="text-center">
                <p className="text-white text-[1.25rem] mt-3">
                  {biddingStatus === 0 && 'None'}
                  {biddingStatus === 1 && auctionStatus === 1 && 'Pending'}
                  {
                    biddingStatus === 1 &&
                    auctionStatus === 2 &&
                    auctionWinner &&
                    'Win'
                  }
                  {biddingStatus === 1 &&
                    auctionStatus === 2 &&
                    !auctionWinner &&
                    'Fail'
                  }
                </p>
              </div>
              {
                biddingStatus === 1 &&
                auctionStatus === 2 &&
                auctionWinner &&
                <div className="btn-gradient rounded-full p-[1px] mb-3">
                  <div className="btn-background-absolute rounded-full">
                    <p className={`text-[1.25rem] text-center py-2 px-8 block text-[#15BFFD] m-0 ${isSold ? 'cursor-no-drop' : 'cursor-pointer'}`}
                      onClick={handleClaimPrize}
                    >
                      Claim Prize
                    </p>
                  </div>
                </div>
              }

              {
                biddingStatus === 1 &&
                auctionStatus === 2 &&
                !auctionWinner &&
                <div className="btn-gradient rounded-full p-[1px] mb-3">
                  <div className="btn-background-absolute rounded-full">
                    <p className={`text-[1.25rem] text-center py-2 px-8 block text-[#15BFFD] m-0 ${isSold ? 'cursor-no-drop' : 'cursor-pointer'}`}
                      onClick={handleClaimBid}
                    >
                      Claim Bid
                    </p>
                  </div>
                </div>
              }


              {
                isNoBidder && <div className="btn-gradient rounded-full p-[1px] mb-3">
                  <div className="btn-background-absolute rounded-full">
                    <p className={`text-[1.25rem] text-center py-2 px-8 block text-[#15BFFD] m-0 ${isSold ? 'cursor-no-drop' : 'cursor-pointer'}`}
                      onClick={handleCancelClaimPrize}
                    >
                      Claim Prize
                    </p>
                  </div>
                </div>
              }

            </div>

            <div className="basis-[63%]">
              <div className="border-4 border-[#606060] bg-[#60606040] rounded-[0.7rem]">
                <div className="flex justify-between p-4">
                  <div>
                    <div className="flex items-center">
                      <img
                        src={VerificationIcon}
                        alt="VerificationIcon"
                        className="w-[20px]"
                      />
                      <p className="text-white">{nftInfo.name}</p>
                    </div>
                    <h1 className="text-3xl text-white mt-1">{nftInfo.project}</h1>

                    <div className="flex items-center mt-4">
                      <button
                        type="button"
                        className={`${raffleInfo === "raffleinfo"
                          ? "border border-white bg-black text-white py-2 rounded-[0.6rem] sm:px-4 px-2 text-sm sm:text-base"
                          : "text-white"
                          } `}
                        onClick={() => showraffleInfo("raffleinfo")}
                      >
                        Bid Info
                      </button>
                      <button
                        type="button"
                        onClick={() => showraffleInfo("participants")}
                        className={`${raffleInfo === "participants"
                          ? "border border-white ml-6 bg-black text-white py-2 rounded-[0.6rem] sm:px-4 px-2 text-sm sm:text-base"
                          : "text-white ml-6"
                          } `}
                      >
                        Leaderboard
                      </button>
                    </div>
                  </div>
                  <div>
                    <Link to='/auction' >

                      <div className="flex items-center mb-2">
                        <img src={ReturnIcon} alt="ReturnIcon" />
                        <span className="text-white inline-block ml-1">
                          Return
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
                <div className="h-[2px] w-[95%] m-auto bg-[#606060]"></div>
                {raffleInfo === "raffleinfo" && (
                  <>
                    <div className="bg-[#323232] py-4 px-4 sm:px-0 mt-4">
                      <div className="sm:flex block justify-between sm:w-[80%] m-auto">
                        <div className="text-center">
                          <img
                            src={TimingIcon}
                            alt="TimingIcon"
                            className="max-w-[60px] m-auto"
                          />
                          {/* <p className="text-[#878787]">Auction Start In</p> */}
                          <p className="text-white">
                            {
                              nftInfo.end_date && <Countdown
                                ref={setStartCountdownRef}
                                date={nftInfo.start_date * 1000}
                                // date={1675442188901}
                                onComplete={() => setAuctionStatus(1)}
                                zeroPadTime={3}
                                renderer={startCountdownRenderer}
                              />
                            }

                          </p>
                        </div>
                        <div className="text-center">
                          <img
                            src={TicketIcon}
                            alt="TimingIcon"
                            className="max-w-[60px] m-auto"
                          />
                          <p className="text-[#878787]">Min. Bid Increment</p>
                          <p className="text-white">{nftInfo.price}</p>
                        </div>
                        <div className="text-center">
                          <img
                            src={DateIcon}
                            alt="TimingIcon"
                            className="max-w-[60px] m-auto"
                          />
                          <p className="text-[#878787]">Start Date</p>
                          <p className="text-white">{(nftInfo.start)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#323232] py-4 px-4 sm:px-0">
                      <div className="sm:flex block justify-between sm:w-[80%] m-auto">
                        <div className="text-center">
                          <img
                            src={BidIcon}
                            alt="TimingIcon"
                            className="max-w-[60px] m-auto"
                          />
                          <p className="text-[#878787]">Create Address</p>
                          <p className="text-white">{nftInfo.walletAddress?.substr(0, 6) + '...' + nftInfo.walletAddress?.substr(nftInfo.walletAddress.length - 4, 4)}</p>
                        </div>
                        <div className="text-center ">
                          <img
                            src={CurrentBidIcon}
                            alt="TimingIcon"
                            className="max-w-[60px] m-auto"
                          />
                          <p className="text-[#878787]">Current Bid</p>
                          <p className="text-white">{currentBid ? currentBid : 0}</p>
                        </div>
                        <div className="text-center">
                          <img
                            src={TimingAuctionIcon}
                            alt="TimingIcon"
                            className="max-w-[60px] m-auto"
                          />
                          <p className="text-[#878787]">Time Extension</p>
                          <p className="text-white">5 Minutes</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {raffleInfo === "participants" && (
                  <div
                    className="text-white py-4 max-h-[447px] overflow-y-auto"
                    id="wallet-list"
                  >
                    <ul className="py-3 px-4 w-full flex justify-between">
                      <li className="basis-[50%] text-xl">Username</li>
                      <li className="basis-[50%] text-xl text-center">
                        Bid Amount
                      </li>
                    </ul>

                    {
                      bidderLists.sort((a: any, b: any) => b.bidPrice - a.bidPrice).map((item: any, idx: any) => {
                        return (
                          <ul className="py-2 px-4 w-full flex justify-between" key={idx} >
                            <li className={`basis-[50%] text-base`}>
                              {item?.bidder?.substr(0, 6) + '...' + item?.bidder?.substr(item?.bidder.length - 4, 4)}
                            </li>
                            <li className={`basis-[50%] text-base text-center`}>{Number(item?.bidPrice) / CONFIG.DECIMAL}</li>
                          </ul>
                        )
                      })
                    }
                  </div>
                )}
                <div className="p-4">
                  <h1 className="text-2xl text-white">Terms & Conditions</h1>
                  <ul className="text-white mt-2 text-base list-decimal px-5">
                    <li>
                      {nftInfo.description}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default DetailAuction1155;
