// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "src/lib/create-nft-metadata.sol";

contract StoreManager is ERC1155, AccessControl, ERC1155Pausable, ERC1155Burnable, ERC1155Supply, ReentrancyGuard {
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    uint256 private _nextId;

    /// @dev equivalent to 100%
    uint256 private constant MAX_BPS = 10_000;

    mapping(uint256 => EcommerceNFT) public nftStore; // token id => NFT Data

    event Minted(address indexed account, uint256 indexed id, uint256 amount, bytes data);
    event CreateProduct(
        uint256 indexed id,
        string name,
        string description,
        string imageURI,
        uint256 price,
        string properties,
        uint256 maxSupply,
        address fundReceiver,
        uint16 referralBps
    );

    error InsufficientEther(uint256 required, uint256 provided);
    error ExceedsMaxSupply(uint256 requested, uint256 available);
    error AddressInsufficientBalance(address account);

    struct EcommerceNFT {
        string name;
        string description;
        string imageURI;
        uint256 tokenId;
        uint256 maxSupply;
        uint256 price;
        string properties;
        address creator;
        address fundReceiver;
        uint16 referralBps;
    }

    constructor() ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _nextId = 1;
    }

    function grantManagerRole(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MANAGER_ROLE, account);
    }

    function revokeManagerRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(MANAGER_ROLE, account);
    }

    function createProduct(
        string memory name,
        string memory description,
        string memory imageURI,
        uint256 price,
        string memory properties,
        uint256 maxSupply,
        address fundReceiver,
        uint16 referralBps
    ) public onlyRole(MANAGER_ROLE) returns (EcommerceNFT memory) {
        require(maxSupply > 0, "Max supply must be greater than 0");
        require(price > 0, "Price must be greater than 0");
        require(referralBps < 2000, "Max referral fee is 20%");
        require(fundReceiver != address(0), "Invalid fund receiver");

        uint256 id = _nextId++;

        EcommerceNFT memory nft = EcommerceNFT({
            name: name,
            description: description,
            imageURI: imageURI,
            tokenId: id,
            maxSupply: maxSupply,
            price: price,
            properties: properties,
            creator: msg.sender,
            fundReceiver: fundReceiver,
            referralBps: referralBps
        });

        nftStore[id] = nft;

        emit CreateProduct(id, name, description, imageURI, price, properties, maxSupply, fundReceiver, referralBps);
        return nft;
    }

    function mint(address to, uint256 id, uint256 amount, address referrer, bytes memory data) external payable nonReentrant {
        if ((amount + totalSupply(id)) > nftStore[id].maxSupply) {
            revert ExceedsMaxSupply({requested: amount, available: nftStore[id].maxSupply});
        }

        uint256 totalCost = amount * nftStore[id].price;

        if (msg.value < totalCost) {
            revert InsufficientEther({required: totalCost, provided: msg.value});
        }

        _mint(to, id, amount, data);
        emit Minted(to, id, amount, data);

        // Collect price
        _distributeFunds(id, totalCost, referrer);
    }


    function uri(uint256 id) public view override returns (string memory) {
        return NFTMetadataRenderer.createMetadataEdition(
            nftStore[id].name, nftStore[id].description, nftStore[id].imageURI, nftStore[id].properties, id
        );
    }

    /// @dev Transfers `amount` of native token to `to`.
    function _safeTransferNativeToken(address to, uint256 amount) internal {
        if (amount == 0) {
            return;
        }
        if (address(this).balance < amount) {
            revert AddressInsufficientBalance(address(this));
        }

        (bool success, ) = to.call{ value: amount }("");
        require(success, "native token transfer failed");
    }

    /// @dev Collects and distributes the primary sale value of NFTs being claimed.
    function _distributeFunds(
        uint256 id,
        uint256 totalAmount,
        address referralFeeRecipient
    ) internal virtual {
        if (totalAmount == 0) {
            require(msg.value == 0, "!Value");
            return;
        }
        require(msg.value == totalAmount, "Invalid msg value");

        address saleRecipient = nftStore[id].fundReceiver;

        if (referralFeeRecipient == address(0)) {
            _safeTransferNativeToken(saleRecipient, totalAmount);
            return;
        }

        uint256 referralFee = (totalAmount * nftStore[id].referralBps) / MAX_BPS;
        _safeTransferNativeToken(referralFeeRecipient, referralFee);
        _safeTransferNativeToken(saleRecipient, totalAmount - referralFee);
    }

    function updateImageURI(uint256 id, string memory newuri) public onlyRole(MANAGER_ROLE) {
        require(nftStore[id].creator == msg.sender, "not valid manager");
        nftStore[id].imageURI = newuri;
    }

    function updateProperties(uint256 id, string memory newProperties) public onlyRole(MANAGER_ROLE) {
        require(nftStore[id].creator == msg.sender, "not valid manager");
        nftStore[id].properties = newProperties;
    }

    function updateDescription(uint256 id, string memory newDescription) public onlyRole(MANAGER_ROLE) {
        require(nftStore[id].creator == msg.sender, "not valid manager");
        nftStore[id].description = newDescription;
    }

    function updateName(uint256 id, string memory newName) public onlyRole(MANAGER_ROLE) {
        require(nftStore[id].creator == msg.sender, "not valid manager");
        nftStore[id].name = newName;
    }

    function updateSupply(uint256 id, uint256 newSupply) public onlyRole(MANAGER_ROLE) {
        require(nftStore[id].creator == msg.sender, "not valid manager");
        nftStore[id].maxSupply = newSupply;
    }

    function updatePrice(uint256 id, uint256 newPrice) public onlyRole(MANAGER_ROLE) {
        require(nftStore[id].creator == msg.sender, "not valid manager");
        nftStore[id].price = newPrice;
    }

    function updateOwner(uint256 id, address newCreator) public onlyRole(MANAGER_ROLE) {
        require(nftStore[id].creator == msg.sender, "not valid manager");
        nftStore[id].creator = newCreator;
    }

    function updateFundReceiver(uint256 id, address newFundReceiver) public onlyRole(MANAGER_ROLE) {
        require(nftStore[id].creator == msg.sender, "not valid manager");
        nftStore[id].fundReceiver = newFundReceiver;
    }

    function updateReferralBps(uint256 id, uint16 newBps) public onlyRole(MANAGER_ROLE) {
        require(nftStore[id].creator == msg.sender, "not valid manager");
        require(newBps < 2000, "Max referral fee is 20%");
        nftStore[id].referralBps = newBps;
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

    // The following functions are overrides required by Solidity.
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Pausable, ERC1155Supply) {
        super._update(from, to, ids, values);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
