import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux';
import { Link } from "react-router-dom";
import Countdown, { CountdownApi } from 'react-countdown'

import VerificationIcon from "../../assets/Verification-icon-2.png";
import VeiwIcon from "../../assets/view_icon.svg";
import TimingIcon from "../../assets/Subtract-timing-icon.png";
import TicketIcon from "../../assets/Subtract-ticket-icon.png";
import BoughtIcon from "../../assets/Subtract-bought-icon.png";
import WinningIcon from "../../assets/Subtract-winning-icon.png";
import { fetchRaffle1155Items, fetchTicket1155ItemsByID } from '../../services/contracts/raffle1155';
import { fetchRaffleItems, fetchTicketItemsByID } from '../../services/contracts/raffle';


const RaffleRarticipant = (props: any) => {
  const { item, idx } = props
  const storeData: any = useSelector((status) => status)
  const [sellAmount, setSellAmount] = useState(0)
  const [winningChance, setWinningChance] = useState(0)

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
        <div className='flex items-center gap-4 ' >
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
          if (storeData.wallet !== 'connected') return
          if (item.type === `ERC1155`) {
            const getRaffleInfo = await fetchRaffle1155Items(item.tokenId, item.tokenAddress, item.start_date)
            const getTicketByID = await fetchTicket1155ItemsByID(getRaffleInfo?.itemId + 1)
            let filter_TicketByID = getTicketByID.filter(
              (person: any, index: any) => index === getTicketByID.findIndex(
                (other: any) => person.buyer === other.buyer
              ));
            let totalAmount = 0
            for (let i = 0; i < filter_TicketByID.length; i++) {
              totalAmount += filter_TicketByID[i].ticketAmount.toNumber()
            }
            setSellAmount(totalAmount)

            const getTicketsOwned = filter_TicketByID.find((item: any) => item.buyer.toLowerCase() === storeData.address)
            const resTicketsOwned = getTicketsOwned.ticketAmount ? getTicketsOwned?.ticketAmount.toNumber() : 0
            const getWinningChance = 100 * resTicketsOwned / totalAmount
            setWinningChance(getWinningChance)

          } else {
            const getRaffleInfo = await fetchRaffleItems(item.tokenId, item.tokenAddress, item.start_date)

            const getTicketByID = await fetchTicketItemsByID(getRaffleInfo?.itemId + 1)

            let filter_TicketByID = getTicketByID.filter(
              (person: any, index: any) => index === getTicketByID.findIndex(
                (other: any) => person.buyer === other.buyer
              ));
            let totalAmount = 0
            for (let i = 0; i < filter_TicketByID.length; i++) {
              totalAmount += filter_TicketByID[i].ticketAmount.toNumber()
            }
            setSellAmount(totalAmount)

            const getTicketsOwned = filter_TicketByID.find((item: any) => item.buyer.toLowerCase() === storeData.address)
            const resTicketsOwned = getTicketsOwned.ticketAmount ? getTicketsOwned?.ticketAmount.toNumber() : 0
            const getWinningChance: any = 100 * resTicketsOwned / totalAmount
            setWinningChance(getWinningChance.toFixed(2))
          }

        } catch (error) {
          console.log('error', error)
        }
      }
    )()
  }, [storeData])

  return (
    <div key={idx} >
      <div className=" m-auto px-4">
        <div className="border-2 border-white bg-[#8652FF] rounded-md mb-4">
          <div className="flex p-4">
            <div className="flex basis-[30%]">
              <div className="mr-2">
                <img
                  src={item?.image ? item?.image : ``}
                  alt="Coode"
                  className="min-w-[110px] h-[110px] w-full object-cover rounded-[16px] "
                />
              </div>
              <div>
                <div className="flex flex-col gap-[30px] h-full">
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
                          to={`/raffle1155/detail/${item?._id}`}
                          type="button"
                          className="max-w-fit flex items-center  bg-white rounded-[2.5px]  px-[5px] "
                        >
                          <img src={VeiwIcon} alt="VeiwIcon" />
                          <span className="ml-1">View Raffle</span>
                        </Link>
                        :
                        <Link
                          to={`/raffle/detail/${item?._id}`}
                          type="button"
                          className="max-w-fit flex items-center  bg-white rounded-[2.5px]  px-[5px] "
                        >
                          <img src={VeiwIcon} alt="VeiwIcon" />
                          <span className="ml-1">View Raffle</span>
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
                <h1 className="text-[#fff]">Time Remaining</h1>
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
                <h1 className="text-[#fff]">Tickets Remaining</h1>
                <p className="text-white">{item?.total_tickets - sellAmount}</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <img
                  src={BoughtIcon}
                  alt="TimingIcon"
                  className="mb-2 w-[60px]"
                />
                <h1 className="text-[#fff]">Tickets Bought</h1>
                <p className="text-white">{sellAmount}</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <img
                  src={WinningIcon}
                  alt="TimingIcon"
                  className="mb-2 w-[60px]"
                />
                <h1 className="text-[#fff]">Winning Chance</h1>
                <p className="text-white">{winningChance}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaffleRarticipant;
