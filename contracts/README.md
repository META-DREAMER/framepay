## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Install

```shell
forge install OpenZeppelin/openzeppelin-contracts
forge install thirdweb-dev/contracts
```



### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```



### Deploy

Setup deployer keystore with cast:
```shell
cast wallet import deployer --interactive
```

Deploy:
```shell
$ forge create ./src/StoreManager.sol:StoreManager --rpc-url $BASE_SEPOLIA_RPC --account deployer
```

Verify:
```shell
forge verify-contract <contractAddress> ./src/StoreManager.sol:StoreManager --chain 84532 --watch
```
### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
