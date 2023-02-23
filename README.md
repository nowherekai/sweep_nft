# 简单NFT扫货合约

## 说明
[contracts/NFTSweep.sol](./contracts/NFTSweep.sol) 扫货合约主要逻辑

[test/NFTSweep.t.js](./test/NFTSweep.t.js) 本地测试，使用Mock的NFT市场合约

[scripts/run_nft_sweep.js](./scripts/run_nft_sweep.js) 使用js调用扫货合约，需要传入或生成所需的calldata

[goerli 部署好的合约](https://goerli.etherscan.io/address/0xff633585E090F84F5a2C19CF73DAE2eD2f66dd49)

[scripts/test_seaport.js](./scripts/test_seaport.js) hack 本机的 openseajs，得到order的calldata数据，然后作为参数调用扫货合约。本代码只是展示实现逻辑，要跑通需要做一些其他工作。另外由于我电脑本机配置的代理问题没解决，opensea的api通过代理才能访问，只能采取搭建新的前端项目获取calldata，使用浏览器的代理功能。

[scripts/test_looksrare.js](./scripts/test_looksrare.js) looksrare的数据获取和测试

### opensea 测试结果
opensea 测试网上找到两个出售的NFT，获取calldata，然后作为参数传递给合约，两个NFT都购买成功

[两个订单都成功](https://goerli.etherscan.io/tx/0x926b0e43e7e7c6d051752703523102571d5acaea381fe8d4c380b32a87569539)


测试网上找到两个出售的NFT，获取calldata，然后用另一个钱包购买第一个订单使它失效.  两个order的calldata作为参数传递给合约，一个失败一个成功，符合预期。

[一个失败一个成功](https://goerli.etherscan.io/tx/0x7d3fdfbc5ef6b3d4edcd1c4c2ff2dc758fcbb81ad18d9e9c355944d98b319baf)

### looksrare 测试
[一个订单成功](https://goerli.etherscan.io/tx/0xacee3ae65454bbbf08af6b1cdc0437a9ba0ca71aa1b3aa015b2c6ee55ab95212)

### 多个交易所混合

## 过程
1. 开发扫货合约，编写本地测试和部署脚本。部署到goerli

2. 使用openseajs获取订单的calldata

不知道如何获取opensea订单的calldata，咨询@Shawn。

安装openseajs 遇到了一些问题，最后通过更新node和npm版本解决

openseajs sdk 调用遇到了本机代理问题(没有代理无法访问)，没有找到解决方案。另搭了一个前端项目使用浏览器代理，openseasdk 正常使用。

阅读和hack opensea代码，返回calldata数据。

把calldata传递合约，调用失败，用sendTranaction 成功。阅读seaport合约代码，猜测是filfull basic order 用到了msg.sender

换成了filfull advanced 方法，测试网调试opensea成功。

3. 接入LooksRare 交易所

获取和生成looksrare订单数据

使用call没有跑通，阅读代码发现是因为LooksRareExchange合约里面判断了`msg.sender == to`

因此必须修改调用LooksRare合约的数据，把to换成扫货合约的地址，然后调用looksrare合约，它会把token转移给扫货合约。
扫货合约再tansfer给原来的to地址。

为了方便扩展，使用了代理模式，修改looksrare订单以及转移nft的逻辑都在LooksRareLogic 合约里面，扫货合约通过delegatecall调用它。
这样再增加其他市场时，无需修改扫货合约本身，只要新增适配合约即可。

补了本地测试，修改部署脚本和增加市场的脚本等.

## 安装测试和部署
```
npm install #安装依赖

npx hardhat test #测试
npx hardhat run scripts/deploy_NFTSweep.js #部署

npx hardhat run scripts/run_nft_sweep.js #使用js进行线上或本地测试
```
