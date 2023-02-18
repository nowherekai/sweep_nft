const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("NFTSweep", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContract() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const NFTMock = await ethers.getContractFactory("NFTMock");
    const nftMock = await NFTMock.deploy();
    await nftMock.deployed();

    await nftMock.mintTo(owner.address);
    await nftMock.mintTo(owner.address);
    await nftMock.mintTo(owner.address);
    await nftMock.mintTo(owner.address);

    const MarketPlaceMock = await ethers.getContractFactory("MarketPlaceMock");
    const marketPlaceMock = await MarketPlaceMock.deploy();
    await marketPlaceMock.deployed()

    const MarketPlaceMockTwo = await ethers.getContractFactory("MarketPlaceMock");
    const marketPlaceMockTwo = await MarketPlaceMock.deploy();
    await marketPlaceMockTwo.deployed()

    //hardcode tokenId
    await nftMock.approve(marketPlaceMock.address, 1);
    await nftMock.approve(marketPlaceMock.address, 2);
    await marketPlaceMock.listItem(nftMock.address, 1, ethers.utils.parseEther("0.01"));
    await marketPlaceMock.listItem(nftMock.address, 2, ethers.utils.parseEther("0.01"));

    await nftMock.approve(marketPlaceMockTwo.address, 3);
    await nftMock.approve(marketPlaceMockTwo.address, 4);
    await marketPlaceMockTwo.listItem(nftMock.address, 3, ethers.utils.parseEther("0.01"));
    await marketPlaceMockTwo.listItem(nftMock.address, 4, ethers.utils.parseEther("0.01"));

    const NFTSweep = await ethers.getContractFactory("NFTSweep");
    const nftSweep = await NFTSweep.deploy();
    await nftSweep.deployed();

    await nftSweep.addMarket("0x0000000000000000000000000000000000000000");
    await nftSweep.addMarket(marketPlaceMock.address);
    await nftSweep.addMarket(marketPlaceMockTwo.address);

    return { nftMock, marketPlaceMock, marketPlaceMockTwo, nftSweep, owner, otherAccount };
  }


  describe("batchBuyFromMarkets", function () {
    describe("one market multiple items", function () {
      it("Should work", async function () {
        const { nftSweep, nftMock, marketPlaceMock, owner, otherAccount } = await loadFixture(deployContract);

        let iface = marketPlaceMock.interface;
        let orderData1 = iface.encodeFunctionData("buyItem", [1, otherAccount.address]);
        let orderData2 = iface.encodeFunctionData("buyItem", [2, otherAccount.address]);

        let orders = [ { marketId: 1, value: ethers.utils.parseEther("0.01"), orderData: orderData1 },
          { marketId: 1, value: ethers.utils.parseEther("0.01"), orderData: orderData2 } ];
        await nftSweep.connect(otherAccount).batchBuyFromMarkets(orders, {value: ethers.utils.parseEther("0.02") });

        expect(await nftMock.ownerOf(1)).eq(otherAccount.address);
        expect(await nftMock.ownerOf(2)).eq(otherAccount.address);
      });

      it("Should work if partial failed", async function () {
        const { nftSweep, nftMock, marketPlaceMock, owner, otherAccount } = await loadFixture(deployContract);

        let iface = marketPlaceMock.interface;
        let orderData1 = iface.encodeFunctionData("buyItem", [1, otherAccount.address]);
        let orderData2 = iface.encodeFunctionData("buyItem", [2, otherAccount.address]);

        let orders = [ { marketId: 1, value: ethers.utils.parseEther("0.005"), orderData: orderData1 },
          { marketId: 1, value: ethers.utils.parseEther("0.01"), orderData: orderData2 } ];
        await nftSweep.connect(otherAccount).batchBuyFromMarkets(orders, {value: ethers.utils.parseEther("0.02") });

        expect(await nftMock.ownerOf(1)).eq(owner.address);
        expect(await nftMock.ownerOf(2)).eq(otherAccount.address);
      });
    });

    describe("two market multiple items", function () {
      it("Should work if partial failed", async function () {
        const { nftSweep, nftMock, marketPlaceMock, owner, otherAccount } = await loadFixture(deployContract);

        let iface = marketPlaceMock.interface;
        let orderData1 = iface.encodeFunctionData("buyItem", [1, otherAccount.address]);
        let orderData2 = iface.encodeFunctionData("buyItem", [2, otherAccount.address]);

        let orderData3 = iface.encodeFunctionData("buyItem", [1, otherAccount.address]);

        let orders = [ { marketId: 1, value: ethers.utils.parseEther("0.01"), orderData: orderData1 },
          { marketId: 1, value: ethers.utils.parseEther("0.01"), orderData: orderData2 },
          { marketId: 2, value: ethers.utils.parseEther("0.01"), orderData: orderData3 } ];
        await nftSweep.connect(otherAccount).batchBuyFromMarkets(orders, {value: ethers.utils.parseEther("0.03") });

        expect(await nftMock.ownerOf(1)).eq(otherAccount.address);
        expect(await nftMock.ownerOf(2)).eq(otherAccount.address);
        // expect(await nftMock.ownerOf(3)).eq(otherAccount.address);
      });

      it("Should work if partial failed", async function () {
        const { nftSweep, nftMock, marketPlaceMock, owner, otherAccount } = await loadFixture(deployContract);

        let iface = marketPlaceMock.interface;
        let orderData1 = iface.encodeFunctionData("buyItem", [1, otherAccount.address]);
        let orderData2 = iface.encodeFunctionData("buyItem", [2, otherAccount.address]);

        let orderData3 = iface.encodeFunctionData("buyItem", [1, otherAccount.address]);

        let orders = [ { marketId: 1, value: ethers.utils.parseEther("0.005"), orderData: orderData1 },
          { marketId: 1, value: ethers.utils.parseEther("0.01"), orderData: orderData2 },
          { marketId: 2, value: ethers.utils.parseEther("0.01"), orderData: orderData3 } ];
        await nftSweep.connect(otherAccount).batchBuyFromMarkets(orders, {value: ethers.utils.parseEther("0.03") });

        expect(await nftMock.ownerOf(1)).eq(owner.address);
        expect(await nftMock.ownerOf(2)).eq(otherAccount.address);
        expect(await nftMock.ownerOf(3)).eq(otherAccount.address);
      });
    });
  });
})
