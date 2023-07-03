import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper";
import Countdown, { CountdownApi } from 'react-countdown'

import Chevron from "../../assets/Chevron.png";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import RaffleItem from "../../components/RaffleItem";

const RaffleSwiper = (props: any) => {
  const { featuredData } = props
  const swiperRef: any = React.useRef();
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

  const sliderSettings = {
    240: {
      slidesPerView: 1,
      spaceBetween: 16,
      pagination: false,
    },
    680: {
      slidesPerView: 2,
      spaceBetween: 30,
    },
    1024: {
      slidesPerView: 3,
      spaceBetween: 30,
    },
  };

  return (
    <div className="relative">
      <button
        onClick={() => swiperRef.current?.slidePrev()}
        className="absolute top-[45%] left-0 "
      >
        <img src={Chevron} alt="RightChevron" className="max-w-[45px]" />
      </button>
      <div className="pl-[80px] pr-[80px] " >
        <Swiper
          slidesPerView={3}
          spaceBetween={30}
          breakpoints={sliderSettings}
          onBeforeInit={(swiper) => {
            swiperRef.current = swiper;
          }}
          speed={1200}
          loop={true}
          // navigation={true}
          pagination={{
            clickable: true,
          }}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          modules={[Navigation, Pagination, Autoplay]}
          className="mySwiper"
        >
          {featuredData.length > 0
            ? featuredData.map((item: any, index: any) => {

              const startCountdownRenderer = ({ api, days, hours, minutes, seconds, completed }: any) => {
                if (api.isPaused()) api.start()
                return (
                  completed ?
                    <Countdown
                      ref={setEndCountdownRef}
                      date={item.end_date * 1000}
                      // date={3245435345233}
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

              return (
                <SwiperSlide key={item.id}>
                  <RaffleItem
                    item={item}
                    index={index}
                  />
                </SwiperSlide>
              );
            })
            :
            <div className="absolute mt-[16px] left-[50%] top-[50%] text-[#8652FF] translate-x-[-50%] translate-y-[-50%] " >
              No Exist Lived NFT Now!
            </div>
          }
        </Swiper>
      </div>
      <button
        onClick={() => swiperRef.current?.slideNext()}
        className="absolute top-[45%] right-0 "
      >
        <img
          src={Chevron}
          alt="RightChevron"
          className="max-w-[45px] rotate-180"
        />
      </button>
    </div>
  );
};

export default RaffleSwiper;
