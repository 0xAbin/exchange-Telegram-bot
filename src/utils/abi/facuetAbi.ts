export const facuetAbi = [
      { "type": "constructor", "inputs": [], "stateMutability": "nonpayable" },
      { "type": "receive", "stateMutability": "payable" },
      {
        "type": "function",
        "name": "MAX_CLAIM_AMOUNT",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "canClaim",
        "inputs": [
          { "name": "user", "type": "address", "internalType": "address" },
          { "name": "token", "type": "address", "internalType": "address" }
        ],
        "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "claimCooldown",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "claimEth",
        "inputs": [
          { "name": "amount", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "claimTokens",
        "inputs": [
          { "name": "token", "type": "address", "internalType": "address" },
          { "name": "amount", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "cooldownEnabled",
        "inputs": [],
        "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "debugCanClaim",
        "inputs": [
          { "name": "user", "type": "address", "internalType": "address" },
          { "name": "token", "type": "address", "internalType": "address" }
        ],
        "outputs": [
          { "name": "", "type": "bool", "internalType": "bool" },
          { "name": "", "type": "bool", "internalType": "bool" },
          { "name": "", "type": "uint256", "internalType": "uint256" },
          { "name": "", "type": "uint256", "internalType": "uint256" }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "depositEth",
        "inputs": [],
        "outputs": [],
        "stateMutability": "payable"
      },
      {
        "type": "function",
        "name": "depositTokens",
        "inputs": [
          { "name": "token", "type": "address", "internalType": "address" },
          { "name": "amount", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "getContractTokenBalance",
        "inputs": [
          { "name": "token", "type": "address", "internalType": "address" }
        ],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "isCooldownEnabled",
        "inputs": [],
        "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "lastClaimTime",
        "inputs": [
          { "name": "", "type": "address", "internalType": "address" },
          { "name": "", "type": "address", "internalType": "address" }
        ],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "owner",
        "inputs": [],
        "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "renounceOwnership",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "toggleCooldown",
        "inputs": [
          { "name": "_enabled", "type": "bool", "internalType": "bool" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "transferOwnership",
        "inputs": [
          { "name": "newOwner", "type": "address", "internalType": "address" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "updateCooldown",
        "inputs": [
          { "name": "newCooldown", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "event",
        "name": "CooldownToggled",
        "inputs": [
          {
            "name": "enabled",
            "type": "bool",
            "indexed": false,
            "internalType": "bool"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "CooldownUpdated",
        "inputs": [
          {
            "name": "newCooldown",
            "type": "uint256",
            "indexed": false,
            "internalType": "uint256"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "EthClaimed",
        "inputs": [
          {
            "name": "user",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "amount",
            "type": "uint256",
            "indexed": false,
            "internalType": "uint256"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "EthDeposited",
        "inputs": [
          {
            "name": "depositor",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "amount",
            "type": "uint256",
            "indexed": false,
            "internalType": "uint256"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "OwnershipTransferred",
        "inputs": [
          {
            "name": "previousOwner",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "newOwner",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "TokensClaimed",
        "inputs": [
          {
            "name": "token",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "user",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "amount",
            "type": "uint256",
            "indexed": false,
            "internalType": "uint256"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "TokensDeposited",
        "inputs": [
          {
            "name": "token",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "depositor",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "amount",
            "type": "uint256",
            "indexed": false,
            "internalType": "uint256"
          }
        ],
        "anonymous": false
      },
      {
        "type": "error",
        "name": "AddressEmptyCode",
        "inputs": [
          { "name": "target", "type": "address", "internalType": "address" }
        ]
      },
      {
        "type": "error",
        "name": "AddressInsufficientBalance",
        "inputs": [
          { "name": "account", "type": "address", "internalType": "address" }
        ]
      },
      { "type": "error", "name": "FailedInnerCall", "inputs": [] },
      {
        "type": "error",
        "name": "OwnableInvalidOwner",
        "inputs": [
          { "name": "owner", "type": "address", "internalType": "address" }
        ]
      },
      {
        "type": "error",
        "name": "OwnableUnauthorizedAccount",
        "inputs": [
          { "name": "account", "type": "address", "internalType": "address" }
        ]
      },
      {
        "type": "error",
        "name": "SafeERC20FailedOperation",
        "inputs": [
          { "name": "token", "type": "address", "internalType": "address" }
        ]
      }
]