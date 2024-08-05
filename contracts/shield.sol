pragma solidity ^0.8.19;

import "./verifier.sol";

contract Shield {

  uint256[5] publicHashes;
  Groth16Verifier verifier;
  constructor(uint256[5] memory _publicHashes, address _verifierAddress) {
    publicHashes = _publicHashes;
    verifier = Groth16Verifier(_verifierAddress);
  }


  function verify(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[5] calldata _pubSignals) external view returns (bool isValid) {
    bool isHashEqual = isArrayEqual(_pubSignals);
    bool proofVerification = verifier.verifyProof(_pA, _pB, _pC, _pubSignals);
  
    isValid = isHashEqual && proofVerification;
  } 

  // using XOR to be gas effecient
  function isArrayEqual(uint256[5] memory publicSignals) internal view returns (bool) {
    uint256 checksum1;
    uint256 checksum2;
  
    for(uint i = 0; i< 5; i++) {
      checksum1 ^= publicHashes[i];
      checksum2 ^= publicSignals[i];
    }
    return checksum1 == checksum2;
  }
}
