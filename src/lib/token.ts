import { BigNumberish, ethers } from "ethers";
import { MOVEMENT_DEVNET } from "../utils/chains";
import axios from "axios";


export const FacuetTestToken = {
    [MOVEMENT_DEVNET]: [
        {
            name: "WSTETH",
            address: "0xeAC3d56DCB15a3Bc174aB292B7023e9Fc9F7aDf0",
            symbol: "WSTETH",
            decimals: 18,
            claimable: 0.01,
        },
        {
            name: "USDC Coin",
            address: "0x38604D543659121faa8F68A91A5b633C7BFE9761",
            symbol: "USDC",
            decimals: 6,
            claimable: 100,
        },
        {
          name: "Milkway Staked TIA",
          address: "0x2A197C29f3E144387EB5877CFe0e63032FD1a0DA",
          symbol: "MILKTIA",
          decimals: 18,
          claimable: 20,
      },
      {
          name: "Staked Move",
          address: "0x1AD94D0a799664D459cB467655eC0EA4cc8Ad478",
          symbol: "STMOVE",
          decimals: 18,
          claimable: 10,
      },
      {
          name: "GoGoPool AVAX",
          address: "0xb9aDf17948481eb380D37E9594fD4382372DBcd0",
          symbol: "GGAVAX",
          decimals: 18,
          claimable: 10,
      },
    ]
};

export const TradeTokens ={
    [MOVEMENT_DEVNET]: [
          {
            name: "WSTETH",
            address: "0xeAC3d56DCB15a3Bc174aB292B7023e9Fc9F7aDf0",
            symbol: "WSTETH",
            decimals: 18,
            claimable: 0.01,
            tradeble : 0.01,
          },
          {
            name: "Milkway Staked TIA",
            address: "0x2A197C29f3E144387EB5877CFe0e63032FD1a0DA",
            symbol: "MILKTIA",
            decimals: 18,
            claimable: 20,
            tradeble : 1,
        },
        {
            name: "Staked Move",
            address: "0x1AD94D0a799664D459cB467655eC0EA4cc8Ad478",
            symbol: "STMOVE",
            decimals: 18,
            claimable: 10,
            tradeble : 5,
        },
        {
            name: "GoGoPool AVAX",
            address: "0xb9aDf17948481eb380D37E9594fD4382372DBcd0",
            symbol: "GGAVAX",
            decimals: 18,
            claimable: 10,
            tradeble : 2,
        },
    ]
}


export const fetchTokenPrices = async () => {
  try {
    const response = await axios.get("https://api.devnet.avituslabs.xyz/prices/tickers");
    return response.data;
  } catch (error: any) {
    console.error((`Error fetching token prices: ${error.message}`));
    throw error;
  }
};


export const TRadeMarket = "0x3A7315a05Bfca36CD309266F99028cF80AD6b1C6"

export const  uiFees = "0x26E76B18D4A132A9397C46af11e4688BDB602E92"


type TokenPrice = {
    tokenAddress: string;
    tokenSymbol: string;
    minPrice: string;
    maxPrice: string;
    updatedAt: number;
    priceDecimals: number;
};

export const processPrices = (data: TokenPrice[]) => {
    const primaryPrices = data.map(item => ({
      min: BigInt(item.minPrice),
      max: BigInt(item.maxPrice)
    }));
  
    const primaryTokens = data.map(item => item.tokenAddress);
  
    return { primaryPrices, primaryTokens };
  };



export function expandDecimals(n: BigNumberish, decimals: number): bigint {
    return BigInt(n) * 10n ** BigInt(decimals);
  }
  
  export function convertToContractPrice(price: bigint, tokenDecimals: number) {
    return price / expandDecimals(1, tokenDecimals);
  }

  export const referralCodeDecimals = "0x0000000000000000000000000000000000000000000000000000000000000000"




  export const fetchMarketData = async () => {
    try {
      const response = await axios.get('https://api.data.avituslabs.xyz/marketdata');
      return response.data.data;
    } catch (error: any) {
      console.error(`Error fetching market data: ${error.message}`);
      throw error;
    }
  };
  
  interface MarketDataEntry {
    marketTokenAddress: string;
    longTokenAddress: string;
    shortTokenAddress: string;
    indexTokenAddress: string;
    isSpotOnly: boolean;
    isDynamic: boolean;
    isSameCollaterals: boolean;
    name: string;
    data: string;
  }
  
  export const getMarketTokenAddress = async (selectedTokenAddress: string) => {
    try {
      const marketData = await fetchMarketData();
  
      for (const [key, value] of Object.entries(marketData)) {
        const marketEntry = value as MarketDataEntry;
  
        if (marketEntry.indexTokenAddress.toLowerCase() === selectedTokenAddress.toLowerCase()) {
          return marketEntry.marketTokenAddress;
        }
      }

      return null;
    } catch (error: any) {
      console.error(`Error getting market token address: ${error.message}`);
      throw error;
    }
  };