require("dotenv").config();
const OpenAI = require("openai");
const ethers = require("ethers");
const Memcoin = require("./MemeCoin.json");
const NFT = require("./Solarpunks.json");
const axios = require("axios");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.SENDER_PRIVATE_KEY, provider);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ERC20 Token Contract ABI and Bytecode
const erc20ABI = Memcoin.abi;
const erc20Bytecode = Memcoin.bytecode; // Replace with actual compiled bytecode for your ERC20 contract



// ERC20 Token Contract ABI and Bytecode
const NFTABI = NFT.abi;
const NFTBytecode = NFT.bytecode; // Replace with actual compiled bytecode for your ERC20 contract

// Function to fetch wallet details and balance
const getWalletDetails = async () => {
  try {
    const balance = await provider.getBalance(signer.address);
    console.log(`Wallet Address: ${signer.address}`);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  } catch (error) {
    console.error("Error fetching wallet details:", error.message || error);
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
    const targetPrice = parseFloat(fixedPrice) * 1.10; // 10% increase threshold

    console.log(`Current Price of ${symbol.toUpperCase()} in ${currency.toUpperCase()}: $${currentPrice}`);
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


// Function to execute a blockchain transaction
const executeTransaction = async (prompt) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.5,
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: `Extract transaction details from this prompt: "${prompt}". Provide a JSON object with "to" (recipient address) and "value" (amount in Flow).`,
        },
      ],
    });

    const response = completion.choices[0].message.content;
    console.log("AI Response:", response);

    const { to, value } = JSON.parse(response);

    // Convert the value to Wei
    const valueInWei = ethers.parseUnits(value.toString(), "ether");

    // Execute the transaction
    console.log(`Sending ${value} ETH to ${to}...`);
    const tx = await signer.sendTransaction({
      to,
      value: valueInWei,
    });

    console.log("Transaction sent:", tx);
    console.log("Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);
  } catch (error) {
    console.error("Error executing transaction:", error.message || error);
  }
};


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
   console.log(`NFT deployment done`);
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
    console.log(`Deploying ERC20 Token: ${name} (${symbol}) with initial supply of ${initialSupply}...`);

    const initialSupplyInWei = ethers.parseUnits(initialSupply.toString(), "ether");
    const factory = new ethers.ContractFactory(erc20ABI, erc20Bytecode, signer);

    const contract = await factory.deploy();
   // console.log("Deployment transaction sent:", contract.deployTransaction.hash);

    console.log("Waiting for deployment confirmation...");
  //  await contract.deployed();

   // console.log(`Token deployed at address: ${contract.address}`);
   console.log(`Token deployed done`);
  } catch (error) {
    console.error("Error deploying ERC20 token:", error.message || error);
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
    console.log(`${symbol.toUpperCase()} current price in ${currency.toUpperCase()}: $${price}`);
  } catch (error) {
    console.error("Error fetching token price:", error.message || error);
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

    console.log(`Current Price of ${symbol.toUpperCase()} in ${currency.toUpperCase()}: $${currentPrice}`);
    console.log(`Target Price (5% drop): $${targetPrice}`);

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


// Main function to handle user prompts
const handleUserPrompt = async (userPrompt) => {
  try {
    if (userPrompt.toLowerCase().includes("transfer")) {
      await executeTransaction(userPrompt);
    } else if (
      userPrompt.toLowerCase().includes("wallet details") ||
      userPrompt.toLowerCase().includes("balance")
    ) {
      await getWalletDetails();
    } else if (userPrompt.toLowerCase().includes("deploy token") ||  userPrompt.toLowerCase().includes("deploy a token")) {
      await deployERC20Token(userPrompt);
    } else if (userPrompt.toLowerCase().includes("deploy nft") ||  userPrompt.toLowerCase().includes("nft")) {
      await NFTERC20Token(userPrompt);
    } else if (userPrompt.toLowerCase().includes("price")) {
      await getTokenPrice(userPrompt);}
    else if (userPrompt.toLowerCase().includes("price drop")||userPrompt.toLowerCase().includes("drop") ) {
        const result = await checkPriceDrop(userPrompt);
        console.log(`Result: ${result}`);}

    else if (userPrompt.toLowerCase().includes("price increase")||(userPrompt.toLowerCase().includes("increase"))) {
          const result = await checkPriceIncrease(userPrompt);
          console.log(`Result: ${result}`);
        } 
    else {
      console.log("Unsupported prompt. Please specify 'Transfer', 'Wallet details', or 'Deploy token' or 'NFT Deploy' or 'Current Price' or 'Price drop' or 'Price increase'");
    }
  } catch (error) {
    console.error("Error handling user prompt:", error.message || error);
  }
};

// Example usage
const userPrompt1 = "Transfer 0.001 Flow to 0xF4c37eDCF86F96263a70294637a5BE0Df1B4E65f";
const userPrompt2 = "Get wallet details and balances";
const userPrompt3 = "Deploy token named Memcoin with symbol MMC and initial supply 1000000";
const userPrompt4 = "Deploy NFT named Memcoin with symbol MMC";
const userPrompt5 = "Get the current price of FLOW in USD";
const userPrompt6 = "Check if BTC drops 5% from $90843 in USD. If yes, suggest buying";
const userPrompt7 = "Check if BTC increases 10% above $$90886.05 in USD. If yes, suggest buying."
 
// Call for transfer
//handleUserPrompt(userPrompt1);

// Call for wallet details
//handleUserPrompt(userPrompt2);

// Call for deploying ERC20 token
//handleUserPrompt(userPrompt7);




