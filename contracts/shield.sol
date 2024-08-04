pragma solidity ^0.8.19;

import "./verifier.sol";

contract Shield is Groth16Verifier {

  uint256[5] publicHashes;

  constructor(uint256[5] memory _publicHashes) {
    publicHashes = _publicHashes;
  }


  function verify(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[5] calldata _pubSignals) external view returns (bool isValid) {
    bool isHashEqual = isArrayEqual(_pubSignals);
    bool proofVerification = verifyProof(_pA, _pB, _pC, _pubSignals);
  
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
