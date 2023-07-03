import CONFIG from "../config";
import Web3 from "web3";
import { ToastContainer, toast } from "react-toastify";
import { utils } from 'ethers'

declare global {
  interface Window {
    ethereum?: any
  }
}


export const datetimeLocal = (datetime: Date) => {
  let month = datetime.getMonth() + 1;
  let day = datetime.getDate();
  let hour = datetime.getHours();
  let min = datetime.getMinutes();
  const result = `${datetime.getFullYear()}-${month >= 10 ? month : `0${month}`}-${day >= 10 ? day : `0${day}`}T${hour >= 10 ? hour : `0${hour}`}:${min >= 10 ? min : `0${min}`}`
  return result;
}

export const connectWallet = async () => {
  try {
    if (window.ethereum) {
      try {
        const chain = await window.ethereum.request({ method: 'eth_chainId' })
        if (chain === CONFIG.CHAINID) {
          const addressArray = await window.ethereum.request({
            method: 'eth_requestAccounts',
          })
          if (addressArray.length > 0) {
            return {
              address: await addressArray[0],
              // status: "👆🏽 Ethereum Wallet is connected.",
            }
          } else {
            toast.error(`😥 Connect your wallet account to the site.`)

          }
        } else {
          // Case other chain connected so change polygon chain
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CONFIG.CHAINID }],
          })
          const addressArray = await window.ethereum.request({
            method: 'eth_requestAccounts',
          })
          if (addressArray.length > 0) {
            return {
              address: await addressArray[0],
            }
          }
        }

      } catch (err: any) {
        // No exist Polygon chain in your wallet
        const networkMap = {
          POLYGON_MAINNET: {
            chainId: utils.hexValue(137), // '0x89'
            chainName: "Matic(Polygon) Mainnet",
            nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
            rpcUrls: ["https://polygon-rpc.com"],
            blockExplorerUrls: ["https://www.polygonscan.com/"],
          },
          MUMBAI_TESTNET: {
            chainId: utils.hexValue(80001), // '0x13881'
            chainName: "Matic(Polygon) Mumbai Testnet",
            nativeCurrency: { name: "tMATIC", symbol: "tMATIC", decimals: 18 },
            rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
            blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
          },
        };

        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [networkMap.MUMBAI_TESTNET],
        });

        const addressArray = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        if (addressArray.length > 0) {
          return {
            address: await addressArray[0],
          }
        }

      }
    } else {
      toast.error(`🦊 You must install Metamask, a virtual Ethereum wallet, in your browser.(https://metamask.io/download.html)`)
    }
  } catch (error) {
    console.log('error', error)
  }

}

export const connectedChain = async () => {
  try {
    const chain = await window.ethereum.request({ method: 'eth_chainId' })
    if (chain === CONFIG.CHAINID) {
      return true
    } else {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CONFIG.CHAINID }],
      })
      const addressArray = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      if (addressArray.length > 0) {
        return {
          address: await addressArray[0],
        }
      }
      toast.error(`Please change Mumbai Chain Network`)

      return false
    }
  } catch (error) {
    console.log('error', error)
  }
}

export const getBalance = async () => {
  try {
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    const balance: any = await web3.eth.getBalance(accounts[0]);

    return balance / 1000000000000000000
  } catch (error) {
    console.log('error', error)
  }

}

export const unknownAccount = (error: any) => {
  if (error === 'unknown account #0') {
    toast.error('Please connect your wallet again');
  }
}

export const LOOP = 30;
export const INTERVAL = 500;
export const delay = (ms: any) => new Promise(resolve => setTimeout(resolve, ms))
