import commonService from "./common.service";
import { API_URL } from "../config/dev";

export const getNfts = async (address: any) => {
  try {
    const result = commonService({
      method: `get`,
      route: `${API_URL}/nft/${address}`
    })
    return result
  } catch (error) {
    console.log('error', error)
  }
}

export const getAllAuctions = async () => {
  try {
    const result = await commonService({
      method: "get",
      route: `${API_URL}/auction`
    })
    return result
  }
  catch (error) {
    console.log('error', error);
    return null;
  }
}

export const createAuction = async (payload: FormData) => {

  try {
    const result = await commonService({
      method: "post",
      route: `${API_URL}/auction`,
      // headerCred: { contentType: 'multipart/form-data' },
      data: payload,
    })

    return result
  } catch (error) {
    console.log('error', error);
    return null
  }
}

export const updateAuction = async (id: any, payload: FormData) => {
  try {
    const result = await commonService({
      method: "put",
      route: `${API_URL}/auction/${id}`,
      // headerCred: { contentType: 'multipart/form-data' },
      data: payload,
    })

    return result
  } catch (error) {
    console.log('error', error);
    return null
  }
}

export const deleteAuction = async (id: any) => {
  try {
    const result = await commonService({
      method: "post",
      route: `${API_URL}/auction/${id}/delete`,
    })

    return result
  } catch (error) {
    console.log('error', error);
    return null
  }
}

export const getAuctionById = async (id: any) => {
  try {
    const result = await commonService({
      method: 'get',
      route: `${API_URL}/auction/${id}`
    })
    return result
  } catch (error) {
    console.log('error', error);
    return null
  }
}

export const getAllRaffle = async () => {
  try {
    const result = await commonService({
      method: 'get',
      route: `${API_URL}/raffle`
    })

    return result
  } catch (error) {
    console.log('error', error);
    return null
  }
}

export const getRaffleById = async (id: any) => {
  try {
    const result = await commonService({
      method: 'get',
      route: `${API_URL}/raffle/${id}`
    })
    return result
  } catch (error) {
    console.log('error', error)
    return null
  }
}


export const createRaffle = async (payload: FormData) => {
  try {
    const result = await commonService({
      method: "post",
      route: `${API_URL}/raffle`,
      data: payload
    })

    return result
  } catch (error) {
    console.log('error', error);
    return null
  }
}

export const updateRaffle = async (id: any, payload: FormData) => {
  try {
    const result = await commonService({
      method: "put",
      route: `${API_URL}/raffle/${id}`,
      data: payload,
    })

    return result
  } catch (error) {
    console.log('error', error);
    return null
  }
}

export const deleteRaffle = async (id: any) => {
  try {
    const result = await commonService({
      method: "post",
      route: `${API_URL}/raffle/${id}/delete`,
    })
    return result
  } catch (error) {
    console.log('error', error);
    return null
  }
}

export const finishRaffle = async (id: any) => {
  try {
    const result = await commonService({
      method: "post",
      route: `${API_URL}/raffle/${id}/finish_raffle`,
    })
    return result
  } catch (error) {
    console.log('error', error);
    return null
  }
}

export const getUser = async (wallet: string) => {
  try {
    const result = await commonService({
      method: "get",
      route: `${API_URL}/user/${wallet}`,
    })
    return result;
  }
  catch (error) {
    console.log('error', error);
    return null;
  }
}

export const createUser = async (wallet: string, signedMessage: string | null) => {
  try {
    const result = await commonService({
      method: "post",
      route: `${API_URL}/user`,
      data: {
        wallet,
        signedMessage
      }
    })
    return result;
  }
  catch (error) {
    console.log('error', error);
    return null;
  }
}


export const checkDiscordStatus = async (wallet: string) => {
  try {
    const result = await commonService({
      method: "get",
      route: `${API_URL}/user/discord/status/${wallet}`,
    })
    return result;
  }
  catch (error) {
    console.log('error', error);
  }
}

export const checkTwitterStatus = async (wallet: string) => {
  try {
    const result = await commonService({
      method: "get",
      route: `${API_URL}/user/twitter/status/${wallet}`,
    })
    return result;
  }
  catch (error) {
    console.log('error', error);
  }
}