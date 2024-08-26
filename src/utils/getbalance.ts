import { Address, formatEther, formatUnits, parseUnits } from 'viem';
import { publicClient } from './providers';
import { ethers } from 'ethers';
import { fetchTokenPrices } from '../lib/token';



export  async function getBalance(Walletaddress: string) {
  try {
    const balance = await publicClient.getBalance({
      address: Walletaddress as Address
    });
    const formattedBalance = formatEther(balance);
    // console.log('Wallet Balance :', formattedBalance, 'GAS');
    return formattedBalance;
  } catch (error) {
    console.error('Error fetching balance:', error);
  }
}



export const calculateClaimAmount = (claimable: number, decimals: number) => {
  return parseUnits(claimable.toString(), decimals);
};

export const formatBalance = (balance: bigint | undefined, decimals: number): string => {
  if (balance === undefined) return "0";
  return parseFloat(formatUnits(balance, decimals)).toFixed(2);
};

export const checkAllowance = async (tokenContract: ethers.Contract, owner: string, spender: string): Promise<bigint> => {
  try {
      const allowance = await tokenContract.allowance(owner, spender);
      return allowance;
  } catch (error: any) {
      throw error;
  }
};

export const getPriceForTokenAddress = async (address: string) => {
  try {
    const tokenPrices = await fetchTokenPrices();
    const tokenPrice = tokenPrices.find(
      (price: any) => price.tokenAddress.toLowerCase() === address.toLowerCase()
    );
    return tokenPrice?.maxPrice;
  } catch (error: any) {
    console.error((`Error getting price for token address: ${error.message}`));
    throw error;
  }
};
