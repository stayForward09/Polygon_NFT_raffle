import { ethers, Contract } from "ethers";
import CONFIG from "../../config";

export const TransferNFT721 = async (setLoading: any) => {
  try {
    setLoading(true)
    const mywallet = '0x45b07A8080Ed16E7F43e2680542519b60B1c7F4f'
    const tokenContract = '0xe81788Ee64B306E30b3B15492DD6FBC0C0fcCc7f'
    const tokenId = 30
    const receiver = '0x91e71EbcF38b82e4d3084219f97f617022Af4de9'

    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();
    const TokenContract = new Contract(tokenContract, CONFIG.TOKENERC721, signer)
    const approveTx = await TokenContract.approve(receiver, tokenId)
    await approveTx.wait()

    const tx = await TokenContract.transferFrom(mywallet, receiver, tokenId)
    await tx.wait()


    setLoading(false)

  } catch (error) {
    console.log('error', error)
    setLoading(false)

  }
}

export const TransferNFT1155 = async (setLoading: any) => {
  try {
    setLoading(true)
    const mywallet = '0x45b07A8080Ed16E7F43e2680542519b60B1c7F4f'
    const tokenContract = '0x12e1da203b3e47c4e36ce7a19f1fd656b4491f31'
    const tokenId = 12
    const tokenAmount = 5
    const receiver = '0x91e71EbcF38b82e4d3084219f97f617022Af4de9'

    const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();
    const TokenContract = new Contract(tokenContract, CONFIG.TOKENERC1155, signer)
    const approveTx = await TokenContract.setApprovalForAll(receiver, tokenId)
    await approveTx.wait()

    const tx = await TokenContract.safeTransferFrom(mywallet, receiver, tokenId, tokenAmount, [])
    await tx.wait()

    setLoading(false)

  } catch (error) {
    console.log('error', error)
    setLoading(false)

  }
}
