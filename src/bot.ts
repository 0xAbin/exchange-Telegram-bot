import { Telegraf, Context } from "telegraf";
import { ethers, formatUnits } from "ethers";
import dotenv from "dotenv";
import { calculateClaimAmount, checkAllowance, formatBalance, getBalance, getPriceForTokenAddress } from "./utils/getbalance";
import { expandDecimals, FacuetTestToken, fetchTokenPrices, processPrices, referralCodeDecimals, TRadeMarket, TradeTokens, uiFees } from "./lib/token";
import { MOVEMENT_DEVNET } from "./utils/chains";
import { ethersprovider, publicClient } from "./utils/providers";
import { Address } from "viem";
import { tokenabi } from "./utils/abi/tokenabi";
import { getContracts } from "./lib/contract";
import { facuetAbi } from "./utils/abi/facuetAbi";
import { singleMarketAbi } from "./utils/abi/singleMarketAbi";
import { sleep } from "telegram/Helpers";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN as string);

let userPrivateKeys = new Map<number, string>();
let userExpectingKey = new Set<number>();
let userReadyToTrade = new Set<number>();
let userSelectedCoin = new Map<number, string>();

function createTradeButtons() {
  const tradeTokens = TradeTokens[MOVEMENT_DEVNET];
  return tradeTokens.map(token => [{ text: `Trade ${token.symbol}`, callback_data: `trade_${token.symbol}` }]);
}

// Handler for /start command
bot.start((ctx) => {
  const chatId = ctx.chat?.id;
  if (chatId) {
    const welcomeMessage =
      "🚀 Welcome to the Avtius Trading Bot! 🤖\n\n" +
      "1. Create a new Ethereum wallet.\n" +
      "2. Enter your private key below.\n" +
      "3. Ensure you're connected to Galxe.\n\n" +
      "✨ Type your private key to continue.\n\n" +
      "🔑 Your private key should start with '0x' and be 64 characters long:\n\n" +
      "0x7db22a0839.......\n\n" +
      "💡 Example: 0x7db22a0839abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

    ctx.reply(welcomeMessage);
    userExpectingKey.add(chatId);
  }
});

// Handler for incoming messages
bot.on("text", async (ctx) => {
  const chatId = ctx.chat?.id;
  const text = ctx.message.text.trim();

  if (chatId === undefined) {
    return;
  }

  console.log(`Received message from ${chatId}: ${text}`);

  if (text.startsWith("/start")) {
    userExpectingKey.add(chatId);
    return;
  }

  if (userExpectingKey.has(chatId)) {
    if (text.startsWith("0x") && text.length === 66) {
      try {
        const privateKey = text;
        const wallet = new ethers.Wallet(privateKey);
        const account = { address: wallet.address };

        userPrivateKeys.set(chatId, privateKey);

        const availableCoins = FacuetTestToken[MOVEMENT_DEVNET].map(token => token.symbol);
        const coinButtons = availableCoins.map(coin => [{ text: coin, callback_data: `select_coin_${coin}` }]);

        await ctx.reply(
          "🔑 **Private Key Received!**\n\n" +
          "✨ Your account details:\n" +
          `📬 Address: ${account.address}\n\n` +
          "Please select a coin to claim:",
          {
            reply_markup: {
              inline_keyboard: coinButtons
            }
          }
        );

        userExpectingKey.delete(chatId);
      } catch (error: any) {
        await ctx.reply("❌ The private key you provided is invalid. Please ensure it's a valid Ethereum private key and try again.");
        console.error(`Error converting private key: ${error.message}`);
      }
    } else {
      await ctx.reply(
        '🚫 The private key should start with "0x" and be exactly 64 characters long (including "0x"). Please provide a valid private key.'
      );
    }
  }
});

// Handler for callback queries (button clicks)
bot.on("callback_query", async (ctx: Context) => {
  const chatId = ctx.chat?.id;
  const callbackQuery = ctx.callbackQuery as { data?: string };

  if (chatId === undefined || !callbackQuery.data) {
    return;
  }

  const data = callbackQuery.data;

  if (data.startsWith("select_coin_")) {
    const selectedCoin = data.split("_")[2];
    userSelectedCoin.set(chatId, selectedCoin);
    userReadyToTrade.add(chatId);
    await ctx.answerCbQuery(`You selected ${selectedCoin}`);
    await handleTrade(ctx, chatId);
  } else if (data.startsWith("trade_")) {
    const selectedTradeCoin = data.split("_")[1];
    await ctx.answerCbQuery(`You selected to trade ${selectedTradeCoin}`);
    await executeTrade(ctx, chatId, selectedTradeCoin);
  }
});

// Function to handle trading process
async function handleTrade(ctx: Context, chatId: number) {
  try {
    const privateKey = userPrivateKeys.get(chatId);
    if (!privateKey) {
      await ctx.reply(
        "❌ No private key found. Please provide your private key again by typing /start."
      );
      return;
    }

    const selectedCoin = userSelectedCoin.get(chatId);
    if (!selectedCoin) {
      await ctx.reply(
        "❌ No coin selected. Please select a coin before trading."
      );
      return;
    }

    const wallet = new ethers.Wallet(privateKey, ethersprovider);
    const address = wallet.address;

    const balance = await getBalance(address);
    if (balance !== null) {
      await ctx.reply(
        `🔄 Trading in progress\n\nYour balance is: ${balance} Gas ⛽️\n`
      );
    } else {
      await ctx.reply(
        "❌ Insufficient gas. Please try again later or claim gas from the faucet."
      );
      return;
    }

    const tokens = FacuetTestToken[MOVEMENT_DEVNET];
    const ClaimToken = tokens.find((token) => token.symbol === selectedCoin);

    if (!ClaimToken) {
      await ctx.reply(`❌ ClaimToken for ${selectedCoin} not found. Please contact support`);
      return;
    }

    const claimableAmount = ClaimToken.claimable;
    const tokenAmount = calculateClaimAmount(claimableAmount, ClaimToken.decimals);

    const faucetContractAddress = getContracts[MOVEMENT_DEVNET].FaucetVault;
    const faucetContract = new ethers.Contract(faucetContractAddress, facuetAbi, wallet);

    const currentBalance = await publicClient.readContract({
      address: ClaimToken.address as Address,
      abi: tokenabi,
      functionName: "balanceOf",
      args: [wallet.address],
    });

    if (typeof currentBalance === 'bigint') {
      const currentBalanceValue = currentBalance as bigint;
      const currentBalanceInTokens = parseFloat(formatUnits(currentBalanceValue, ClaimToken.decimals));
      const claimAmountInTokens = parseFloat(formatUnits(tokenAmount, ClaimToken.decimals));

      if (currentBalanceInTokens >= claimAmountInTokens) {
        await ctx.reply("💰 Your wallet already has sufficient tokens. No need to claim more.");
        await approveAllowance(ctx, chatId, ClaimToken);
        return;
      }
    } else {
      await ctx.reply("❌ Error fetching current balance. Please try again later.");
      return;
    }

    // Notify user that the process has started
    const loadingMessage = await ctx.reply("🔄 Claiming your tokens...\nPlease wait...");

    try {
      await ctx.reply(`🪙 Preparing to claim ${ClaimToken.symbol} from Avtius faucet...`);

      // Send transaction
      const tx = await faucetContract.claimTokens(ClaimToken.address, tokenAmount);

      await ctx.reply("📡 Request sent to blockchain. Waiting for response...");

      const startTime = Date.now();
      let txReceipt;
      let dots = '';

      while (!txReceipt) {
        try {
          txReceipt = await tx.wait();
        } catch (error) {
          const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
          dots = '.'.repeat((elapsedTime % 3) + 1);

          await ctx.telegram.editMessageText(
            chatId,
            loadingMessage.message_id,
            undefined,
            `⏳ Waiting for response${dots}\n` +
            `Time elapsed: ${elapsedTime}s\n` +
            `(Chain may be slow, please be patient)`
          );

          if (elapsedTime > 80 && elapsedTime % 20 === 0) {
            await ctx.reply("⚠️ Transaction taking longer than usual. Movement RPC might be slow.");
          }

          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
        }
      }

      // Edit the loading message to indicate success
      await ctx.telegram.editMessageText(
        chatId,
        loadingMessage.message_id,
        undefined,
        "✅ Transaction confirmed! Successfully claimed " + ClaimToken.symbol + " from Avtius faucet!"
      );

      const getBalanceClaimed = await publicClient.readContract({
        address: ClaimToken.address as Address,
        abi: tokenabi,
        functionName: "balanceOf",
        args: [wallet.address],
      });

      await ctx.reply(
        `🎉 Claim successful!\n\n` +
        `🔍 Your new ${ClaimToken.symbol} balance:\n` +
        `${formatBalance(getBalanceClaimed as bigint, ClaimToken.decimals)} ${ClaimToken.symbol}\n\n` +
        `🚀`
      );
      
      await approveAllowance(ctx, chatId, ClaimToken);
      
    } catch (error: any) {
      // Edit the loading message to indicate failure
      await ctx.telegram.editMessageText(
        chatId,
        loadingMessage.message_id,
        undefined,
        "❌ Error processing faucet claim.\n\n" +
        "Possible reasons:\n" +
        "- Network congestion\n" +
        "- Insufficient gas\n" +
        "- Contract error\n\n" +
        "Please try again later or contact support if the issue persists."
      );
      console.error(`Error processing faucet claim: ${error.message}`);
    }
  } catch (error: any) {
    await ctx.reply(
      "❌ Error processing trade.\n\n" +
      "We apologize for the inconvenience. Our team has been notified.\n" +
      "Please try again later or contact support if the issue persists."
    );
    console.error(`Error processing trade: ${error.message}`);
  }
}

async function approveAllowance(ctx: Context, chatId: number, ClaimToken: any) {
  try {
    await ctx.reply(`🪙 Preparing to approve ${ClaimToken.symbol} to be spent by the contract...`);

    const wallet = new ethers.Wallet(userPrivateKeys.get(chatId)!, ethersprovider);
    const syntheticsRouterAddress = getContracts[MOVEMENT_DEVNET].SyntheticsRouter;
    const tokenContract = new ethers.Contract(ClaimToken.address, tokenabi, wallet);

    const currentAllowance = await checkAllowance(tokenContract, wallet.address, syntheticsRouterAddress);

    if (currentAllowance >= 1000000n) {
      await ctx.reply("✅ Maximum allowance already granted. Ready to trade.");
      await showTradeOptions(ctx, chatId);
      return;
    }

    // Send transaction to approve allowance
    const approvalAmount = ethers.MaxUint256; // Adjust the amount as needed
    const tx = await tokenContract.approve(syntheticsRouterAddress, approvalAmount);

    await ctx.reply("📡 Request sent to blockchain. Waiting for response...");

    const startTime = Date.now();
    let txReceipt;
    let dots = '';

    while (!txReceipt) {
      try {
        txReceipt = await tx.wait();
      } catch (error) {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        dots = '.'.repeat((elapsedTime % 3) + 1);

        await ctx.reply(
          `⏳ Waiting for response${dots}\n` +
          `Time elapsed: ${elapsedTime}s\n` +
          `(Chain may be slow, please be patient)`
        );

        if (elapsedTime > 80 && elapsedTime % 20 === 0) {
          await ctx.reply("⚠️ Transaction taking longer than usual. Movement RPC might be slow.");
        }

        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
      }
    }

    await ctx.reply(`✅ Allowance approved successfully for ${ClaimToken.symbol}.`);

    const updatedAllowance = await checkAllowance(tokenContract, wallet.address, syntheticsRouterAddress);

    await ctx.reply(
      `🎉 Allowance updated!\n\n` +
      `🔍 Your new allowance for ${ClaimToken.symbol}:\n` +
      `${formatUnits(updatedAllowance, ClaimToken.decimals)} ${ClaimToken.symbol}\n\n` +
      `🚀`
    );

    await showTradeOptions(ctx, chatId);
    
  } catch (error: any) {
    await ctx.reply("❌ Error processing allowance approval. Please try again later.");
    console.error(`Error processing allowance approval: ${error.message}`);
  }
}

async function showTradeOptions(ctx: Context, chatId: number) {
  await ctx.reply(
    "🔥 Ready to trade! Select a token to trade:",
    {
      reply_markup: {
        inline_keyboard: createTradeButtons()
      }
    }
  );
}

async function executeTrade(ctx: Context, chatId: number, selectedCoin: string) {
    try {
      await ctx.reply(`🔄 Preparing to trade ${selectedCoin}...`);
  
      const wallet = new ethers.Wallet(userPrivateKeys.get(chatId)!, ethersprovider);
      const gettokensTokennew = TradeTokens[MOVEMENT_DEVNET];
      const TradeTokensnew = gettokensTokennew.find((token) => token.symbol === selectedCoin);
  
      if (!TradeTokensnew) {
        throw new Error(`Trade token for ${selectedCoin} not found.`);
      }
  
      const prices = await fetchTokenPrices();
      const processedData = processPrices(prices);
      const primaryPrices = processedData.primaryPrices;
      const primaryTokens = processedData.primaryTokens;
  
      const apiPrice = await getPriceForTokenAddress(TradeTokensnew.address);
      const numberApiPrice = BigInt(apiPrice || "0");
  
      if (!apiPrice) {
        throw new Error(`Max price for token address ${TradeTokensnew.address} not found.`);
      }
    
      const singleMarketOrderHandler = getContracts[MOVEMENT_DEVNET].SingleMarketExchangeRouter;
      const tokenContract = new ethers.Contract(singleMarketOrderHandler, singleMarketAbi, wallet);
  
      // Data for trade
      const orderVault = getContracts[MOVEMENT_DEVNET].OrderVault;
      const newCollateral = 5000000n;
      const tradeAmount = TradeTokensnew.tradeble;
      const collateral = 5;
      const collvstradeamount = tradeAmount * collateral;
      const expndedDecimals = expandDecimals(collvstradeamount, 30);
      const receiver = wallet.address;
  
      // Params data
      const sendWnt = { method: "sendWnt", params: [orderVault, 0n] };
      const sendTokens = { method: "sendTokens", params: [TradeTokensnew.address, orderVault, newCollateral] };
  
      const orderParams = {
        addresses: {
          receiver: receiver as Address,
          callbackContract: ethers.ZeroAddress,
          uiFeeReceiver: uiFees,
          market: TRadeMarket,
          initialCollateralToken: TradeTokensnew.address,
          swapPath: []
        },
        numbers: {
          sizeDeltaUsd: expndedDecimals,
          initialCollateralDeltaAmount: 0n,
          triggerPrice: 0n,
          acceptablePrice: numberApiPrice,
          executionFee: 0n,
          callbackGasLimit: 0n,
          minOutputAmount: 0n
        },
        orderType: 2,
        decreasePositionSwapType: 0,
        isLong: true,
        shouldUnwrapNativeToken: false,
        referralCode: referralCodeDecimals
      };
  
      const pricesParams = {
        primaryTokens: primaryTokens,
        primaryPrices: primaryPrices
      };
  
      const simulateCreateSingleMarketOrder = { method: "simulateCreateSingleMarketOrder", params: [orderParams, pricesParams] };
  
      const multicall = [sendWnt, sendTokens, simulateCreateSingleMarketOrder];
      const encodedPayload = multicall.filter(Boolean).map((call) => tokenContract.interface.encodeFunctionData(call!.method, call!.params));
  
      await ctx.reply("🔄 Multicalling Data loaded");
  
      await sleep(500);
  
      try {
        const tx = await tokenContract.multicall(encodedPayload);
  
        // Handle multicall transaction status
        const startTime = Date.now();
        let txReceipt;
        let dots = '';
  
        while (!txReceipt) {
          try {
            txReceipt = await tx.wait();
          } catch (error) {
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            dots = '.'.repeat((elapsedTime % 3) + 1);
  
            await ctx.reply(
              `⏳ Waiting for response${dots}\n` +
              `Time elapsed: ${elapsedTime}s\n` +
              `(Chain may be slow, please be patient)`
            );
  
            if (elapsedTime > 80 && elapsedTime % 20 === 0) {
              await ctx.reply("⚠️ Transaction taking longer than usual. Movement RPC might be slow.");
            }
  
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
          }
        }
  
        await ctx.reply("✅ Multicall transaction confirmed! Trades executed successfully!");
  
        // Optionally, you can fetch and show the updated trade results or balances here
  
      } catch (error: any) {
        // Handle multicall failure
        await ctx.reply("❌ Error executing multicall. Please try again later.");
        console.error(`Error executing multicall: ${error.message}`);
      }
      
    } catch (error: any) {
      await ctx.reply("❌ Error Executing Trade. Please try again later.");
      console.error(`Error processing trade: ${error.message}`);
    }
  }
  
  bot.launch().then(() => {
    console.log("Bot is up and running");
  });
  
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));