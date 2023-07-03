import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux';
import { Link } from "react-router-dom"
import Navbar from "../../components/Navbar"
import TwitterBlack from "../../assets/Twitter-black.png";
import DiscordBlack from "../../assets/Discord-Black.png";
import infoIconBlack from "../../assets/InfoIconBlack.png";
import { createUser, getAllAuctions, getUser, checkDiscordStatus, checkTwitterStatus } from '../../services/api';
import AuctionRarticipant from './AuctionParticipant'
import { toast } from "react-toastify";
import CONFIG from '../../config';


const AuctionProfile = () => {
  const [isLoading, setLoading] = useState(false)
  const [participantLists, setParticipantLists] = useState<any[]>([])
  const storeData: any = useSelector((status) => status)
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [discord, setDiscord] = useState('');
  const [twitter, setTwitter] = useState('');
  const [social, setSocial] = useState(false);

  const handleConnectDiscord = async () => {
    try {
      if (discord) {
        toast.error(`You have already Discord Account`)
        return;
      }
      if (storeData.wallet !== 'connected') {
        toast.error("Connect your Wallet!");
        return
      }
      setLoading(true)
      let user = await getUser(storeData.address);
      let signedMessage = null;
      if (!user) {

        signedMessage = await window.ethereum.request({
          method: "personal_sign",
          params: ["Sign Message", storeData.address],
        });
      }
      const token: any = await createUser(storeData.address, signedMessage);
      localStorage.setItem('token', JSON.stringify(token));
      if (token) {
        window.open(CONFIG.Backend_URL + "/api/oauth/discord?token=" + token);
      }
      setLoading(false)

    }
    catch (error) {
      console.log('error', error);
      setLoading(false)

    }
  }

  const handleConnectTwitter = async () => {
    try {
      if (twitter) {
        toast.error(`You have already Twitter Account`)
        return
      };
      if (storeData.wallet !== `connected`) {
        toast.error("Connect your Wallet!");
        return
      }
      let user = await getUser(storeData.address);
      let signedMessage = null;
      if (!user) {
        signedMessage = await window.ethereum.request({
          method: "personal_sign",
          params: ["Sign Message", storeData.address],
        });
      }
      const token: any = await createUser(storeData.address, signedMessage);
      localStorage.setItem('token', JSON.stringify(token));
      setToken(token);
      if (token) {
        window.open(CONFIG.Backend_URL + "/api/oauth/twitter?token=" + token);
        setSocial(!social);
      }
    }
    catch (error) {
      console.log('error', error);
      setLoading(false)
    }
  }

  useEffect(() => {
    (async () => {
      if (storeData.wallet !== 'connected') return;
      const discord: any = await checkDiscordStatus(storeData.address);
      if (discord) setDiscord(discord);
      const twitter: any = await checkTwitterStatus(storeData.address);
      if (twitter) setTwitter(twitter);
    })();
  }, [storeData, token, social])

  useEffect(() => {
    (
      async () => {
        try {
          if (storeData.wallet === 'connected') {
            setLoading(true)
            const getAllAuction: any = await getAllAuctions();
            const filterRaffles = getAllAuction.filter((item: any) => item.walletAddress === storeData.address)
            setParticipantLists(filterRaffles)
            setLoading(false)
          }
        } catch (error) {
          console.log('error', error)
          setLoading(false)

        }
      }
    )()
  }, [storeData])

  return (
    <>
      {
        isLoading ?
          <div id="preloader"></div> :
          <div id="preloader" style={{ display: "none" }}></div>
      }
      <Navbar />
      <div className="border-white border-b-2">
        <div className="flex items-center justify-between py-5 px-4">
          <div className="flex">
            <button
              type="button"
              className="py-3 px-4 bg-white rounded-md flex items-center"
              onClick={handleConnectTwitter}
            >
              <img src={TwitterBlack} alt="TwitterBlack" className="w-[25px]" />
              <span className="ml-3">Connect Twitter</span>
            </button>
            <button
              type="button"
              className="py-3 px-4 bg-white rounded-md flex items-center ml-4"
              onClick={handleConnectDiscord}
            >
              <img src={DiscordBlack} alt="TwitterBlack" className="w-[25px]" />
              <span className="ml-3">Connect Discord</span>
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-[1360px] m-auto px-4 py-4">
        <h1 className="text-4xl text-white">Participations</h1>
        <div className="relative h-[100px] w-full">
          <div className="absolute -mt-5 top-0 left-[-12px] ">
            <div className="sm:px-4 px-2">

              <div className="sm:mt-12 mt-8 flex justify-end max-w-[1280px] m-auto">
                <div className="flex justify-between items-center max-w-3xl w-full">
                  <div className="w-[300px] border bg-white rounded-[0.7rem] p-[1px]">
                    <div className="rounded-[0.7rem]">
                      <div className="flex items-center justify-between text-white text-base">
                        <Link
                          to={`/profile/raffle`}
                          className="duration-75 transition basis-[49%] text-center text-black py-3 rounded-[0.7rem]"

                        >
                          Raffles
                        </Link>
                        <Link
                          to={`/profile/auction`}
                          className=" transition duration-75 btn-background basis-[49%] text-center py-3 rounded-[0.7rem] bg-black"
                        >
                          Auctions
                        </Link>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {
        participantLists.length > 0 ?
          participantLists.map((item: any, idx: any) =>
            <AuctionRarticipant item={item} idx={idx} key={idx} />
          )
          :
          isLoading ? <></>
            :
            <div className="max-w-[1280px] m-auto px-4">
              <div className="bg-white rounded-md py-8 px-8 flex items-center">
                <img src={infoIconBlack} alt="infoIconBlack" />
                <h1 className="xl:text-[3.2rem] lg:text-[2.5rem] md:text-[1.8rem] ml-10">
                  You haven’t participated in any Raffles!
                </h1>
              </div>
            </div>
      }
    </>
  )
}

export default AuctionProfile