import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Countdown, { CountdownApi } from 'react-countdown'

import Navbar from "../../components/Navbar";
import { getRaffleById } from "../../services/api";
import ReturnIcon from "../../assets/detailpage/return-icon.svg";
import ShareIcon from "../../assets/Share-icon.png";
import PricetagIcon from "../../assets/detailpage/per-ticket.svg";
import VerificationIcon from "../../assets/verification-icon.svg";

import TimingIcon from "../../assets/detailpage/time-icon.svg";
import TicketIcon from "../../assets/detailpage/ticketSelling-icon.svg";
import DateIcon from "../../assets/detailpage/startDate-icon.svg";
import WinningIcon from "../../assets/detailpage/winning-icon.svg"
import TicketOwnedIcon from "../../assets/detailpage/ticketsOwned-icon.svg"
import HoldersIcon from "../../assets/detailpage/holder-icon.svg"
import OpenSeaIcon from "../../assets/opensea-icon.svg"
import MagicEdenIcon from "../../assets/magic-icon.png"
import PolygonIcon from "../../assets/polygon-icon.svg"
import IdCardIcon from "../../assets/idcard.png"
import DiscordIcon from "../../assets/discord.png"
import TwitterIcon from "../../assets/twitter.png"
import EditIcon from "../../assets/edit.png"

import { getBalance } from "../../utils";
import { buyTicket1155, fetchMyTickets1155, fetchRaffle1155Items, fetchTicket1155ItemsByID } from "../../services/contracts/raffle1155";
import { API_URL } from "../../config/dev";
import commonService from "../../services/common.service";
import axios from 'axios';
import { ethers, Contract } from "ethers";
import CONFIG from "../../config";


const DetailRaffle1155 = () => {
  const { id } = useParams();
  const storeData: any = useSelector((status) => status)
  const [isLoading, setLoading] = useState(false);
  const [nftInfo, setNftInfo] = useState<any>([]);
  const [amount, setAmount] = useState(0);
  const [raffleStatus, setRaffleStatus] = useState(0);
  const [buyStatus, setBuyStatus] = useState(0)
  const [currentItemId, setCurrentItemId] = useState(0)
  const [raffleInfo, showraffleInfo] = React.useState<string>("raffleinfo");
  const [currentBuyTicket, setCurrnetBuyTicket] = useState(0)
  const [isWinner, setWinner] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [ticketHolder, setTicketHolder] = useState(0)
  const [winningChance, setWinningChance] = useState(0)
  const [ticketBuyerLists, setTicketBuyerLists] = useState<any>([])
  const [walletBalance, setWalletBalance] = useState(0)
  const [ticketsOwned, setTicketsOwned] = useState(0)
  const [winnerAddress, setWinnerAddress] = useState('')
  let startCountdownApi: CountdownApi | null = null
  let countdownEndApi: CountdownApi | null = null

  const setStartCountdownRef = (countdown: Countdown | null) => {
    if (countdown) {
      startCountdownApi = countdown.getApi()
    }
  }

  const setEndCountdownRef = (countdown: Countdown | null) => {
    if (countdown) {
      countdownEndApi = countdown.getApi()
    }
  }

  const handleFollow = async (id: any, follow: boolean) => {
    try{
      const res = await axios.post(`${API_URL}/raffle/updateUserFollow`, {
        id: id,
        follow: follow
      })
      setNftInfo({...nftInfo, follow: follow})
    }catch(error){
      console.log("error", error);
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
          onComplete={handleTickedEndedTime}
          renderer={countdownEndRenderer}
        />
        :
        <div className="flex gap-1 text-white text-[18px] font-semibold" >
          {
            nftInfo ? <>
              <p>Starts In</p>
              <p>
                {days.toString().length === 1 ? `0${days}` : days}:
                {hours.toString().length === 1 ? `0${hours}` : hours}:
                {minutes.toString().length === 1 ? `0${minutes}` : minutes}:
                {seconds.toString().length === 1 ? `0${seconds}` : seconds}
              </p>
            </>
              :
              <p>loading...</p>
          }

        </div>
    )
  }

  const countdownEndRenderer = ({ api, days, hours, minutes, seconds, completed }: any) => {
    if (api.isPaused()) api.start()
    return (
      completed ?
        <p className="text-[18px] font-semibold  " >ENDED</p>
        :
        <div className="flex gap-1 text-white text-[18px] font-semibold" >
          <p>Live</p>
          <p>
            {days.toString().length === 1 ? `0${days}` : days}:
            {hours.toString().length === 1 ? `0${hours}` : hours}:
            {minutes.toString().length === 1 ? `0${minutes}` : minutes}:
            {seconds.toString().length === 1 ? `0${seconds}` : seconds}
          </p>
        </div>
    )
  }

  const handleBuyTicket = async () => {
    try {
      if (raffleStatus === 2) return
      if (storeData.wallet !== 'connected') {
        toast.error(`Please connect your wallet`)
        return
      }
      setLoading(true)

      const walletBalance: any = await getBalance();
      if (walletBalance < nftInfo.price * amount) {
        toast.error(`Wallet Balance must bigger than buy price`)
        setLoading(false)
        return
      }

      if (amount > nftInfo.total_tickets - currentBuyTicket) {
        toast.error(`Amount must smaller than Max Amount`)
        setLoading(false)
        return
      }

      if (amount <= 0) {
        toast.error(`Amount must bigger than 0`)
        setLoading(false)
        return
      }

      const buyTicketTx = await buyTicket1155(
        currentItemId,
        amount,
        nftInfo.price * amount 
      )

      if (buyTicketTx) {
        toast.success(`Successfully Ticket Buy`)
        setCurrnetBuyTicket(currentBuyTicket + amount)
        if (buyStatus === 0) {
          const findIdx = ticketBuyerLists.findIndex((item: any) =>
            item?.buyer.toLowerCase() === storeData.address)

          if (findIdx === -1) {
            setTicketBuyerLists([...ticketBuyerLists, {
              buyer: storeData.address,
              amount: amount
            }])
          } else {
            const new_buyerLists = ticketBuyerLists.map((item: any, idx: any) => {
              return idx === findIdx ? { ...ticketBuyerLists[findIdx], amount: item.amount + Number(amount) } : item
            })
            setTicketBuyerLists(new_buyerLists)
          }

        } else if (buyStatus === 1) {
          const findIdx = ticketBuyerLists.findIndex((item: any) =>
            item?.buyer.toLowerCase() === storeData.address)

          const new_buyerLists = ticketBuyerLists.map((item: any, idx: any) => {
            return idx === findIdx ? { ...ticketBuyerLists[findIdx], amount: item.amount + Number(amount) } : item
          })
          setTicketBuyerLists(new_buyerLists)
        }

      }
      setLoading(false)
    } catch (error) {
      console.log('error', error)
      toast.error(`Error Buy Ticket`)
      setLoading(false)
    }
  };

  const getRaffleStatus = (nftInfo: any) => {
    const currentTime = Math.floor(Date.now() / 1000);
    let status = 0;
    if (currentTime > nftInfo.end_date) status = 2;
    else if (currentTime >= nftInfo.start_date) status = 1;
    setRaffleStatus(status);
  };

  const handleTickedEndedTime = async () => {
    try {
      if (nftInfo.state !== 0) return
      setLoading(true)

      const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
      const signer = Provider.getSigner();
      const raffleContract = new Contract(CONFIG.RAFFLE.CONTRACTADDRESS721, CONFIG.RAFFLE.ABI721, signer);
      const fetch_lists = await raffleContract.fetchRaffleItems();
      const get_winner = fetch_lists.find((item: any, index: number)  => item.tokenId.toNumber() === nftInfo?.tokenId && item.solid === true);
      setWinnerAddress(get_winner.winner)
      if (get_winner.winner.toLowerCase() === storeData.address) {
        setWinner(true)
      } else {
        setWinner(false)
      }
      setRaffleStatus(2)

      setLoading(false)
    } catch (error) {
      console.log('error', error)
      setLoading(false)

    }
  }


  const BuyStatus = () => {
    return (
      <>
        {
          raffleStatus === 0 && <p className="text-black text-[1.25rem] text-center">None</p>
        }

        {
          raffleStatus === 1 && buyStatus === 0 && <p className="text-black text-[1.25rem] text-center">None</p>
        }

        {
          raffleStatus === 1 && buyStatus === 1 && <p className="text-black text-[1.25rem] text-center">Pending</p>
        }

        {
          raffleStatus === 2 && buyStatus === 0 && <div className="flex flex-col gap-2" >
            <p className="text-[#8652FF] text-[0.75rem] text-center" >Raffle Winner</p>
            <p className="text-[#8652FF] text-[1.25rem] text-center">{winnerAddress ?
              winnerAddress?.substr(0, 6) + '...' + winnerAddress?.substr(storeData?.address.length - 4, 4)
              : ``}</p>
          </div>
        }

        {
          // raffleStatus === 2 && buyStatus === 1 && <p className="text-black text-[1.25rem] text-center">Fail</p>
          raffleStatus === 2 && buyStatus === 1 && <div className="flex flex-col gap-2" >
            <p className="text-[#8652FF] text-[0.75rem] text-center" >Raffle Winner</p>
            <p className="text-[#8652FF] text-[1.25rem] text-center">{winnerAddress ?
              winnerAddress?.substr(0, 6) + '...' + winnerAddress?.substr(storeData?.address.length - 4, 4)
              : ``}</p>
          </div>
        }

      </>
    )
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const nftInfoById: any = await getRaffleById(id);

        const dateFormat = new Date(nftInfoById.start_date * 1000)
        const result_date = dateFormat.getMonth() + 1 +
          "/" + (dateFormat.getDate()) +
          "/" + dateFormat.getFullYear() +
          " " + dateFormat.getHours() +
          ":" + dateFormat.getMinutes()
        // ":" + dateFormat.getSeconds()
        setNftInfo({
          ...nftInfoById,
          _id: nftInfoById._id,
          project: nftInfoById.project,
          price: nftInfoById.price,
          tokenAddress: nftInfoById.tokenAddress,
          tokenId: nftInfoById.tokenId,
          start: result_date,
          state: nftInfoById.state,
          nftName: nftInfoById.name
        });
        const getWalletBalance: any = await getBalance();
        setWalletBalance(getWalletBalance)

        if (nftInfoById.start_date * 1000 > Date.now() && nftInfoById.walletAddress === storeData.address) {
          setShowEdit(true)
        }

        const getRaffleInfo: any = await fetchRaffle1155Items(nftInfoById.tokenId, nftInfoById.tokenAddress, nftInfoById.start_date)
        setCurrentItemId(getRaffleInfo?.itemId + 1)

        if (storeData.wallet === 'connected') {
          const getMyTickets = await fetchMyTickets1155()
          const filter_myTickets = getMyTickets.find((item: any) => item.buyer.toLowerCase() === storeData.address && item.raffleId.toNumber() === getRaffleInfo?.itemId + 1)
          const getBuyTicketAmount = filter_myTickets?.ticketAmount.toNumber()

          if (getBuyTicketAmount > 0) {
            setBuyStatus(1)
          } else {
            setBuyStatus(0)
          }
          setWinnerAddress(getRaffleInfo?.winner)

          if (getRaffleInfo?.winner === storeData.address) {
            setWinner(true)
          } else {
            setWinner(false)
          }

        }

        const getTicketByID = await fetchTicket1155ItemsByID(getRaffleInfo?.itemId + 1)

        let filter_TicketByID = getTicketByID.filter(
          (person: any, index: any) => index === getTicketByID.findIndex(
            (other: any) => person?.buyer === other?.buyer
          ));
        setTicketHolder(filter_TicketByID.length)
        let totalAmount = 0
        const res_ticketById = filter_TicketByID.map((item: any) => {
          totalAmount += item.ticketAmount.toNumber()
          return { ...item, amount: item?.ticketAmount.toNumber() }
        })
        setCurrnetBuyTicket(totalAmount ? totalAmount : 0)

        const getTicketsOwned = filter_TicketByID.find((item: any) => item.buyer.toLowerCase() === storeData.address)
        const resTicketsOwned = getTicketsOwned?.ticketAmount ? getTicketsOwned?.ticketAmount.toNumber() : 0
        const percentTicketsOwned = 100 * resTicketsOwned / nftInfo.total_tickets
        setTicketsOwned(percentTicketsOwned)

        const getWinningChance = 100 * resTicketsOwned / totalAmount
        setWinningChance(getWinningChance)
        setTicketBuyerLists(res_ticketById)
        getRaffleStatus(nftInfoById)
        setLoading(false)
      } catch (error) {
        console.log("error", error);
        setLoading(false)
      }
    })();
  }, [storeData, raffleInfo]);

  return (
    <div>
      {
        isLoading ?
          <div id="preloader"></div> :
          <div id="preloader" style={{ display: "none" }}></div>
      }
      <div className="bg-white">
        <Navbar />
        <div className="max-w-[1240px] m-auto pt-8 pb-16 px-4">
          <div className="xl:flex justify-between block">
            {/* Info Left  */}
            <div className="xl:basis-[35%] max-w-[450px] m-auto xl:max-w-auto xl:m-0 pb-6 xl:pb-0">
              <div className="rounded-[0.9rem] overflow-hidden border-4 border-[white] nftItem-shadow">
                <div className="relative">
                  <img
                    src={nftInfo.image}
                    alt="CoodeImage"
                    className="min-h-[360px] object-cover"
                  />
                </div>
                <div className="p-5">
                  <div className="flex flex-col gap-[16px] bg-white p-[18px]  ">
                    <button
                      type="button"
                      className="bg-white-500 shadow-lg shadow-white-500/50 text-black bg-white rounded-[0.7rfem] flex items-center py-3 px-5"
                    >
                      <img
                        src={PricetagIcon}
                        alt="Pricetag-icon"
                        className="w-[22px]"
                      />
                      <span className="ml-3 text-lg">
                        Price: {nftInfo.price} MATIC per Ticket
                      </span>
                    </button>

                    {
                      raffleStatus !== 2 && <div className="relative" >
                        <div className="flex items-center justify-between gap-[8px]">
                          <input
                            type="number"
                            name="solValue"
                            min="0"
                            value={amount}
                            placeholder=""
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-[20%] block text-[#000] text-base text-center outline-none bg-[#82828240] border border-[#ECECEC] rounded-[0.7rem] py-3 px-5"
                            disabled={raffleStatus !== 1}
                          />
                          <button
                            type="button"
                            onClick={handleBuyTicket}
                            className="w-[60%] rounder-[14px]  text-center text-white bg-[#8652FF] rounded-[0.7rem]  py-3 sm:px-5"
                          >
                            <span className="text-center sm:text-lg text-sm text-white ">
                              Buy for {amount * nftInfo.price} MATIC
                            </span>
                          </button>
                          <button
                            type="button"
                            className="text-black bg-white rounded-[0.7rem] flex items-center justify-center py-3 px-5 nftItem-shadow"
                          >
                            <img
                              src={ShareIcon}
                              alt="Pricetag-icon"
                              className="w-[22px]"
                            />
                          </button>

                        </div>
                        <div className="relative" >
                          <p className="text-[#8652FF] text-center mt-2" >You have: {walletBalance ? (walletBalance - amount * nftInfo.price).toFixed(2) : 0} MATIC </p>
                        </div>
                      </div>
                    }

                    {
                      isWinner === true ?
                        // <p className="text-[#8652FF] text-[1.25rem] text-center">Win</p>
                        <div className="flex flex-col gap-2" >
                          <p className="text-[#8652FF] text-[0.75rem] text-center" >Raffle Winner</p>
                          <p className="text-[#8652FF] text-[1.25rem] text-center">{winnerAddress ?
                            winnerAddress?.substr(0, 6) + '...' + winnerAddress?.substr(storeData?.address.length - 4, 4)
                            : ``}</p>
                        </div>
                        : (
                          raffleStatus === 0 ? <p className="text-black text-[1.25rem] text-center">None</p>
                            : <BuyStatus />
                        )
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Info Right  */}
            <div className="basis-[63%]">
              <div className="border-4 border-[white] rounded-[0.9rem]  nftItem-shadow">
                <div className="flex justify-between p-4">
                  <div>
                    <div className="flex items-center">

                      <p className="text-[#1A1A1A]">{nftInfo.project}</p>
                      <img
                        src={VerificationIcon}
                        alt="VerificationIcon"
                        className="w-[20px] ml-1"
                      />
                    </div>
                    <h1 className="text-[24px] text-[#1A1A1A] mt-1">{nftInfo.nftName}</h1>
                    {/* <div className="flex items-center" >
                      <p className="text-[16px] text-grey " >NFT Contract Address:</p>
                      <p className="text-[16px] text-grey" >{nftInfo.tokenAddress}</p>
                    </div>
                    <div className="flex items-center" >
                      <p className="text-[16px] text-grey " >NFT Token ID:</p>
                      <p className="text-[16px] text-grey" >{nftInfo.tokenId}</p>
                    </div> */}
                    <div className="flex items-center gap-2" >
                      <a href={`https://opensea.io/assets/ethereum/${nftInfo.tokenAddress}/${nftInfo.tokenId}`} target="_blank" ><img src={OpenSeaIcon} className="w-[25px]" /></a>
                      <a href={`https://magiceden.io/item-details/polygon/${nftInfo.tokenAddress}/${nftInfo.tokenId}`} target="_blank"><img src={MagicEdenIcon} className="w-[25px]" /></a>
                      <a href={`https://mumbai.polygonscan.com/token/${nftInfo.tokenAddress}?a=${nftInfo.tokenId}}#inventory`} target="_blank"><img src={PolygonIcon} className="w-[25px]" /></a>
                    </div>
                    <div className="flex items-center mt-4">
                      <button
                        type="button"
                        className={`${raffleInfo === "raffleinfo"
                          ? "border border-white bg-[#8652FF] text-white py-2 rounded-[0.6rem] sm:px-4 px-2 text-sm sm:text-base"
                          : "text-[#666666]  sm:px-4 px-2 hover:border-[1px] hover:border-solid hover:border-[#8652FF] "
                          } `}
                        onClick={() => showraffleInfo("raffleinfo")}
                      >
                        Raffle Info
                      </button>
                      <button
                        type="button"
                        onClick={() => showraffleInfo("participants")}
                        // className="ml-3 text-white py-2 rounded-[0.6rem] px-4"
                        className={`${raffleInfo === "participants"
                          ? "border border-white bg-[#8652FF] text-white py-2 rounded-[0.6rem] sm:px-4 px-2 text-sm sm:text-base"
                          : "text-[#666666] sm:px-4 px-2 hover:border-[1px] hover:border-solid hover:border-[#8652FF] "
                          } `}
                      >
                        Participants
                      </button>
                    </div>
                  </div>
                  <div>
                    <Link to='/' >

                      <div className="flex items-center mb-2">
                        <img src={ReturnIcon} alt="ReturnIcon" />
                        <span className="text-[black] inline-block ml-1 font-medium ">
                          Return
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
                <div className="h-[2px] w-[95%] m-auto bg-[#606060]"></div>
                {raffleInfo === "raffleinfo" && (
                  <div className="bg-[#8652FF] rounded-[16px] py-4 px-4 sm:px-0 mt-4">
                    <div className="relative sm:flex block justify-between sm:w-[85%] m-auto">
                      <div className="text-center">
                        <img
                          src={TimingIcon}
                          alt="TimingIcon"
                          className="max-w-[60px] m-auto"
                        />
                        <p className="text-[white]">Time Remaining</p>
                        <p className="text-white">
                          {
                            nftInfo?.start_date && <Countdown
                              ref={setStartCountdownRef}
                              date={nftInfo?.start_date * 1000}
                              // date={1675428664291}
                              zeroPadTime={3}
                              renderer={startCountdownRenderer}
                              onComplete={() => {
                                setRaffleStatus(1)
                                setShowEdit(false)
                              }}
                            />
                          }

                        </p>
                      </div>
                      <div className={`
                        absolute left-[50%] translate-x-[-50%]
                        text-center
                        `}>
                        <img
                          src={TicketIcon}
                          alt="TimingIcon"
                          className="max-w-[60px] m-auto"
                        />
                        <p className="text-[white]">Tickets Remaining</p>
                        <p className="text-white text-[18px] font-semibold ">{(nftInfo.total_tickets) ? nftInfo.total_tickets - currentBuyTicket : 0}/{nftInfo.total_tickets ? nftInfo.total_tickets : 0}</p>
                      </div>
                      <div className={`
                        absolute w-[200px] left-[52%] translate-x-[63%] text-center
                        `}>
                        <img
                          src={TicketOwnedIcon}
                          alt="TimingIcon"
                          className="max-w-[60px] m-auto"
                        />
                        <p className="text-[white]">Tickets Owned</p>
                        <p className="text-white text-[18px] font-semibold">{ticketsOwned ? ticketsOwned.toFixed(2) : 0}%</p>
                      </div>

                      <div className="absolute left-[33%] md: border-l-[1px] bg-[transparent] w-2 border-dashed h-[108px] border-white  " />
                      <div className="absolute left-[66%] md: border-l-[1px] bg-[transparent] w-2 border-dashed h-[108px] border-white  " />
                    </div>

                    <div className="relative sm:flex block justify-between sm:w-[85%] m-auto mt-6 ">
                      <div className="text-center">
                        <img
                          src={DateIcon}
                          alt="TimingIcon"
                          className="max-w-[60px] m-auto"
                        />
                        <p className="text-[white]">Start Date</p>
                        <p className="text-white text-[18px] font-semibold">{nftInfo?.start}</p>
                      </div>

                      <div className="absolute left-[50%] translate-x-[-50%]
                        text-center">
                        <img
                          src={HoldersIcon}
                          alt="TimingIcon"
                          className="max-w-[60px] m-auto"
                        />
                        <p className="text-[white]">Unique Ticket Holders</p>
                        <p className="text-white text-[18px] font-semibold">{ticketHolder}</p>
                      </div>
                      <div className="text-center  absolute w-[200px] left-[52%] translate-x-[63%] text-center">
                        <img
                          src={WinningIcon}
                          alt="TimingIcon"
                          className="max-w-[60px] m-auto"
                        />
                        <p className="text-[white]">Winning Chance</p>
                        <p className="text-white text-[18px] font-semibold">{winningChance ? winningChance.toFixed(2) : 0}%</p>
                      </div>
                      <div className="absolute left-[33%] md: border-l-[1px] bg-[transparent] w-2 border-dashed h-[108px] border-white  " />
                      <div className="absolute left-[66%] md: border-l-[1px] bg-[transparent] w-2 border-dashed h-[108px] border-white  " />
                    </div>
                  </div>
                )}

                {raffleInfo === "participants" && (
                  <div
                    className="text-white max-h-[447px] overflow-y-auto bg-[#ECECEC] mt-4 "
                    id="wallet-list"
                  >
                    <ul className="py-3 px-4 w-full flex justify-between">
                      <li className="basis-[50%] text-[24px] text-[#1A1A1A] ">User</li>
                      <li className="basis-[50%] text-[24px] text-[#1A1A1A] text-center">
                        Tickets Bought
                      </li>
                    </ul>
                    {
                      ticketBuyerLists.map((item: any, idx: any) => {
                        return (
                          <ul key={idx}
                            className={`px-4 w-full flex justify-between pt-0 ${idx % 2 === 0 ? "bg-[#CCCBD2]" : ""} `}
                          >
                            <li className="basis-[50%] text-[#666] text-[14px]">
                              {item?.buyer.substr(0, 6) + '...' + item?.buyer.substr(item?.buyer.length - 4, 4)}
                              {/* {item?.name} */}
                            </li>
                            <li className="basis-[50%] text-[#666] text-[14px] text-center">{item?.amount}</li>
                          </ul>
                        )
                      })
                    }
                  </div>
                )}
                <div className=" flex flex-col gap-2 p-4" >
                  <p className="text-[#8652FF] text-[24px] ">Raffler</p>
                  <div className="flex items-center gap-2 " >
                    <p>@Yogesh</p>
                    <img src={IdCardIcon} />
                    <img src={TwitterIcon} />
                    <img src={DiscordIcon} />
                  </div>
                  {
                    !nftInfo?.follow ? 
                      <button className="bg-[#8652FF] max-w-fit rounded-[4px] py-[6px] px-[25px] text-white " onClick={() => handleFollow(nftInfo._id, true) } >Follow</button>
                    :
                    <button className="bg-[#8652FF] max-w-fit rounded-[4px] py-[6px] px-[25px] text-white " onClick={() => handleFollow(nftInfo._id, false) } >Unfollow</button>
                  }
                </div>
                <div className="p-4">

                  <h1 className="text-2xl text-[##666666]">Terms & Conditions</h1>
                  <ul className="text-[##666666] mt-2 text-base list-decimal px-5">
                    <li>
                      All NFT prizes are held by raffle in escrow and can be claimed by the winner or
                      creator once the draw is done.
                    </li>
                    <li>
                      Raffle tickets cannot be refunded once bought.
                    </li>
                    <li>
                      Raffle tickets will not be refunded if you did not win the raffle.
                    </li>
                    <li>
                      You can only buy 20% of total tickets.
                    </li>
                    <li>
                      You'll be charged 1% fees for swapping through Jupiter.
                    </li>
                    <li>
                      FFF receives a portion of the fees generated for anyone utilizing the Raven
                      services through our website.
                    </li>
                  </ul>
                </div>
              </div>

              {
                showEdit && <Link
                  to={`/raffle/${nftInfo._id}`}
                  className="flex gap-[16px] items-center bg-[#ECECEC] rounded-[9px] py-[8px] px-[10px] max-w-fit cursor-pointer ml-[auto] " >
                  <img src={EditIcon} className="w-[18px] h-[18px] " />
                  <p>Edit Raffle</p>
                </Link>
              }



            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};
export default DetailRaffle1155;
