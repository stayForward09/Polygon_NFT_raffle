import { ethers } from "hardhat";

async function main() {
  
  const raffle721 = await ethers.deployContract("nft721Raffle");
  await raffle721.waitForDeployment();
  console.log('raffle721 deployed to:', raffle721.target);
  
  const raffle1155 = await ethers.deployContract("nft1155Raffle");
  await raffle1155.waitForDeployment();
  console.log('raffle1155 deployed to:', raffle1155.target);
  
  const auction721 = await ethers.deployContract("nft721Auction");
  await auction721.waitForDeployment();
  console.log('auction721 deployed to:', auction721.target);
  
  const auction1155 = await ethers.deployContract("nft1155Auction");
  await auction1155.waitForDeployment();
  console.log('auction1155 deployed to:', auction1155.target);

  await raffle721.transferOwnership("0x398818ca588209Fec5348e6CA901629C553c902E");
  await raffle1155.transferOwnership("0x398818ca588209Fec5348e6CA901629C553c902E");
  await auction721.transferOwnership("0x398818ca588209Fec5348e6CA901629C553c902E");
  await auction1155.transferOwnership("0x398818ca588209Fec5348e6CA901629C553c902E");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
