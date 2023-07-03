import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import AddRaffleIcon from "../assets/add-raffle-icon.png";

const Menus: React.FC = () => {
  const navigate = useNavigate();
  const activeLink = useLocation();
  const storeData: any = useSelector((status) => status)

  const handleNewRaffleLink = () => {
    if (storeData.wallet === 'connected') {
      navigate('/raffle/create')
    } else {
      toast("Please connect your wallet");

    }
  }

  const handleNewAuctionLink = () => {
    if (storeData.wallet === 'connected') {
      navigate('/auction/create')
    } else {
      toast("Please connect your wallet");

    }
  }

  return (
    <div>
      <div className="sm:px-4 px-2">
        {activeLink.pathname === "/" ||
          activeLink.pathname === "/auction" ||
          activeLink.pathname === "/admin" ||
          activeLink.pathname === "/admin/auction" ||
          activeLink.pathname === "/profile" ||
          activeLink.pathname === "/participant" ||
          activeLink.pathname === "/filter-auctions" ? (
          <div className="sm:mt-12 mt-8 flex justify-end max-w-[1280px] m-auto">
            <div className="flex justify-between items-center max-w-3xl w-full">
              <div className="w-[300px] border bg-white rounded-[0.7rem] p-[1px]">
                <div className="rounded-[0.7rem]">
                  <div className="flex items-center justify-between text-white text-base">
                    <Link
                      to={
                        activeLink.pathname === "/" ||
                          activeLink.pathname === "/auction" ||
                          activeLink.pathname === "/participant" ||
                          activeLink.pathname === "/profile"
                          ? "/"
                          : "/admin"
                      }
                      className={`${activeLink.pathname === "/" ||
                        activeLink.pathname === "/profile" ||
                        activeLink.pathname === "/participant" ||
                        activeLink.pathname === "/admin"
                        ? " transition duration-75 btn-background basis-[49%] text-center py-3 rounded-[0.7rem] bg-black"
                        : "duration-75 transition basis-[49%] text-center text-black py-3 rounded-[0.7rem]"
                        }`}
                    >
                      Raffles
                    </Link>
                    <Link
                      to={
                        activeLink.pathname === "/" ||
                          activeLink.pathname === "/auction" ||
                          activeLink.pathname === "/participant" ||
                          activeLink.pathname === "/profile"
                          ? "/auction"
                          : "/admin/auction"
                      }
                      className={`${activeLink.pathname === "/auction" ||
                        activeLink.pathname === "/admin/auction"
                        ? " transition duration-75 btn-background basis-[49%] text-center py-3 rounded-[0.7rem] bg-black"
                        : "duration-75 transition basis-[49%] text-center text-black py-3 rounded-[0.7rem]"
                        }`}
                    >
                      Auctions
                    </Link>
                  </div>
                </div>
              </div>
              <div>
                {activeLink.pathname === "/" && (
                  <div className="flex">
                    <div
                      onClick={handleNewRaffleLink}
                      className="bg-white flex items-center py-3 px-5 rounded-[0.7rem] ml-4 cursor-pointer "
                    >
                      <img src={AddRaffleIcon} alt="RBI" className="mr-2" />

                      <span>New Raffle</span>
                    </div>
                  </div>
                )}
                {activeLink.pathname === "/auction" && (
                  <div className="flex">
                    <div
                      onClick={handleNewAuctionLink}
                      className="bg-white flex items-center py-3 px-5 rounded-[0.7rem] cursor-pointer"
                    >
                      <img src={AddRaffleIcon} alt="RBI" className="mr-2" />

                      <span>New Auction</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default Menus;
