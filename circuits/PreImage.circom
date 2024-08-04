pragma circom  2.1.6;

include "../node_modules/circomlib/circuits/poseidon.circom";

template PreImage(n) {
  signal input hashes[n];
  signal input preImage;

  component poseiden = Poseidon(1);
  poseiden.inputs[0] <== preImage;

  signal isHashPresent[n];

  isHashPresent[0] <== hashes[0] - poseiden.out;
  for(var i = 1; i<n; i++) {
    isHashPresent[i] <== isHashPresent[i - 1] * (hashes[i] - poseiden.out);
  }

  isHashPresent[n - 1] === 0;
}

component main{public [hashes] } = PreImage(5);