import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { getAuctionById } from "../../services/api";
import { updateAuction, deleteAuction } from "../../services/api";
import { datetimeLocal, } from "../../utils";
import CONFIG from "../../config";
import NFTModal from "../../components/NFTModal";
import Navbar from "../../components/Navbar";
import SelectNFTIcon from "../../assets/Select-NFT-Icon.png";
import { CancelAuctionContract, UpdateAuctionContract, fetchAuctionItems } from "../../services/contracts/auction";
import { validationAuction } from "../../utils/validation/auction";
import { CancelAuction1155Contract, UpdateAuction1155Contract, fetchAuction1155Items } from "../../services/contracts/auction1155";

const { TOAST_TIME_OUT } = CONFIG;

const EditAuction = () => {
  const storeData: any = useSelector((status) => status)
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setLoading] = useState(false);
  const [isModal, setModal] = useState(false);
  const [updateBtnActive, setUpdateBtnActive] = useState(false)
  const [nftName, setNftName] = useState('Select Nft')
  const [contractType, setContractType] = useState(``)

  const [auctionValue, setAuctionValue] = useState<any>({
    id: 0,
    project: ``,
    description: ``,
    image: ``,
    imageFile: "",
    discord: ``,
    twitter: ``,
    min_bid_amount: ``,
    start_date: new Date(),
    end_date: new Date(),
    mint: ``,
  });

  const handleAuctionUpdate = async () => {
    try {
      if (!updateBtnActive) {
        toast.error(`You can't update`)
        return
      }
      if (storeData.wallet !== 'connected') {
        toast.error(`Please connect your wallet`)
        return
      }

      const validation = validationAuction(auctionValue)
      if (!validation) return

      setLoading(true);

      let updateAuctionTx;
      if (auctionValue.type === `ERC1155`) {
        const getAuctionInfo = await fetchAuction1155Items(auctionValue.tokenId, auctionValue.tokenAddress, Math.floor(auctionValue.start_date?.getTime() / 1000).toString())
        updateAuctionTx = await UpdateAuction1155Contract(
          getAuctionInfo?.itemId + 1,
          auctionValue.price,
          Math.floor(auctionValue.start_date?.getTime() / 1000),
          Math.floor(auctionValue.end_date?.getTime() / 1000)
        )

      } else {
        const getAuctionInfo = await fetchAuctionItems(auctionValue.tokenId, auctionValue.tokenAddress, Math.floor(auctionValue.start_date?.getTime() / 1000).toString())

        updateAuctionTx = await UpdateAuctionContract(
          getAuctionInfo?.itemId + 1,
          auctionValue.price,
          Math.floor(auctionValue.start_date?.getTime() / 1000),
          Math.floor(auctionValue.end_date?.getTime() / 1000)
        )
      }

      if (updateAuctionTx) {
        const payload: any = {
          name: nftName,
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
          walletAddress: storeData.address
        }
        const res = await updateAuction(id, payload);
        if (res) {
          toast("Success in updating auction", {
            onClose: () => {
              setTimeout(() => {
                navigate("/auction");
              }, TOAST_TIME_OUT);
            },
          });
        } else {
          toast("Error in updating auction");
        }
      }

      setLoading(false);

    } catch (error) {
      console.log("error", error);
      toast("Error in creating auction");
      setLoading(false);

    }
  };

  const handleAuctionDeleteBtn = async () => {
    try {
      if (!updateBtnActive) {
        toast.error(`You can't delete`)
        return
      }
      if (storeData.wallet !== 'connected') {
        toast.error(`Please connect your wallet`)
        return
      }

      setLoading(true)

      let deleteTx;

      if (auctionValue.type === `ERC1155`) {
        const getAuctionInfo: any = await fetchAuction1155Items(auctionValue.tokenId, auctionValue.tokenAddress, Math.floor(auctionValue.start_date?.getTime() / 1000).toString())
        deleteTx = await CancelAuction1155Contract(getAuctionInfo.itemId + 1)
      } else {
        const getAuctionInfo: any = await fetchAuctionItems(auctionValue.tokenId, auctionValue.tokenAddress, Math.floor(auctionValue.start_date?.getTime() / 1000).toString())
        deleteTx = await CancelAuctionContract(getAuctionInfo.itemId + 1)
      }

      if (deleteTx) {
        const res = await deleteAuction(id);
        if (res) {
          toast("Success in delete auction", {
            onClose: () => {
              setTimeout(() => {
                navigate("/auction");
              }, TOAST_TIME_OUT);
            },
          });
        } else {
          toast("Error in delete auction");
        }
      }
      setLoading(false)
    } catch (error) {
      console.log('error', error)
      setLoading(false)
      toast("Error in delete auction");
    }
  }

  const handleClickModal = () => {
    toast.error(`NFT can't update`)
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (id) {
          const nftInfoById: any = await getAuctionById(id);

          setAuctionValue({
            ...nftInfoById,
            start_date: new Date(nftInfoById.start_date * 1000),
            end_date: new Date(nftInfoById.end_date * 1000),
          });
          setNftName(nftInfoById.name)
          if (nftInfoById.start_date * 1000 > Date.now()) {
            setUpdateBtnActive(true)
          }
        }
      } catch (error) {
        console.log("error", error);
      }
      setLoading(false);
    })();
  }, [id, storeData]);

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
          <h1 className="text-center text-white text-4xl">Edit Auction</h1>
          <div className="border-4 mt-6 md:px-8 px-4 pt-8 pb-14 border-[#606060] bg-[#60606040] rounded-[0.7rem]">
            <div className="md:flex block justify-between items-start">
              <label
                htmlFor="profilePic"
                className="border-2 md:mb-0 mb-4 min-h-[295px] basis-[46%] flex items-center justify-center flex-col p-8 border-[#606060] bg-[#60606040] rounded-[0.7rem] cursor-pointer"
                onClick={handleClickModal}
              >
                <img src={auctionValue?.image ? auctionValue?.image : SelectNFTIcon} alt="SelectNFTIcon" />

                <span className="text-[#606060] text-xl mt-3"> {nftName}</span>
              </label>
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
                      type="text"
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
                    htmlFor="ticketdate"
                  >
                    End Date
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      type="datetime-local"
                      id="ticketdate"
                      name="ticketdate"
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
                    htmlFor="bidprice"
                  >
                    Min. Bid Incrementant
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      id="bidprice"
                      name="bidprice"
                      placeholder="1-100%"
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
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-[16px] " >
            <div className="flex justify-center -mt-6">
              <p
                onClick={handleAuctionUpdate}
                className={` cursor-pointer text-black bg-white rounded-[0.5rem] flex items-center py-3 px-5`}
              >
                Update Auction
              </p>
            </div>
            <div className="flex justify-center -mt-6">
              <p
                onClick={handleAuctionDeleteBtn}
                className={`cursor-pointer text-black bg-white rounded-[0.5rem] flex items-center py-3 px-5`}
              >
                Delete Auction
              </p>
            </div>
          </div>

        </div>
      </div>
      <NFTModal
        title="Select an NFT to Auction!"
        show={isModal}
        setNftName={setNftName}
        onCancel={() => setModal(false)}
        auctionValue={auctionValue}
        setAuctionValue={setAuctionValue}
        setContractType={setContractType}
      />
      <ToastContainer />
    </div>
  );
};

export default EditAuction;
