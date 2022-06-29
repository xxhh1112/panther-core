// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: Copyright 2021-22 Panther Ventures Limited Gibraltar
pragma solidity ^0.8.4;

// ZAssetRegistry contract
string constant ERR_ASSET_ALREADY_REGISTERED = "AR:E1";
string constant ERR_UNKNOWN_ASSET = "AR:E2";
string constant ERR_WRONG_ASSET_STATUS = "AR:E3";
string constant ERR_ZERO_TOKEN_ADDRESS = "AR:E4";

// CommitmentsTrees contract
string constant ERR_TOO_LARGE_COMMITMENTS = "CT:E1"; // commitment exceeds maximum scalar field size

// Registry contract
string constant ERR_INVALID_PUBKEYS = "RG:E1"; // Unexpected format of Pub Keys

// PantherPool contract
string constant ERR_DEPOSIT_OVER_LIMIT = "PP:E1";
string constant ERR_DEPOSIT_FROM_ZERO_ADDRESS = "PP:E2";
string constant ERR_EXPIRED_TX_TIME = "PP:E3";
string constant ERR_INVALID_JOIN_INPUT = "PP:E4";
string constant ERR_INVALID_PROOF = "PP:E5";
string constant ERR_MISMATCHED_ARR_LENGTH = "PP:E6";
string constant ERR_PLUGIN_FAILURE = "PP:E7";
string constant ERR_SPENT_NULLIFIER = "PP:E8";
string constant ERR_TOO_EARLY_CREATED_AT = "PP:E9";
string constant ERR_TOO_LARGE_AMOUNT = "PP:E10";
string constant ERR_TOO_LARGE_COMMITMENT = "PP:E11";
string constant ERR_TOO_LARGE_NULLIFIER = "PP:E12";
string constant ERR_TOO_LARGE_ROOT = "PP:E13";
string constant ERR_TOO_LARGE_SCALED_AMOUNT = "PP:E26";
string constant ERR_TOO_LARGE_TIME = "PP:E14";
string constant ERR_UNKNOWN_MERKLE_ROOT = "PP:E16";
string constant ERR_WITHDRAW_OVER_LIMIT = "PP:E17";
string constant ERR_WITHDRAW_TO_ZERO_ADDRESS = "PP:E18";
string constant ERR_WRONG_ASSET = "PP:E19";
string constant ERR_WRONG_ASSET_SCALE = "PP:20";
string constant ERR_WRONG_ASSET_VER = "PP:27";
string constant ERR_ZERO_DEPOSIT = "PP:E21";
string constant ERR_ZERO_FEE_PAYER = "PP:E22";
string constant ERR_ZERO_TOKEN_EXPECTED = "PP:E23";
string constant ERR_ZERO_TOKEN_UNEXPECTED = "PP:E24";
string constant ERR_ZERO_TOKENID_EXPECTED = "PP:E25";

// (Specific to) PantherPoolV0 contract
string constant ERR_TOO_EARLY_EXIT = "P0:E1";
string constant ERR_TOO_LARGE_LEAFID = "P0:E2";
string constant ERR_TOO_LARGE_PRIVKEY = "P0:E3";
string constant ERR_WRONG_DEPOSIT = "P0:E4";

// PrpGrantor contract
string constant ERR_ZERO_PROCESSOR_ADDR = "GR:E0";
string constant ERR_ZERO_CURATOR_ADDR = "GR:E1";
string constant ERR_ZERO_GRANTEE_ADDR = "GR:E2";
string constant ERR_GRANT_TYPE_EXISTS = "GR:E3";
string constant ERR_UNEXPECTED_GRANT_RECEIPIENT = "GR:E4";
string constant ERR_LOW_GRANT_BALANCE = "GR:E5";
string constant ERR_UKNOWN_GRANT_TYPE = "GR:E6";
string constant ERR_TOO_LARGE_GRANT_AMOUNT = "GR:E6";
string constant ERR_UNDEF_GRANT = "GR:E7";
string constant ERR_UNAUTHORIZED_CALL = "GR:Unauthorized";

// Vault contract
string constant ERR_INVALID_TOKEN_TYPE = "VA:E1";
string constant ERR_ZERO_LOCK_TOKEN_ADDR = "VA:E2";
string constant ERR_ZERO_EXT_ACCOUNT_ADDR = "VA:E3";
string constant ERR_ZERO_EXT_AMOUNT = "VA:E4";

// TriadIncrementalMerkleTrees contract
string constant ERR_ZERO_ROOT = "TT:E1"; // merkle tree root can not be zero

// CommitmentGenerator contract
string constant ERR_TOO_LARGE_PUBKEY = "CG:E1";

// MerkleProofVerifier
string constant ERR_MERKLE_PROOF_VERIFICATION_FAILED = "MP:E1";
string constant ERR_TRIAD_INDEX_MIN_VALUE = "MP:E2";
string constant ERR_TRIAD_INDEX_MAX_VALUE = "MP:E3";
