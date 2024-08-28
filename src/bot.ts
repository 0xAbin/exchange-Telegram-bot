import { Telegraf, Context } from "telegraf";
import { ethers, formatUnits } from "ethers";
import dotenv from "dotenv";
import {
  calculateClaimAmount,
  checkAllowance,
  formatBalance,
  getBalance,
  getPriceForTokenAddress,
} from "./utils/getbalance";
import {
  expandDecimals,
  FacuetTestToken,
  fetchTokenPrices,
  getMarketTokenAddress,
  processPrices,
  referralCodeDecimals,
  TradeTokens,
  uiFees,
} from "./lib/token";
import { MOVEMENT_DEVNET } from "./utils/chains";
import { ethersprovider, publicClient } from "./utils/providers";
import { Address } from "viem";
import { tokenabi } from "./utils/abi/tokenabi";
import { getContracts } from "./lib/contract";
import { facuetAbi } from "./utils/abi/facuetAbi";
import { singleMarketAbi } from "./utils/abi/singleMarketAbi";
import axios from "axios";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN as string);

let userPrivateKeys = new Map<number, string>();
let userExpectingKey = new Set<number>();
let userReadyToTrade = new Set<number>();
let userSelectedCoin = new Map<number, string>();

// Generic function to handle blockchain interactions
async function handleBlockchainInteraction(ctx: Context, operation: string, interactionPromise: Promise<any>) {
  const startTime = Date.now();
  const updateInterval = 5000; // 5 seconds
  let dots = "";

  const statusMessage = await ctx.reply(`🕒 ${operation} in progress. Please wait...`);

  const updateStatus = async () => {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    dots = ".".repeat((elapsedTime % 3) + 1);
    await ctx.telegram.editMessageText(
      ctx.chat!.id,
      statusMessage.message_id,
      undefined,
      `🕒 ${operation} in progress${dots}\n` +
      `⏱️ Time elapsed: ${elapsedTime}s\n` +
      `(The blockchain might be slow, please be patient)`
    );

    if (elapsedTime > 60 && elapsedTime % 30 === 0) {
      await ctx.reply("⚠️ This is taking longer than usual. The RPC or blockchain might be experiencing delays.");
    }
  };

  const statusInterval = setInterval(updateStatus, updateInterval);

  try {
    const result = await interactionPromise;
    clearInterval(statusInterval);
    await ctx.telegram.editMessageText(
      ctx.chat!.id,
      statusMessage.message_id,
      undefined,
      `✅ ${operation} completed successfully!`
    );
    return result;
  } catch (error: any) {
    clearInterval(statusInterval);
    await ctx.telegram.editMessageText(
      ctx.chat!.id,
      statusMessage.message_id,
      undefined,
      `❌ ${operation} encountered an issue:\n${error.message}\n\nPlease try again later.`
    );
    console.error(`Error in ${operation}:`, error);
    throw error;
  }
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

        const availableCoins = FacuetTestToken[MOVEMENT_DEVNET].map(
          (token) => token.symbol
        );
        const coinButtons = availableCoins.map((coin) => [
          { text: coin, callback_data: `select_coin_${coin}` },
        ]);

        await ctx.reply(
          "🔑 **Private Key Received!**\n\n" +
            "✨ Your account details:\n" +
            `📬 Address: ${account.address}\n\n` +
            "Please select a coin to claim:",
          {
            reply_markup: {
              inline_keyboard: coinButtons,
            },
          }
        );

        userExpectingKey.delete(chatId);
      } catch (error: any) {
        await ctx.reply(
          "❌ The private key you provided is invalid. Please ensure it's a valid Ethereum private key and try again."
        );
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
    await handleClaim(ctx, chatId);
  } else if (data.startsWith("trade_")) {
    const selectedTradeCoin = data.split("_")[1];
    await ctx.answerCbQuery(`You selected to trade ${selectedTradeCoin}`);
    await executeTrade(ctx, chatId, selectedTradeCoin);
  }
});

async function handleClaim(ctx: Context, chatId: number) {
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
        "❌ No coin selected. Please select a coin before claiming."
      );
      return;
    }

    const wallet = new ethers.Wallet(privateKey, ethersprovider);
    const address = wallet.address;

    const balance = await getBalance(address);
    if (balance !== null) {
      await ctx.reply(
        `🔄 Claim in progress\n\nYour balance is: ${balance} Gas ⛽️\n`
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
      await ctx.reply(
        `❌ ClaimToken for ${selectedCoin} not found. Please contact support`
      );
      return;
    }

    const claimableAmount = ClaimToken.claimable;
    const tokenAmount = calculateClaimAmount(
      claimableAmount,
      ClaimToken.decimals
    );

    const faucetContractAddress = getContracts[MOVEMENT_DEVNET].FaucetVault;
    const faucetContract = new ethers.Contract(
      faucetContractAddress,
      facuetAbi,
      wallet
    );

    const currentTokenBalance = await publicClient.readContract({
      address: ClaimToken.address as Address,
      abi: tokenabi,
      functionName: "balanceOf",
      args: [wallet.address],
    });

    // Cast currentTokenBalance to bigint
    const tokenBalanceBigInt = currentTokenBalance as bigint;

    if (tokenBalanceBigInt > 0n) {
      await ctx.reply(
        `✅ You already have a balance of ${formatBalance(
          tokenBalanceBigInt,
          ClaimToken.decimals
        )} ${ClaimToken.symbol}.\n` +
        `Proceeding to the next step...`
      );

      // Proceed to the next step, skipping the claim
      await approveAllowance(ctx, chatId, ClaimToken);
      return;
    }

    // Proceed with the claim process if no balance exists
    await handleBlockchainInteraction(
      ctx,
      `Claiming collateral token (${ClaimToken.symbol}) to trade with`,
      faucetContract.claimTokens(ClaimToken.address, tokenAmount)
    );

    const newBalance = await publicClient.readContract({
      address: ClaimToken.address as Address,
      abi: tokenabi,
      functionName: "balanceOf",
      args: [wallet.address],
    });

    await ctx.reply(
      `🎉 Claim successful!\n\n` +
      `🔍 Your new ${ClaimToken.symbol} balance:\n` +
      `${formatBalance(newBalance as bigint, ClaimToken.decimals)} ${ClaimToken.symbol}\n\n` +
      `🚀 Ready for the next step!`
    );

    await ctx.reply(
      "Currently, we have (coin name) available as a collateral token. We will add more in coming iterations."
    );

    await approveAllowance(ctx, chatId, ClaimToken);

  } catch (error: any) {
    if (error.message.includes("Cooldown period has not passed")) {
      await ctx.reply(
        `❌ You need to wait for the cooldown period to pass before claiming more ${userSelectedCoin.get(
          chatId
        )}.`
      );
    } else {
      await ctx.reply(
        "❌ Error processing claim.\n\n" +
        "We apologize for the inconvenience. Our team has been notified.\n" +
        "Please try again later or contact support if the issue persists."
      );
    }
    console.error(`Error processing claim: ${error.message}`);
  }
}

async function approveAllowance(ctx: Context, chatId: number, ClaimToken: any) {
  try {
    const wallet = new ethers.Wallet(
      userPrivateKeys.get(chatId)!,
      ethersprovider
    );
    const syntheticsRouterAddress =
      getContracts[MOVEMENT_DEVNET].SyntheticsRouter;
    const tokenContract = new ethers.Contract(
      ClaimToken.address,
      tokenabi,
      wallet
    );

    const currentAllowance = await checkAllowance(
      tokenContract,
      wallet.address,
      syntheticsRouterAddress
    );

    if (currentAllowance >= 1000000n) {
      await ctx.reply("✅ Maximum allowance already granted. Ready to trade.");
      await showTradeOptions(ctx, chatId);
      return;
    }

    const approvalAmount = ethers.MaxUint256;
    await handleBlockchainInteraction(
      ctx,
      `Approving ${ClaimToken.symbol} allowance`,
      tokenContract.approve(syntheticsRouterAddress, approvalAmount)
    );

    const updatedAllowance = await checkAllowance(
      tokenContract,
      wallet.address,
      syntheticsRouterAddress
    );

    await ctx.reply(
      `🎉 Allowance updated!\n\n` +
      `🔍 Your new allowance for ${ClaimToken.symbol}:\n` +
      `${formatUnits(updatedAllowance, ClaimToken.decimals)} ${ClaimToken.symbol}\n\n` +
      `🚀 Ready to trade!`
    );

    await showTradeOptions(ctx, chatId);
  } catch (error: any) {
    await ctx.reply(
      "❌ Error processing allowance approval. Please try again later."
    );
    console.error(`Error processing allowance approval: ${error.message}`);
  }
}

async function showTradeOptions(ctx: Context, chatId: number) {
  const tradeTokens = TradeTokens[MOVEMENT_DEVNET];
  const tradeButtons = tradeTokens.map((token) => [
    { text: `Trade ${token.symbol}`, callback_data: `trade_${token.symbol}` },
  ]);

  await ctx.reply("🔥 Ready to trade! Select a token to trade:", {
    reply_markup: {
      inline_keyboard: tradeButtons,
    },
  });
}

async function getCurrentTokenPrice(tokenAddress: string): Promise<bigint> {
  try {
    const response = await axios.get("https://api.devnet.avituslabs.xyz/prices/tickers");
    const tokenData = response.data.find((token: any) => token.tokenAddress.toLowerCase() === tokenAddress.toLowerCase());
    if (tokenData) {
      return BigInt(tokenData.minPrice);
    } else {
      throw new Error("Token price not found");
    }
  } catch (error: any) {
    console.error(`Error fetching token price: ${error.message}`);
    throw error;
  }
}

function calculateUsdValue(price: bigint, decimals: number): number {
  const usdValue = Number(price) / 10 ** (30 - decimals);
  return usdValue;
}

async function getUserTokenBalance(wallet: ethers.Wallet, tokenAddress: string, decimals: number): Promise<string> {
  const tokenContract = new ethers.Contract(tokenAddress, tokenabi, wallet);
  const balance = await tokenContract.balanceOf(wallet.address);
  return ethers.formatUnits(balance, decimals);
}

async function executeTrade(ctx: Context, chatId: number, selectedCoin: string) {
  try {
    const wallet = new ethers.Wallet(userPrivateKeys.get(chatId)!, ethersprovider);

    // Get the USDC token details
    const USDC = FacuetTestToken[MOVEMENT_DEVNET].find(
      (token) => token.symbol === "USDC"
    );

    if (!USDC) {
      throw new Error("USDC token not found.");
    }

    // Fetch the current price of the selected trade token
    const currentPriceResponse = await axios.get("https://api.devnet.avituslabs.xyz/prices/tickers");
    const tokenPriceData = currentPriceResponse.data.find(
      (token: any) => token.tokenAddress.toLowerCase() === TradeTokens[MOVEMENT_DEVNET].find(
        (t) => t.symbol === selectedCoin
      )?.address.toLowerCase()
    );

    if (!tokenPriceData) {
      throw new Error("Price data not found for the selected token.");
    }

    const currentPriceBigInt = BigInt(tokenPriceData.minPrice);
    const currentPriceUsd = calculateUsdValue(currentPriceBigInt, TradeTokens[MOVEMENT_DEVNET].find(
      (t) => t.symbol === selectedCoin
    )!.decimals);

    // Get the user's USDC balance
    const userBalance = await getUserTokenBalance(wallet, USDC.address, USDC.decimals);
    const userBalanceInUsd = parseFloat(userBalance);

    await ctx.reply(
      `Your USDC balance:\n` +
      `${userBalance} USDC\n\n` +
      `Collateral USDC : (Max: ${userBalance})`
    );

    // Wait for user input
    const userInputMsg = await new Promise<any>((resolve) => {
      bot.on('text', (ctx) => {
        if (ctx.chat.id === chatId) {
          resolve(ctx.message);
        }
      });
    });

    const userCollateralAmount = parseFloat(userInputMsg.text);

    // Ensure the user cannot trade more than their balance
    if (isNaN(userCollateralAmount) || userCollateralAmount <= 0 || userCollateralAmount > userBalanceInUsd) {
      throw new Error(`Invalid amount. Please enter a number between 1 and ${userBalance}.`);
    }

    // Convert the user's collateral amount to BigInt
    const tradeAmountBigInt = expandDecimals(userCollateralAmount, USDC.decimals);

    // Calculate sizeDeltaUsd
    const sizeDeltaUsd = tradeAmountBigInt * currentPriceBigInt / BigInt(10 ** USDC.decimals);

    // Get the market token address for the selected trade token
    const marketTokenAddress = await getMarketTokenAddress(TradeTokens[MOVEMENT_DEVNET].find(
      (t) => t.symbol === selectedCoin
    )!.address);

    if (!marketTokenAddress) {
      await ctx.reply(`❌ Market for ${selectedCoin} not found.`);
      return;
    }

    const singleMarketOrderHandler = getContracts[MOVEMENT_DEVNET].SingleMarketExchangeRouter;
    const tokenContract = new ethers.Contract(singleMarketOrderHandler, singleMarketAbi, wallet);

    const orderVault = getContracts[MOVEMENT_DEVNET].OrderVault;
    const receiver = wallet.address;

    const sendWnt = { method: "sendWnt", params: [orderVault, 0n] };
    const sendTokens = {
      method: "sendTokens",
      params: [USDC.address, orderVault, tradeAmountBigInt],
    };

    const orderParams = {
      addresses: {
        receiver: receiver as Address,
        callbackContract: ethers.ZeroAddress,
        uiFeeReceiver: uiFees,
        market: marketTokenAddress,
        initialCollateralToken: USDC.address, // Use USDC as collateral
        swapPath: [],
      },
      numbers: {
        sizeDeltaUsd: sizeDeltaUsd,
        initialCollateralDeltaAmount: 0n,
        triggerPrice: 0n,
        acceptablePrice: currentPriceBigInt,
        executionFee: 0n,
        callbackGasLimit: 0n,
        minOutputAmount: 0n,
      },
      orderType: 2,
      decreasePositionSwapType: 0,
      isLong: true,
      shouldUnwrapNativeToken: false,
      referralCode: referralCodeDecimals,
    };

    const prices = await fetchTokenPrices();
    const processedData = processPrices(prices);
    const primaryPrices = processedData.primaryPrices;
    const primaryTokens = processedData.primaryTokens;

    const pricesParams = {
      primaryTokens: primaryTokens,
      primaryPrices: primaryPrices,
    };

    const simulateCreateSingleMarketOrder = {
      method: "simulateCreateSingleMarketOrder",
      params: [orderParams, pricesParams],
    };
    const multicall = [sendWnt, sendTokens, simulateCreateSingleMarketOrder];

    console.log("Multicall Array:", multicall);

    const encodedPayload = multicall
      .filter(Boolean)
      .map((call) =>
        tokenContract.interface.encodeFunctionData(call!.method, call!.params)
      );

    const dataToDisplay = `
🔄 Trade Details:

- Market: ${selectedCoin}
- Trade Amount: ${userCollateralAmount} USDC
- Current Price: ${currentPriceUsd.toFixed(2)} USD
- Size Delta USD: ${ethers.formatUnits(sizeDeltaUsd, USDC.decimals)} USD
- Direction: Long

Executing trade...
    `;

    await ctx.reply(dataToDisplay);

    await handleBlockchainInteraction(
      ctx,
      `Executing ${selectedCoin} trade`,
      tokenContract.multicall(encodedPayload)
    );

    await ctx.reply(
      "✅ Trade executed successfully!\n\n" +
      "🔍 You can check your position in the Avtius dashboard.\n" +
      "🚀 What would you like to do next?"
    );

    // Offer next steps to the user
    await ctx.reply("Choose your next action:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📊 View Portfolio", callback_data: "view_portfolio" }],
          [{ text: "🔄 Trade Again", callback_data: "trade_again" }],
          [{ text: "❓ Get Help", callback_data: "get_help" }]
        ]
      }
    });

  } catch (error: any) {
    const errorMessage = error.message || "Error executing trade. Please try again later.";
    await ctx.reply(`❌ Error: ${errorMessage}\n\nIf this persists, please contact support.`);
    console.error(`Error processing trade: ${errorMessage}`);
  }
}

// Additional handlers for the new callback queries
bot.action('view_portfolio', async (ctx) => {
  // Implement portfolio view logic here
  await ctx.answerCbQuery();
  await ctx.reply("Portfolio view is not yet implemented. Check back soon!");
});

bot.action('trade_again', async (ctx) => {
  await ctx.answerCbQuery();
  await showTradeOptions(ctx, ctx.chat!.id);
});

bot.action('get_help', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(
    "Need help? Here are some resources:\n\n" +
    "📚 User Guide: [link to user guide]\n" +
    "🆘 Support Channel: @AvtiusSupportChannel\n" +
    "❓ FAQ: [link to FAQ page]\n\n" +
    "If you need further assistance, please contact our support team."
  );
});

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error while handling update ${ctx.update.update_id}:`, err);
  ctx.reply("An unexpected error occurred. Our team has been notified. Please try again later.");
});

// Start the bot
bot.launch().then(() => {
  console.log("Bot is up and running");
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally, send an error report to your logging service
});