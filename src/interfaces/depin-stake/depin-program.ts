/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/depin_stake.json`.
 */
export type DepinStake = {
    "address": "ECcNAeDo6TbYpr1bY2e1uybkiNEuRSbxRbqad4r1azK8",
    "metadata": {
        "name": "depinStake",
        "version": "0.1.0",
        "spec": "0.1.0",
        "description": "Created with Anchor"
    },
    "instructions": [
        {
            "name": "acceptAdminRequest",
            "discriminator": [
                81,
                254,
                219,
                141,
                109,
                117,
                12,
                67
            ],
            "accounts": [
                {
                    "name": "user",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "adminAccount",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    97,
                                    100,
                                    109,
                                    105,
                                    110,
                                    95,
                                    97,
                                    99,
                                    99,
                                    111,
                                    117,
                                    110,
                                    116
                                ]
                            }
                        ]
                    }
                }
            ],
            "args": []
        },
        {
            "name": "addMintAuthority",
            "discriminator": [
                41,
                254,
                251,
                123,
                155,
                68,
                213,
                8
            ],
            "accounts": [
                {
                    "name": "user",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "adminAccount",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    97,
                                    100,
                                    109,
                                    105,
                                    110,
                                    95,
                                    97,
                                    99,
                                    99,
                                    111,
                                    117,
                                    110,
                                    116
                                ]
                            }
                        ]
                    }
                }
            ],
            "args": [
                {
                    "name": "newMintAuthority",
                    "type": "pubkey"
                }
            ]
        },
        {
            "name": "initStakeNft",
            "discriminator": [
                115,
                4,
                17,
                174,
                29,
                68,
                80,
                50
            ],
            "accounts": [
                {
                    "name": "user",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "tokenMint"
                },
                {
                    "name": "adminAccount",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    97,
                                    100,
                                    109,
                                    105,
                                    110,
                                    95,
                                    97,
                                    99,
                                    99,
                                    111,
                                    117,
                                    110,
                                    116
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "nfnodeEntry",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    110,
                                    102,
                                    110,
                                    111,
                                    100,
                                    101,
                                    95,
                                    101,
                                    110,
                                    116,
                                    114,
                                    121
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "externalNftMint"
                            }
                        ]
                    }
                },
                {
                    "name": "depositEntry",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    100,
                                    101,
                                    112,
                                    111,
                                    115,
                                    105,
                                    116,
                                    95,
                                    101,
                                    110,
                                    116,
                                    114,
                                    121
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "externalNftMint"
                            },
                            {
                                "kind": "account",
                                "path": "stakeNftMint"
                            }
                        ]
                    }
                },
                {
                    "name": "externalNftMint"
                },
                {
                    "name": "stakeNftMint",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    115,
                                    116,
                                    97,
                                    107,
                                    101,
                                    95,
                                    110,
                                    102,
                                    116,
                                    95,
                                    109,
                                    105,
                                    110,
                                    116
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "externalNftMint"
                            },
                            {
                                "kind": "account",
                                "path": "nfnode_entry.stake_nft_counter",
                                "account": "nfNodeEntry"
                            }
                        ]
                    }
                },
                {
                    "name": "userStakeNftAccount",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account",
                                "path": "user"
                            },
                            {
                                "kind": "account",
                                "path": "tokenProgram"
                            },
                            {
                                "kind": "account",
                                "path": "stakeNftMint"
                            }
                        ],
                        "program": {
                            "kind": "const",
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ]
                        }
                    }
                },
                {
                    "name": "userTokenAccount",
                    "writable": true
                },
                {
                    "name": "tokenStorageAuthority",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    116,
                                    111,
                                    107,
                                    101,
                                    110,
                                    95,
                                    115,
                                    116,
                                    111,
                                    114,
                                    97,
                                    103,
                                    101
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "externalNftMint"
                            }
                        ]
                    }
                },
                {
                    "name": "tokenStorageAccount",
                    "writable": true
                },
                {
                    "name": "feeReceivingWallet",
                    "writable": true
                },
                {
                    "name": "programAuthority",
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    112,
                                    114,
                                    111,
                                    103,
                                    114,
                                    97,
                                    109,
                                    95,
                                    97,
                                    117,
                                    116,
                                    104,
                                    111,
                                    114,
                                    105,
                                    116,
                                    121
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "tokenProgram"
                },
                {
                    "name": "tokenProgramSpl",
                    "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                },
                {
                    "name": "associatedTokenProgram",
                    "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
                },
                {
                    "name": "systemProgram",
                    "address": "11111111111111111111111111111111"
                }
            ],
            "args": [
                {
                    "name": "args",
                    "type": {
                        "defined": {
                            "name": "stakeNfTnMetadataArgs"
                        }
                    }
                },
                {
                    "name": "amount",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "initializeNfnode",
            "discriminator": [
                51,
                110,
                148,
                151,
                182,
                151,
                64,
                104
            ],
            "accounts": [
                {
                    "name": "user",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "tokenMint"
                },
                {
                    "name": "externalNftMint"
                },
                {
                    "name": "nfnodeEntry",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    110,
                                    102,
                                    110,
                                    111,
                                    100,
                                    101,
                                    95,
                                    101,
                                    110,
                                    116,
                                    114,
                                    121
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "externalNftMint"
                            }
                        ]
                    }
                },
                {
                    "name": "adminAccount",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    97,
                                    100,
                                    109,
                                    105,
                                    110,
                                    95,
                                    97,
                                    99,
                                    99,
                                    111,
                                    117,
                                    110,
                                    116
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "tokenStorageAuthority",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    116,
                                    111,
                                    107,
                                    101,
                                    110,
                                    95,
                                    115,
                                    116,
                                    111,
                                    114,
                                    97,
                                    103,
                                    101
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "externalNftMint"
                            }
                        ]
                    }
                },
                {
                    "name": "tokenStorageAccount",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account",
                                "path": "tokenStorageAuthority"
                            },
                            {
                                "kind": "const",
                                "value": [
                                    6,
                                    221,
                                    246,
                                    225,
                                    215,
                                    101,
                                    161,
                                    147,
                                    217,
                                    203,
                                    225,
                                    70,
                                    206,
                                    235,
                                    121,
                                    172,
                                    28,
                                    180,
                                    133,
                                    237,
                                    95,
                                    91,
                                    55,
                                    145,
                                    58,
                                    140,
                                    245,
                                    133,
                                    126,
                                    255,
                                    0,
                                    169
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "tokenMint"
                            }
                        ],
                        "program": {
                            "kind": "const",
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ]
                        }
                    }
                },
                {
                    "name": "tokenProgram",
                    "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                },
                {
                    "name": "associatedTokenProgram",
                    "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
                },
                {
                    "name": "systemProgram",
                    "address": "11111111111111111111111111111111"
                }
            ],
            "args": []
        },
        {
            "name": "initializeSystem",
            "discriminator": [
                50,
                173,
                248,
                140,
                202,
                35,
                141,
                150
            ],
            "accounts": [
                {
                    "name": "user",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "adminAccount",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    97,
                                    100,
                                    109,
                                    105,
                                    110,
                                    95,
                                    97,
                                    99,
                                    99,
                                    111,
                                    117,
                                    110,
                                    116
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "mintAuthority"
                },
                {
                    "name": "tokenMint"
                },
                {
                    "name": "tokenProgram",
                    "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                },
                {
                    "name": "program",
                    "address": "ECcNAeDo6TbYpr1bY2e1uybkiNEuRSbxRbqad4r1azK8"
                },
                {
                    "name": "programData"
                },
                {
                    "name": "feeReceivingWallet"
                },
                {
                    "name": "systemProgram",
                    "address": "11111111111111111111111111111111"
                }
            ],
            "args": [
                {
                    "name": "feeAmount",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "removeMintAuthority",
            "discriminator": [
                33,
                207,
                52,
                111,
                106,
                97,
                9,
                63
            ],
            "accounts": [
                {
                    "name": "user",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "adminAccount",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    97,
                                    100,
                                    109,
                                    105,
                                    110,
                                    95,
                                    97,
                                    99,
                                    99,
                                    111,
                                    117,
                                    110,
                                    116
                                ]
                            }
                        ]
                    }
                }
            ],
            "args": [
                {
                    "name": "mintAuthority",
                    "type": "pubkey"
                }
            ]
        },
        {
            "name": "stake",
            "discriminator": [
                206,
                176,
                202,
                18,
                200,
                209,
                179,
                108
            ],
            "accounts": [
                {
                    "name": "user",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "tokenMint"
                },
                {
                    "name": "adminAccount",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    97,
                                    100,
                                    109,
                                    105,
                                    110,
                                    95,
                                    97,
                                    99,
                                    99,
                                    111,
                                    117,
                                    110,
                                    116
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "nfnodeEntry",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    110,
                                    102,
                                    110,
                                    111,
                                    100,
                                    101,
                                    95,
                                    101,
                                    110,
                                    116,
                                    114,
                                    121
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "externalNftMint"
                            }
                        ]
                    }
                },
                {
                    "name": "depositEntry",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    100,
                                    101,
                                    112,
                                    111,
                                    115,
                                    105,
                                    116,
                                    95,
                                    101,
                                    110,
                                    116,
                                    114,
                                    121
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "externalNftMint"
                            },
                            {
                                "kind": "account",
                                "path": "stakeNftMint"
                            }
                        ]
                    }
                },
                {
                    "name": "externalNftMint"
                },
                {
                    "name": "stakeNftMint"
                },
                {
                    "name": "userStakeNftAccount"
                },
                {
                    "name": "userTokenAccount",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account",
                                "path": "user"
                            },
                            {
                                "kind": "account",
                                "path": "tokenProgramSpl"
                            },
                            {
                                "kind": "account",
                                "path": "tokenMint"
                            }
                        ],
                        "program": {
                            "kind": "const",
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ]
                        }
                    }
                },
                {
                    "name": "tokenStorageAuthority",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    116,
                                    111,
                                    107,
                                    101,
                                    110,
                                    95,
                                    115,
                                    116,
                                    111,
                                    114,
                                    97,
                                    103,
                                    101
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "externalNftMint"
                            }
                        ]
                    }
                },
                {
                    "name": "tokenStorageAccount",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account",
                                "path": "tokenStorageAuthority"
                            },
                            {
                                "kind": "account",
                                "path": "tokenProgramSpl"
                            },
                            {
                                "kind": "account",
                                "path": "tokenMint"
                            }
                        ],
                        "program": {
                            "kind": "const",
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ]
                        }
                    }
                },
                {
                    "name": "programAuthority",
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    112,
                                    114,
                                    111,
                                    103,
                                    114,
                                    97,
                                    109,
                                    95,
                                    97,
                                    117,
                                    116,
                                    104,
                                    111,
                                    114,
                                    105,
                                    116,
                                    121
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "tokenProgram"
                },
                {
                    "name": "tokenProgramSpl",
                    "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                },
                {
                    "name": "associatedTokenProgram",
                    "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
                },
                {
                    "name": "systemProgram",
                    "address": "11111111111111111111111111111111"
                },
                {
                    "name": "feeReceivingWallet",
                    "writable": true
                }
            ],
            "args": [
                {
                    "name": "amount",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "unstake",
            "discriminator": [
                90,
                95,
                107,
                42,
                205,
                124,
                50,
                225
            ],
            "accounts": [
                {
                    "name": "user",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "tokenMint"
                },
                {
                    "name": "adminAccount",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    97,
                                    100,
                                    109,
                                    105,
                                    110,
                                    95,
                                    97,
                                    99,
                                    99,
                                    111,
                                    117,
                                    110,
                                    116
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "nfnodeEntry",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    110,
                                    102,
                                    110,
                                    111,
                                    100,
                                    101,
                                    95,
                                    101,
                                    110,
                                    116,
                                    114,
                                    121
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "externalNftMint"
                            }
                        ]
                    }
                },
                {
                    "name": "depositEntry",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    100,
                                    101,
                                    112,
                                    111,
                                    115,
                                    105,
                                    116,
                                    95,
                                    101,
                                    110,
                                    116,
                                    114,
                                    121
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "externalNftMint"
                            },
                            {
                                "kind": "account",
                                "path": "stakeNftMint"
                            }
                        ]
                    }
                },
                {
                    "name": "externalNftMint"
                },
                {
                    "name": "stakeNftMint",
                    "writable": true
                },
                {
                    "name": "userStakeNftAccount",
                    "writable": true
                },
                {
                    "name": "userTokenAccount",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account",
                                "path": "user"
                            },
                            {
                                "kind": "account",
                                "path": "tokenProgramSpl"
                            },
                            {
                                "kind": "account",
                                "path": "tokenMint"
                            }
                        ],
                        "program": {
                            "kind": "const",
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ]
                        }
                    }
                },
                {
                    "name": "tokenStorageAuthority",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    116,
                                    111,
                                    107,
                                    101,
                                    110,
                                    95,
                                    115,
                                    116,
                                    111,
                                    114,
                                    97,
                                    103,
                                    101
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "externalNftMint"
                            }
                        ]
                    }
                },
                {
                    "name": "tokenStorageAccount",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account",
                                "path": "tokenStorageAuthority"
                            },
                            {
                                "kind": "account",
                                "path": "tokenProgramSpl"
                            },
                            {
                                "kind": "account",
                                "path": "tokenMint"
                            }
                        ],
                        "program": {
                            "kind": "const",
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ]
                        }
                    }
                },
                {
                    "name": "programAuthority",
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    112,
                                    114,
                                    111,
                                    103,
                                    114,
                                    97,
                                    109,
                                    95,
                                    97,
                                    117,
                                    116,
                                    104,
                                    111,
                                    114,
                                    105,
                                    116,
                                    121
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "tokenProgram"
                },
                {
                    "name": "tokenProgramSpl",
                    "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                },
                {
                    "name": "associatedTokenProgram",
                    "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
                },
                {
                    "name": "systemProgram",
                    "address": "11111111111111111111111111111111"
                },
                {
                    "name": "feeReceivingWallet",
                    "writable": true
                }
            ],
            "args": []
        },
        {
            "name": "updateAdminRequest",
            "discriminator": [
                58,
                118,
                170,
                225,
                117,
                36,
                203,
                167
            ],
            "accounts": [
                {
                    "name": "user",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "adminAccount",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    97,
                                    100,
                                    109,
                                    105,
                                    110,
                                    95,
                                    97,
                                    99,
                                    99,
                                    111,
                                    117,
                                    110,
                                    116
                                ]
                            }
                        ]
                    }
                }
            ],
            "args": [
                {
                    "name": "newAdminPubkey",
                    "type": "pubkey"
                }
            ]
        },
        {
            "name": "updateFeeAmount",
            "discriminator": [
                42,
                132,
                206,
                131,
                241,
                110,
                113,
                96
            ],
            "accounts": [
                {
                    "name": "user",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "adminAccount",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    97,
                                    100,
                                    109,
                                    105,
                                    110,
                                    95,
                                    97,
                                    99,
                                    99,
                                    111,
                                    117,
                                    110,
                                    116
                                ]
                            }
                        ]
                    }
                }
            ],
            "args": [
                {
                    "name": "newFeeAmount",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "updateFeeWallet",
            "discriminator": [
                236,
                164,
                201,
                6,
                176,
                37,
                80,
                17
            ],
            "accounts": [
                {
                    "name": "user",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "adminAccount",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    97,
                                    100,
                                    109,
                                    105,
                                    110,
                                    95,
                                    97,
                                    99,
                                    99,
                                    111,
                                    117,
                                    110,
                                    116
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "newFeeWallet"
                }
            ],
            "args": []
        }
    ],
    "accounts": [
        {
            "name": "adminAccount",
            "discriminator": [
                153,
                119,
                180,
                178,
                43,
                66,
                235,
                148
            ]
        },
        {
            "name": "depositEntry",
            "discriminator": [
                151,
                227,
                10,
                218,
                128,
                73,
                80,
                240
            ]
        },
        {
            "name": "nfNodeEntry",
            "discriminator": [
                123,
                252,
                104,
                177,
                238,
                42,
                64,
                0
            ]
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "unauthorizedAdmin",
            "msg": "Unauthorized access admin."
        },
        {
            "code": 6001,
            "name": "missingAdminSignature",
            "msg": "Missing admin signature."
        },
        {
            "code": 6002,
            "name": "programPaused",
            "msg": "Program is paused."
        },
        {
            "code": 6003,
            "name": "arithmeticOverflow",
            "msg": "Aricmetic overflow."
        },
        {
            "code": 6004,
            "name": "invalidStorageAccount",
            "msg": "Invalid Storage Account"
        },
        {
            "code": 6005,
            "name": "invalidUserTokenAccount",
            "msg": "Invalid User Token Account"
        },
        {
            "code": 6006,
            "name": "invalidNftMint",
            "msg": "Invalid NFT mint."
        },
        {
            "code": 6007,
            "name": "invalidFeeWallet",
            "msg": "Invalid Fee wallet."
        },
        {
            "code": 6008,
            "name": "insufficientNftBalance",
            "msg": "Insufficient NFT balance."
        },
        {
            "code": 6009,
            "name": "invalidNftTokenAccount",
            "msg": "Invalid Nft token account."
        },
        {
            "code": 6010,
            "name": "invalidNftSupply",
            "msg": "Invalid Nft supply."
        },
        {
            "code": 6011,
            "name": "invalidNftDecimals",
            "msg": "Invalid Nft decimals."
        },
        {
            "code": 6012,
            "name": "sameAdminPubkey",
            "msg": "New admin can't be the same current admin"
        },
        {
            "code": 6013,
            "name": "sameAdminCandidatePubkey",
            "msg": "New admin can't be the same current admin candidate"
        },
        {
            "code": 6014,
            "name": "alreadyAccepted",
            "msg": "Admin already accepted."
        },
        {
            "code": 6015,
            "name": "alreadyPaused",
            "msg": "Program already paused."
        },
        {
            "code": 6016,
            "name": "alreadyRunning",
            "msg": "Program already running."
        },
        {
            "code": 6017,
            "name": "invalidPubkey",
            "msg": "Invalid pubkey."
        },
        {
            "code": 6018,
            "name": "invalidDepositAmount",
            "msg": "Deposit amount must be >= 25000 and total staked <= 1000000000000."
        },
        {
            "code": 6019,
            "name": "depositAlreadyMade",
            "msg": "Deposit already made."
        },
        {
            "code": 6020,
            "name": "withdrawAlreadyMade",
            "msg": "Withdraw already made."
        },
        {
            "code": 6021,
            "name": "withdrawTooEarly",
            "msg": "Withdraw too early."
        },
        {
            "code": 6022,
            "name": "invalidMint",
            "msg": "Invalid token mint."
        },
        {
            "code": 6023,
            "name": "unauthorizedMintAuthority",
            "msg": "Unauthorized Mint Authority."
        },
        {
            "code": 6024,
            "name": "mintAuthorityAlreadyExists",
            "msg": "Mint authority already exists."
        },
        {
            "code": 6025,
            "name": "mintAuthorityNotFound",
            "msg": "Mint authority not found."
        },
        {
            "code": 6026,
            "name": "mintAuthorityListFull",
            "msg": "Mint authority list is full."
        },
        {
            "code": 6027,
            "name": "invalidFeeAmount",
            "msg": "Invalid fee amount."
        },
        {
            "code": 6028,
            "name": "insufficientBalance",
            "msg": "Insufficient balance."
        }
    ],
    "types": [
        {
            "name": "adminAccount",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "adminPubkey",
                        "type": "pubkey"
                    },
                    {
                        "name": "adminCandidatePubkey",
                        "type": "pubkey"
                    },
                    {
                        "name": "paused",
                        "type": "bool"
                    },
                    {
                        "name": "adminUpdateRequested",
                        "type": "bool"
                    },
                    {
                        "name": "validMint",
                        "type": "pubkey"
                    },
                    {
                        "name": "mintAuthorities",
                        "type": {
                            "vec": "pubkey"
                        }
                    },
                    {
                        "name": "totalValueLocked",
                        "type": "u64"
                    },
                    {
                        "name": "feeReceivingWallet",
                        "type": "pubkey"
                    },
                    {
                        "name": "feeAmount",
                        "type": "u64"
                    }
                ]
            }
        },
        {
            "name": "depositEntry",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "depositAmount",
                        "type": "u64"
                    },
                    {
                        "name": "depositTimestamp",
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "nfNodeEntry",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "localValueLocked",
                        "type": "u64"
                    },
                    {
                        "name": "stakeNftCounter",
                        "type": "u64"
                    }
                ]
            }
        },
        {
            "name": "stakeNfTnMetadataArgs",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "name": "symbol",
                        "type": "string"
                    },
                    {
                        "name": "uri",
                        "type": "string"
                    }
                ]
            }
        }
    ]
};
