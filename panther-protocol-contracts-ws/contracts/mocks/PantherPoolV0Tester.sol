// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar
pragma solidity ^0.8.4;

import "../PantherPoolV0.sol";
import "./FakeVault.sol";
import "./FakePrpGrantor.sol";

contract PantherPoolV0Tester is PantherPoolV0 {
    address private immutable _owner;

    constructor()
        PantherPoolV0(
            address(this),
            timeNow() + 1,
            address(new FakeVault()),
            address(new FakePrpGrantor())
        )
    {
        _owner = msg.sender;
        ZAsset memory z1;
        z1.tokenType = ERC20_TOKEN_TYPE;
        z1.scale = 0;
        z1.token = address(uint160(111));
        z1.status = zASSET_ENABLED;
        _addAsset(z1);
    }

    function testGetZAssetId(address token, uint256 tokenId)
        external
        pure
        returns (uint256)
    {
        return getZAssetId(token, tokenId);
    }

    function testIsKnownZAsset(address token, uint256 tokenId)
        external
        view
        returns (bool)
    {
        ZAsset memory asset;
        uint160 zAssetId;
        (asset, zAssetId) = getZAssetAndId(token, tokenId);
        if (asset.status == 1 || asset.status == 2) {
            return true;
        }
        return false;
    }

    function testGenerateCommitments(
        uint256 pubSpendingKeyX,
        uint256 pubSpendingKeyY,
        uint256 amount,
        uint160 zAssetId,
        uint32 creationTime
    ) external pure returns (uint256) {
        return
            uint256(
                generateCommitment(
                    pubSpendingKeyX,
                    pubSpendingKeyY,
                    amount,
                    zAssetId,
                    creationTime
                )
            );
    }

    function testConvert(uint256 n) external pure returns (bytes32) {
        return bytes32(n);
    }

    function testGeneratePublicSpendingKey(uint256 privKey)
        external
        view
        returns (uint256[2] memory xy)
    {
        G1Point memory p;
        p = generatePubSpendingKey(privKey);
        xy[0] = p.x;
        xy[1] = p.y;
    }

    function testExit(
        address token,
        uint256 tokenId,
        uint256 amount,
        uint32 creationTime,
        uint256 privSpendingKey,
        uint256 leafId,
        bytes32[TREE_DEPTH + 1] calldata pathElements,
        bytes32 merkleRoot,
        uint256 cacheIndexHint
    ) external {
        this.exit(
            token,
            tokenId,
            amount,
            creationTime,
            privSpendingKey,
            leafId,
            pathElements,
            merkleRoot,
            cacheIndexHint
        );
    }

    function testGenerateDepositsExtended(
        address[OUT_UTXOs] calldata tokens,
        uint256[OUT_UTXOs] calldata extAmounts,
        uint256[2] calldata pubKeys,
        uint256[CIPHERTEXT1_WORDS] calldata secrets,
        uint32 createdAt
    ) external {
        require(_owner == msg.sender, "OWNER IS NOT MESSAGE_SENDER");

        address[OUT_UTXOs] memory tokenss;
        tokenss[0] = tokens[0];
        tokenss[1] = tokens[1];
        tokenss[2] = tokens[2];

        uint256[OUT_UTXOs] memory tokenIds;
        tokenIds[0] = 0;
        tokenIds[1] = 0;
        tokenIds[2] = 0;

        G1Point[OUT_UTXOs] memory pubKeyss;
        pubKeyss[0] = G1Point(pubKeys[0], pubKeys[1]);
        pubKeyss[1] = G1Point(pubKeys[0], pubKeys[1]);
        pubKeyss[2] = G1Point(pubKeys[0], pubKeys[1]);

        uint256[CIPHERTEXT1_WORDS][OUT_UTXOs] memory secretss;
        secretss[0][0] = secrets[0];
        secretss[0][1] = secrets[1];
        secretss[0][2] = secrets[2];
        secretss[1][0] = secrets[0];
        secretss[1][1] = secrets[1];
        secretss[1][2] = secrets[2];
        secretss[2][0] = secrets[0];
        secretss[2][1] = secrets[1];
        secretss[2][2] = secrets[2];

        this.generateDeposits(
            tokenss,
            tokenIds,
            extAmounts,
            pubKeyss,
            secretss,
            createdAt
        );
    }
}
