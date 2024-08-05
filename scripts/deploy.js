const hre = require("hardhat");
// const ethers = require("ethers");
const circomlibjs = require("circomlibjs");
const snarkjs = require("snarkjs");

const fs = require("fs");

const chai = require("chai");
const { wasm } = require("circom_tester");
const path = require("path");
const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);
const Fr = new F1Field(exports.p);
const chaiAsPromised = require("chai-as-promised");
const wasm_tester = require("circom_tester").wasm;
const crypto = require("crypto");
const bigInt = require("big-integer");

function stringToFieldElement(str) {
  // Convert string to a hex representation of its SHA256 hash
  const hash = crypto.createHash("sha256").update(str).digest("hex");
  let num = bigInt(hash, 16);
  const FIELD_SIZE = bigInt(
    "21888242871839275222246405745257275088548364400416034343698204186575808495617"
  );
  num = num.mod(FIELD_SIZE);

  return num.toString();
}

async function poseidonHash(input) {
  const poseidon = await circomlibjs.buildPoseidon();
  const hash = poseidon([input]);
  return poseidon.F.toString(hash);
}

chai.use(chaiAsPromised);
const expect = chai.expect;

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Deploying verifier.....");

  const Verifier = await hre.ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();

  console.log("Verifier deployed to: ", verifier.target);

  console.log("Setting up circuit hashes");

  const preImages = ["hello", "world", "circom", "rust", "zkp"];
  const preImagesFieldElement = preImages.map((preImage) =>
    stringToFieldElement(preImage)
  );
  const poseidonHashes = await Promise.all(
    preImagesFieldElement.map(async (preImage) => {
      return await poseidonHash(preImage);
    })
  );


  const Shield = await ethers.getContractFactory("Shield");
  const shield = await Shield.deploy(poseidonHashes, verifier.target);

  console.log("Shield contract deployed to:", shield.target);

  const {proof, publicSignals} = await snarkjs.groth16.fullProve(
    {
      hashes: poseidonHashes,
      preImage: preImagesFieldElement[3],
    },
    "output/PreImage_js/PreImage.wasm",
    "output/PreImage_0001.zkey"
  );

  
  const pA = proof.pi_a.slice(0, 2);
  const pB = [                      
    proof.pi_b[0].slice(0, 2).reverse(),
    proof.pi_b[1].slice(0, 2).reverse()
  ];
  const pC = proof.pi_c.slice(0, 2);
  
  console.log("pA:", pA);
  console.log("pB:", pB);
  console.log("pC:", pC);
  console.log("publicSignals:", publicSignals);

  const isVerified = await shield.verify(pA, pB, pC, publicSignals);

  console.log(isVerified);


  

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });