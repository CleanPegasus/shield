# Shield

### Rareskill Circom Bootcamp Homework - 6
Create a ZK circuit that lets you prove you know the preimage of *one* of the hashes in a list.

That is, a smart contract holds a fixed-length array of hashes (MiMC, Poseidon,…, your choice) and you submit a proof that you know the preimage to one of them.

Thus, your circuit takes an input of n hashes (public input) and the preimage of the hash and which hash it is (private input).