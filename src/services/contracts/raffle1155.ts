import { Contract, ethers } from "ethers"
import BigNumber from "bignumber.js";

import CONFIG from "../../config";
import { connectWallet } from "../../utils";


export const CreateRaffle1155Contract = async (
  tokenContract: string,
  tokenId: number,
  tokenAmount: number,
  ticketPrice: number,
  maxTicketAmount: any,
  startDate: any,
  endDate: any,
) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();
    const TokenContract = new Contract(tokenContract, CONFIG.TOKENERC1155, signer)
    const approveTx = await TokenContract.setApprovalForAll(CONFIG.RAFFLE.CONTRACTADDRESS1155, tokenId)
    await approveTx.wait()

    const raffleContract = new Contract(CONFIG.RAFFLE.CONTRACTADDRESS1155, CONFIG.RAFFLE.ABI1155, signer);
    const price = new BigNumber(ticketPrice).times(new BigNumber(10).pow(new BigNumber(18)))
    const tx = await raffleContract.createRaffle(
      tokenContract,
      tokenId,
      tokenAmount,
      price.toString(),
      maxTicketAmount,
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

export const UpdateRaffle1155Contract = async (
  itemId: string,
  ticketPrice: number,
  maxTicketAmount: any,
  startDate: any,
  endDate: any,
) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();
    const raffleContract = new Contract(CONFIG.RAFFLE.CONTRACTADDRESS1155, CONFIG.RAFFLE.ABI1155, signer);
    const price = new BigNumber(ticketPrice).times(new BigNumber(10).pow(new BigNumber(18)))
    const tx = await raffleContract.updateRaffle(
      itemId,
      price.toString(),
      maxTicketAmount,
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

export const FinishRaffle1155Contract = async (
  itemId: number
) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const raffleContract = new Contract(CONFIG.RAFFLE.CONTRACTADDRESS1155, CONFIG.RAFFLE.ABI1155, signer);
    const tx = await raffleContract.completeRaffle(itemId)
    await tx.wait()
    if (tx) {
      return true
    }
  } catch (error) {
    console.log('error', error)
    return false
  }
}

export const CancelRaffle1155Contract = async (
  itemId: string,
) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();
    const raffleContract = new Contract(CONFIG.RAFFLE.CONTRACTADDRESS1155, CONFIG.RAFFLE.ABI1155, signer);
    const tx = await raffleContract.cancelRaffle(itemId)
    await tx.wait()
    if (tx) {
      return true
    }
  } catch (error) {
    console.log('error', error)
    return false
  }
}

export const buyTicket1155 = async (
  itemId: number,
  ticketAmount: number,
  price: number
) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();
    const raffleContract = new Contract(CONFIG.RAFFLE.CONTRACTADDRESS1155, CONFIG.RAFFLE.ABI1155, signer);
    const send_value: any = new BigNumber(price).times(new BigNumber(10).pow(new BigNumber(18)))
    const res = await raffleContract.buyTicket(
      itemId,
      ticketAmount,
      { value: (Math.floor(send_value)).toString() }
    )
    await res.wait()
    if (res) {
      return true
    }
  } catch (error) {
    console.log('error', error)
    return false
  }
}

export const fetchRaffleLists1155 = async () => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const raffleContract = new Contract(CONFIG.RAFFLE.CONTRACTADDRESS1155, CONFIG.RAFFLE.ABI1155, signer);

    const fetch_lists = await raffleContract.fetchRaffleItems()
    return fetch_lists
  } catch (error) {
    console.log('error', error)
  }
}

export const fetchRaffle1155Items = async (tokenId: any, tokenAddress: any, startDate: any) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const raffleContract = new Contract(CONFIG.RAFFLE.CONTRACTADDRESS1155, CONFIG.RAFFLE.ABI1155, signer);

    const fetch_lists = await raffleContract.fetchRaffleItems()
    const itemId = fetch_lists.findIndex((item: any) => item.tokenId.toNumber() === tokenId && item.nftContract.toLowerCase() === tokenAddress.toLowerCase() && item.startDate.toNumber() === startDate)
    const myWalletAddress: any = await connectWallet()

    const filterWinner = fetch_lists.filter((item: any) => item.winner.toLowerCase() === myWalletAddress.address)
    if (itemId > -1) {
      const getItem = fetch_lists.find((item: any) => item.tokenId.toNumber() === tokenId && item.nftContract.toLowerCase() === tokenAddress.toLowerCase() && item.startDate.toNumber() === startDate)
      return { itemId, winner: getItem?.winner.toLowerCase(), price: Number(getItem?.ticketPrice), winnerCount: filterWinner.length }
    }

  } catch (error) {
    console.log('error', error)
  }
}

export const fetchMyTickets1155 = async () => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const raffleContract = new Contract(CONFIG.RAFFLE.CONTRACTADDRESS1155, CONFIG.RAFFLE.ABI1155, signer);
    const res = await raffleContract.fetchMyTicketItems()
    return res

  } catch (error) {
    console.log('error', error)
  }
}

export const fetchTicket1155ItemsByID = async (itemId: number) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const raffleContract = new Contract(CONFIG.RAFFLE.CONTRACTADDRESS1155, CONFIG.RAFFLE.ABI1155, signer);
    const res = await raffleContract.fetchTicketItemsByID(itemId)
    return res

  } catch (error) {
    console.log('error', error)
  }
}
