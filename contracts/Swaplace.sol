// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import {DataPalace} from "./DataPalace.sol";
import {SwapFactory} from "./SwapFactory.sol";
import {ISwaplace} from "./interfaces/ISwaplace.sol";
import {ITransfer} from "./interfaces/ITransfer.sol";

error InvalidAddress(address caller);
error InvalidAssetsLength();
error InvalidExpiryDate(uint256 timestamp);
error InvalidFunctionCall(bytes reason);

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
 * @dev - Swaplace is a decentralized Feeless DEX for ERC20 and ERC721 tokens.
 * It allows users to propose and accept swaps. It won't handle allowances, only transfers.
 */
contract Swaplace is SwapFactory, DataPalace, ISwaplace, IERC165 {
    uint256 public swapId;

    mapping(uint256 => Swap) private swaps;

    function createSwap(Swap calldata swap) public returns (uint256) {
        if (swap.owner == address(0) || swap.owner != msg.sender) {
            revert InvalidAddress(swap.owner);
        }

        if (swap.expiry == 0) {
            revert InvalidExpiryDate(swap.expiry);
        }

        if (swap.biding.length == 0 || swap.asking.length == 0) {
            revert InvalidAssetsLength();
        }

        unchecked {
            swapId++;
        }

        swaps[swapId] = swap;
        swaps[swapId].expiry = swap.expiry + block.timestamp;

        return swapId;
    }

    function acceptSwap(uint256 id) public {
        Swap memory swap = swaps[id];

        if (swap.allowed != address(0) && swap.allowed != msg.sender) {
            revert InvalidAddress(msg.sender);
        }

        if (swap.expiry < block.timestamp) {
            revert InvalidExpiryDate(swap.expiry);
        }

        swaps[id].expiry = 0;

        Asset[] memory assets = swap.asking;

        for (uint256 i = 0; i < assets.length; ) {
            ITransfer(assets[i].addr).transferFrom(
                msg.sender,
                swap.owner,
                assets[i].amountOrId
            );
            unchecked {
                i++;
            }
        }

        assets = swap.biding;

        for (uint256 i = 0; i < assets.length; ) {
            ITransfer(assets[i].addr).transferFrom(
                swap.owner,
                msg.sender,
                assets[i].amountOrId
            );
            unchecked {
                i++;
            }
        }
    }

    function cancelSwap(uint256 id) public {
        Swap memory swap = swaps[id];

        if (swap.expiry < block.timestamp) {
            revert InvalidExpiryDate(swap.expiry);
        }

        if (swap.owner != msg.sender) {
            revert InvalidAddress(msg.sender);
        }

        swaps[id].expiry = 0;
    }

    function getSwap(uint256 id) public view returns (Swap memory) {
        return swaps[id];
    }

    function supportsInterface(
        bytes4 interfaceID
    ) external pure override(IERC165, ISwaplace) returns (bool) {
        return
            interfaceID == type(IERC165).interfaceId ||
            interfaceID == type(ISwaplace).interfaceId;
    }
}
