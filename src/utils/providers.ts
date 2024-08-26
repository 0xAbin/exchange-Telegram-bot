import { ethers } from "ethers";
import { createPublicClient, createWalletClient, defineChain, http } from "viem";



export const movementDevnet = defineChain({
    id: 30732,
    name: "Movement Devnet",
    nativeCurrency: { name: "Move", symbol: "MOVE", decimals: 18 },
    rpcUrls: {
      default: {
        http: ["https://mevm.devnet.imola.movementlabs.xyz"],
        webSocket: [""],
      },
    },
    blockExplorers: {
      default: { name: "Movement Devnet", url: "https://explorer.devnet.imola.movementlabs.xyz" },
    },
    contracts: {
      multicall3: {
        address: "0xa21B31946003EEC92550bE2180BE0b1A04B40ff3",
        blockCreated: 5882,
      },
    },
  });

 export const config = createPublicClient({
    chain: movementDevnet,
    transport: http(),
  });
  
  export const publicClient = createPublicClient({
    chain: movementDevnet,
    transport: http(),
  });
  
  export const walletClient = createWalletClient({
    chain: movementDevnet,
    transport: http(),
  })
  

export const ethersprovider =  new ethers.JsonRpcProvider(movementDevnet.rpcUrls.default.http[0]);



