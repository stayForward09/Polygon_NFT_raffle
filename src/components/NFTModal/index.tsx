import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import VerificationIcon from "../../assets/Verification-icon.png";
import { getNfts } from "../../services/api";
import "./index.css";

const NFTModal = (props: any) => {
  const { show, title, setNftName, setContractType, raffleValue, setRaffleValue, auctionValue, setAuctionValue } = props;
  const storeData: any = useSelector(status => status)
  const [isModalLoading, setModalLoading] = useState(false);
  const [nfts, setNfts] = useState<any[]>([]);
  const [selectedNft, setSelectedNft] = useState<any>(null);
  const [isActive, setActive] = useState(-1)

  useEffect(() => {
    (async () => {
      if (show === true) {
        if (storeData.wallet === 'disconnect') {
          toast(`Please connect your wallet`)
          return
        }
        try {
          setNfts([]);
          setModalLoading(true);

          const lists: any = await getNfts(storeData.address)
          let filtered_nfts: any = []
          await lists.result.forEach((nft: any) => {
            const ipfs = JSON.parse(nft?.metadata)?.image
            let get_image = ''
            if (ipfs?.includes('ipfs://')) {
              get_image = 'https://ipfs.io/ipfs/' + ipfs.replace('ipfs://', '')
            } else {
              get_image = ipfs
            }
            filtered_nfts.push({
              metadata: JSON.parse(nft?.metadata),
              name: nft?.name,
              token_address: nft?.token_address,
              token_id: nft?.token_id,
              owner: nft?.owner_of,
              symbol: nft?.symbol,
              image: get_image,
              type: nft?.contract_type,
              nftAmount: nft?.amount
            })
          })
          setNfts(filtered_nfts)

          setModalLoading(false);

        } catch (error) {
          console.log("error", error);
          setModalLoading(false);
        }
      }

    })();
  }, [show, storeData]);

  const onOkBtn = () => {
    if(selectedNft == null) props.onCancel();
    else {
      if (raffleValue) {
        setRaffleValue({
          ...raffleValue,
          tokenAddress: selectedNft.token_address,
          tokenId: selectedNft.token_id,
          image: selectedNft?.image,
          amount: selectedNft?.nftAmount
        })
      }

      if (auctionValue) {
        setAuctionValue({
          ...auctionValue,
          tokenAddress: selectedNft.token_address,
          tokenId: selectedNft.token_id ? selectedNft.token_id : ``,
          image: selectedNft?.image ? selectedNft?.image : ``,
          amount: selectedNft?.nftAmount
        })
      }
      const selectedNftName = selectedNft?.name ? selectedNft?.name : selectedNft?.metadata?.name.split(`#`)[0]

      setNftName(`${selectedNftName} #${selectedNft.token_id} `)
      setContractType(selectedNft?.type)
      props.onCancel()
    }
    
  }

  const handleSelect = (index: number) => {
    try {
      if (isModalLoading) return;
      if (index >= 0) {
        setActive(index)
      }
      setSelectedNft({
        ...nfts[index],
        index,
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <>
      {
        isModalLoading ?
          <div id="preloader"></div> :
          <div id="preloader" style={{ display: "none" }}></div>
      }
      {show ? (
        <div className="fixed w-full h-full top-0 left-0 custom-blur-bg flex items-center justify-center z-50 px-2 py-12 overflow-y-auto">
          <div className="w-full max-w-[920px] m-auto border-4 md:px-8 px-4 md:py-8 py-4 border-[#fff] bg-[#fff] rounded-[0.7rem] nftItem-shadow ">
            <div className="flex items-center justify-between">
              <h1 className="text-black md:text-3xl text-xl">{title}</h1>
              <button
                onClick={() => props.onCancel()}
                className="bg-white text-xl rounded-[0.6rem] py-1 px-3 font-bold"
              >
                X
              </button>
            </div>
            <div className=" max-h-[500px] overflow-y-scroll flex items-start mt-6 gap-[0.7rem] flex-wrap min-h-[250px]">
              {
                nfts.length > 0 ?
                  nfts.map((nft, index: any) => {
                    return (
                      <div key={index} className={`cursor-pointer basis-[22%] rounded-[18px] ${isActive === index ? `border-[4px] border-[#8652FF] border-solid ` : `border-[none] border-solid `} `} onClick={() => handleSelect(index)} >
                        <div className={`  rounded-[8px] overflow-hidden transition duration-1000 nftItem-shadow `}>
                          <div className="relative">
                            <img
                              src={nft?.image}
                              alt="CoodeImage"
                              className={`object-cover min-h-[250px] w-full border-solid `}

                            />
                          </div>
                          <div className="bg-[#fff] pt-2 -mt-1">
                            <div className="flex items-center mb-1">
                              <img
                                src={VerificationIcon}
                                alt="VerificationIcon"
                                style={{ width: "16px" }}
                              />
                              <span className="text-white text-sm leading-none inline-block ml-1">
                                {nft?.metadata?.name.split('#')[0]}
                              </span>
                            </div>
                            <div className="bg-[#8652FF]  flex overflow-hidden">
                              <p className="bg-white text-base text-center basis-[70%] py-1 pl-2 pr-4 para-clip">
                                Token ID
                              </p>
                              <p className="py-1 text-center px-2 text-base basis-[30%] bg-[#8652FF]  text-white">
                                #{nft?.token_id}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                  : isModalLoading ? <></>
                    :
                    <p className="w-full text-center text-black mt-8 " >No exist NFT in your wallet.</p>
              }
            </div>
            <div className="flex item-center justify-end mt-6">
              <button
                // onClick={() => props.onOk(selectedNft?.mint, selectedNft?.baseUri)}
                onClick={onOkBtn}
                className="bg-[#8652FF] text-white py-2 px-6 rounded-[0.6rem]"
              >
                Ok
              </button>
              <button
                onClick={() => props.onCancel()}
                className="bg-[#AA0000] ml-4 text-white py-2 px-6 rounded-[0.6rem]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </>
  );
};

export default NFTModal;
