import { Contract, ethers } from "ethers"
import BigNumber from "bignumber.js";

import CONFIG from "../../config";
import { connectWallet } from "../../utils";


export const CreateRaffleContract = async (
  tokenContract: string,
  tokenId: number,
  ticketPrice: number,
  maxTicketAmount: any,
  startDate: any,
  endDate: any,
) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();
    const TokenContract = new Contract(tokenContract, CONFIG.TOKENERC721, signer)
    const approveTx = await TokenContract.approve(CONFIG.RAFFLE.CONTRACTADDRESS721, tokenId)
    await approveTx.wait()

    const raffleContract = new Contract(CONFIG.RAFFLE.CONTRACTADDRESS721, CONFIG.RAFFLE.ABI721, signer);
    const price = new BigNumber(ticketPrice).times(new BigNumber(10).pow(new BigNumber(18)))
    const tx = await raffleContract.createRaffle(
      tokenContract,
      tokenId,
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

export const UpdateRaffleContract = async (
  itemId: number,
  ticketPrice: number,
  maxTicketAmount: number,
  startDate: any,
  endDate: any,
) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const raffleContract = new Contract(CONFIG.RAFFLE.CONTRACTADDRESS721, CONFIG.RAFFLE.ABI721, signer);

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

export const FinishRaffleContract = async (
  itemId: number
) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const raffleContract = new Contract(CONFIG.RAFFLE.CONTRACTADDRESS721, CONFIG.RAFFLE.ABI721, signer);
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

export const CancelRaffleContract = async (itemId: any) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const raffleContract = new Contract(CONFIG.RAFFLE.CONTRACTADDRESS721, CONFIG.RAFFLE.ABI721, signer);
    const tx = await raffleContract.cancelRaffle(itemId);

    await tx.wait()

    if (tx) {
      return true
    }

  } catch (error) {
    console.log('error', error)
  }
}

export const buyTicket = async (itemId: number, ticketAmount: number, price: number) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const raffleContract = new Contract(CONFIG.RAFFLE.CONTRACTADDRESS721, CONFIG.RAFFLE.ABI721, signer);
    const send_value: any = new BigNumber(price).times(new BigNumber(10).pow(new BigNumber(18)))
    const res = await raffleContract.buyTicket(
      itemId,
      ticketAmount,
      { value: (Math.floor(send_value)).toString() }
    );
    await res.wait()

    return res

  } catch (error) {
    console.log('error', error)
  }
}

export const fetchRaffleLists = async () => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const raffleContract = new Contract(CONFIG.RAFFLE.CONTRACTADDRESS721, CONFIG.RAFFLE.ABI721, signer);
    const fetch_lists = await raffleContract.fetchRaffleItems()
    return fetch_lists

  } catch (error) {
    console.log('error', error)
  }
}

export const fetchRaffleItems = async (tokenId: any, tokenAddress: any, startDate: any) => {
  try {

    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const raffleContract = new Contract(CONFIG.RAFFLE.CONTRACTADDRESS721, CONFIG.RAFFLE.ABI721, signer);
    const fetch_lists = await raffleContract.fetchRaffleItems()

    const myWalletAddress: any = await connectWallet()

    const filterWinner = fetch_lists.filter((item: any) => item.winner.toLowerCase() === myWalletAddress.address)

    const itemId = fetch_lists.findIndex((item: any) => item.tokenId.toNumber() === tokenId && item.nftContract.toLowerCase() === tokenAddress.toLowerCase() && item.startDate.toNumber() === startDate)

    const getItem = fetch_lists.find((item: any) => item.tokenId.toNumber() === tokenId && item.nftContract.toLowerCase() === tokenAddress.toLowerCase() && item.startDate.toNumber() === startDate)

    return { itemId, winner: getItem?.winner.toLowerCase(), price: Number(getItem?.ticketPrice), winnerCount: filterWinner.length }
  } catch (error) {
    console.log('error', error)
  }
}

export const fetchMyTickets = async () => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const raffleContract = new Contract(CONFIG.RAFFLE.CONTRACTADDRESS721, CONFIG.RAFFLE.ABI721, signer);

    const res = await raffleContract.fetchMyTicketItems()
    return res

  } catch (error) {
    console.log('error', error)
  }
}

export const fetchTicketItemsByID = async (itemId: number) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const raffleContract = new Contract(CONFIG.RAFFLE.CONTRACTADDRESS721, CONFIG.RAFFLE.ABI721, signer);

    const res = await raffleContract.fetchTicketItemsByID(itemId)
    return res
  } catch (error) {
    console.log('error', error)
  }
}

export const completeRaffle = async (itemId: any) => {
  try {
    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    const raffleContract = new Contract(CONFIG.RAFFLE.CONTRACTADDRESS721, CONFIG.RAFFLE.ABI721, signer);
    const res = await raffleContract.completeRaffle(itemId);
    return res
  } catch (error) {
    console.log('error', error)
  }
}