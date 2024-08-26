
export const singleMarketAbi = [
  {
    "inputs": [
      {
        "internalType": "contract GlobalRouter",
        "name": "_globalRouter",
        "type": "address"
      },
      {
        "internalType": "contract RoleStore",
        "name": "_roleStore",
        "type": "address"
      },
      {
        "internalType": "contract DataStore",
        "name": "_dataStore",
        "type": "address"
      },
      {
        "internalType": "contract EventEmitter",
        "name": "_eventEmitter",
        "type": "address"
      },
      {
        "internalType": "contract ISingleMarketDepositHandler",
        "name": "_singleMarketDepositHandler",
        "type": "address"
      },
      {
        "internalType": "contract ISingleMarketWithdrawalHandler",
        "name": "_singleMarketWithdrawalHandler",
        "type": "address"
      },
      {
        "internalType": "contract ISingleMarketOrderHandler",
        "name": "_singleMarketOrderHandler",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "key",
        "type": "bytes32"
      }
    ],
    "name": "DisabledFeature",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EmptyDeposit",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EmptyHoldingAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EmptyOrder",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EmptyReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "EmptyTokenTranferGasLimit",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "TokenTransferError",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "msgSender",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "role",
        "type": "string"
      }
    ],
    "name": "Unauthorized",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "key",
        "type": "bytes32"
      }
    ],
    "name": "cancelSingleMarketDeposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "key",
        "type": "bytes32"
      }
    ],
    "name": "cancelSingleMarketOrder",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "key",
        "type": "bytes32"
      }
    ],
    "name": "cancelSingleMarketWithdrawal",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "callbackContract",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "uiFeeReceiver",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "market",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "initialLongToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "initialShortToken",
            "type": "address"
          },
          {
            "internalType": "address[]",
            "name": "longTokenSwapPath",
            "type": "address[]"
          },
          {
            "internalType": "address[]",
            "name": "shortTokenSwapPath",
            "type": "address[]"
          },
          {
            "internalType": "uint256",
            "name": "minMarketTokens",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "shouldUnwrapNativeToken",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "executionFee",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "callbackGasLimit",
            "type": "uint256"
          }
        ],
        "internalType": "struct SingleMarketDepositUtils.CreateDepositParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "createSingleMarketDeposit",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "callbackContract",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "uiFeeReceiver",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "market",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "initialCollateralToken",
                "type": "address"
              },
              {
                "internalType": "address[]",
                "name": "swapPath",
                "type": "address[]"
              }
            ],
            "internalType": "struct ISingleMarketBaseOrderUtils.CreateOrderParamsAddresses",
            "name": "addresses",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "sizeDeltaUsd",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "initialCollateralDeltaAmount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "triggerPrice",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "acceptablePrice",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "executionFee",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "callbackGasLimit",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "minOutputAmount",
                "type": "uint256"
              }
            ],
            "internalType": "struct ISingleMarketBaseOrderUtils.CreateOrderParamsNumbers",
            "name": "numbers",
            "type": "tuple"
          },
          {
            "internalType": "enum SingleMarketOrder.OrderType",
            "name": "orderType",
            "type": "uint8"
          },
          {
            "internalType": "enum SingleMarketOrder.DecreasePositionSwapType",
            "name": "decreasePositionSwapType",
            "type": "uint8"
          },
          {
            "internalType": "bool",
            "name": "isLong",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "shouldUnwrapNativeToken",
            "type": "bool"
          },
          {
            "internalType": "bytes32",
            "name": "referralCode",
            "type": "bytes32"
          }
        ],
        "internalType": "struct ISingleMarketBaseOrderUtils.CreateOrderParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "createSingleMarketOrder",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "callbackContract",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "uiFeeReceiver",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "market",
            "type": "address"
          },
          {
            "internalType": "address[]",
            "name": "longTokenSwapPath",
            "type": "address[]"
          },
          {
            "internalType": "address[]",
            "name": "shortTokenSwapPath",
            "type": "address[]"
          },
          {
            "internalType": "uint256",
            "name": "minLongTokenAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "minShortTokenAmount",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "shouldUnwrapNativeToken",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "executionFee",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "callbackGasLimit",
            "type": "uint256"
          }
        ],
        "internalType": "struct SingleMarketWithdrawalUtils.CreateWithdrawalParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "createSingleMarketWithdrawal",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "dataStore",
    "outputs": [
      {
        "internalType": "contract DataStore",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "eventEmitter",
    "outputs": [
      {
        "internalType": "contract EventEmitter",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "globalRouter",
    "outputs": [
      {
        "internalType": "contract GlobalRouter",
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
        "internalType": "bytes[]",
        "name": "data",
        "type": "bytes[]"
      }
    ],
    "name": "multicall",
    "outputs": [
      {
        "internalType": "bytes[]",
        "name": "results",
        "type": "bytes[]"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "roleStore",
    "outputs": [
      {
        "internalType": "contract RoleStore",
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
        "name": "receiver",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "sendNativeToken",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "sendTokens",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "sendWnt",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "market",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "callbackContract",
        "type": "address"
      }
    ],
    "name": "setSavedCallbackContractForSingleMarket",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "callbackContract",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "uiFeeReceiver",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "market",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "initialLongToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "initialShortToken",
            "type": "address"
          },
          {
            "internalType": "address[]",
            "name": "longTokenSwapPath",
            "type": "address[]"
          },
          {
            "internalType": "address[]",
            "name": "shortTokenSwapPath",
            "type": "address[]"
          },
          {
            "internalType": "uint256",
            "name": "minMarketTokens",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "shouldUnwrapNativeToken",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "executionFee",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "callbackGasLimit",
            "type": "uint256"
          }
        ],
        "internalType": "struct SingleMarketDepositUtils.CreateDepositParams",
        "name": "params",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "address[]",
            "name": "primaryTokens",
            "type": "address[]"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "min",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "max",
                "type": "uint256"
              }
            ],
            "internalType": "struct Price.Props[]",
            "name": "primaryPrices",
            "type": "tuple[]"
          }
        ],
        "internalType": "struct OracleUtils.SimulatePricesParams",
        "name": "prices",
        "type": "tuple"
      }
    ],
    "name": "simulateCreateSingleMarketDeposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "callbackContract",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "uiFeeReceiver",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "market",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "initialCollateralToken",
                "type": "address"
              },
              {
                "internalType": "address[]",
                "name": "swapPath",
                "type": "address[]"
              }
            ],
            "internalType": "struct ISingleMarketBaseOrderUtils.CreateOrderParamsAddresses",
            "name": "addresses",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "sizeDeltaUsd",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "initialCollateralDeltaAmount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "triggerPrice",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "acceptablePrice",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "executionFee",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "callbackGasLimit",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "minOutputAmount",
                "type": "uint256"
              }
            ],
            "internalType": "struct ISingleMarketBaseOrderUtils.CreateOrderParamsNumbers",
            "name": "numbers",
            "type": "tuple"
          },
          {
            "internalType": "enum SingleMarketOrder.OrderType",
            "name": "orderType",
            "type": "uint8"
          },
          {
            "internalType": "enum SingleMarketOrder.DecreasePositionSwapType",
            "name": "decreasePositionSwapType",
            "type": "uint8"
          },
          {
            "internalType": "bool",
            "name": "isLong",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "shouldUnwrapNativeToken",
            "type": "bool"
          },
          {
            "internalType": "bytes32",
            "name": "referralCode",
            "type": "bytes32"
          }
        ],
        "internalType": "struct ISingleMarketBaseOrderUtils.CreateOrderParams",
        "name": "params",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "address[]",
            "name": "primaryTokens",
            "type": "address[]"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "min",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "max",
                "type": "uint256"
              }
            ],
            "internalType": "struct Price.Props[]",
            "name": "primaryPrices",
            "type": "tuple[]"
          }
        ],
        "internalType": "struct OracleUtils.SimulatePricesParams",
        "name": "prices",
        "type": "tuple"
      }
    ],
    "name": "simulateCreateSingleMarketOrder",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "callbackContract",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "uiFeeReceiver",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "market",
            "type": "address"
          },
          {
            "internalType": "address[]",
            "name": "longTokenSwapPath",
            "type": "address[]"
          },
          {
            "internalType": "address[]",
            "name": "shortTokenSwapPath",
            "type": "address[]"
          },
          {
            "internalType": "uint256",
            "name": "minLongTokenAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "minShortTokenAmount",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "shouldUnwrapNativeToken",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "executionFee",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "callbackGasLimit",
            "type": "uint256"
          }
        ],
        "internalType": "struct SingleMarketWithdrawalUtils.CreateWithdrawalParams",
        "name": "params",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "address[]",
            "name": "primaryTokens",
            "type": "address[]"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "min",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "max",
                "type": "uint256"
              }
            ],
            "internalType": "struct Price.Props[]",
            "name": "primaryPrices",
            "type": "tuple[]"
          }
        ],
        "internalType": "struct OracleUtils.SimulatePricesParams",
        "name": "prices",
        "type": "tuple"
      }
    ],
    "name": "simulateCreateSingleMarketWithdrawal",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "singleMarketDepositHandler",
    "outputs": [
      {
        "internalType": "contract ISingleMarketDepositHandler",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "singleMarketOrderHandler",
    "outputs": [
      {
        "internalType": "contract ISingleMarketOrderHandler",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "singleMarketWithdrawalHandler",
    "outputs": [
      {
        "internalType": "contract ISingleMarketWithdrawalHandler",
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
        "internalType": "bytes32",
        "name": "key",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "sizeDeltaUsd",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "acceptablePrice",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "triggerPrice",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minOutputAmount",
        "type": "uint256"
      }
    ],
    "name": "updateSingleMarketOrder",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
]