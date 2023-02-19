# 简单NFT扫货合约

## 说明
[contracts/NFTSweep.sol](./contracts/NFTSweep.sol) 扫货合约主要逻辑

[test/NFTSweep.t.js](./test/NFTSweep.t.js) 本地测试，使用Mock的NFT市场合约

[scripts/run_nft_sweep.js](./scripts/run_nft_sweep.js) 使用js调用扫货合约，需要传入或生成所需的calldata

[goerli 部署好的合约](https://goerli.etherscan.io/address/0xeeE61026AaC3d5cb750A50959e9A2A810AeB08B6)
[使用错误的数据产生的结果](https://goerli.etherscan.io/tx/0xe8708ebe869e8e44068da48d893748645091ba99764ed64756f2e5229819e3ff)

还没有完成：构造正确的opensea calldata 数据

## 安装测试和部署
```
npm install #安装依赖

npx hardhat test #测试
npx hardhat run scripts/deploy_NFTSweep.js #部署

npx hardhat run scripts/run_nft_sweep.js #使用js进行线上或本地测试
```
