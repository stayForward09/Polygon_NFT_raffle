import { Contract, ethers } from "ethers"
import BigNumber from "bignumber.js";

import CONFIG from "../../config";


export const CreateAuctionContract = async (
  tokenContract: string,
  tokenId: number,
  minPrice: number,
  startDate: any,
  endDate: any,
) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();
    const TokenContract = new Contract(tokenContract, CONFIG.TOKENERC721, signer)
    const approveTx = await TokenContract.approve(CONFIG.AUCTION.CONTRACTADDRESS721, tokenId)
    await approveTx.wait()

    const auctionContract = new Contract(CONFIG.AUCTION.CONTRACTADDRESS721, CONFIG.AUCTION.ABI721, signer);
    const price = new BigNumber(minPrice).times(new BigNumber(10).pow(new BigNumber(18)))
    const tx = await auctionContract.createAuction(
      tokenContract,
      tokenId,
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

export const UpdateAuctionContract = async (
  itemId: number,
  minPrice: number,
  startDate: any,
  endDate: any,
) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const auctionContract = new Contract(CONFIG.AUCTION.CONTRACTADDRESS721, CONFIG.AUCTION.ABI721, signer);

    const price = new BigNumber(minPrice).times(new BigNumber(10).pow(new BigNumber(18)))
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

export const CancelAuctionContract = async (itemId: any) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const auctionContract = new Contract(CONFIG.AUCTION.CONTRACTADDRESS721, CONFIG.AUCTION.ABI721, signer);
    const tx = await auctionContract.cancelAuction(itemId);

    await tx.wait()

    if (tx) {
      return true
    }

  } catch (error) {
    console.log('error', error)
  }
}

export const createBidAuction = async (itemId: number, price: number) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const auctionContract = new Contract(CONFIG.AUCTION.CONTRACTADDRESS721, CONFIG.AUCTION.ABI721, signer);

    const send_value = new BigNumber(price).times(new BigNumber(10).pow(new BigNumber(18)))
    const res = await auctionContract.createBid(itemId, {
      value: send_value.toString()
    });

    await res.wait()

    return res

  } catch (error) {
    console.log('error', error)
  }
}

export const updateBidAuction = async (itemId: number, price: number) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const auctionContract = new Contract(CONFIG.AUCTION.CONTRACTADDRESS721, CONFIG.AUCTION.ABI721, signer);

    const send_value = new BigNumber(price).times(new BigNumber(10).pow(new BigNumber(18)))
    const res = await auctionContract.updateBid(itemId, {
      value: send_value.toString()
    });

    await res.wait()

    return res

  } catch (error) {
    console.log('error', error)
  }
}

export const cancelBidAuction = async (itemId: number) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const auctionContract = new Contract(CONFIG.AUCTION.CONTRACTADDRESS721, CONFIG.AUCTION.ABI721, signer);

    const res = await auctionContract.cancelBid(itemId)

    await res.wait()

    return res

  } catch (error) {
    console.log('error', error)
  }
}

export const claimBidAuction = async (itemId: any) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const auctionContract = new Contract(CONFIG.AUCTION.CONTRACTADDRESS721, CONFIG.AUCTION.ABI721, signer);

    const tx = await auctionContract.claimAuction(itemId);
    await tx.wait()
    return tx

  } catch (error) {
    console.log('error', error)
  }
}


export const fetchAuctionItems = async (tokenId: any, tokenAddress: any, startDate: any) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const auctionContract = new Contract(CONFIG.AUCTION.CONTRACTADDRESS721, CONFIG.AUCTION.ABI721, signer);

    const fetch_lists = await auctionContract.fetchAuctionItems()
    const itemId = fetch_lists.findIndex((item: any) => item.tokenId.toNumber() === tokenId && item.nftContract.toLowerCase() === tokenAddress.toLowerCase() && item.startDate.toNumber() === Number(startDate))

    const fetchLists = fetch_lists.find((item: any) => item.tokenId.toNumber() === tokenId && item.nftContract.toLowerCase() === tokenAddress.toLowerCase() && item.startDate.toNumber() === Number(startDate))

    return { itemId, largestPrice: fetchLists?.largestBidPrice.toNumber() }
  } catch (error) {
    console.log('error', error)
  }
}

export const fetchMyBidItems = async () => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const auctionContract = new Contract(CONFIG.AUCTION.CONTRACTADDRESS721, CONFIG.AUCTION.ABI721, signer);

    const res = await auctionContract.fetchMyBidItems()
    return res

  } catch (error) {
    console.log('error', error)
  }
}

export const fetchBidItemsById = async (itemId: any) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const auctionContract = new Contract(CONFIG.AUCTION.CONTRACTADDRESS721, CONFIG.AUCTION.ABI721, signer);

    const res = await auctionContract.fetchBidItemsByID(itemId);

    return res
  } catch (error) {
    console.log('error', error)
  }
}

export const getSoldNftStatus = async (tokenId: any, tokenAddress: any, startDate: any) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const auctionContract = new Contract(CONFIG.AUCTION.CONTRACTADDRESS721, CONFIG.AUCTION.ABI721, signer);

    const fetch_lists = await auctionContract.fetchAuctionItems()
    const res = fetch_lists.find((item: any) => item.tokenId.toNumber() === tokenId && item.nftContract.toLowerCase() === tokenAddress.toLowerCase() && item.startDate.toNumber() === Number(startDate))
    return res?.sold
  } catch (error) {
    console.log('error', error)
  }
}