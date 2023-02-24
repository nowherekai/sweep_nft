# NFT扫货合约

## 实现的功能

完成挑战：

- [x] 通过合约，在 OpenSea NFT 交易平台，一次调用完成多个 NFT 的购买；
- [x] 购买多个 NFT 时，其中一个失败，不影响其他 NFT 购买；
- [x] 通过合约，一次调用完成多个平台 (OpenSea, LooksRare, x2y2 等）多个合约购买。

完成了扫货合约的开发、测试和部署，在goerli测试链上调通了OpenSea和LooksRare的购买，可以一次调用完成在两个平台的购买。
现在只支持seaport 的fulfillAdvancedOrder方法和looksrare的matchAskWithTakerBidUsingETHAndWETH方法调用.

使用JS获取OpenSea和LooksRare订单数据，并根据订单数据生成交易平台合约所需calldata功能，可以进一步完善成可复用代码。

## 说明

[goerli 部署好的合约](https://goerli.etherscan.io/address/0xff633585E090F84F5a2C19CF73DAE2eD2f66dd49)

[contracts/NFTSweep.sol](./contracts/NFTSweep.sol) 扫货合约主要逻辑

`addMarket(address marketAddr, bool useDelegate)` 增加NFT市场合约地址后就可以调用对应合约

`function batchBuyFromMarkets(GeneralOrder[] memory orders)` 批量购买入口，可以从多个NFT市场购买多个NFT

有些NFT市场合约可直接call调用，有些合约必须在调用之前和之后做一些额外处理工作，因此使用delegatecall间接调用

[contracts/LooksRareLogic.sol](./contracts/LooksRareLogic.sol) 适配LooksRare的合约，LooksRare无法直接使用call调用

解码 LooksRare 购买订单的数据，然后修改数据后（把to改成扫货合约地址）再传递给LooksRare 合约，调用LooksRare成功是把token转移给了扫货合约，此时需要再转移给用户.

[test/NFTSweep.t.js](./test/NFTSweep.t.js) 本地测试，使用Mock的NFT市场合约

[scripts/deploy_NFTSweep.js](./scripts/deploy_NFTSweep.js) 部署合约

[scripts/add_markets.js](./scripts/add_markets.js) 添加市场

[scripts/run_nft_sweep.js](./scripts/run_nft_sweep.js) 使用js调用扫货合约，需要传入或生成所需的calldata

[scripts/test_seaport.js](./scripts/test_seaport.js) hack 本机的 openseajs，得到order的calldata数据，然后作为参数调用扫货合约。本代码只是展示实现逻辑，要跑通需要做一些其他工作。另外由于我电脑本机配置的代理问题没解决，opensea的api通过代理才能访问，只能采取搭建新的前端项目获取calldata，使用浏览器的代理功能。

[scripts/test_looksrare.js](./scripts/test_looksrare.js) looksrare的数据获取和测试

[scripts/test_multmarket.js](./scripts/test_multmarket.js) 一次调用OpenSea和LooksRare两个市场合约测试

## goerli测试结果

### 多个交易所混合测试

looksrare和opensea 测试网找到合适的订单，生成数据，然后调用扫货合约一次购买两个不同市场的订单

[looksrae和opensea各一个订单](https://goerli.etherscan.io/tx/0xc4139f1949fa7747be59891d683ea9574de2cc082b09c6c73f4c2584f3dc945d)

测试成功, 一个调用分别从LooksRare和OpenSea购买

Internal Txns中可以看到详情, 0xd112466471b5438c1ca2d218694200e49d81d047是LooksRare合约，0x00000000006c3852cbEf3e08E8dF289169EdE581是seaport合约

### opensea goerli 测试结果

opensea 测试网上找到两个出售的NFT，获取calldata，然后作为参数传递给合约，两个NFT都购买成功

[两个订单都成功](https://goerli.etherscan.io/tx/0x926b0e43e7e7c6d051752703523102571d5acaea381fe8d4c380b32a87569539)

测试网上找到两个出售的NFT，获取calldata，然后用另一个钱包购买第一个订单使它失效.  两个order的calldata作为参数传递给合约，一个失败一个成功，符合预期。

[一个失败一个成功](https://goerli.etherscan.io/tx/0x7d3fdfbc5ef6b3d4edcd1c4c2ff2dc758fcbb81ad18d9e9c355944d98b319baf)

### looksrare goerli 测试

[一个订单成功](https://goerli.etherscan.io/tx/0xacee3ae65454bbbf08af6b1cdc0437a9ba0ca71aa1b3aa015b2c6ee55ab95212)


## 开发过程

1. 开发扫货合约，编写本地测试和部署脚本。部署到goerli

2. 使用openseajs获取订单的calldata，接入seaport合约成功

不知道如何获取opensea订单的calldata，咨询@Shawn。

安装openseajs 遇到了一些问题，通过更新node和npm版本解决。
openseajs sdk 调用遇到了本机代理问题(没有代理无法访问)，没有找到解决方案。另搭了一个前端项目使用浏览器代理，openseasdk 正常使用。

阅读并hack openseajs 代码，获取calldata数据。

把calldata传递给扫货合约，调用失败，用sendTranaction 成功。阅读seaport合约代码，猜测是filfull basic order 用到了msg.sender

换成了filfull advanced 方法，测试网调试opensea成功。

多个订单调试也成功。

3. 接入LooksRare 交易所

获取和生成looksrare订单数据

使用solidity call 方法失败，阅读代码发现是因为LooksRareExchange合约里面判断了`msg.sender == to`

通过扫货合约调用LooksRare合约时，必须修改调用LooksRare合约的数据，把to换成扫货合约的地址，然后再调用looksrare合约，它会把token转移给扫货合约。
扫货合约再tansfer给原来的to地址。

修改NFTSweep合约逻辑，给Market增加了useDelegate参数,同时在batchBuyFromMarkets方法里面判断使用call还是delegatecall。
针对LooksRare 增加了LooksRareLogic合约，它用来适配LooksRare 。

为了方便扩展，使用了代理模式，修改looksrare订单以及转移nft的逻辑都在LooksRareLogic 合约里面，扫货合约通过delegatecall调用它。
这样再增加其他市场时，无需修改扫货合约本身，只要新增适配合约即可。

补了本地测试，修改部署脚本和增加市场的脚本等.

4. 一次从多个交易所购买多个订单

构造looksrare订单和opensea订单测试，测试成功

## 进一步工作

- [ ] 调试searport和LooksRare更多购买方法
- [ ] 接入更多NFT交易合约
- [ ] 获取订单数据、根据订单数据生成calldata功能整理成可复用代码
- [ ] 优化gas使用

## 安装测试和部署

```
npm install #安装依赖

npx hardhat test #测试

npx hardhat run scripts/deploy_NFTSweep.js #部署

npx hardhat run scripts/add_market.js #增加适配的NFT市场

npx hardhat run scripts/run_nft_sweep.js #使用js进行线上或本地测试
npx hardhat run scripts/test_seaport.js #使用js进行线上或本地测试
npx hardhat run scripts/test_looksrare.js #使用js进行线上或本地测试
```
