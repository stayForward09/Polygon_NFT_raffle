import { useState, useEffect } from 'react'
import { Link } from "react-router-dom";
import Countdown, { CountdownApi } from 'react-countdown'

import VerificationIcon from "../../assets/Verification-icon-2.png";
import VeiwIcon from "../../assets/Veiw-Icon.png";
import TimingIcon from "../../assets/Subtract-timing-icon.png";
import TicketIcon from "../../assets/Subtract-ticket-icon.png";
import BoughtIcon from "../../assets/Subtract-bought-icon.png";
import WinningIcon from "../../assets/Subtract-winning-icon.png";

import { fetchRaffleItems, fetchTicketItemsByID } from '../../services/contracts/raffle';
import { fetchAuctionItems, fetchMyBidItems } from '../../services/contracts/auction';
import CONFIG from '../../config';
import { fetchAuction1155Items, fetchBidItemsById1155, fetchMyBidItems1155 } from '../../services/contracts/auction1155';


const AuctionRarticipant = (props: any) => {
  const { item, idx } = props
  const [sellAmount, setSellAmount] = useState(0)

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
        <div>
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
        <div>
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

            const find_bidding = get_nftInfo.find((item: any) => getAuctionInfo?.itemId === item.auctionId.toNumber() - 1)
            if (find_bidding) {
              setSellAmount(find_bidding.bidPrice.toNumber() / CONFIG.DECIMAL)
            }

          } else {
            const getAuctionInfo = await fetchAuctionItems(item.tokenId, item.tokenAddress, item.start_date);
            const get_nftInfo = await fetchMyBidItems()

            const find_bidding = get_nftInfo.find((item: any) => getAuctionInfo?.itemId === item.auctionId.toNumber() - 1)
            if (find_bidding) {
              setSellAmount(find_bidding.bidPrice.toNumber() / CONFIG.DECIMAL)
            }

          }

        } catch (error) {
          console.log('error', error)
        }
      }
    )()
  }, [])

  return (
    <div key={idx} >
      <div className="max-w-[1280px] m-auto px-4">
        <div className="border-2 border-white bg-[#606060A6] rounded-md mb-4">
          <div className="flex p-4">
            <div className="flex basis-[30%]">
              <div className="mr-2">
                <img
                  src={item?.image ? item?.image : ``}
                  alt="Coode"
                  className="w-[130px] h-[130px] w-full object-cover"
                />
              </div>
              <div>
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center">
                      <img
                        src={VerificationIcon}
                        alt="VerificationIcon"
                      />
                      <span className="text-lg text-white inline-block ml-1">
                        {item?.project}
                      </span>
                    </div>
                    <h1 className="text-[16px] text-white mt-1">
                      {item?.name}
                    </h1>
                  </div>
                  <div>
                    {
                      item.type === `ERC1155` ?
                        <Link
                          to={`/auction1155/detail/${item?._id}`}
                          type="button"
                          className="max-w-fit flex items-center py-2 px-2 bg-white rounded-md"
                        >
                          <img src={VeiwIcon} alt="VeiwIcon" />
                          <span className="ml-1">View Auction</span>
                        </Link>
                        :
                        <Link
                          to={`/auction/detail/${item?._id}`}
                          type="button"
                          className="max-w-fit flex items-center py-2 px-2 bg-white rounded-md"
                        >
                          <img src={VeiwIcon} alt="VeiwIcon" />
                          <span className="ml-1">View Auction</span>
                        </Link>
                    }
                  </div>
                </div>
              </div>
            </div>
            <div className="basis-[70%] flex justify-around pt-2">
              <div className="text-center flex flex-col items-center">
                <img
                  src={TimingIcon}
                  alt="TimingIcon"
                  className="mb-2 w-[60px]"
                />
                <h1 className="text-[#878787]">Time Remaining</h1>
                <p className="text-white">
                  <Countdown
                    ref={setStartCountdownRef}
                    date={item?.start_date ? item?.start_date * 1000 : 0}
                    zeroPadTime={3}
                    renderer={startCountdownRenderer}
                  />
                </p>
              </div>
              <div className="text-center flex flex-col items-center">
                <img
                  src={TicketIcon}
                  alt="TimingIcon"
                  className="mb-2 w-[60px]"
                />
                <h1 className="text-[#878787]">Min. Bid Incrementant</h1>
                <p className="text-white">{item?.price}</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <img
                  src={BoughtIcon}
                  alt="TimingIcon"
                  className="mb-2 w-[60px]"
                />
                <h1 className="text-[#878787]">Tickets Bought</h1>
                <p className="text-white">{sellAmount}</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <img
                  src={WinningIcon}
                  alt="TimingIcon"
                  className="mb-2 w-[60px]"
                />
                <h1 className="text-[#878787]">Winning Chance</h1>
                <p className="text-white">10%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionRarticipant;
