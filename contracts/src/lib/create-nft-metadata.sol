// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "lib/contracts/contracts/lib/Strings.sol";
import "lib/contracts/contracts/external-deps/openzeppelin/utils/Base64.sol";

/// NFT metadata library for rendering metadata associated with editions
library NFTMetadataRenderer {
    /**
     *  @notice Generate edition metadata from storage information as base64-json blob
     *  @dev Combines the media data and metadata
     */
    function createMetadataEdition(
        string memory name,
        string memory description,
        string memory imageURI,
        string memory properties,
        uint256 tokenId
    ) internal pure returns (string memory) {
        bytes memory json = createMetadataJSON(
            name,
            description,
            imageURI,
            properties,
            tokenId
        );
        return encodeMetadataJSON(json);
    }

    function createMetadataJSON(
        string memory name,
        string memory description,
        string memory imageURI,
        string memory properties,
        uint256 tokenId
    ) internal pure returns (bytes memory) {
        return
            abi.encodePacked(
                '{"name": "',
                name,
                " no.",
                Strings.toString(tokenId),
                '", "',
                'description": "',
                description,
                '", "',
                'image": "',
                imageURI,
                '", "',
                'properties": {"number": "',
                Strings.toString(tokenId),
                '", "properties": "',
                properties,
                '"}}'
            );
    }

    /// Encodes the argument json bytes into base64-data uri format
    /// @param json Raw json to base64 and turn into a data-uri
    function encodeMetadataJSON(
        bytes memory json
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(json)
                )
            );
    }

}
