import { Contract, ethers } from "ethers"
import BigNumber from "bignumber.js";

import CONFIG from "../../config";


export const CreateAuction1155Contract = async (
  tokenContract: string,
  tokenId: number,
  tokenAmount: number,
  ticketPrice: number,
  startDate: any,
  endDate: any,
) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();
    const TokenContract = new Contract(tokenContract, CONFIG.TOKENERC1155, signer)
    const approveTx = await TokenContract.setApprovalForAll(CONFIG.AUCTION.CONTRACTADDRESS1155, tokenId)
    await approveTx.wait()

    const auctionContract = new Contract(CONFIG.AUCTION.CONTRACTADDRESS1155, CONFIG.AUCTION.ABI1155, signer);
    const price = new BigNumber(ticketPrice).times(new BigNumber(10).pow(new BigNumber(18)))
    const tx = await auctionContract.createAuction(
      tokenContract,
      tokenId,
      tokenAmount,
      price.toString(),
      startDate,
      endDate
    )
    await tx.wait()
    if (tx) {
      return true
    }
  } catch (error) {
    console.log('error', error)
    return false
  }
}

export const UpdateAuction1155Contract = async (
  itemId: string,
  ticketPrice: number,
  startDate: any,
  endDate: any,
) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();
    const auctionContract = new Contract(CONFIG.AUCTION.CONTRACTADDRESS1155, CONFIG.AUCTION.ABI1155, signer);
    const price = new BigNumber(ticketPrice).times(new BigNumber(10).pow(new BigNumber(18)))
    const tx = await auctionContract.updateAuction(
      itemId,
      price.toString(),
      startDate,
      endDate
    )
    await tx.wait()
    if (tx) {
      return true
    }
  } catch (error) {
    console.log('error', error)
    return false
  }
}

export const CancelAuction1155Contract = async (
  itemId: string
) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();
    const auctionContract = new Contract(CONFIG.AUCTION.CONTRACTADDRESS1155, CONFIG.AUCTION.ABI1155, signer);
    const tx = await auctionContract.cancelAuction(itemId)
    await tx.wait()
    if (tx) {
      return true
    }
  } catch (error) {
    console.log('error', error)
    return false
  }
}


export const fetchAuction1155Items = async (tokenId: any, tokenAddress: any, startDate: any) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const auctionContract = new Contract(CONFIG.AUCTION.CONTRACTADDRESS1155, CONFIG.AUCTION.ABI1155, signer);

    const fetch_lists = await auctionContract.fetchAuctionItems()
    const itemId = fetch_lists.findIndex((item: any) => item.tokenId.toNumber() === tokenId && item.nftContract.toLowerCase() === tokenAddress.toLowerCase() && item.startDate.toNumber() === Number(startDate))
    const get_winner = fetch_lists.find((item: any) => item.tokenId.toNumber() === tokenId && item.nftContract.toLowerCase() === tokenAddress.toLowerCase() && item.startDate.toNumber() === Number(startDate))
    return { itemId, winner: get_winner?.winner.toLowerCase() }
  } catch (error) {
    console.log('error', error)
  }
}

export const createBidAuction1155 = async (itemId: any, price: any) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const auctionContract = new Contract(CONFIG.AUCTION.CONTRACTADDRESS1155, CONFIG.AUCTION.ABI1155, signer);

    const send_value = new BigNumber(price).times(new BigNumber(10).pow(new BigNumber(18)))
    const res = await auctionContract.createBid(itemId, {
      value: send_value.toString()
    });
    await res.wait()

    return res

  } catch (error) {
    console.log(`error`, error)
  }
}

export const updateBidAuction1155 = async (itemId: any, price: any) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const auctionContract = new Contract(CONFIG.AUCTION.CONTRACTADDRESS1155, CONFIG.AUCTION.ABI1155, signer);

    const send_value = new BigNumber(price).times(new BigNumber(10).pow(new BigNumber(18)))
    const res = await auctionContract.updateBid(itemId, {
      value: send_value.toString()
    });
    await res.wait()

    return res

  } catch (error) {
    console.log(`error`, error)
  }
}

export const cancelBidAuction1155 = async (itemId: any) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const auctionContract = new Contract(CONFIG.AUCTION.CONTRACTADDRESS1155, CONFIG.AUCTION.ABI1155, signer);

    const res = await auctionContract.cancelBid(itemId);
    await res.wait()

    return res

  } catch (error) {
    console.log(`error`, error)
  }
}

export const claimBidAuction1155 = async (itemId: any) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const auctionContract = new Contract(CONFIG.AUCTION.CONTRACTADDRESS1155, CONFIG.AUCTION.ABI1155, signer);

    const tx = await auctionContract.claimAuction(itemId);
    await tx.wait()
    return tx

  } catch (error) {
    console.log('error', error)
  }
}


export const fetchMyBidItems1155 = async () => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const auctionContract = new Contract(CONFIG.AUCTION.CONTRACTADDRESS1155, CONFIG.AUCTION.ABI1155, signer);

    const res = await auctionContract.fetchMyBidItems()
    return res

  } catch (error) {
    console.log(`error`, error)
  }
}

export const fetchBidItemsById1155 = async (itemId: any) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const auctionContract = new Contract(CONFIG.AUCTION.CONTRACTADDRESS1155, CONFIG.AUCTION.ABI1155, signer);

    const res = await auctionContract.fetchBidItemsByID(itemId);

    return res

  } catch (error) {
    console.log('error', error)
  }
}

export const getSoldNftStatus1155 = async (tokenId: any, tokenAddress: any, startDate: any) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const auctionContract = new Contract(CONFIG.AUCTION.CONTRACTADDRESS1155, CONFIG.AUCTION.ABI1155, signer);

    const fetch_lists = await auctionContract.fetchAuctionItems()
    const res = fetch_lists.find((item: any) => item.tokenId.toNumber() === tokenId && item.nftContract.toLowerCase() === tokenAddress.toLowerCase() && item.startDate.toNumber() === Number(startDate))
    return res.sold
  } catch (error) {
    console.log('error', error)
  }
}
