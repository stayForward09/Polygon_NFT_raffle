
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import { createRaffle } from "../../services/api";
import { connectedChain, datetimeLocal } from "../../utils";
import CONFIG from "../../config";
import NFTModal from "../../components/NFTModal";
import Navbar from "../../components/Navbar";
import SelectNFTIcon from "../../assets/Select-NFT-Icon.png";
import { CreateRaffleContract } from "../../services/contracts/raffle";
import { validationRaffle } from "../../utils/validation/raffle";
import { CreateRaffle1155Contract } from "../../services/contracts/raffle1155";
import { TransferNFT1155, TransferNFT721 } from "../../services/contracts/transferNFT";

const { TOAST_TIME_OUT } = CONFIG;

const CreateRaffle = () => {
  const navigate = useNavigate();

  const storeData: any = useSelector((status) => status)
  const [nftAmount, setNftAmount] = useState(1)
  const [isLoading, setLoading] = useState(false);
  const [isModal, setModal] = useState(false);
  const [nftName, setNftName] = useState('Select NFT')
  const [contractType, setContractType] = useState(``)
  const [raffleValue, setRaffleValue] = useState<any>({
    id: 0,
    project: "",
    description: ``,
    image: ``,
    imageFile: ``,
    discord: ``,
    twitter: ``,
    total_tickets: ``,
    price: ``,
    start_date: new Date(),
    end_date: new Date(),
    mint: ``,
  });
  const [totalTicketValue, setTotlaTicketValue] = useState(0)

  const handleNftIncrease = () => {
    if (nftAmount < Number(raffleValue?.amount)) {
      setNftAmount(nftAmount + 1)
    }
  }

  const handleNftDecrease = () => {
    if (nftAmount > 1) {
      setNftAmount(nftAmount - 1)
    }
  }

  const handleCreateRaffle = async () => {
    try {
      const chainStatus = await connectedChain();
      if (!chainStatus) return;
      const validation = validationRaffle(raffleValue)
      if (!validation) return
      setLoading(true);
      let createRaffleTx;

      if (contractType === `ERC1155`) {
        createRaffleTx = await CreateRaffle1155Contract(
          raffleValue.tokenAddress,
          raffleValue.tokenId,
          nftAmount,
          raffleValue.price,
          raffleValue.total_tickets,
          Math.floor(raffleValue.start_date?.getTime() / 1000),
          Math.floor(raffleValue.end_date?.getTime() / 1000)
        )

      } else {
        createRaffleTx = await CreateRaffleContract(
          raffleValue.tokenAddress,
          raffleValue.tokenId,
          raffleValue.price,
          raffleValue.total_tickets,
          Math.floor(raffleValue.start_date?.getTime() / 1000),
          Math.floor(raffleValue.end_date?.getTime() / 1000)
        )
      }
      if (createRaffleTx) {
        const payload: any = {
          name: nftName,
          project: raffleValue?.project || "",
          description: 'description',
          discord: 'discord',
          twitter: 'twitter',
          total_tickets: raffleValue.total_tickets,
          price: raffleValue.price,
          start_date: Math.floor(raffleValue.start_date?.getTime() / 1000).toString(),
          end_date: Math.floor(raffleValue.end_date?.getTime() / 1000).toString(),
          tokenAddress: raffleValue.tokenAddress,
          tokenId: raffleValue.tokenId,
          image: raffleValue.image,
          walletAddress: storeData.address,
          type: contractType
        }
        const res = await createRaffle(payload);
        if (res) {
          toast("Success in creating raffle", {
            onClose: () => {
              setTimeout(() => {
                navigate("/");
              }, TOAST_TIME_OUT);
            },
          });
        } else {
          toast("Error in creating raffle");
        }
      }
    } catch (error) {
      console.log("error", error);
      toast("Error in creating raffle");
    }
    setLoading(false);
  };

  const handleClickModal = async () => {
    const chainStatus = await connectedChain();
    if (!chainStatus) return;

    setModal(true)
  }

  return (
    <div>
      {
        isLoading ?
          <div id="preloader"></div> :
          <div id="preloader" style={{ display: "none" }}></div>
      }
      <div className="bg-white">
        <Navbar />
        <div className="max-w-[768px] m-auto pt-20 pb-16 px-4 md:px-0">
          <h1 className="text-center text-black text-4xl">Create NFT Raffle</h1>

          {
            storeData.wallet !== 'connected' ?
              <div className="mt-6 md:px-8 px-[30px] py-[40px]  rounded-[0.7rem] nftItem-shadow bg-white border-[none]" >
                <p className="text-[#8652FF] text-[32px] " >No Wallet detected</p>
                <p className="text-[#666] text-[24px] " >Please connect your wallet to continue</p>
              </div>
              :
              <div className=" mt-6 md:px-8 px-4 pt-8 pb-8  rounded-[0.7rem] nftItem-shadow bg-white border-[none]">
                <div className="md:flex block justify-between items-start">
                  <div className="min-h-[295px] basis-[46%]" >
                    <div
                      className="md:mb-0 mb-4  flex items-center justify-center flex-col p-8  bg-[#8652FF] rounded-[0.7rem] cursor-pointer min-h-[295px] "
                      onClick={handleClickModal}
                    >
                      <img src={raffleValue?.image ? raffleValue?.image : SelectNFTIcon} className="text-white" alt="SelectNFTIcon" />

                      <span className="text-[white] text-xl mt-3"> {nftName}</span>

                      <span className="text-[white] text-md mt-2"> {contractType}</span>
                    </div>

                    {
                      contractType === 'ERC1155' && <div className="nft-count border-[black] border-[1px] border-solid " >
                        <div className="nft-decrease text-black " onClick={handleNftDecrease} >-</div>
                        <div className="nft-amount text-black " >{nftAmount}</div>
                        <div className="nft-increase text-black " onClick={handleNftIncrease}  >+</div>
                      </div>
                    }
                  </div>

                  <div className="basis-[48%]">
                    {/* <div className="mb-5">
                       <label
                        className="text-[#1A1A1A] text-lg inline-block mb-1"
                        htmlFor="project"
                      >
                        Project
                      </label> 
                       <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                        <input
                          type="text"
                          id="project"
                          name="project"
                          placeholder="Project"
                          value={raffleValue.project}
                          onChange={(e) =>
                            setRaffleValue({
                              ...raffleValue,
                              project: e.target.value,
                            })
                          }
                          className="bg-[white] w-full text-[#1A1A1A] placeholder:text-[#606060] p-3 outline-none"
                        />
                      </div> 
                    </div>  */}
                    <div className="mb-5">
                      <label
                        className="text-[#1A1A1A] text-lg inline-block mb-1"
                        htmlFor="ticketprice"
                      >
                        Ticket Price
                      </label>
                      <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                        <input
                          type="number"
                          id="ticketprice"
                          name="ticketprice"
                          placeholder=""
                          value={raffleValue.price}
                          onChange={(e: any) => {
                            setTotlaTicketValue(raffleValue.price ? e.target.value * raffleValue.total_tickets : 0)
                            setRaffleValue({
                              ...raffleValue,
                              price: Number(e.target.value),
                            })
                          }
                          }
                          className="bg-[white] w-full text-[#1A1A1A] placeholder:text-[#606060] p-3 outline-none"
                        />
                      </div>
                    </div>
                    <div className="mb-5">
                      <label
                        className="text-[#1A1A1A] text-lg inline-block mb-1"
                        htmlFor="startdate"
                      >
                        Start Date
                      </label>
                      <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                        <input
                          type="datetime-local"
                          id="startdate"
                          name="startdate"
                          value={datetimeLocal(raffleValue.start_date)}
                          onChange={(e) =>
                            setRaffleValue({
                              ...raffleValue,
                              start_date: new Date(e.target.value),
                            })
                          }
                          className="bg-[white] w-full text-[#1A1A1A] placeholder:text-[#606060] p-3 outline-none"
                        />
                      </div>
                    </div>
                    <div className="mb-5">
                      <label
                        className="text-[#1A1A1A] text-lg inline-block mb-1"
                        htmlFor="enddate"
                      >
                        End Date
                      </label>
                      <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                        <input
                          type="datetime-local"
                          id="enddate"
                          name="enddate"
                          value={datetimeLocal(raffleValue.end_date)}
                          onChange={(e) =>
                            setRaffleValue({
                              ...raffleValue,
                              end_date: new Date(e.target.value),
                            })
                          }
                          className="bg-[white] w-full text-[#1A1A1A]  placeholder:text-[#606060] p-3 outline-none"
                        />
                      </div>
                    </div>
                    <div className="mb-5">
                      <label
                        className="text-[#1A1A1A] text-lg inline-block mb-1"
                        htmlFor="ticketsupply"
                      >
                        Total Ticket Supply
                      </label>
                      <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                        <input
                          type="number"
                          pattern="[0-9]*"
                          id="ticketsupply"
                          name="ticketsupply"
                          placeholder="1-100%"
                          className="bg-[white] w-full text-[#1A1A1A] placeholder:text-[#606060] p-3 outline-none"
                          value={raffleValue.total_tickets}
                          onChange={(e: any) => {
                            setTotlaTicketValue(raffleValue.price ? e.target.value * raffleValue.price : 0)
                            setRaffleValue({
                              ...raffleValue,
                              total_tickets: Number(parseInt((e.target.value))),
                            })
                          }
                          }
                        />
                      </div>
                      <div className="flex gap-2 items center " >
                        <p>Total Ticket Value</p>
                        <p> {totalTicketValue ? totalTicketValue.toFixed(3) : 0} </p>
                      </div>
                    </div>

                    <div>

                    </div>
                  </div>
                </div>
                <p className="text-[14px] text-[red] text-center" >Please link your twitter and discord in <span className="underline" >
                  <Link to='/profile/raffle' >your profile</Link>
                </span> or your raffles won't be shown</p>
                <div className="flex justify-center -mt-6">
                  <p
                    onClick={handleCreateRaffle}
                    className="cursor-pointer text-white bg-[#8652FF] rounded-[0.5rem] flex items-center py-3 px-5 mt-8 "
                  >
                    Create Raffle
                  </p>
                </div>
              </div>

          }

          {/* <p
            onClick={() => TransferNFT721(setLoading)}
            className="cursor-pointer text-black bg-white rounded-[0.5rem] flex items-center py-3 px-5"
          >
            NFT transfer
          </p>
          <p
            onClick={() => TransferNFT1155(setLoading)}
            className="cursor-pointer text-black bg-white rounded-[0.5rem] flex items-center py-3 px-5"
          >
            1155NFT transfer
          </p> */}
        </div>
      </div>

      <NFTModal
        title="Select an NFT"
        show={isModal}
        onCancel={() => setModal(false)}
        setNftName={setNftName}
        setContractType={setContractType}
        raffleValue={raffleValue}
        setRaffleValue={setRaffleValue}
      />
      <ToastContainer />
    </div>
  );
};

export default CreateRaffle;
