import { useState, useEffect, useMemo } from 'react'
import Select from 'react-select'
import { ethers } from 'ethers';
import Navbar from "../../components/Navbar"
import { fetchMyTickets, fetchRaffleItems, fetchRaffleLists, fetchTicketItemsByID } from '../../services/contracts/raffle'
import { fetchMyTickets1155, fetchRaffle1155Items, fetchRaffleLists1155, fetchTicket1155ItemsByID } from '../../services/contracts/raffle1155'
import { getAllRaffle } from '../../services/api'
import { fetchMyBidItems } from '../../services/contracts/auction';
import { fetchMyBidItems1155 } from '../../services/contracts/auction1155';
import { time } from 'console';
import { isTemplateExpression } from 'typescript';
import axios from 'axios';
import { API_URL } from '../../config/dev';
import { userInfo } from 'os';


const LeaderBoard = () => {
  const [rafflerLists, setRafflerLists] = useState([]);
  const [soldTicketAmounts, setSoldTicketAmounts] = useState<any[]>([])
  const [ticketPrices, setTicketPrices] = useState<any[]>([]);
  const [volume, setVolume] = useState<number[]>();
  const [ticketSold, setTicketSold] = useState<number[]>();
  const [raffleGroupByList, setRaffleGroupByList] = useState<any>([]);

  const [raffleLoading, setRaffleLoading] = useState(false);
  const [buyTicketLists, setBuyTicketLists] = useState<any>([]);
  const [buyTicketAmount, setBuyTicketAmount] = useState<any[]>([]);
  const [buyTicketVolume, setBuyTicketVolume] = useState<any[]>([]);
  const [buyTicketWon, setBuyTicketWon] = useState<any[]>([]);

  const [raffleDayFilter, setRaffleDayFilter] = useState<string>("all");
  const [buyRaffleDayFilter, setBuyRaffleDayFilter] = useState<string>("all");
  const [raffleDayFilterValue, setRaffleDayFilterValue] = useState<number>(0);
  const [buyRaffleDayFilterValue, setBuyRaffleDayFilterValue] = useState<number>(0);
  const [raffleSort, setRaffleSort] = useState("volume");
  const [buyRaffleSort, setBuyRaffleSort] = useState("volume");

  const handleRafflerDayChange = (value: any, type: boolean) => {
    let current_time: any = new Date()
    switch (value) {
      case 'all':
        if(type){
          setRaffleDayFilter("all");
          setRaffleDayFilterValue(0);
        }else{
          setBuyRaffleDayFilter("all")
          setBuyRaffleDayFilterValue(0);
        }
        break;
      case 'twoWeek':
        if(type){
          setRaffleDayFilter("twoWeek");
          setRaffleDayFilterValue(current_time - 24 * 7 * 60 * 60 * 1000);
        }else{
          setBuyRaffleDayFilter("twoWeek")
          setBuyRaffleDayFilterValue(current_time - 24 * 7 * 60 * 60 * 1000);
        }
        break;
      case 'day':
        if(type){
          setRaffleDayFilter("day");
          setRaffleDayFilterValue(current_time - 24 * 60 * 60 * 1000);
        }else{
          setBuyRaffleDayFilter("day");
          setBuyRaffleDayFilterValue(current_time - 24 * 60 * 60 * 1000);
        }
        break;
      default: break;
    }
  }
  
  const handleBuyRafflerSortChange = (value: any) => {
    switch(value) {
      case 'raffle_bought':
        setBuyRaffleSort("raffle_bought")
        break;
      case 'ticket_bought':
        setBuyRaffleSort("ticket_bought")
        break;
      case 'raffle_won':
        setBuyRaffleSort("raffle_won")
        break;
      case 'volume':
        setBuyRaffleSort("volume")
        break;
      default: break;
    }
  }

  const handleRafflerSortChange = (value: any) => {
    switch(value) {
      case 'raffle_create':
       setRaffleSort("raffle_create")
        break;
      case 'ticket_sold':
        setRaffleSort("ticket_sold")
        break;
      case 'volume':
         setRaffleSort("volume")
        break;
      default: break;
    }
  }

  const getUserInfo = async (address: string) => {
    try{
      const res = await axios.get(`${API_URL}/raffle`, {
          params: {
            walletAddress: address
          }
      });
      return res.data
    }catch(error){
      console.log("error", error);
    }
  } 

  const fetchRafflers = async (tempAllRaffle: any) => {
    setRaffleLoading(true);
    let allRaffle: any = [], dayRaffleFilter: any = [], tempRafflerSort: any = [];
    dayRaffleFilter = tempAllRaffle.filter((item:any) =>  item.startDate.toNumber() * 1000 >= raffleDayFilterValue );
    allRaffle = dayRaffleFilter;
    
    let ans = allRaffle.reduce((agg: any,curr: any) => {
      let found = agg.find((x: { seller: any }) => x.seller === curr.seller);
      if(found){
        found.sellerCount.push(curr.seller);
        found.ticketPrices.push(curr.ticketPrice);
        found.soldVolume+= Number(ethers.utils.formatEther(curr.ticketPrice)) * curr.soldTicketAmount.toNumber();
        found.soldTicketAmount+= curr.soldTicketAmount.toNumber();
      }
      else{
        agg.push({
          seller : curr.seller,
          sellerCount : [curr.seller],
          ticketPrices: [curr.ticketPrice],
          soldVolume: Number(ethers.utils.formatEther(curr.ticketPrice)) * curr.soldTicketAmount.toNumber(),
          soldTicketAmount: curr.soldTicketAmount.toNumber()
        });
      }
      return agg;
    },[]);

    switch(raffleSort){
      case 'raffle_create':
          tempRafflerSort = ans.sort((a: any, b: any) => b.sellerCount.length - a.sellerCount.length);
      break;
      case 'ticket_sold':
        tempRafflerSort = ans.sort((a: any, b: any) => b.soldTicketAmount - a.soldTicketAmount);
        break;
      case 'volume':
        tempRafflerSort = ans.sort((a: any, b: any) => b.soldVolume - a.soldVolume);
        break;
      default: break;
    }
  

    const userInfos: any[] = await Promise.all(tempRafflerSort.map((item: any) => getUserInfo(item?.seller)));
    tempRafflerSort = tempRafflerSort.map(
      (item: any, index: number) => 
       ({...item, discord: userInfos[index]?.discord, twitter: userInfos[index]?.twitter})
    );
    setRaffleGroupByList([...tempRafflerSort]);
    setRaffleLoading(false);
  }

  const fetchBuyRaffler = async (tempAllRaffle: any) => {
    setRaffleLoading(true);
    let buyAllRaffle: any = [], dayBuyRaffleFilter: any = [], tempBuyAllRaffle: any = [];
    tempBuyAllRaffle = tempAllRaffle;
    dayBuyRaffleFilter = tempBuyAllRaffle.filter((item:any) =>  item.startDate.toNumber() * 1000 >= buyRaffleDayFilterValue );
    buyAllRaffle = dayBuyRaffleFilter;
    
    const tempFetchBuyTicket: any[] = await Promise.all(buyAllRaffle.map(async(item: any, index: number) => {
      const fetchItem = await fetchTicketItemsByID(item.itemId.toNumber());
      if(fetchItem.length !==0){
        return { ...fetchItem, winner: item.winner, ticketPrice: item.ticketPrice }
      }
    }))
    const resFoundBuyTicket = tempFetchBuyTicket.filter((item: any, index: number) => item !== undefined );
    let foundBuy: any = [];
    for(let i = 0; i < resFoundBuyTicket?.length; i++){
      const objKeys  = Object.keys(resFoundBuyTicket[i]);
      for(let j = 0; j < objKeys.length - 2; j++){
        foundBuy.push({item:resFoundBuyTicket[i][j], winner: resFoundBuyTicket[i].winner, ticketPrice: resFoundBuyTicket[i].ticketPrice});
      }
    }

    let foundBuyGroupBy = foundBuy.reduce((agg: any,curr: any) => {
      let found = agg.find((x: { buyer: any }) => x.buyer === curr.item.buyer);
      if(found){
        found.buyerCount += 1;
        found.ticketPrice.push(curr.ticketPrice);
        found.buyVolume+= Number(ethers.utils.formatEther(curr.ticketPrice)) * curr.item.ticketAmount.toNumber()
        found.ticketAmount+=curr.item.ticketAmount.toNumber();
        found.won.push(curr.winner);
      }
      else{
        agg.push({
          buyer : curr.item.buyer,
          buyerCount : 1,
          ticketPrice: [curr.ticketPrice],
          buyVolume: Number(ethers.utils.formatEther(curr.ticketPrice)) * curr.item.ticketAmount.toNumber(),
          ticketAmount: curr.item.ticketAmount.toNumber(),
          won: [curr.winner],
        });
      }
      return agg;
    },[]);
    let tempfoundBuyGroupBy: any = [], tempFoundBuyGroupBySort: any = [];
    foundBuyGroupBy.forEach((item: any, index: number) => {
      let wonCount = item.won.filter((_item: any) => _item === item.buyer).length;
      tempfoundBuyGroupBy.push({...item, wonCount: wonCount});
    })
    switch(buyRaffleSort){
      case 'raffle_bought':
        tempFoundBuyGroupBySort = tempfoundBuyGroupBy.sort((a: any, b: any) => b.buyerCount - a.buyerCount);
        break;
      case 'ticket_bought':
        tempFoundBuyGroupBySort = tempfoundBuyGroupBy.sort((a: any, b: any) => b.ticketAmount - a.ticketAmount);
        break;
      case 'raffle_won':
        tempFoundBuyGroupBySort = tempfoundBuyGroupBy.sort((a: any, b: any) => b.wonCount - a.wonCount);
        break;
      case 'volume':
        tempFoundBuyGroupBySort = tempfoundBuyGroupBy.sort((a: any, b: any) => b.buyVolume - a.buyVolume);
        break;
      default: break;
    }
    const userInfos: any[] = await Promise.all(tempFoundBuyGroupBySort.map((item: any) => getUserInfo(item?.buyer)));
    tempFoundBuyGroupBySort = tempFoundBuyGroupBySort.map(
      (item: any, index: number) => 
      ({...item, discord: userInfos[index]?.discord, twitter: userInfos[index]?.twitter})
    );
    setBuyTicketLists([...tempFoundBuyGroupBySort]);
    setRaffleLoading(false);
  }

  useEffect(() => {
    (
      async () => {
        try {
          const fetchRaffle = await fetchRaffleLists();
          const fetchRaffle1155 = await fetchRaffleLists1155();
          const res_fetchRaffle = fetchRaffle.map((item: any) => {
            return { ...item }
          })
          const res_fetchRaffle1155 = fetchRaffle1155.map((item: any) => {
            return { ...item }
          })
          const tempAllRaffle: any = [...res_fetchRaffle, ...res_fetchRaffle1155];
          fetchRafflers(tempAllRaffle);
          fetchBuyRaffler(tempAllRaffle);
        } catch (error) {
          console.log('error', error)
        }
      }
    )()
  }, [raffleDayFilterValue, raffleSort, buyRaffleDayFilterValue, buyRaffleSort])

  return (
    <>
    {
      raffleLoading && <div id="preloader"></div>
    }
   
    <div>
      <Navbar />
      <div className="max-w-[1280px] mx-[auto] my-0 ">
        <h1 className="hidden md:block text-5xl font-bold px-8 md:px-0 mt-3 sm:mb-5 text-purple-500/30 mr-5 " >LeaderBoard</h1>
        <div className="flex gap-4 " >
          <div className="basis-[48%]" >
            <div className="w-full flex justify-between items-center  " >
              <p className="text-black font-bold text-xl" >Top Rafflers</p>
              <div className='flex items-center gap-2' >
                <select
                  defaultValue={"all"}
                  onChange={(e: any) => handleRafflerDayChange(e.target.value, true)}
                  className='border-[1px] border-solid border-[grey] p-[4px] min-w-[80px] cursor-pointer rounded-[6px]'
                >
                  <option value="all">All</option>
                  <option value="twoWeek">2W</option>
                  <option value="day">1D</option>
                </select>
                <select
                  defaultValue={"volume"}
                  id="countries"
                  className='border-[1px] border-solid border-[grey] p-[4px] min-w-[120px] cursor-pointer rounded-[6px] '
                  onChange={(e: any) => handleRafflerSortChange(e.target.value)}
                >
                  <option value="raffle_create">Raffles Created</option>
                  <option value="ticket_sold">Tickets Sold</option>
                  <option value="volume">Volume</option>
                </select>
              </div>
            </div>
            <div className='border-[#5a2fbe] border-solid border-[1px] text-black rounded-2xl p-3 nftItem-shadow mt-4 ' >
              <div className='flex items-center' >
                <div className='w-[20%] text-center border-b-2 border-purple-500 pb-2 font-black' >Rank</div>
                <div className='w-[20%] text-center border-b-2 border-purple-500 pb-2 font-black' >User</div>
                <div className='w-[20%] text-center border-b-2 border-purple-500 pb-2 font-black' >Raffles</div>
                <div className='w-[25%] text-center border-b-2 border-purple-500 pb-2 font-black' >Tickets Sold</div>
                <div className='w-[25%] text-center border-b-2 border-purple-500 pb-2 font-black' >Volume</div>
              </div>
              {
                !raffleLoading && 
                 raffleGroupByList?.map((item: any, index: number) => (
                  <div className='flex items-cetner pt-3' style={{alignItems: "center"}} key={index} >
                        {
                          index === 0 && <div className={
                            "bg-gradient-to-b from-yellow-400 to-yellow-500  border-4 border-yellow-500 1w-[20%] text-center badge text-white rounded-full flex items-center justify-center h-10 w-10 ml-3"
                            } >{index+1}</div>
                        }
                        {
                            index === 1 && <div className={
                              "bg-gradient-to-b from-gray-400 to-gray-500  border-4 border-gray-500 1w-[15%] text-center badge text-white rounded-full flex items-center justify-center h-10 w-10 ml-3"
                              } >{index+1}</div>
                        }
                        {
                            index === 2 && <div className={
                              "bg-gradient-to-b from-orange-400 to-orange-500  border-4 border-orange-500 1w-[15%] text-center badge text-white rounded-full flex items-center justify-center h-10 w-10 ml-3"
                              } >{index+1}</div>
                        }
                        {
                          (index !=0 && index !=1 && index !=2 )&& <div className={
                            "1w-[15%] text-center badge text-black rounded-full flex items-center justify-center h-10 w-10 ml-3"
                            } >{index+1}</div>
                        }
                    <div className='w-[35%] text-center font-bold text-purple-500 block  truncate'>
                      {
                      item.discord !== undefined && item.discord }
                      {
                        (item.discord === undefined && item.twitter !== undefined) && item.twitter 
                      }
                      {
                        (item.discord === undefined && item.twitter === undefined) && item.seller.slice(0, 3) + "..." + item.seller.slice(-4)
                      }
                    </div>
                    <div className='w-[20%] text-center' >{item.sellerCount?.length}</div>
                    <div className='w-[25%] text-center' >{item.soldTicketAmount}</div>
                    <div className='w-[25%] text-center' >{item.soldVolume.toFixed(4)}</div>
                  </div>
                ))
                }
            </div>
          </div>
          <div className="basis-[48%]" >
            <div className="w-full flex justify-between items-center  " >
              <p className="text-black font-bold text-xl" >Top Raffle Buyers</p>
              <div className='flex items-center gap-2' >
                <select
                  defaultValue={"all"}
                  onChange={(e: any) => handleRafflerDayChange(e.target.value, false)}
                  className='border-[1px] border-solid border-[grey] p-[4px] min-w-[80px] cursor-pointer rounded-[6px] '
                >
                  <option value="all">All</option>
                  <option value="twoWeek">2W</option>
                  <option value="day">1D</option>
                </select>
                <select
                  defaultValue={"volume"}
                  id="countries"
                  className='border-[1px] border-solid border-[grey] p-[4px] min-w-[120px] cursor-pointer rounded-[6px] '
                  onChange={(e: any) => handleBuyRafflerSortChange(e.target.value)}
                >
                  <option value="raffle_bought">Raffles Bought</option>
                  <option value="ticket_bought">Tickets Bought</option>
                  <option value="raffle_won">Raffles Won</option>
                  <option value="volume">Volume</option>
                </select>
              </div>
            </div>
            <div className='bg-white border-[#5a2fbe] border-solid border-[1px] text-black rounded-2xl p-3 nftItem-shadow mt-4 ' >
                <div className='flex items-cetner' >
                  <div className='w-[15%] text-center border-b-2 border-purple-500 pb-2 font-black' >Rank</div>
                  <div className='w-[35%] text-center border-b-2 border-purple-500 pb-2 font-black' >User</div>
                  <div className='w-[15%] text-center border-b-2 border-purple-500 pb-2 font-black' >Raffles</div>
                  <div className='w-[15%] text-center border-b-2 border-purple-500 pb-2 font-black' >Tickets</div>
                  <div className='w-[15%] text-center border-b-2 border-purple-500 pb-2 font-black' >Won</div>
                  <div className='w-[15%] text-center border-b-2 border-purple-500 pb-2 font-black' >Volume</div>
                </div>
                  { 
                      !raffleLoading && 
                      buyTicketLists?.map((item: any, index: number) => (
                      <div className="flex items-cetner pt-3 " style={{alignItems: 'center'}} key={index}>
                        {
                          index === 0 && <div className={
                            "bg-gradient-to-b from-yellow-400 to-yellow-500  border-4 border-yellow-500 1w-[15%] text-center badge text-white rounded-full flex items-center justify-center h-10 w-10 ml-3"
                            } >{index+1}</div>
                        }
                        {
                            index === 1 && <div className={
                              "bg-gradient-to-b from-gray-400 to-gray-500  border-4 border-gray-500 1w-[15%] text-center badge text-white rounded-full flex items-center justify-center h-10 w-10 ml-3"
                              } >{index+1}</div>
                        }
                        {
                            index === 2 && <div className={
                              "bg-gradient-to-b from-orange-400 to-orange-500  border-4 border-orange-500 1w-[15%] text-center badge text-white rounded-full flex items-center justify-center h-10 w-10 ml-3"
                              } >{index+1}</div>
                        }
                        {
                          (index !=0 && index !=1 && index !=2 )&& <div className={
                            "1w-[15%] text-center badge text-black rounded-full flex items-center justify-center h-10 w-10 ml-3"
                            } >{index+1}</div>
                        }
                        
                        <div className='w-[35%] text-center font-bold text-purple-500 block  truncate' >
                          {
                            item.discord !== undefined && item.discord }
                          {
                            (item.discord === undefined && item.twitter !== undefined) && item.twitter 
                          }
                          {
                            (item.discord === undefined && item.twitter === undefined) && item.buyer.slice(0, 3) + "..." + item.buyer.slice(-4)
                          }
                        </div>
                        <div className='w-[15%] text-center' >{item.buyerCount}</div>
                        <div className='w-[15%] text-center' >{item.ticketAmount}</div>
                        <div className='w-[15%] text-center' >{item.wonCount}</div>
                        <div className='w-[15%] text-center' >{item.buyVolume.toFixed(4)}</div>
                      </div>
                      ))
                  }
              </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default LeaderBoard