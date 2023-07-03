import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import Navbar from "../../components/Navbar";
import searchIcon from "../../assets/search-icon.png";
import RaffleItem from "../../components/RaffleItem";
import FilterRaffles from "./FilterRaffle";
import { datetimeLocal } from "../../utils";
import { getAllRaffle } from "../../services/api";
import RaffleSwiper from "./RaffleSwiper";
import { isReadable } from "stream";

const Raffle = () => {
  const storeData = useSelector((status) => status)
  const [raffleData, setRaffleData] = useState<any[]>([]);
  const [featuredData, setFeaturedData] = useState<any[]>([]);
  const [featuredEndingSoon, setFeaturedEndingSoon] = useState<any[]>([]);
  const [pastData, setPastData] = useState<any[]>([]);
  const [selectRaffleData, setSelectRaffleData] = useState<any>([]);

  const [isLoading, setLoading] = useState(false);
  const [isFeatured, setFeatured] = useState(true);
  const [isAllRaffles, setAllRaffles] = useState(false);
  const [isPastRaffles, setPastRaffles] = useState(false);
  const [filterData, setFilterData] = useState<any>({
    tokenId: ``,
    name: ``,
    endDate: new Date()
  })
  const [filterByItem, setFilterByItem] = useState<any>([])
  const [searchNft, setSearchNft] = useState(``)
  const [filterSideBar, setFilterSideBar] = useState(true)
  const [sortList, setSortList] = useState<any[]>([]);
  const [sortListData, setSortListData] = useState<any[]>([]);

  const handleFeatured = () => {
    setFeatured(true);
    setAllRaffles(false);
    setPastRaffles(false);
    setFilterSideBar(true)
  };
  const handleAllRaffles = () => {
    setFeatured(false);
    setAllRaffles(true);
    setPastRaffles(false);
    setFilterSideBar(true)

  };
  const handlePastRaffles = () => {
    setFeatured(false);
    setAllRaffles(false);
    setPastRaffles(true);
    setFilterSideBar(true)

  };
  const handleFilterRaffles = () => {
    if(isFeatured) setSelectRaffleData([...featuredData]);
    if(isAllRaffles) setSelectRaffleData([...raffleData]);
    if(isPastRaffles) setSelectRaffleData([...pastData]);
    setFilterSideBar(!filterSideBar)
  };

  const handleSearchNft = (input: any) => {
    setSearchNft(input)
    if(!input){
    }
    let temp: any = [];
    if(isFeatured) temp = featuredData;
    if(isPastRaffles) temp = pastData;
      const filtered_name = !input ? selectRaffleData
        : selectRaffleData.filter((item: any) => item.name.toLowerCase().includes(input.toLowerCase()))
      setFilterByItem([...filtered_name])
  }

  const handleRecentlySort = () => {
    let current_time = new Date().getTime();
    const res = selectRaffleData.filter((item: any) =>  item.start_date > current_time / 1000 - 10 * 60 * 60)
    setFilterByItem([...res]);
    let temp_sort = sortList;
    temp_sort.push("Recently Added")
    setSortList([...temp_sort]);
  }

  const handleExpiringSoonSort = () => {
    const res = selectRaffleData.sort((a: any, b: any) => a.end_date - b.end_date)
    setFilterByItem([...res])
    let temp_sort = sortList;
    if(!temp_sort.includes("Expiring Soon")){
      temp_sort.push("Expiring Soon")
      setSortList([...temp_sort]);
    }
  }

  const handleSellingOutSoonSort = () => {
    const res = selectRaffleData.sort((a: any, b: any) => a.count - b.count)
    setFilterByItem([...res])
    let temp_sort = sortList;
    if(!temp_sort.includes("Selling Out Soon")){
      temp_sort.push("Selling Out Soon")
      setSortList([...temp_sort]);
    }
  }

  const handlePriceAscendingSort = () => {
    const res = selectRaffleData.sort((a: any, b: any) => a.price - b.price)
    setFilterByItem([...res])
    let temp_sort = sortList;
    if(!temp_sort.includes("Price (Ascending)")){
      temp_sort.push("Price (Ascending)")
      setSortList([...temp_sort]);
    }
  }
  const handlePriceDescendingSort = () => {
    const res = selectRaffleData.sort((a: any, b: any) => b.price - a.price)
    setFilterByItem([...res])
    let temp_sort = sortList;
    if(!temp_sort.includes("Price (descending)")){
      temp_sort.push("Price (descending)")
      setSortList([...temp_sort]);
    }
  }

  const handleFilterApplyBtn = () => {
    const filtered_endDate = !filterData.endDate ? selectRaffleData
      : selectRaffleData.filter((item: any) => item.end_date < (new Date(filterData.endDate).getTime()) / 1000)

    const filtered_name = !filterData.name ? filtered_endDate
      : filtered_endDate.filter((item: any) => item.name.toLowerCase().includes(filterData.name.toLowerCase()))
    const filtered_tokenId = !filterData.tokenId
      ? filtered_name
      : filtered_name.filter((item: any) =>
        item.tokenId.toString() === filterData.tokenId
      );

    setFilterByItem(filtered_tokenId)

  }

  const handleFilterClearBtn = () => {
    setFilterData({
      ...filterData,
      tokenId: ``,
      name: ``,
      endDate: new Date
    })
  }

  const getData = async () => {
    try {

      const getRaffle: any = await getAllRaffle();
      const temp_featuredEndSoonData = getRaffle.filter(
        (item: any) => item.end_date >= Date.now() / 1000 && item.end_date - Date.now() / 1000 <= 60 * 60
        ).sort((a: any, b: any) => a.end_date - b.end_date);
      
      const temp_featuredData = getRaffle.filter(
        (item: any) => item.end_date >= Date.now() / 1000 && Date.now() / 1000 >= item.start_date
      );

      const temp_pastData = getRaffle.filter(
        (item: any) => item.end_date < Date.now() / 1000
      );
      setFeaturedData([...temp_featuredData]);
      setFeaturedEndingSoon([...temp_featuredEndSoonData]);
      setPastData([...temp_pastData]);
      setRaffleData([...getRaffle]);
      if(isFeatured) setFilterByItem([...temp_featuredData])
      if(isAllRaffles) setFilterByItem([...getRaffle])
      if(isPastRaffles) setFilterByItem([...temp_pastData])
      

    } catch (error) {
      console.log("error", error);
      setLoading(false)
    }
  };

  const removeSortList = (idx: number) => {
    let temp_sortList = sortList
    temp_sortList.splice(idx, 1);
    setSortList([...temp_sortList]);
  }

  const sortListAllRemove = () => {
    setSortList([]);
  }

  useEffect(() => {
    if(isFeatured) setSelectRaffleData([...featuredData]);
    if(isAllRaffles) setSelectRaffleData([...raffleData]);
    if(isPastRaffles) setSelectRaffleData([...pastData]);
    setFilterSideBar(!filterSideBar);
  }, [isFeatured, isAllRaffles, isPastRaffles])
  
  useEffect(() => {
    (async () => {
      setLoading(true);
      await getData();
      setLoading(false);
    })();
  }, [storeData, isFeatured, isAllRaffles, isPastRaffles]);
  return (
    <div className="bg-white min-h-[100vh] ">
      <Navbar />
      {/* <Menus /> */}
      <div className="max-w-[1280px] m-auto pt-8 px-4">
        <div className="text-white rounded-[12px] bg-[#8652FF] py-[12px] px-[50px] max-w-fit  my-[0] mx-[auto] text-[24px] md:text-[42px] " >FEATURED ENDING SOON </div>
        <RaffleSwiper featuredData={featuredEndingSoon} />
        <div className="flex md:flex-col lg:flex-row justify-between items-center mt-[32px] md:mt-[60px] ">
          <button
            type="button"
            onClick={handleFilterRaffles}
            className={`${filterSideBar
              ? "flex items-center py-3 px-5 bg-[#8652FF] text-white border border-white rounded-[0.7rem]"
              : "flex items-center py-3 px-5 bg-[white] border-[1px] border-[solid] border-[transparent] text-[#666666] hover:text-[#8652FF]  rounded-[0.7rem] hover:border-[#8652FF] "
              }`}
          >
            <svg
              width="21"
              height="20"
              viewBox="0 0 21 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.7713 16.32L19.7013 15.5C19.7213 15.33 19.7413 15.17 19.7413 15C19.7413 14.83 19.7313 14.67 19.7013 14.5L20.7613 13.68C20.8513 13.6 20.8813 13.47 20.8213 13.36L19.8213 11.63C19.7613 11.5 19.6313 11.5 19.5013 11.5L18.2713 12C18.0013 11.82 17.7313 11.65 17.4213 11.53L17.2313 10.21C17.2213 10.09 17.1113 10 17.0013 10H15.0013C14.8713 10 14.7613 10.09 14.7413 10.21L14.5513 11.53C14.2513 11.66 13.9613 11.82 13.7013 12L12.4613 11.5C12.3513 11.5 12.2213 11.5 12.1513 11.63L11.1513 13.36C11.0913 13.47 11.1113 13.6 11.2113 13.68L12.2713 14.5C12.2513 14.67 12.2413 14.83 12.2413 15C12.2413 15.17 12.2513 15.33 12.2713 15.5L11.2113 16.32C11.1213 16.4 11.0913 16.53 11.1513 16.64L12.1513 18.37C12.2113 18.5 12.3413 18.5 12.4613 18.5L13.7013 18C13.9613 18.18 14.2413 18.35 14.5513 18.47L14.7413 19.79C14.7613 19.91 14.8613 20 15.0013 20H17.0013C17.1113 20 17.2213 19.91 17.2413 19.79L17.4313 18.47C17.7313 18.34 18.0013 18.18 18.2713 18L19.5013 18.5C19.6313 18.5 19.7613 18.5 19.8313 18.37L20.8313 16.64C20.8913 16.53 20.8613 16.4 20.7713 16.32ZM16.0013 16.5C15.1613 16.5 14.5013 15.83 14.5013 15C14.5013 14.17 15.1713 13.5 16.0013 13.5C16.8313 13.5 17.5013 14.17 17.5013 15C17.5013 15.83 16.8313 16.5 16.0013 16.5ZM1.00132 0C0.781322 0 0.571323 0.08 0.381323 0.22C-0.0486774 0.56 -0.128677 1.19 0.211323 1.62L5.97132 9H6.00132V14.87C5.96132 15.16 6.06132 15.47 6.29132 15.7L8.30132 17.71C8.65132 18.06 9.19132 18.08 9.58132 17.8C9.20132 16.91 9.00132 15.96 9.00132 15C9.00132 13.73 9.35132 12.5 10.0013 11.4V9H10.0313L15.7913 1.62C16.1313 1.19 16.0513 0.56 15.6213 0.22C15.4313 0.08 15.2213 0 15.0013 0H1.00132Z"
                fill="currentColor"
              />
            </svg>
            <span className="inline-block ml-2 text-base">Filter</span>
          </button>
          <div className="flex items-center justify-between xl:basis-[35%] sm:w-[400px] sm:my-4 lg:my-0">
            <button
              type="button"
              onClick={handleFeatured}
              className={`${isFeatured
                ? "rounded-[10px] raffle-status-active text-[#8652FF] py-3 px-7"
                : "bg-white-500 hover:bg-[#F8F8FF] border-[1px] border-[solid] border-[transparent] text-[#666666] py-3 px-7 hover:text-[#8652FF]  hover:rounded-[10px]"
                }`}
            >
              Featured
            </button>
            <button
              type="button"
              onClick={handleAllRaffles}
              className={`${isAllRaffles
                ? "rounded-[10px] raffle-status-active text-[#8652FF] py-3 px-7"
                : "bg-white-500 hover:bg-[#F8F8FF] border-[1px] border-[solid] border-[transparent] text-[#666666] py-3 px-7 hover:text-[#8652FF]   hover:rounded-[10px]"
                }`}
            >
              All Raffles
            </button>
            <button
              type="button"
              onClick={handlePastRaffles}
              className={`${isPastRaffles
                ? "rounded-[10px] raffle-status-active text-[#8652FF] py-3 px-7"
                : "bg-white-500 hover:bg-[#F8F8FF] border-[1px] border-[solid] border-[transparent] text-[#666666] py-3 px-7 hover:text-[#8652FF]  hover:rounded-[10px] "
                }`}
            >
              Past Raffles
            </button>
          </div>
          {/* {
            isFilterRaffles && */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search Raffles..."
              className=" text-[#000000] placeholder:text-[#666] bg-[#fff] text-base p-3 rounded-[0.6rem] border border-[#ECECEC] outline-none"
              value={searchNft}
              onChange={(e) => handleSearchNft(e.target.value)}
            />
            <img
              src={searchIcon}
              alt="searchIcon"
              className="absolute top-[16px] right-[10px] w-[20px]"
            />
          </div>
        </div>
        {/* Filter Raffle Tab  */}
          <>
            {isLoading ? (
              <div id="preloader"></div>
            ) :
              <div className="bg-white">
                <div className="max-w-[1280px] m-auto pt-8">
                  <div className="flex gap-[1rem]">
                    {
                      filterSideBar &&
                      <div className="basis-[22%]">
                        <div className=" bg-white p-4 mt-6 rounded-[0.6rem] nftItem-shadow ">
                          <h1 className="text-3xl">Sort</h1>
                          <ul className="ml-1">
                            <li className="my-2">
                              <p
                                onClick={handleRecentlySort}
                                className="cursor-pointer text-[#5E5E5E] text-base hover:text-black transition-all"
                              >
                                Recently Added
                              </p>
                            </li>
                            <li className="my-2">
                              <p
                                onClick={handleExpiringSoonSort}
                                className="cursor-pointer text-[#5E5E5E] text-base hover:text-black transition-all"
                              >
                                Expiring Soon
                              </p>
                            </li>
                            <li className="my-2">
                              <p
                                onClick={handleSellingOutSoonSort}
                                className="cursor-pointer text-[#5E5E5E] text-base hover:text-black transition-all"
                              >
                                Selling Out Soon
                              </p>
                            </li>
                            <li className="my-2">
                              <p
                                onClick={handlePriceAscendingSort}
                                className="cursor-pointer text-[#5E5E5E] text-base hover:text-black transition-all"
                              >
                                Price (Ascending)
                              </p>
                            </li>
                            <li className="my-2">
                              <p
                                onClick={handlePriceDescendingSort}
                                className="cursor-pointer text-[#5E5E5E] text-base hover:text-black transition-all"
                              >
                                Price (Descending)
                              </p>
                            </li>
                            <li className="my-2">
                              <p
                                className="cursor-pointer text-[#5E5E5E] text-base hover:text-black transition-all"
                              >
                                Rank (Ascending)
                              </p>
                            </li>
                            <li className="my-2">
                              <p
                                className="cursor-pointer text-[#5E5E5E] text-base hover:text-black transition-all"
                              >
                                Rank (Descending)
                              </p>
                            </li>
                          </ul>
                          <div className="mt-4">
                            <h1 className="text-3xl">Filter</h1>
                            <div className="my-2">
                              <label htmlFor="token">Token</label>
                              <div className="relative border border-[#606060] rounded-[0.5rem] overflow-hidden">
                                <input
                                  type="text"
                                  id="token"
                                  name="token"
                                  placeholder="Search by ID"
                                  className="bg-[#fff] w-full text-[#000] border-[#ECECEC] placeholder:text-[#606060] p-3 outline-none"
                                  value={filterData.tokenId}
                                  onChange={(e) => setFilterData({ ...filterData, tokenId: e.target.value })}
                                />
                              </div>
                            </div>
                            <div className="my-2">
                              <label htmlFor="collection">Collection</label>
                              <div className="relative border border-[#606060] rounded-[0.5rem] overflow-hidden">
                                <input
                                  type="text"
                                  id="collection"
                                  name="collection"
                                  placeholder="Search Collection"
                                  className="bg-[#fff] w-full text-[#000] placeholder:text-[#606060] p-3 outline-none"
                                  value={filterData.name}
                                  onChange={(e) => setFilterData({ ...filterData, name: e.target.value })}
                                />
                              </div>
                            </div>
                            <div className="my-2">
                              <label htmlFor="collection">Floor</label>
                              <div className="flex justify-between">
                                <div className="basis-[48%] relative border border-[#606060] rounded-[0.5rem] overflow-hidden">
                                  <input
                                    type="type"
                                    id="collection"
                                    name="collection"
                                    placeholder="Minimum"
                                    className="bg-[#fff] w-full text-[#000] placeholder:text-[#606060] p-3 outline-none"
                                  />
                                </div>
                                <div className="basis-[48%] relative border border-[#606060] rounded-[0.5rem] overflow-hidden">
                                  <input
                                    type="type"
                                    id="collection"
                                    name="collection"
                                    placeholder="Maximum"
                                    className="bg-[#fff] w-full text-[#606060] placeholder:text-[#606060] p-3 outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="my-2">
                              <label htmlFor="collection">End Date</label>
                              <div className="relative border border-[#606060] rounded-[0.5rem] overflow-hidden">
                                <input
                                  type="datetime-local"
                                  id="collection"
                                  name="collection"
                                  placeholder="Search Collection"
                                  className="bg-[#fff] w-full text-[#000] placeholder:text-[#606060] p-3 outline-none"
                                  value={datetimeLocal(filterData.endDate)}
                                  onChange={(e) => setFilterData({ ...filterData, endDate: new Date(e.target.value) })}
                                />
                              </div>
                            </div>
                            <div className="mt-6 mb-2">
                              <div className="flex justify-between">
                                <button
                                  type="button"
                                  className="basis-[48%] rounded-[0.6rem] text-white bg-[#8652FF] py-3"
                                  onClick={handleFilterApplyBtn}
                                >
                                  Apply
                                </button>

                                <button
                                  type="button"
                                  className="basis-[48%] rounded-[0.6rem] text-[#666666] bg-[#ECECEC] py-3"
                                  onClick={handleFilterClearBtn}
                                >
                                  Clear All
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                    <div className={` ${filterSideBar ? `basis-[77%]` : `basis-[100%]`}`}>
                      {
                        (Array(sortList) && sortList.length > 0 && filterSideBar) && 
                          <div className="flex gap-[1rem] justify-left flex-wrap items-center p-4">
                            <div className="text-lg">Showing:</div>
                            <button onClick={() => sortListAllRemove() } style={{display:'flex', alignItems:'center !important', fontSize: '12px'}} className="flex gap-[1rem] item-center rounded-[10px] raffle-status-active py-1 px-2 text-[#666666]">
                                  <span>Clear All</span>
                                  <svg xmlns="http://www.w3.org/2000/svg" width={"20"} height={"20"} viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12 6 6m6 6 6 6m-6-6 6-6m-6 6-6 6"/></svg>
                                </button>
                            {
                              sortList.map((item: any, index: number) => (
                                <button onClick={() => removeSortList(index)} style={{display:'flex', alignItems:'center !important', fontSize: '12px'}} className="flex gap-[1rem] item-center rounded-[10px] raffle-status-active py-1 px-2 text-[#666666]">
                                  <span>{item}</span>
                                  <svg xmlns="http://www.w3.org/2000/svg" width={"20"} height={"20"} viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12 6 6m6 6 6 6m-6-6 6-6m-6 6-6 6"/></svg>
                                </button>
                              ))
                            }
                          </div>
                      }
                      <div className="flex gap-[1rem] justify-left mt-4 flex-wrap pb-12 md:max-w-[768px] lg:max-w-[100%] sm:max-w-[100%] md:m-auto">
                        {isLoading ? (
                          <div id="preloader"></div>
                        ) : filterByItem.length > 0 ? (
                          filterByItem.map((item: any, id: any) => (
                            <RaffleItem item={item} isFeatured={isFeatured} key={id} index={id} />
                          ))
                        ) : (
                          <div className="w-full text-center text-black">There is no Featured Raffle Data</div>
                        )}
                      </div>     
                    </div>
                    
                  </div>
                </div>
              </div>
            }

          </>
      </div>
    </div>
  );
};

export default Raffle;
