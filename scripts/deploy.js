const hre = require("hardhat");
const ethers = require("ethers");
const circomlibjs = require("circomlibjs");
const snarkjs = require("snarkjs");

const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Shield = await ethers.getContractFactory("Shield");
  const publicHashes = [1, 2, 3, 4, 5]; // Replace with actual public hashes
  const shield = await Shield.deploy(publicHashes);

  console.log("Shield contract deployed to:", shield.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });