import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
// import { interfaceIdFromABI } from "erc165";
import { interfaceIdFromABI } from "./test-utils/erc165";
import { keccak256 } from "js-sha3";
import { splitSignature } from "ethers/lib/utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import erc721abi from "../artifacts/contracts/mock/MockERC721.sol/MockERC721.json";

describe("Swaplace", async function () {
  let Swaplace: Contract;
  let MockERC20: Contract;
  let MockERC721: Contract;
  // Naturally, the contract deployer is signed by the owner
  let owner: string;
  let acceptee: SignerWithAddress;

  let day = 86400;

  before(async () => {
    const [signer, accountOne] = await ethers.getSigners();
    owner = signer.address;
    acceptee = accountOne;

    const swaplaceFactory = await ethers.getContractFactory("SwaplaceV2", signer);
    const MockERC20Factory = await ethers.getContractFactory("MockERC20", signer);
    const mockERC721Factory = await ethers.getContractFactory("MockERC721", signer);

    const swaplaceContract = await swaplaceFactory.deploy();
    const MockERC20Contract = await MockERC20Factory.deploy("MockERC20", "20");
    const mockERC721Contract = await mockERC721Factory.deploy("MockERC721", "721");

    Swaplace = await swaplaceContract.deployed();
    MockERC20 = await MockERC20Contract.deployed();
    MockERC721 = await mockERC721Contract.deployed();

    console.log("Swaplace address: ", Swaplace.address);
    console.log("MockERC20 address: ", MockERC20.address);
    console.log("MockERC721 address: ", MockERC721.address);
  });

  // it("Should test mock contracts", async function () {
  //   await MockERC20.mintTo(owner, 1000);
  //   expect(await MockERC20.balanceOf(owner)).to.be.equals(1000);

  //   await MockERC721.mintTo(owner);
  //   expect(await MockERC721.balanceOf(owner)).to.be.equals(1);
  // });

  // it("Should match interface from abi and erc165", async function () {
  //   const abi = require("../artifacts/contracts/SwaplaceV2.sol/ISwaplaceV2.json");
  //   const faceIdFromAbi = interfaceIdFromABI(abi.abi);

  //   const result = await Swaplace.supportsInterface(faceIdFromAbi);
  //   expect(result).to.be.equal(true);
  // });

  // it("Should build expiration timestamp", async function () {
  //   const week = day * 7;

  //   expect(day.toString()).to.be.equals("86400");
  //   expect(week.toString()).to.be.equals("604800");
  // });

  // it("Should build assets for { ERC20, ERC721 }", async function () {
  //   const erc20 = await Swaplace.makeAsset(MockERC20.address, 1000, 0);
  //   expect(erc20[0].toString()).to.be.equals(MockERC20.address);
  //   expect(erc20[1].toString()).to.be.equals("1000");
  //   expect(erc20[2].toString()).to.be.equals("0");

  //   const erc721 = await Swaplace.makeAsset(MockERC721.address, 1, 1);
  //   expect(erc721[0].toString()).to.be.equals(MockERC721.address);
  //   expect(erc721[1].toString()).to.be.equals("1");
  //   expect(erc721[2].toString()).to.be.equals("1");
  // });

  // it("Should build single trades for { ERC20, ERC721 }", async function () {
  //   const expiry = day * 2;

  //   const ERC20Asset = await Swaplace.makeAsset(MockERC20.address, 1000, 0);
  //   const ERC721Asset = await Swaplace.makeAsset(MockERC721.address, 1, 0);

  //   const ERC20Trade = await Swaplace.makeTrade(owner, expiry, [ERC20Asset], [ERC721Asset]);
  //   const ERC721Trade = await Swaplace.makeTrade(owner, expiry, [ERC721Asset], [ERC20Asset]);

  //   expect(ERC20Trade[0]).to.be.equals(owner);
  //   expect(ERC20Trade[1]).to.be.equals(expiry);
  //   expect(ERC20Trade[2][0].toString()).to.be.equals(ERC20Asset.toString());
  //   expect(ERC20Trade[3][0].toString()).to.be.equals(ERC721Asset.toString());

  //   expect(ERC721Trade[0]).to.be.equals(owner);
  //   expect(ERC721Trade[1]).to.be.equals(expiry);
  //   expect(ERC721Trade[2][0].toString()).to.be.equals(ERC721Asset.toString());
  //   expect(ERC721Trade[3][0].toString()).to.be.equals(ERC20Asset.toString());
  // });

  // it("Should build single trade containing both { ERC20, ERC721 }", async function () {
  //   const expiry = day * 2;

  //   const ERC20Asset = await Swaplace.makeAsset(MockERC20.address, 1000, 0);
  //   const ERC721Asset = await Swaplace.makeAsset(MockERC721.address, 1, 0);

  //   const trade = await Swaplace.makeTrade(
  //     owner,
  //     expiry,
  //     [ERC20Asset, ERC721Asset],
  //     [ERC20Asset, ERC721Asset]
  //   );

  //   expect(trade[0]).to.be.equals(owner);
  //   expect(trade[1]).to.be.equals(expiry);
  //   expect(trade[2][0].toString()).to.be.equals(ERC20Asset.toString());
  //   expect(trade[2][1].toString()).to.be.equals(ERC721Asset.toString());
  //   expect(trade[3][0].toString()).to.be.equals(ERC20Asset.toString());
  //   expect(trade[3][1].toString()).to.be.equals(ERC721Asset.toString());
  // });

  // it("Should compose a trade in a single function for both { ERC20, ERC721 }", async function () {
  //   const expiry = day * 2;

  //   // The point in the asset index that we'll flip from bid to ask
  //   const indexFlipSide = 2;

  //   const assetsContractAddrs = [MockERC20.address, MockERC721.address, MockERC721.address];
  //   const assetsAmountsOrId = [1000, 1, 2];
  //   const assetTypes = [0, 1, 1]; // 0 = ERC20, 1 = ERC721

  //   const trade = await Swaplace.composeTrade(
  //     owner,
  //     expiry,
  //     assetsContractAddrs,
  //     assetsAmountsOrId,
  //     assetTypes,
  //     indexFlipSide
  //   );

  //   expect(trade[0]).to.be.equals(owner);
  //   expect(trade[1]).to.be.equals(expiry);

  //   const firstBid = await Swaplace.makeAsset(
  //     assetsContractAddrs[0],
  //     assetsAmountsOrId[0],
  //     assetTypes[0]
  //   );

  //   const secondBid = await Swaplace.makeAsset(
  //     assetsContractAddrs[1],
  //     assetsAmountsOrId[1],
  //     assetTypes[1]
  //   );

  //   const askingAsset = await Swaplace.makeAsset(
  //     assetsContractAddrs[2],
  //     assetsAmountsOrId[2],
  //     assetTypes[2]
  //   );

  //   expect(trade[2][0].toString()).to.be.equals(firstBid.toString());
  //   expect(trade[2][1].toString()).to.be.equals(secondBid.toString());
  //   expect(trade[3][0].toString()).to.be.equals(askingAsset.toString());
  // });

  // it("Should revert while building asset with invalid asset type", async function () {
  //   const invalidAssetType = 2;
  //   await expect(Swaplace.makeAsset(MockERC20.address, 1000, invalidAssetType)).to.be.reverted;
  // });

  // it("Should revert while building asset with zero amount as type ERC20, but not for ERC721", async function () {
  //   await expect(Swaplace.makeAsset(MockERC20.address, 0, 0)).to.be.revertedWithCustomError(
  //     Swaplace,
  //     "CannotBeZeroAmountWhenERC20"
  //   );

  //   await expect(Swaplace.makeAsset(MockERC721.address, 0, 1)).to.not.be.reverted;
  // });

  // it("Should revert while building trade without minimum expiry period", async function () {
  //   const expiry = day / 2;

  //   const ERC20Asset = await Swaplace.makeAsset(MockERC20.address, 1000, 0);

  //   await expect(
  //     Swaplace.makeTrade(owner, expiry, [ERC20Asset], [ERC20Asset])
  //   ).to.be.revertedWithCustomError(Swaplace, "ExpiryMustBeBiggerThanOneDay");
  // });

  // it("Should revert while building trade with 'owner' as address zero", async function () {
  //   const expiry = day * 2;

  //   const assetsContractAddrs = [MockERC20.address, MockERC721.address];
  //   const assetsAmountsOrId = [1000, 1];
  //   const assetTypes = [0, 1]; // 0 = ERC20, 1 = ERC721

  //   await expect(
  //     Swaplace.composeTrade(
  //       ethers.constants.AddressZero,
  //       expiry,
  //       assetsContractAddrs,
  //       assetsAmountsOrId,
  //       assetTypes,
  //       1
  //     )
  //   ).to.be.revertedWithCustomError(Swaplace, "CannotBeZeroAddress");
  // });

  // it("Should revert while building trade with empty assets", async function () {
  //   const expiry = day * 2;

  //   // The point in the asset index that we'll flip from bid to ask
  //   let indexFlipSide = 0;

  //   const assetsContractAddrs = [MockERC20.address, MockERC721.address];
  //   const assetsAmountsOrId = [1000, 1];
  //   const assetTypes = [0, 1]; // 0 = ERC20, 1 = ERC721

  //   await expect(
  //     Swaplace.composeTrade(
  //       owner,
  //       expiry,
  //       assetsContractAddrs,
  //       assetsAmountsOrId,
  //       assetTypes,
  //       indexFlipSide
  //     )
  //   ).to.be.revertedWithCustomError(Swaplace, "CannotInputEmptyAssets");

  //   indexFlipSide = 2;

  //   await expect(
  //     Swaplace.composeTrade(
  //       owner,
  //       expiry,
  //       assetsContractAddrs,
  //       assetsAmountsOrId,
  //       assetTypes,
  //       indexFlipSide
  //     )
  //   ).to.be.revertedWithCustomError(Swaplace, "CannotInputEmptyAssets");
  // });

  // it("Should revert while composing trade with mismatching inputs length", async function () {
  //   const expiry = day * 2;

  //   const assetsContractAddrs = [MockERC20.address, MockERC721.address];
  //   const assetsAmountsOrId = [1000, 1, 999];
  //   const assetTypes = [0, 1]; // 0 = ERC20, 1 = ERC721

  //   await expect(
  //     Swaplace.composeTrade(owner, expiry, assetsContractAddrs, assetsAmountsOrId, assetTypes, 1)
  //   ).to.be.revertedWithCustomError(Swaplace, "LengthMismatchWhenComposing");
  // });

  // it("Should create a trade and validate the storage refs", async function () {
  //   const expiry = day * 2;

  //   const assetsContractAddrs = [MockERC20.address, MockERC721.address];
  //   const assetsAmountsOrId = [1000, 1];
  //   const assetTypes = [0, 1]; // 0 = ERC20, 1 = ERC721

  //   const trade = await Swaplace.composeTrade(
  //     owner,
  //     expiry,
  //     assetsContractAddrs,
  //     assetsAmountsOrId,
  //     assetTypes,
  //     1
  //   );

  //   // Create the first trade
  //   expect(await Swaplace.createTrade(trade)).to.be.ok;

  //   // Return the first trade and expect timestamp to be greater
  //   const tradeResult = await Swaplace.getTrade(1);
  //   expect(tradeResult[1]).to.be.greaterThan(trade[1]);
  //   expect(tradeResult.toString()).to.be.not.equal(trade.toString());

  //   // Expect ownerOf trade 1 to be the trade creator
  //   let tradeIds = await Swaplace.ownerOf(owner);
  //   expect(tradeIds[0].toString()).to.be.equal("1");

  //   // Create a second trade
  //   expect(await Swaplace.createTrade(trade)).to.be.ok;

  //   // Expect ownerOf trade 1 and 2 to be the trade creator
  //   tradeIds = await Swaplace.ownerOf(owner);
  //   tradeIds.forEach((element: any, index: any) => {
  //     expect(element.toString()).to.be.equal((index + 1).toString());
  //   });
  // });

  // it("Should create and validate allowances", async function () {
  //   // Mint tokens for test execution

  //   await MockERC20.mintTo(owner, 1000);
  //   await MockERC721.mintTo(owner);

  //   // Ask user to approve for future token transfers

  //   await MockERC20.approve(Swaplace.address, 1000);
  //   await MockERC721.approve(Swaplace.address, 1);

  //   expect(await MockERC20.allowance(owner, Swaplace.address)).to.be.equal("1000");
  //   expect(await MockERC721.getApproved(1)).to.be.equal(Swaplace.address);
  // });

  // it("Should create trade and allowances as 'owner' then accept as 'user'", async function () {
  //   /* { Trade Owner } */

  //   // Mint tokens for test execution

  //   await MockERC20.mintTo(owner, 1000);
  //   await MockERC721.mintTo(owner); // NFT id: 1

  //   // Ask user to approve for future token transfers

  //   await MockERC20.approve(Swaplace.address, 1000);
  //   await MockERC721.approve(Swaplace.address, 1);

  //   // Compose a trade bidding 1000 Tokens and 1 NFT and asking for 1 NFT (id: 2)

  //   const trade = await Swaplace.composeTrade(
  //     owner, // Trade creator
  //     day * 2, // Expiry
  //     [MockERC20.address, MockERC721.address, MockERC721.address],
  //     [1000, 1, 2], // Amount or Id
  //     [0, 1, 1], // 0 = ERC20, 1 = ERC721
  //     2 // Index of the asset that will be flipped from bid to ask
  //   );

  //   // Create the trade

  //   await Swaplace.createTrade(trade);

  //   /* { Trade Acceptee } */

  //   // Mint tokens to accept the trade

  //   await MockERC721.mintTo(acceptee.address); // NFT id: 2

  //   // Ask user to approve for its own token transfers

  //   await MockERC721.connect(acceptee).approve(Swaplace.address, 4);

  //   // Accept the trade

  //   await Swaplace.connect(acceptee).acceptTrade(1);
  // });

  it("Should break the world", async function () {
    const trade = await Swaplace.composeTrade(
      owner, // Trade creator
      day * 2, // Expiry
      [MockERC20.address, MockERC721.address, MockERC721.address],
      [1000, 1, 2], // Amount or Id
      [0, 1, 1], // 0 = ERC20, 1 = ERC721
      2 // Index of the asset that will be flipped from bid to ask
    );

    await Swaplace.createTrade(trade);
  });
});
