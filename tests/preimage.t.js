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

const circomlibjs = require("circomlibjs");
const snarkjs = require("snarkjs");
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

describe("PreImage Test", function () {
  this.timeout(100000);

  it("Should model addition", async () => {
    const circuit = await wasm_tester(
      path.join(__dirname, "../circuits", "PreImage.circom")
    );

    await circuit.loadConstraints();

    const preImages = ["hello", "world", "circom", "rust", "zkp"];
    const preImagesFieldElement = preImages.map((preImage) =>
      stringToFieldElement(preImage)
    );
    console.log(preImagesFieldElement);
    const poseidonHashes = await Promise.all(
      preImagesFieldElement.map(async (preImage) => {
        return await poseidonHash(preImage);
      })
    );

    // console.log(poseidonHashes);
    const poseidonHashesBigInt = poseidonHashes.map(poseidonHash => BigInt(poseidonHash));
    console.log(poseidonHashesBigInt)

    await circuit.calculateWitness(
      {
        hashes: poseidonHashes,
        preImage: preImagesFieldElement[3],
      },
      true
    );
  });
});
