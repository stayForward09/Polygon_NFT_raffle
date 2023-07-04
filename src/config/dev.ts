import Raffle721Abi from '../constants/Raffle/RaffleErc721.json'
import Raffle1155Abi from '../constants/Raffle/Raffle1155.json'
import Auction721Abi from '../constants/Auction/AuctionErc721.json'
import Auction1155Abi from '../constants/Auction/AuctionErc1155.json'
import TokenErc721 from '../constants/Token/Erc721Token.json'
import TokenErc1155 from '../constants/Token/Erc1155Token.json'

export const Backend_URL = 'https://polygonraffle.herokuapp.com'
// export const Backend_URL = 'http://localhost:5000'

export const API_URL = `${Backend_URL}/api`

export const RAFFLE = {
  CONTRACTADDRESS721: `0xF915D954095FB08E3352963d00Cbe258e0AB536D`,
  ABI721: Raffle721Abi,
  CONTRACTADDRESS1155: `0x3Dfab437F4fa586503d5d08dEE9ac71AfCa52b6E`,
  ABI1155: Raffle1155Abi,
}

export const AUCTION = {
  CONTRACTADDRESS721: `0x2F65d49b83bB2AD6bf32aadDc0F9B17167d09E9c`,
  ABI721: Auction721Abi,
  CONTRACTADDRESS1155: `0xDa2c07fa6A7B093893a1eb6D701Cf54C2c07b06F`,
  ABI1155: Auction1155Abi,

}

export const TOKENERC721 = TokenErc721
export const TOKENERC1155 = TokenErc1155

export const TOAST_TIME_OUT = 2000;
export const INTERVAL = 6 * 1000;
export const DECIMAL = 1000000000000000000
// export const CHAINID = '0x5' //Goerli
// export const CHAINID = '0x13881' //Mumbai
export const CHAINID = '0x89' //polygon

export const WALLET_STATUS_LOCALSTORAGE = 'wallet'
export const WALLET_ADRESS_LOCALSTORAGE = 'wallet_address'
export const DEFAUL_NONE_WINNER = '0x0000000000000000000000000000000000000000'
export const SIGN_KEY = 'VERIFY WALLET';
