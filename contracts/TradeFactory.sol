// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {ITrade} from "./interfaces/ITrade.sol";
import {ITradeFactory} from "./interfaces/ITradeFactory.sol";

error InvalidAssetType(uint256 assetType);
error InvalidAddressForOwner(address caller);
error InvalidAmountOrCallId(uint256 amountOrCallId);
error InvalidAssetsLength();
error InvalidExpiryDate(uint256 timestamp);
error InvalidMismatchingLengths(
    uint256 addr,
    uint256 amountIdCall,
    uint256 assetType
);

/**
 *  ________   ___        ________   ________   ___  __     ________  ___  ___   ___
 * |\   __  \ |\  \      |\   __  \ |\   ____\ |\  \|\  \  |\  _____\|\  \|\  \ |\  \
 * \ \  \|\ /_\ \  \     \ \  \|\  \\ \  \___| \ \  \/  /|_\ \  \__/ \ \  \\\  \\ \  \
 *  \ \   __  \\ \  \     \ \  \\\  \\ \  \     \ \   ___  \\ \   __\ \ \  \\\  \\ \  \
 *   \ \  \|\  \\ \  \____ \ \  \\\  \\ \  \____ \ \  \\ \  \\ \  \_|  \ \  \\\  \\ \  \____
 *    \ \_______\\ \_______\\ \_______\\ \_______\\ \__\\ \__\\ \__\    \ \_______\\ \_______\
 *     \|_______| \|_______| \|_______| \|_______| \|__| \|__| \|__|     \|_______| \|_______|
 *
 * @title Swaplace
 * @author @dizzyaxis | @blockful_io
 * @dev - Trade Factory is a factory for creating trades. It's a helper for the core Swaplace features.
 */
abstract contract TradeFactory is ITrade, ITradeFactory {
    function makeAsset(
        address addr,
        uint256 amountIdCall,
        AssetType assetType
    ) public pure returns (Asset memory) {
        if (
            assetType != AssetType.ERC20 &&
            assetType != AssetType.ERC721 &&
            assetType != AssetType.FUNCTION_CALL
        ) {
            revert InvalidAssetType(uint256(assetType));
        }

        if (
            (assetType == AssetType.ERC20 && amountIdCall == 0) ||
            (assetType == AssetType.FUNCTION_CALL && amountIdCall == 0)
        ) {
            revert InvalidAmountOrCallId(amountIdCall);
        }

        return Asset(addr, amountIdCall, assetType);
    }

    function makeTrade(
        address owner,
        uint256 expiry,
        Asset[] memory assets,
        Asset[] memory asking
    ) public pure returns (Trade memory) {
        if (expiry < 1 days) {
            revert InvalidExpiryDate(expiry);
        }

        if (owner == address(0)) {
            revert InvalidAddressForOwner(address(0));
        }

        if (assets.length == 0 || asking.length == 0) {
            revert InvalidAssetsLength();
        }

        return Trade(owner, expiry, assets, asking);
    }

    function composeTrade(
        address owner,
        uint256 expiry,
        address[] memory addrs,
        uint256[] memory amountsIdsCalls,
        AssetType[] memory assetTypes,
        uint256 indexFlipToAsking
    ) public pure returns (Trade memory) {
        if (
            addrs.length != amountsIdsCalls.length ||
            addrs.length != assetTypes.length
        ) {
            revert InvalidMismatchingLengths(
                addrs.length,
                amountsIdsCalls.length,
                assetTypes.length
            );
        }

        Asset[] memory assets = new Asset[](indexFlipToAsking);
        for (uint256 i = 0; i < indexFlipToAsking; ) {
            assets[i] = makeAsset(addrs[i], amountsIdsCalls[i], assetTypes[i]);
            unchecked {
                i++;
            }
        }

        Asset[] memory asking = new Asset[](addrs.length - indexFlipToAsking);
        for (uint256 i = indexFlipToAsking; i < addrs.length; ) {
            asking[i - indexFlipToAsking] = makeAsset(
                addrs[i],
                amountsIdsCalls[i],
                assetTypes[i]
            );
            unchecked {
                i++;
            }
        }

        return makeTrade(owner, expiry, assets, asking);
    }
}
