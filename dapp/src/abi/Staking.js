export const abi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "stakingToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "rewardMaster",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "stakeID",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "Delegation",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "account",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "stakeID",
                "type": "uint256"
            }
        ],
        "name": "StakeClaimed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "account",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "stakeID",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "bytes4",
                "name": "stakeType",
                "type": "bytes4"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "lockedTill",
                "type": "uint256"
            }
        ],
        "name": "StakeCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "bytes4",
                "name": "stakeType",
                "type": "bytes4"
            }
        ],
        "name": "TermsAdded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "bytes4",
                "name": "stakeType",
                "type": "bytes4"
            }
        ],
        "name": "TermsDisabled",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "OWNER",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "REWARD_MASTER",
        "outputs": [
            {
                "internalType": "contract IActionMsgReceiver",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "START_BLOCK",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "TOKEN",
        "outputs": [
            {
                "internalType": "contract IErc20Min",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_account",
                "type": "address"
            }
        ],
        "name": "accountStakes",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint32",
                        "name": "id",
                        "type": "uint32"
                    },
                    {
                        "internalType": "bytes4",
                        "name": "stakeType",
                        "type": "bytes4"
                    },
                    {
                        "internalType": "uint32",
                        "name": "stakedAt",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "lockedTill",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "claimedAt",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint96",
                        "name": "amount",
                        "type": "uint96"
                    },
                    {
                        "internalType": "address",
                        "name": "delegatee",
                        "type": "address"
                    }
                ],
                "internalType": "struct IStakingTypes.Stake[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes4",
                "name": "stakeType",
                "type": "bytes4"
            },
            {
                "components": [
                    {
                        "internalType": "bool",
                        "name": "isEnabled",
                        "type": "bool"
                    },
                    {
                        "internalType": "bool",
                        "name": "isRewarded",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint32",
                        "name": "minAmountScaled",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "maxAmountScaled",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "allowedSince",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "allowedTill",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "lockedTill",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "exactLockPeriod",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "minLockPeriod",
                        "type": "uint32"
                    }
                ],
                "internalType": "struct IStakingTypes.Terms",
                "name": "_terms",
                "type": "tuple"
            }
        ],
        "name": "addTerms",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "stakeID",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            }
        ],
        "name": "delegate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes4",
                "name": "stakeType",
                "type": "bytes4"
            }
        ],
        "name": "disableTerms",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "blockNum",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "hint",
                "type": "uint256"
            }
        ],
        "name": "globalSnapshotAt",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint32",
                        "name": "beforeBlock",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint96",
                        "name": "ownPower",
                        "type": "uint96"
                    },
                    {
                        "internalType": "uint96",
                        "name": "delegatedPower",
                        "type": "uint96"
                    }
                ],
                "internalType": "struct IVotingPower.Snapshot",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_index",
                "type": "uint256"
            }
        ],
        "name": "globalsSnapshot",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint32",
                        "name": "beforeBlock",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint96",
                        "name": "ownPower",
                        "type": "uint96"
                    },
                    {
                        "internalType": "uint96",
                        "name": "delegatedPower",
                        "type": "uint96"
                    }
                ],
                "internalType": "struct IVotingPower.Snapshot",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "globalsSnapshotLength",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "latestGlobalsSnapshotBlock",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_account",
                "type": "address"
            }
        ],
        "name": "latestSnapshotBlock",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "v",
                "type": "uint8"
            },
            {
                "internalType": "bytes32",
                "name": "r",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "s",
                "type": "bytes32"
            },
            {
                "internalType": "bytes4",
                "name": "stakeType",
                "type": "bytes4"
            },
            {
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
            }
        ],
        "name": "permitAndStake",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "power",
        "outputs": [
            {
                "internalType": "uint96",
                "name": "own",
                "type": "uint96"
            },
            {
                "internalType": "uint96",
                "name": "delegated",
                "type": "uint96"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_account",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_index",
                "type": "uint256"
            }
        ],
        "name": "snapshot",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint32",
                        "name": "beforeBlock",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint96",
                        "name": "ownPower",
                        "type": "uint96"
                    },
                    {
                        "internalType": "uint96",
                        "name": "delegatedPower",
                        "type": "uint96"
                    }
                ],
                "internalType": "struct IVotingPower.Snapshot",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_account",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "blockNum",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "hint",
                "type": "uint256"
            }
        ],
        "name": "snapshotAt",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint32",
                        "name": "beforeBlock",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint96",
                        "name": "ownPower",
                        "type": "uint96"
                    },
                    {
                        "internalType": "uint96",
                        "name": "delegatedPower",
                        "type": "uint96"
                    }
                ],
                "internalType": "struct IVotingPower.Snapshot",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_account",
                "type": "address"
            }
        ],
        "name": "snapshotLength",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "bytes4",
                "name": "stakeType",
                "type": "bytes4"
            },
            {
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
            }
        ],
        "name": "stake",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "stakes",
        "outputs": [
            {
                "internalType": "uint32",
                "name": "id",
                "type": "uint32"
            },
            {
                "internalType": "bytes4",
                "name": "stakeType",
                "type": "bytes4"
            },
            {
                "internalType": "uint32",
                "name": "stakedAt",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "lockedTill",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "claimedAt",
                "type": "uint32"
            },
            {
                "internalType": "uint96",
                "name": "amount",
                "type": "uint96"
            },
            {
                "internalType": "address",
                "name": "delegatee",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_account",
                "type": "address"
            }
        ],
        "name": "stakesNum",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes4",
                "name": "",
                "type": "bytes4"
            }
        ],
        "name": "terms",
        "outputs": [
            {
                "internalType": "bool",
                "name": "isEnabled",
                "type": "bool"
            },
            {
                "internalType": "bool",
                "name": "isRewarded",
                "type": "bool"
            },
            {
                "internalType": "uint32",
                "name": "minAmountScaled",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "maxAmountScaled",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "allowedSince",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "allowedTill",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "lockedTill",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "exactLockPeriod",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "minLockPeriod",
                "type": "uint32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalPower",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint96",
                        "name": "own",
                        "type": "uint96"
                    },
                    {
                        "internalType": "uint96",
                        "name": "delegated",
                        "type": "uint96"
                    }
                ],
                "internalType": "struct IVotingPower.Power",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalStaked",
        "outputs": [
            {
                "internalType": "uint96",
                "name": "",
                "type": "uint96"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalVotingPower",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "stakeID",
                "type": "uint256"
            }
        ],
        "name": "undelegate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "stakeID",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
            },
            {
                "internalType": "bool",
                "name": "_isForced",
                "type": "bool"
            }
        ],
        "name": "unstake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];
