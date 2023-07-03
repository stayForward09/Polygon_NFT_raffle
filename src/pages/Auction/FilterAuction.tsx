import Countdown, { CountdownApi } from 'react-countdown'
import { Link } from 'react-router-dom';
import VerificationIcon from "../../assets/Verification-icon.png";
import UnionIcons from "../../assets/Union-icons.png";

const FilterAuction = ({ item }: any) => {

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

  return (
    <div className="basis-[32%] mt-6" key={item.id}>
      <div className="rounded-[0.9rem] overflow-hidden border-4 border-[#606060]">
        <div className="relative object-cover">
          <img
            src={item.image}
            alt="CoodeImage"
            className="h-[320px] w-full object-cover"
          />
          <div className="absolute top-0 bg-yellow left-0 h-full w-full">
            <div className="flex flex-col justify-between h-full p-2">
              <div className="flex justify-end">
                <div className="border-black bg-[#949494] border flex rounded-md overflow-hidden">
                  <p className="bg-white text-base py-1 pl-2 pr-4 para-clip">
                    {item.tokenName}
                  </p>
                  <p className="py-1 px-2 text-base text-white">
                    #{item.tokenId}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div className="border-black bg-[#949494] border flex rounded-md overflow-hidden">
                  <p className="bg-white text-base pt-[4px] pl-2 pr-3 para-clip-2">
                    <img
                      src={UnionIcons}
                      alt="UnionIcons"
                      className="w-[10px]"
                    />
                  </p>
                  <p className="py-[2px] pl-[2px] pr-[5px] text-[12px] text-white">
                    #0001
                  </p>
                </div>
                <div className="border-black bg-[#949494] border flex rounded-md overflow-hidden">
                  <p className="bg-white text-[12px] pt-[2px] pl-2 pr-3 para-clip-3">
                    Floor
                  </p>
                  <p className="py-[2px] pl-[2px] pr-[5px] text-[12px] text-white">
                    9.9
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white -mt-1">
          <div className="pt-2 pl-3 pb-2 border-b-[#D9D9D9] border">
            <div className="flex items-center">
              <img
                src={VerificationIcon}
                alt="VerificationIcon"
              />
              <span className="text-base leading-none inline-block ml-1">
                {item.tokenName}
              </span>
            </div>
            <h1 className="text-xl">@{item.project}</h1>
          </div>
          <div className="pt-2 pl-3 pr-2">
            <div className="flex justify-between">
              <div className="basis-[49%]">
                <p className="text-sm">Time Remaining</p>
                <p className="text-sm text-[#4A4A4A]">
                  <Countdown
                    ref={setStartCountdownRef}
                    date={item.start_date * 1000}
                    zeroPadTime={3}

                    renderer={startCountdownRenderer}
                  />
                </p>
              </div>
              <div className="basis-[49%]">
                <p className="text-sm">Tickets Remaining</p>
                <p className="text-sm text-[#4A4A4A]">
                  {item.count}/{item.total_tickets}
                </p>
              </div>
            </div>
            <div className="flex justify-between pt-2 pb-9">
              <div>
                <p className="text-sm">Ticket Price</p>
                <p className="text-sm text-[#4A4A4A]">
                  {item.price} Polygon
                </p>
              </div>
              {/* <div className="flex basis-[50%] justify-between items-start">
                      <button
                        type="button"
                        className="basis-[49%] text-sm border border-black bg-[#82828240] text-[#828282] py-1 rounded-md"
                      >
                        QTY
                      </button>
                      <button
                        type="button"
                        className="basis-[49%] text-sm bg-black rounded-md text-white py-1 border border-black"
                      >
                        BUY
                      </button>
                    </div> */}
            </div>
          </div>
        </div>
      </div>
      <div className="-mt-[26px] text-center">
        <Link
          to={`/admin/raffle/${item._id}`}
          className="bg-black text-white border-4 rounded-md inline-block py-2 px-6  border-[#606060]"
        >
          View Raffle
        </Link>
      </div>
    </div>
  );
};

export default FilterAuction;
