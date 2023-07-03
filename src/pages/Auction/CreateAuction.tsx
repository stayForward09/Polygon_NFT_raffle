
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { createAuction, updateAuction, } from "../../services/api";
import { datetimeLocal } from "../../utils";
import CONFIG from "../../config";
import NFTModal from "../../components/NFTModal";
import Navbar from "../../components/Navbar";
import SelectNFTIcon from "../../assets/Select-NFT-Icon.png";
import { CreateAuctionContract } from "../../services/contracts/auction";
import { validationAuction } from "../../utils/validation/auction";
import { CreateAuction1155Contract } from "../../services/contracts/auction1155";

const { TOAST_TIME_OUT } = CONFIG;

const CreateAuction = () => {
  const navigate = useNavigate();
  const storeData: any = useSelector((status) => status)
  const [isLoading, setLoading] = useState(false);
  const [isModal, setModal] = useState(false);
  const [nftName, setNftName] = useState('Select Nft')
  const [contractType, setContractType] = useState('')
  const [nftAmount, setNftAmount] = useState(1)

  const [auctionValue, setAuctionValue] = useState<any>({
    id: 0,
    project: ``,
    description: ``,
    image: ``,
    imageFile: "",
    discord: ``,
    twitter: ``,
    price: 0,
    start_date: new Date(),
    end_date: new Date(),
    mint: ``,
  });

  const handleAuctionSubmit = async () => {
    try {
      const validation = validationAuction(auctionValue)
      if (!validation) return
      setLoading(true);

      let createAuctionTx;

      if (contractType === `ERC1155`) {
        createAuctionTx = await CreateAuction1155Contract(
          auctionValue.tokenAddress,
          auctionValue.tokenId,
          nftAmount,
          auctionValue.price,
          Math.floor(auctionValue.start_date?.getTime() / 1000),
          Math.floor(auctionValue.end_date?.getTime() / 1000)
        )
      } else {
        createAuctionTx = await CreateAuctionContract(
          auctionValue.tokenAddress,
          auctionValue.tokenId,
          auctionValue.price,
          Math.floor(auctionValue.start_date?.getTime() / 1000),
          Math.floor(auctionValue.end_date?.getTime() / 1000)
        )
      }

      // const createAuctionTx = await CreateAuctionContract(
      //   auctionValue.tokenAddress,
      //   auctionValue.tokenId,
      //   auctionValue.price,
      //   Math.floor(auctionValue.start_date?.getTime() / 1000),
      //   Math.floor(auctionValue.end_date?.getTime() / 1000)
      // )
      if (createAuctionTx) {
        const payload: any = {
          name: nftName ? nftName : `NFT`,
          project: auctionValue.project,
          description: auctionValue.description,
          discord: auctionValue.discord,
          twitter: auctionValue.twitter,
          price: auctionValue.price,
          start_date: Math.floor(auctionValue.start_date?.getTime() / 1000).toString(),
          end_date: Math.floor(auctionValue.end_date?.getTime() / 1000).toString(),
          tokenAddress: auctionValue.tokenAddress,
          tokenId: auctionValue.tokenId,
          image: auctionValue.image,
          walletAddress: storeData.address,
          type: contractType
        }

        const res = await createAuction(payload);
        if (res) {
          toast("Success in creating auction", {
            onClose: () => {
              setTimeout(() => {
                navigate("/auction");
              }, TOAST_TIME_OUT);
            },
          });
        } else {
          toast("Error in creating auction");
        }
      }

    } catch (error) {
      console.log("error", error);
      toast("Error in creating auction");
    }
    setLoading(false);
  };

  const handleSelectNftModal = () => {
    if (storeData.wallet !== 'connected') {
      toast.error(`Please connect your wallet`);
      return
    }
    setModal(true)
  }

  const handleNftIncrease = () => {
    if (nftAmount < Number(auctionValue?.amount)) {
      setNftAmount(nftAmount + 1)
    }
  }

  const handleNftDecrease = () => {
    if (nftAmount > 1) {
      setNftAmount(nftAmount - 1)
    }
  }

  return (
    <div>
      {
        isLoading ?
          <div id="preloader"></div> :
          <div id="preloader" style={{ display: "none" }}></div>
      }
      <div className="bg-black">
        <Navbar />
        <div className="max-w-[768px] m-auto pt-20 pb-16 px-4 md:px-0">
          <h1 className="text-center text-white text-4xl">Create NFT Auction</h1>
          <div className="border-4 mt-6 md:px-8 px-4 pt-8 pb-14 border-[#606060] bg-[#60606040] rounded-[0.7rem]">
            <div className="md:flex block justify-between items-start">
              <div className="min-h-[295px] basis-[46%]" >
                <div
                  className="border-2 md:mb-0 mb-4  flex items-center justify-center flex-col p-8 border-[#606060] bg-[#60606040] rounded-[0.7rem] cursor-pointer min-h-[295px] "
                  onClick={handleSelectNftModal}
                >
                  <img src={auctionValue?.image ? auctionValue?.image : SelectNFTIcon} alt="SelectNFTIcon" />

                  <span className="text-[#606060] text-xl mt-3"> {nftName}</span>
                  <span className="text-[#606060] text-md mt-2"> {contractType}</span>
                </div>
                {
                  contractType === 'ERC1155' && <div className="nft-count" >
                    <div className="nft-decrease" onClick={handleNftDecrease} >-</div>
                    <div className="nft-amount" >{nftAmount}</div>
                    <div className="nft-increase" onClick={handleNftIncrease}  >+</div>
                  </div>
                }
              </div>

              <div className="basis-[48%]">
                <div className="mb-5">
                  <label
                    className="text-white text-lg inline-block mb-1"
                    htmlFor="project"
                  >
                    Project
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      id="project"
                      name="project"
                      placeholder="Project"
                      value={auctionValue.project}
                      onChange={(e) =>
                        setAuctionValue({
                          ...auctionValue,
                          project: e.target.value,
                        })
                      }
                      className="bg-[#46464680] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none"
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <label
                    className="text-white text-lg inline-block mb-1"
                    htmlFor="ticketprice"
                  >
                    Ticket Price
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      id="ticketprice"
                      name="ticketprice"
                      placeholder="1.00"
                      type={`number`}
                      value={auctionValue.price}
                      onChange={(e) =>
                        setAuctionValue({
                          ...auctionValue,
                          price: Number(e.target.value),
                        })
                      }
                      className="bg-[#46464680] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none"
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <label
                    className="text-white text-lg inline-block mb-1"
                    htmlFor="startdate"
                  >
                    Start Date
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      type="datetime-local"
                      id="startdate"
                      name="startdate"
                      value={datetimeLocal(auctionValue.start_date)}
                      onChange={(e) =>
                        setAuctionValue({
                          ...auctionValue,
                          start_date: new Date(e.target.value),
                        })
                      }
                      className="bg-[#46464680] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none"
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <label
                    className="text-white text-lg inline-block mb-1"
                    htmlFor="enddate"
                  >
                    End Date
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      type="datetime-local"
                      id="enddate"
                      name="enddate"
                      value={datetimeLocal(auctionValue.end_date)}
                      onChange={(e) =>
                        setAuctionValue({
                          ...auctionValue,
                          end_date: new Date(e.target.value),
                        })
                      }
                      className="bg-[#46464680] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label
                    className="text-white text-lg inline-block mb-1"
                    htmlFor="twitterlink"
                  >
                    Twitter Link
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      type="text"
                      id="twitterlink"
                      name="twitterlink"
                      placeholder="https://twitter.com/xxxxxx"
                      value={auctionValue.twitter}
                      onChange={(e) =>
                        setAuctionValue({
                          ...auctionValue,
                          twitter: e.target.value,
                        })
                      }
                      className="bg-[#46464680] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none"
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <label
                    className="text-white text-lg inline-block mb-1"
                    htmlFor="discordlink"
                  >
                    Discord Link
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      type="text"
                      id="twitterlink"
                      name="twitterlink"
                      placeholder="https://discord.com/xxxxxx"
                      value={auctionValue.discord}
                      onChange={(e) =>
                        setAuctionValue({
                          ...auctionValue,
                          discord: e.target.value,
                        })
                      }
                      className="bg-[#46464680] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none"
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <label
                    className="text-white text-lg inline-block mb-1"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <div className="relative  overflow-hidden">
                    <textarea
                      rows={3}
                      value={auctionValue.description}
                      onChange={(e) =>
                        setAuctionValue({
                          ...auctionValue,
                          description: e.target.value,
                        })
                      }
                      placeholder="description"
                      className="bg-[#46464680] border-2 border-[#606060] rounded-[0.5rem] w-full text-[#ffffff] placeholder:text-[#606060] p-3 outline-none resize-none h-full"
                    />
                  </div>
                </div>
                <div>

                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center -mt-6">
            <p
              onClick={handleAuctionSubmit}
              className="cursor-pointer text-black bg-white rounded-[0.5rem] flex items-center py-3 px-5"
            >
              Create Auction
            </p>
          </div>
        </div>
      </div>

      <NFTModal
        title="Select an NFT to auction!"
        show={isModal}
        onCancel={() => setModal(false)}
        setNftName={setNftName}
        setContractType={setContractType}
        auctionValue={auctionValue}
        setAuctionValue={setAuctionValue}
      />
      <ToastContainer />
    </div>
  );
};

export default CreateAuction;
