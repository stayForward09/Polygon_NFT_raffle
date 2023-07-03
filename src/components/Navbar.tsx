import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { CONNECT } from '../actions'
import { connectWallet } from "../utils";
import ProfileImg from "../assets/profile.svg";
import CONFIG from "../config";
import LeaderBoardImg from '../assets/leaderboard.svg'
import CreateImg from '../assets/create.svg'

const Navbar = () => {
  const dispatch = useDispatch()
  const storeData: any = useSelector(status => status)
  const [walletStatus, setWalletStatus] = useState({
    status: ``,
    address: ``
  })
  const handleConnect = async () => {
    try {
      const wallet: any = await connectWallet();
      dispatch(CONNECT({
        wallet: `connected`,
        address: wallet.address
      }))

      localStorage.setItem(CONFIG.WALLET_STATUS_LOCALSTORAGE, 'connected')
      localStorage.setItem(CONFIG.WALLET_ADRESS_LOCALSTORAGE, wallet.address)

    } catch (error) {
      console.log('error', error)
    }
  }

  const handleDisConnect = () => {
    dispatch(CONNECT({
      wallet: `disconnect`,
      address: ``
    }))
    localStorage.setItem(CONFIG.WALLET_STATUS_LOCALSTORAGE, 'disconnect')
    localStorage.setItem(CONFIG.WALLET_ADRESS_LOCALSTORAGE, '')

  }

  useEffect(() => {
    const get_walletStatus: any = localStorage.getItem(CONFIG.WALLET_STATUS_LOCALSTORAGE)
    const get_walletAddress: any = localStorage.getItem(CONFIG.WALLET_ADRESS_LOCALSTORAGE)
    setWalletStatus({
      ...walletStatus,
      status: get_walletStatus,
      address: get_walletAddress
    })
  }, [storeData])


  useEffect(() => {
    window.ethereum.on('accountsChanged', async () => {
      const wallet: any = await connectWallet();
      localStorage.setItem(CONFIG.WALLET_STATUS_LOCALSTORAGE, 'connected')
      localStorage.setItem(CONFIG.WALLET_ADRESS_LOCALSTORAGE, wallet.address)
      dispatch(CONNECT({
        wallet: 'connected',
        address: wallet.address
      }))

      setWalletStatus({
        ...walletStatus,
        status: 'connected',
        address: wallet.address
      })
    });
  }, [])

  useEffect(() => {
    const get_walletStatus: any = localStorage.getItem(CONFIG.WALLET_STATUS_LOCALSTORAGE)
    const get_walletAddress: any = localStorage.getItem(CONFIG.WALLET_ADRESS_LOCALSTORAGE)
    dispatch(CONNECT({
      wallet: get_walletStatus,
      address: get_walletAddress
    }))
  }, [])

  return (
    <div className="header-section">
      <div className="flex justify-between items-center py-5 px-4">
        {/* <Link to="/" className="sm:max-w-[165px] max-w-[100px]">
          <img src={Logo} alt="l" />
        </Link> */}
        <Link to="/">
          <p className="text-[30px] font-semibold text-[white] uppercase " >Polygon Raffle</p>

        </Link>
        <ul className="flex items-center gap-[16px]">
          <li>
            <Link
              to="/leaderboard"
              className="fill-white hover:fill-[#1a1a1a] text-base font-archia hover:opacity-95 transition-all flex items-center gap-1 "
            >
              {/* <img src={LeaderBoardImg} /> */}
              <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.14587 14.625H1.37504C0.939624 14.625 0.583374 14.2688 0.583374 13.8333V5.91667C0.583374 5.48125 0.939624 5.125 1.37504 5.125H4.14587C4.58129 5.125 4.93754 5.48125 4.93754 5.91667V13.8333C4.93754 14.2688 4.58129 14.625 4.14587 14.625ZM9.88546 0.375H7.11462C6.67921 0.375 6.32296 0.73125 6.32296 1.16667V13.8333C6.32296 14.2688 6.67921 14.625 7.11462 14.625H9.88546C10.3209 14.625 10.6771 14.2688 10.6771 13.8333V1.16667C10.6771 0.73125 10.3209 0.375 9.88546 0.375ZM15.625 6.70833H12.8542C12.4188 6.70833 12.0625 7.06458 12.0625 7.5V13.8333C12.0625 14.2688 12.4188 14.625 12.8542 14.625H15.625C16.0605 14.625 16.4167 14.2688 16.4167 13.8333V7.5C16.4167 7.06458 16.0605 6.70833 15.625 6.70833Z" className="svgImg" />
              </svg>
              <p className="text-white" >LeaderBoard</p>
            </Link>
          </li>
          <li>
            <Link
              to="/raffle/create"
              className="text-[#666666] text-base font-archia hover:opacity-95 transition-all flex items-center gap-1 "
            >
              {/* <img src={CreateImg} /> */}
              <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.77783 0.5H2.66668C1.96008 0.50211 1.28303 0.783741 0.783384 1.28338C0.283741 1.78303 0.00211032 2.46008 0 3.16668V10.2778C0.00211032 10.9844 0.283741 11.6615 0.783384 12.1611C1.28303 12.6608 1.96008 12.9424 2.66668 12.9445H9.77783C10.4844 12.9424 11.1615 12.6608 11.6611 12.1611C12.1608 11.6615 12.4424 10.9844 12.4445 10.2778V3.16668C12.4424 2.46008 12.1608 1.78303 11.6611 1.28338C11.1615 0.783741 10.4844 0.50211 9.77783 0.5ZM8.00005 7.61115H7.11115V8.50005C7.11115 8.7358 7.0175 8.96189 6.8508 9.12859C6.6841 9.29529 6.45801 9.38894 6.22226 9.38894C5.98651 9.38894 5.76042 9.29529 5.59372 9.12859C5.42702 8.96189 5.33336 8.7358 5.33336 8.50005V7.61115H4.44447C4.20872 7.61115 3.98263 7.5175 3.81593 7.3508C3.64923 7.1841 3.55558 6.95801 3.55558 6.72226C3.55558 6.48651 3.64923 6.26042 3.81593 6.09372C3.98263 5.92702 4.20872 5.83336 4.44447 5.83336H5.33336V4.94447C5.33336 4.70872 5.42702 4.48263 5.59372 4.31593C5.76042 4.14923 5.98651 4.05558 6.22226 4.05558C6.45801 4.05558 6.6841 4.14923 6.8508 4.31593C7.0175 4.48263 7.11115 4.70872 7.11115 4.94447V5.83336H8.00005C8.2358 5.83336 8.46189 5.92702 8.62859 6.09372C8.79529 6.26042 8.88894 6.48651 8.88894 6.72226C8.88894 6.95801 8.79529 7.1841 8.62859 7.3508C8.46189 7.5175 8.2358 7.61115 8.00005 7.61115Z" fill="white" />
                <path d="M11.5556 16.4999H3.55552C3.31977 16.4999 3.09368 16.4063 2.92698 16.2396C2.76028 16.0729 2.66663 15.8468 2.66663 15.611C2.66663 15.3753 2.76028 15.1492 2.92698 14.9825C3.09368 14.8158 3.31977 14.7221 3.55552 14.7221H11.5556C12.2628 14.7221 12.9411 14.4412 13.4412 13.9411C13.9413 13.441 14.2222 12.7627 14.2222 12.0554V4.0554C14.2222 3.81965 14.3159 3.59356 14.4826 3.42686C14.6493 3.26016 14.8754 3.1665 15.1111 3.1665C15.3469 3.1665 15.573 3.26016 15.7397 3.42686C15.9064 3.59356 16 3.81965 16 4.0554V12.0554C15.9986 13.2338 15.5299 14.3634 14.6967 15.1966C13.8635 16.0298 12.7339 16.4985 11.5556 16.4999Z" fill="white" />
              </svg>

              <p className="text-white " >Create</p>
            </Link>
          </li>
          {
            storeData.wallet === 'connected' &&
            <li>
              <Link
                to="/profile/raffle"
              >
                {/* <img src={ProfileImg} /> */}
                <svg width="27" height="28" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.046 4.45408C20.4961 1.90426 17.106 0.5 13.5 0.5C9.89402 0.5 6.50389 1.90426 3.95402 4.45408C1.40426 7.00389 0 10.394 0 14C0 17.606 1.40426 20.9961 3.95402 23.5459C6.50389 26.0957 9.89402 27.5 13.5 27.5C17.106 27.5 20.4961 26.0957 23.046 23.5459C25.5957 20.9961 27 17.606 27 14C27 10.394 25.5957 7.00389 23.046 4.45408ZM13.5 25.918C9.97371 25.918 6.80078 24.378 4.61679 21.9359C5.97074 18.3465 9.43671 15.793 13.5 15.793C10.8788 15.793 8.75391 13.6681 8.75391 11.0469C8.75391 8.42566 10.8788 6.30078 13.5 6.30078C16.1212 6.30078 18.2461 8.42566 18.2461 11.0469C18.2461 13.6681 16.1212 15.793 13.5 15.793C17.5633 15.793 21.0293 18.3465 22.3832 21.9359C20.1992 24.378 17.0263 25.918 13.5 25.918Z" fill="white" />
                </svg>

              </Link>
            </li>
          }
          <li>
            {
              walletStatus.status === `connected` ?
                <div className="text-[white] text-base border-[white] border-solid border-[1px] rounded-[4px] py-1 px-2 cursor-pointer  " onClick={handleDisConnect} >
                  {walletStatus?.address ?
                    walletStatus?.address?.substr(0, 6) + '...' + walletStatus?.address?.substr(storeData?.address.length - 4, 4)
                    : `Connect Wallet`
                  }
                </div>
                :
                <div className="text-[white]  text-base border-[white] border-solid border-[1px] rounded-[4px] py-1 px-2 cursor-pointer " onClick={handleConnect} >
                  Connect Wallet
                </div>
            }
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
