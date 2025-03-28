/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/reward_system.json`.
 */
export type RewardSystem = {
    "address": "HHTCLv7oMc4KH3h1iUAxRoKWWV9H6NfBSxECKNXtag5S",
    "metadata": {
      "name": "rewardSystem",
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
        "name": "depositTokens",
        "discriminator": [
          176,
          83,
          229,
          18,
          191,
          143,
          176,
          150
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
            "name": "nftMintAddress"
          },
          {
            "name": "userNftTokenAccount"
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
                  "path": "nftMintAddress"
                }
              ]
            }
          },
          {
            "name": "adminAccount",
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
                  "path": "nftMintAddress"
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
            "name": "userTokenAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "user"
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
            "name": "tokenProgram2022"
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
        "name": "fundTokenStorage",
        "discriminator": [
          56,
          188,
          131,
          56,
          117,
          30,
          26,
          4
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
            "name": "userTokenAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "user"
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
            "name": "associatedTokenProgram",
            "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
          },
          {
            "name": "tokenProgram",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
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
            "name": "userAdmin",
            "writable": true,
            "signer": true
          },
          {
            "name": "user",
            "writable": true,
            "signer": true
          },
          {
            "name": "host"
          },
          {
            "name": "manufacturer"
          },
          {
            "name": "tokenMint"
          },
          {
            "name": "nftMintAddress"
          },
          {
            "name": "userNftTokenAccount"
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
                  "path": "nftMintAddress"
                }
              ]
            }
          },
          {
            "name": "adminAccount",
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
                  "path": "nftMintAddress"
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
            "name": "userTokenAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "user"
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
            "name": "tokenProgram2022"
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
        "args": [
          {
            "name": "hostShare",
            "type": "u64"
          },
          {
            "name": "nfnodeType",
            "type": {
              "defined": {
                "name": "nfNodeType"
              }
            }
          }
        ]
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
            "address": "HHTCLv7oMc4KH3h1iUAxRoKWWV9H6NfBSxECKNXtag5S"
          },
          {
            "name": "programData"
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "othersClaimRewards",
        "discriminator": [
          58,
          11,
          98,
          232,
          89,
          35,
          242,
          50
        ],
        "accounts": [
          {
            "name": "userAdmin",
            "writable": true,
            "signer": true
          },
          {
            "name": "user",
            "writable": true,
            "signer": true
          },
          {
            "name": "nftMintAddress"
          },
          {
            "name": "rewardEntry",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    114,
                    101,
                    119,
                    97,
                    114,
                    100,
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
                  "path": "user"
                },
                {
                  "kind": "account",
                  "path": "nftMintAddress"
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
                  "path": "nftMintAddress"
                }
              ]
            }
          },
          {
            "name": "tokenMint"
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
            "name": "userTokenAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "user"
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
            "name": "adminAccount",
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
        "args": [
          {
            "name": "rewardAmount",
            "type": "u64"
          },
          {
            "name": "nonce",
            "type": "u64"
          }
        ]
      },
      {
        "name": "ownerClaimRewards",
        "discriminator": [
          11,
          92,
          226,
          213,
          71,
          223,
          171,
          241
        ],
        "accounts": [
          {
            "name": "userAdmin",
            "writable": true,
            "signer": true
          },
          {
            "name": "user",
            "writable": true,
            "signer": true
          },
          {
            "name": "nftMintAddress"
          },
          {
            "name": "rewardEntry",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    114,
                    101,
                    119,
                    97,
                    114,
                    100,
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
                  "path": "user"
                },
                {
                  "kind": "account",
                  "path": "nftMintAddress"
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
                  "path": "nftMintAddress"
                }
              ]
            }
          },
          {
            "name": "tokenMint"
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
            "name": "userTokenAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "user"
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
            "name": "userNftTokenAccount"
          },
          {
            "name": "adminAccount",
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
            "name": "tokenProgram2022"
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
        "args": [
          {
            "name": "rewardAmount",
            "type": "u64"
          },
          {
            "name": "nonce",
            "type": "u64"
          }
        ]
      },
      {
        "name": "pauseProgram",
        "discriminator": [
          91,
          86,
          253,
          175,
          66,
          236,
          172,
          124
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
        "name": "unpauseProgram",
        "discriminator": [
          43,
          162,
          233,
          92,
          254,
          62,
          69,
          58
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
        "name": "updateNfnode",
        "discriminator": [
          38,
          118,
          71,
          30,
          160,
          171,
          157,
          162
        ],
        "accounts": [
          {
            "name": "userAdmin",
            "writable": true,
            "signer": true
          },
          {
            "name": "user",
            "writable": true,
            "signer": true
          },
          {
            "name": "host"
          },
          {
            "name": "nftMintAddress"
          },
          {
            "name": "userNftTokenAccount"
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
                  "path": "nftMintAddress"
                }
              ]
            }
          },
          {
            "name": "adminAccount",
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
            "name": "associatedTokenProgram",
            "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
          },
          {
            "name": "tokenProgram2022"
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "hostShare",
            "type": "u64"
          }
        ]
      },
      {
        "name": "withdrawTokens",
        "discriminator": [
          2,
          4,
          225,
          61,
          19,
          182,
          106,
          170
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
            "name": "nftMintAddress"
          },
          {
            "name": "userNftTokenAccount"
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
                  "path": "nftMintAddress"
                }
              ]
            }
          },
          {
            "name": "adminAccount",
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
                  "path": "nftMintAddress"
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
            "name": "userTokenAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "user"
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
            "name": "tokenProgram2022"
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
      },
      {
        "name": "rewardEntry",
        "discriminator": [
          208,
          191,
          173,
          14,
          213,
          84,
          179,
          162
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
        "name": "unauthorizedUser",
        "msg": "Unauthorized access user."
      },
      {
        "code": 6002,
        "name": "missingAdminSignature",
        "msg": "Missing admin signature."
      },
      {
        "code": 6003,
        "name": "nonceAlreadyClaimed",
        "msg": "Nonce already claimed or invalid."
      },
      {
        "code": 6004,
        "name": "programPaused",
        "msg": "Program is paused."
      },
      {
        "code": 6005,
        "name": "claimAlreadyMadeToday",
        "msg": "Claim already made today."
      },
      {
        "code": 6006,
        "name": "arithmeticOverflow",
        "msg": "Aricmetic overflow."
      },
      {
        "code": 6007,
        "name": "invalidNftMint",
        "msg": "Invalid NFT mint."
      },
      {
        "code": 6008,
        "name": "insufficientNftBalance",
        "msg": "Insufficient NFT balance."
      },
      {
        "code": 6009,
        "name": "invalidNfNodeEntry",
        "msg": "Invalid Nfnode entry."
      },
      {
        "code": 6010,
        "name": "invalidNftTokenAccount",
        "msg": "Invalid Nft token account."
      },
      {
        "code": 6011,
        "name": "invalidNftSupply",
        "msg": "Invalid Nft supply."
      },
      {
        "code": 6012,
        "name": "invalidNftDecimals",
        "msg": "Invalid Nft decimals."
      },
      {
        "code": 6013,
        "name": "sameAdminPubkey",
        "msg": "New admin can't be the same current admin"
      },
      {
        "code": 6014,
        "name": "sameAdminCandidatePubkey",
        "msg": "New admin can't be the same current admin candidate"
      },
      {
        "code": 6015,
        "name": "alreadyAccepted",
        "msg": "Admin already accepted."
      },
      {
        "code": 6016,
        "name": "alreadyPaused",
        "msg": "Program already paused."
      },
      {
        "code": 6017,
        "name": "alreadyRunning",
        "msg": "Program already running."
      },
      {
        "code": 6018,
        "name": "invalidPubkey",
        "msg": "Invalid pubkey."
      },
      {
        "code": 6019,
        "name": "invalidRewardAmount",
        "msg": "Reward amount must be greater than zero."
      },
      {
        "code": 6020,
        "name": "invalidFundingAmount",
        "msg": "Funding amount must be greater than zero."
      },
      {
        "code": 6021,
        "name": "invalidDepositAmount",
        "msg": "Deposit amount must be equal than 5000000000."
      },
      {
        "code": 6022,
        "name": "depositAlreadyMade",
        "msg": "Deposit already made."
      },
      {
        "code": 6023,
        "name": "withdrawAlreadyMade",
        "msg": "Withdraw already made."
      },
      {
        "code": 6024,
        "name": "withdrawTooEarly",
        "msg": "Withdraw too early."
      },
      {
        "code": 6025,
        "name": "invalidMint",
        "msg": "Invalid token mint."
      },
      {
        "code": 6026,
        "name": "depositRequired",
        "msg": "Deposit required."
      },
      {
        "code": 6027,
        "name": "unauthorizedMintAuthority",
        "msg": "Unauthorized Mint Authority."
      },
      {
        "code": 6028,
        "name": "mintAuthorityAlreadyExists",
        "msg": "Mint authority already exists."
      },
      {
        "code": 6029,
        "name": "mintAuthorityNotFound",
        "msg": "Mint authority not found."
      },
      {
        "code": 6030,
        "name": "mintAuthorityListFull",
        "msg": "Mint authority list is full."
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
              "name": "ownerLastClaimedTimestamp",
              "type": "i64"
            },
            {
              "name": "host",
              "type": "pubkey"
            },
            {
              "name": "hostShare",
              "type": "u64"
            },
            {
              "name": "hostLastClaimedTimestamp",
              "type": "i64"
            },
            {
              "name": "manufacturer",
              "type": "pubkey"
            },
            {
              "name": "manufacturerLastClaimedTimestamp",
              "type": "i64"
            },
            {
              "name": "totalRewardsClaimed",
              "type": "u64"
            },
            {
              "name": "depositAmount",
              "type": "u64"
            },
            {
              "name": "depositTimestamp",
              "type": "i64"
            },
            {
              "name": "nfnodeType",
              "type": {
                "defined": {
                  "name": "nfNodeType"
                }
              }
            }
          ]
        }
      },
      {
        "name": "nfNodeType",
        "type": {
          "kind": "enum",
          "variants": [
            {
              "name": "don"
            },
            {
              "name": "byod"
            },
            {
              "name": "wayruHotspot"
            }
          ]
        }
      },
      {
        "name": "rewardEntry",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "lastClaimedNonce",
              "type": "u64"
            },
            {
              "name": "lastClaimedTimestamp",
              "type": "i64"
            },
            {
              "name": "totalRewardsEarned",
              "type": "u64"
            }
          ]
        }
      }
    ]
  };
  