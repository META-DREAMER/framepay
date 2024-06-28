// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "src/lib/create-nft-metadata.sol";

contract StoreManager is
    ERC1155,
    AccessControl,
    ERC1155Pausable,
    ERC1155Burnable,
    ERC1155Supply
{
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    uint256 private constant PRICE = 0.003 ether;
    uint256 private pendingBalance;
    uint256 private _nextId;

    mapping(uint256 => EcommerceNFT) public nftStore; // token id => NFT Data

    event Minted(
        address indexed account,
        uint256 indexed id,
        uint256 amount,
        bytes data
    );
    event CreateProduct(
        uint256 indexed id,
        string name,
        string description,
        string imageURI,
        string price,
        string properties,
        uint256 maxSupply
    );

    error InsufficientEther(uint256 required, uint256 provided);
    error ExceedsMaxSupply(uint256 requested, uint256 available);

    error NotValidWithdraw(uint256 id, uint256 amount, address initiator);

    struct EcommerceNFT {
        string name;
        string description;
        string imageURI;
        uint256 tokenId;
        uint256 supply;
        uint256 price;
        string properties;
        address creator;
    }

    constructor() ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _nextId = 1;
    }

    function grantManagerRole(
        address account
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MANAGER_ROLE, account);
    }

    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public payable {
        if (nftStore[id] == 0) {
            revert("nft is not set");
        }

        if (nftStore[id].supply < amount) {
            revert ExceedsMaxSupply({
                requested: amount,
                available: nftStore[id].supply
            });
        }

        uint256 totalCost = amount * nftStore[id].price;

        if (msg.value < totalCost) {
            revert InsufficientEther({
                required: totalCost,
                provided: msg.value
            });
        }

        _mint(to, id, amount, data);
        emit Minted(to, id, amount, data);

        _withdraw(id, totalCost);

        //Added a refund mechanism in case the user sends too much eth
        uint256 excess = msg.value - totalCost;
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }
    }

    function createProduct(
        string memory name,
        string memory description,
        string memory imageURI,
        string memory price,
        string memory properties,
        uint256 memory maxSupply
    ) public onlyRole(MANAGER_ROLE) returns (EcommerceNFT memory) {
        require(maxSupply > 0, "Max supply must be greater than 0");
        require(price > 0, "Price must be greater than 0");

        uint256 id = _nextId++;

        EcommerceNFT memory nft = EcommerceNFT({
            name: name,
            description: description,
            imageURI: imageURI,
            tokenId: id,
            supply: maxSupply,
            price: price,
            properties: properties,
            creator: msg.sender
        });

        nftStore[id] = nft;

        emit CreateProduct(
            id,
            name,
            description,
            imageURI,
            price,
            properties,
            maxSupply
        );
    }

    function uri(uint256 id) public view override returns (string memory) {
        return
            NFTMetadataRenderer.createMetadataEdition(
                nftStore[id].name,
                nftStore[id].description,
                nftStore[id].imageURI,
                nftStore[id].properties,
                id
            );
    }

    function _withdraw(
        uint256 id,
        uint256 amount
    ) internal onlyRole(MANAGER_ROLE) {
        if (nftStore.creator != msg.sender) {
            revert NotValidWithdraw(id, amount, msg.sender);
        }

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
    }

    function withdraw() public onlyRole(DEFAULT_ADMIN_ROLE) {
        // Checker
        require(pendingBalance > 0, "No funds to withdraw");

        uint256 totalAmount = pendingBalance;

        // Set state to 0
        pendingBalance = 0;

        // Transaction
        (bool success, ) = payable(msg.sender).call{value: totalAmount}("");
        require(success, "Transfer failed");
    }

    // function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public payable {
    //     require(ids.length == amounts.length, "IDs and amounts length mismatch");

    //     for (uint256 i = 0; i < ids.length; i++) {
    //         if (nftStore[ids[i]].supply < amounts[i]) {
    //             revert ExceedsMaxSupply({requested: amounts[i], available: nftStore[ids[i]].supply});
    //         }

    //         if (nftStore[ids[i]].price == 0) {
    //             revert("Price not set");
    //         }
    //     }

    //     if (msg.value < totalCost) {
    //         revert InsufficientEther({required: totalCost, provided: msg.value});
    //     }

    //     _mintBatch(to, ids, amounts, data);

    //     for (uint256 i = 0; i < ids.length; i++) {
    //         emit Minted(to, ids[i], amounts[i], data);

    //         uint256 totalCost = amounts[i] * nftStore[ids[i]];
    //         _withdraw(id, totalCost);
    //     }

    //     //Added a refund mechanism in case the user sends too much eth
    //     uint256 excess = msg.value - totalCost;
    //     if (excess > 0) {
    //         payable(msg.sender).transfer(excess);
    //     }
    // }

    function updateImageURI(
        uint256 id,
        string memory newuri
    ) public onlyRole(MANAGER_ROLE) {
        require(nftStore[id].creator == msg.sender, "not valid manager");
        nftStore[id].imageURI = newuri;
    }

    function updateProperties(
        uint256 id,
        string memory newProperties
    ) public onlyRole(MANAGER_ROLE) {
        require(nftStore[id].creator == msg.sender, "not valid manager");
        nftStore[id].properties = newProperties;
    }

    function updateDescription(
        uint256 id,
        string memory newDescription
    ) public onlyRole(MANAGER_ROLE) {
        require(nftStore[id].creator == msg.sender, "not valid manager");
        nftStore[id].description = newDescription;
    }

    function updateName(
        uint256 id,
        string memory newName
    ) public onlyRole(MANAGER_ROLE) {
        require(nftStore[id].creator == msg.sender, "not valid manager");
        nftStore[id].name = newName;
    }

    function updateSupply(
        uint256 id,
        uint256 newSupply
    ) public onlyRole(MANAGER_ROLE) {
        require(nftStore[id].creator == msg.sender, "not valid manager");
        nftStore[id].supply = newSupply;
    }

    function updatePrice(
        uint256 id,
        uint256 newPrice
    ) public onlyRole(MANAGER_ROLE) {
        require(nftStore[id].creator == msg.sender, "not valid manager");
        nftStore[id].price = newPrice;
    }

    function updateOwner(
        uint256 id,
        address newCreator
    ) public onlyRole(MANAGER_ROLE) {
        require(nftStore[id].creator == msg.sender, "not valid manager");
        nftStore[id].creator = newCreator;
    }

    function updateNFT(
        uint256 id,
        EcommerceNFT memory nft
    ) public onlyRole(MANAGER_ROLE) {
        require(nftStore[id].creator == msg.sender, "not valid manager");
        nftStore[id] = nft;
    }

    function setURI(string memory newuri) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _setURI(newuri);
    }

    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // This function is used to add supply
    function addSupply(
        uint256[] memory ids,
        uint256[] memory values
    ) public onlyRole(MANAGER_ROLE) {
        _update(address(0), msg.sender, ids, values);
    }

    // The following functions are overrides required by Solidity.
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Pausable, ERC1155Supply) {
        super._update(from, to, ids, values);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
