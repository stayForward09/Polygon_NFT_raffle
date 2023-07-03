import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Countdown, { CountdownApi } from 'react-countdown'

import VerificationIcon from "../assets/Verification-icon.png";
import { fetchAuctionItems, fetchMyBidItems } from "../services/contracts/auction";
import { DECIMAL } from "../config/dev";
import { fetchAuction1155Items, fetchMyBidItems1155 } from "../services/contracts/auction1155";

const AuctionItem = (props: any) => {
  const { item } = props;
  const storeData: any = useSelector((status) => status)
  const [currentBid, setCurrentBid] = useState(0)
  const [showEdit, setShowEdit] = useState(false)

  let startCountdownApi: CountdownApi | null = null
  let endCountdownApi: CountdownApi | null = null

  const setStartCountdownRef = (countdown: Countdown | null) => {
    if (countdown) {
      startCountdownApi = countdown.getApi()
    }
  }

  const setEndCountdownRef = (countdown: Countdown | null) => {
    if (countdown) {
      endCountdownApi = countdown.getApi()
    }
  }

  const startCountdownRenderer = ({ api, days, hours, minutes, seconds, completed }: any) => {
    if (api.isPaused()) api.start()
    return (
      completed ?
        <Countdown
          ref={setEndCountdownRef}
          date={item.end_date * 1000}
          zeroPadTime={3}

          renderer={endCountdownRenderer}
        />
        :
        <div className="flex gap-1" >
          <p>Starts In</p>
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
        <p>Ended</p>
        :
        <div className="flex gap-1" >
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

  useEffect(() => {
    (
      async () => {
        try {
          if (item.type === `ERC1155`) {
            const getAuctionInfo = await fetchAuction1155Items(item.tokenId, item.tokenAddress, item.start_date);
            const get_nftInfo = await fetchMyBidItems1155()

            const find_bidding = get_nftInfo.find((item: any) => getAuctionInfo?.itemId + 1 === item.auctionId.toNumber())

            if (find_bidding) {
              setCurrentBid(find_bidding.bidPrice.toNumber() / DECIMAL)
            }
          } else {
            const getAuctionInfo = await fetchAuctionItems(item.tokenId, item.tokenAddress, item.start_date);
            const get_nftInfo = await fetchMyBidItems()

            const find_bidding = get_nftInfo.find((item: any) => getAuctionInfo?.itemId + 1 === item.auctionId.toNumber())

            if (find_bidding) {
              setCurrentBid(find_bidding.bidPrice.toNumber() / DECIMAL)
            }
          }

          if (item.start_date * 1000 > Date.now() && item.walletAddress === storeData.address) {
            setShowEdit(true)
          }


        } catch (error) {
          console.log('error', error)
        }
      }
    )()
  }, [])

  return (
    <div
      className="xl:basis-[24%] lg:basis-[32%] md:basis-[48%] sm:basis-[48%] basis-[100%] mt-6"
      key={item._id}
    >
      <div className="rounded-[0.9rem] overflow-hidden border-4 border-[#606060]">
        <div className="relative min-h-[300px] ">
          <img
            src={item.image}
            alt="CoodeImage"
            className="lg:h-[300px] w-full object-cover"
          />
          <div className="absolute top-0 left-0 h-full w-full">
            <div className="flex flex-col justify-between h-full p-2">
              <div className="flex justify-end">
                <div className="border-black bg-[#949494] border flex rounded-md overflow-hidden">
                  <p className="bg-white text-base py-1 pl-2 pr-4 para-clip">
                    {item.name.split('#')[0]}
                  </p>
                  <p className="py-1 px-2 text-base text-white">#{item.tokenId}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
        <div className="bg-white -mt-1">
          <div className="pt-2 pl-3 pb-2 border-b-[#D9D9D9] border">
            <div className="flex items-center">
              <img src={VerificationIcon} alt="VerificationIcon" />
              <span className="text-base leading-none inline-block ml-1">
                {item.name.split('#')[0]} #{item.tokenId}
              </span>
            </div>
            <h1 className="text-xl">@{item.project}</h1>
          </div>
          <div className="pt-4 pb-8 px-3 ">
            <div className="flex justify-between">
              <div className="basis-[40%]">
                <p className="text-sm">Time Remaining</p>
                <p className="text-sm ">
                  <Countdown
                    ref={setStartCountdownRef}
                    date={item.start_date * 1000}
                    zeroPadTime={3}
                    onComplete={() => setShowEdit(false)}

                    renderer={startCountdownRenderer}
                  />
                </p>
              </div>
              <div className="basis-[29%]">
                <p className="text-sm">Min. Increment</p>
                <p className="text-sm text-[#4A4A4A]">{item.price}</p>
              </div>

              <div className="basis-[29%]">
                <p className="text-sm">Type</p>
                <p className="text-sm text-[#4A4A4A]">{item.type}</p>
              </div>
            </div>
            {
              storeData.wallet === 'connected' &&
              <div className="flex justify-between pt-2 ">
                <div className="basis-[50%] flex gap-1 items-center ">
                  <p className="text-sm">Current Bid</p>
                  <p className="text-sm text-[#4A4A4A]">{currentBid ? currentBid : 0}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <div className='flex gap-2 justify-center w-full' >
        <div className="-mt-[26px] text-center">
          {
            item.type === `ERC1155` ?
              <Link
                to={`/auction1155/detail/${item._id}`}
                className="bg-black text-white border-4 rounded-md inline-block py-1 px-4  border-[#606060]"
              >
                View
              </Link>
              :
              <Link
                to={`/raffle/detail/${item._id}`}
                className="bg-black text-white border-4 rounded-md inline-block py-1 px-4  border-[#606060]"
              >
                View
              </Link>

          }
        </div>
        {
          showEdit &&
          <div className="-mt-[26px] text-center">
            <Link
              to={`/auction/${item._id}`}
              className="bg-black text-white border-4 rounded-md inline-block py-1 px-4  border-[#606060]"
            >
              Edit
            </Link>
          </div>
        }

      </div>
    </div>
  );
};

export default AuctionItem;
