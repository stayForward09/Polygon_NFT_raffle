import { useState, useEffect } from 'react'
import { SwiperSlide } from "swiper/react"
import { Link } from "react-router-dom";
import Countdown, { CountdownApi } from 'react-countdown'


import VerificationIcon from "../assets/verification-icon.svg";
import { fetchRaffle1155Items, fetchTicket1155ItemsByID } from '../services/contracts/raffle1155';
import { fetchRaffleItems, fetchTicketItemsByID } from '../services/contracts/raffle';

const SwiperItem = (props: any) => {
  const { item, index } = props
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
          }
        } catch (error) {
          console.log('error', error)
        }
      }
    )()

  }, [])

  return (
    <div className="rounded-[0.9rem] overflow-hidden border-4 border-[white] nftItem-shadow">
      <div className="relative">
        <img
          src={item.image}
          alt="CoodeImage"
          className="min-h-[360px] object-cover"
        />
      </div>
      <div className=" flex flex-col gap-[8px] bg-white p-[18px]  ">
        <div>
          <div className="flex items-center">
            <img
              src={VerificationIcon}
              alt="VerificationIcon"
              style={{ width: "16px" }}
            />
            <span className="text-base leading-none inline-block ml-1">
              {item.project}
            </span>
          </div>
          <h1 className="text-xl">{item.name}</h1>
        </div>

        <div >
          <div className="flex justify-between items-center " >
            <p className="text-[15px]">Ticket Price</p>
            <p className="text-sm text-[#8652FF] font-medium ">
              {item.price} MATIC
            </p>
          </div>
          <div className="flex justify-between items-center " >
            <p className="text-[15px]">Tickets Remaining</p>
            <p className="text-sm text-[#8652FF] font-medium ">
              {item.total_tickets}/{item.total_tickets}
            </p>
          </div>
          <div className="flex justify-between items-center ">
            <p className="text-[15px]">Time Remaining</p>
            <p className="text-sm text-[#8652FF] font-medium ">
              <Countdown
                ref={setStartCountdownRef}
                date={item.start_date * 1000}
                zeroPadTime={3}
                // onComplete={() => setShowEdit(false)}
                renderer={startCountdownRenderer}
              />
            </p>
          </div>
        </div>

        <div className="text-center mt-2 ">
          {
            item.type === `ERC1155` ?
              <Link
                to={`/raffle1155/detail/${item._id}`}
                className="bg-[#8652FF] text-white rounded-[4px] py-[10px] px-[10px] md:px-[80px] button-hover "
              >
                View Raffle
              </Link>
              :
              <Link
                to={`/raffle/detail/${item._id}`}
                className="bg-[#8652FF] text-white rounded-[4px] py-[10px] px-[10px] md:px-[80px] button-hover "
              >
                View Raffle
              </Link>

          }
        </div>

      </div>
    </div>

  )
}

export default SwiperItem