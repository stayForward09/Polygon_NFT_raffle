import { useState, useEffect } from 'react'
import Countdown, { CountdownApi } from 'react-countdown'
import { Link } from 'react-router-dom';
import VerificationIcon from "../../assets/verification-icon.svg";
import FavouriteIcon from "../../assets/fav-icon.svg"
import { fetchRaffle1155Items, fetchTicket1155ItemsByID } from '../../services/contracts/raffle1155';
import { fetchRaffleItems, fetchTicketItemsByID } from '../../services/contracts/raffle';
import { API_URL } from '../../config/dev';
import axios from 'axios';
import RedFavouriteIcon from "../../assets/fav-icon.svg"
import GreyFavouriteIcon from "../../assets/grey-fav-icon.svg"

const FilterRaffles = ({ item, filterSideBar }: any) => {
  const [sellAmount, setSellAmount] = useState(0)
  const [favouriteState, setFavouriteState] = useState<any>(item?.favourite);
  const handleFavourite = async (id: any, favourite: boolean) => {
    try{
      const res = await axios.post(`${API_URL}/raffle/updateUserFavourite`, {
        id: id,
        favourite: favourite
      });
      setFavouriteState(favourite);
    }catch(error){
      console.log("error", error);
    }
  }

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
        <div className='flex items-center gap-2' >
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
        <div className='flex items-center gap-2' >
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
    
    <div className={` ${filterSideBar ? `basis-[32%]` : `basis-[24%]`}  nftItem-hover `} key={item.id}  >
      <div className="rounded-[0.9rem] overflow-hidden  nftItem-shadow  ">
        <div className="relative">
          <img
            src={item.image}
            alt="CoodeImage"
            className="min-h-[360px] object-cover"
          />
          {
            favouriteState ? 
              <div className='absolute top-2 right-2 bg-white p-[8px] cursor-pointer rounded-[6px]' onClick={() => handleFavourite(item._id, false)} >
               <img src={RedFavouriteIcon} />
              </div>
              :
              <div className='absolute top-2 right-2 bg-white p-[8px] cursor-pointer rounded-[6px]' onClick={() => handleFavourite(item._id, true)} >
                <img src={GreyFavouriteIcon} />
              </div>
            }
          <div className=" absolute bottom-2 right-2 bg-[#8652FF]  flex overflow-hidden rounded-[4px] ">
            <p className="bg-white text-base text-center basis-[70%]  pl-2 pr-4 para-clip text-[10px]">
              TTV: {(item.price * (item.total_tickets - sellAmount)).toFixed(3)}
            </p>
            <p className="flex  text-center px-2 text-base basis-[30%] bg-[#8652FF]  text-white text-[10px] ">
              <span>FP:</span>
              <span>2.55</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-[8px] bg-white p-[18px]  ">
          <div>
            <div className="flex items-center">
              <span className="text-[20px] leading-none inline-block ">
                {item.project}
              </span>
              <img
                src={VerificationIcon}
                alt="VerificationIcon"
                style={{ width: "16px" }}
                className='ml-1'
              />

            </div>
            <h1 className="text-[16px]">{item.name}</h1>
            <p className='text-[#1A1A1A] text-[16px] ' >@Yogesh</p>
          </div>

          <div className='border-[1px] border-dotted border-[grey] rounded-[8px] p-[20px]' >
            <div className="flex justify-between items-center " >
              <p className="text-[15px]">Ticket Price</p>
              <p className="text-sm text-[#8652FF] font-medium ">
                {item.price} MATIC
              </p>
            </div>
            <div className="flex justify-between items-center " >
              <p className="text-[15px]">Tickets Remaining</p>
              <p className="text-sm text-[#8652FF] font-medium ">
                {sellAmount}/{item.total_tickets}
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

          <div className="text-center mt-4 ">
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
    </div>
  );
};

export default FilterRaffles;
