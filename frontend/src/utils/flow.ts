import { prepareTransaction, toWei } from "thirdweb";
import { sendAndConfirmTransaction } from "thirdweb";
import { chain, client, openai } from "@/utils/utils";
import Memcoin from "./MemeCoin.json";
import NFT from "./Solarpunks.json";
import { ethers } from "ethers";
import axios from "axios";

const rpcUrl = import.meta.env.VITE_RPC_URL;
const senderPrivateKey = import.meta.env.VITE_SENDER_PRIVATE_KEY;

// const provider = new ethers.JsonRpcProvider(rpcUrl);
// const signer = new ethers.Wallet(senderPrivateKey, provider);

// ERC20 Token Contract ABI and Bytecode
const erc20ABI = Memcoin.abi;
const erc20Bytecode = Memcoin.bytecode; // Replace with actual compiled bytecode for your ERC20 contract

// ERC20 Token Contract ABI and Bytecode
const NFTABI = NFT.abi;
const NFTBytecode = NFT.bytecode; // Replace with actual compiled bytecode for your ERC20 contract

// Function to deploy ERC20 token
const NFTERC20Token = async (prompt) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.5,
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: `Extract token deployment details from this prompt: "${prompt}". Provide a JSON object with "name", "symbol" (in tokens, not Wei).`,
        },
      ],
    });

    const response = completion.choices[0].message.content;
    console.log("AI Response:", response);

    const { name, symbol, initialSupply } = JSON.parse(response);

    // Deploy ERC20 Token
    console.log(`Deploying NFT Token: ${name} (${symbol})`);

    //const initialSupplyInWei = ethers.parseUnits(initialSupply.toString(), "ether");
    const factory = new ethers.ContractFactory(NFTABI, NFTBytecode, signer);

    const contract = await factory.deploy();
    // console.log("Deployment transaction sent:", contract.deployTransaction.hash);

    console.log("Waiting for deployment confirmation...");
    //  await contract.deployed();

    // console.log(`Token deployed at address: ${contract.address}`);
    console.log(`NFT deployment completed`);
    return `NFT deployment done`;
  } catch (error) {
    console.error("Error deploying NFT:", error.message || error);
  }
};

// Function to deploy ERC20 token
const deployERC20Token = async (prompt) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.5,
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: `Extract token deployment details from this prompt: "${prompt}". Provide a JSON object with "name", "symbol", and "initialSupply" (in tokens, not Wei).`,
        },
      ],
    });

    const response = completion.choices[0].message.content;
    console.log("AI Response:", response);

    const { name, symbol, initialSupply } = JSON.parse(response);

    // Deploy ERC20 Token
    console.log(
      `Deploying ERC20 Token: ${name} (${symbol}) with initial supply of ${initialSupply}...`
    );

    const initialSupplyInWei = ethers.parseUnits(
      initialSupply.toString(),
      "ether"
    );
    const factory = new ethers.ContractFactory(erc20ABI, erc20Bytecode, signer);

    const contract = await factory.deploy();
    // console.log("Deployment transaction sent:", contract.deployTransaction.hash);

    console.log("Waiting for deployment confirmation...");
    //  await contract.deployed();

    // console.log(`Token deployed at address: ${contract.address}`);
    console.log(`Token deployed done`);
    return `ERC20 deployment completed`;
  } catch (error) {
    console.error("Error deploying ERC20 token:", error.message || error);
  }
};

// Function to check price increase
const checkPriceIncrease = async (prompt) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.5,
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: `Extract token symbol, currency, and the fixed price from this prompt: "${prompt}". Provide a JSON object with "symbol", "currency", and "fixedPrice".`,
        },
      ],
    });

    const response = completion.choices[0].message.content;
    console.log("AI Response:", response);

    const { symbol, currency, fixedPrice } = JSON.parse(response);
    const currencyPair = `${symbol.toUpperCase()}-${currency.toUpperCase()}`;

    // Fetch live token price from Coinbase
    const apiUrl = `https://api.coinbase.com/v2/prices/${currencyPair}/spot`;
    const apiResponse = await axios.get(apiUrl);

    const currentPrice = parseFloat(apiResponse.data.data.amount);
    const targetPrice = parseFloat(fixedPrice) * 1.1; // 10% increase threshold

    console.log(
      `Current Price of ${symbol.toUpperCase()} in ${currency.toUpperCase()}: $${currentPrice}`
    );
    console.log(`Target Price (10% increase): $${targetPrice}`);

    if (currentPrice >= targetPrice) {
      console.log("Buy recommendation triggered.");
      return "Buy";
    } else {
      console.log("No buy recommendation. Price hasn't increased enough.");
      return "Hold";
    }
  } catch (error) {
    console.error("Error checking price increase:", error.message || error);
  }
};

const checkPriceDrop = async (prompt) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.5,
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: `Extract token symbol, currency, and the fixed price from this prompt: "${prompt}". Provide a JSON object with "symbol", "currency", and "fixedPrice".`,
        },
      ],
    });

    const response = completion.choices[0].message.content;
    console.log("AI Response:", response);

    const { symbol, currency, fixedPrice } = JSON.parse(response);
    const currencyPair = `${symbol.toUpperCase()}-${currency.toUpperCase()}`;

    // Fetch live token price from Coinbase
    const apiUrl = `https://api.coinbase.com/v2/prices/${currencyPair}/spot`;
    const apiResponse = await axios.get(apiUrl);

    const currentPrice = parseFloat(apiResponse.data.data.amount);
    const targetPrice = parseFloat(fixedPrice) * 0.95; // 5% drop threshold
    // return `
    // Current Price of ${symbol.toUpperCase()} in ${currency.toUpperCase()}: $${currentPrice}
    //   Target Price (5% drop): $${targetPrice}
    // `;

    if (currentPrice <= targetPrice) {
      console.log("Buy recommendation triggered.");
      return "Buy";
    } else {
      console.log("No buy recommendation. Price hasn't dropped enough.");
      return "Hold";
    }
  } catch (error) {
    console.error("Error checking price drop:", error.message || error);
  }
};

const getTokenPrice = async (prompt) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.5,
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: `Extract cryptocurrency symbol and currency pair from this prompt: "${prompt}". Provide a JSON object with "symbol" (e.g., BTC) and "currency" (e.g., USD).`,
        },
      ],
    });

    const response = completion.choices[0].message.content;
    console.log("AI Response:", response);

    const { symbol, currency } = JSON.parse(response);
    const currencyPair = `${symbol.toUpperCase()}-${currency.toUpperCase()}`;

    // Fetch token price from Coinbase
    const apiUrl = `https://api.coinbase.com/v2/prices/${currencyPair}/spot`;
    const apiResponse = await axios.get(apiUrl);

    const price = apiResponse.data.data.amount;
    return `${symbol.toUpperCase()} current price in ${currency.toUpperCase()}: $${price}`;
  } catch (error) {
    console.error("Error fetching token price:", error.message || error);
  }
};
