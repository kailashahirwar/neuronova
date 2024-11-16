import { useEffect, useRef, useState } from "react";
import OpenAI from "openai";
import { Send } from "lucide-react";
import { sendTransaction } from "thirdweb";
import {
  useActiveAccount,
  useActiveWallet,
  useWalletBalance,
} from "thirdweb/react";
import { prepareTransaction, toWei } from "thirdweb";
import { sendAndConfirmTransaction } from "thirdweb";
import { apiFn, chain, client, openai, pushNotification } from "@/utils/utils";
import Memcoin from "../utils/MemeCoin.json";
import NFT from "../utils/Solarpunks.json";
import { ethers } from "ethers";
import axios from "axios";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
}

const rpcUrl = import.meta.env.VITE_RPC_URL;
const senderPrivateKey = import.meta.env.VITE_SENDER_PRIVATE_KEY;

// export const ChatInterface = () => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const activeWallet = useActiveWallet();
//   const account = useActiveAccount();
//   const { data } = useWalletBalance({
//     address: account?.address,
//     client,
//     chain,
//   });

//   // const provider = new ethers.JsonRpcProvider(rpcUrl);
//   // const signer = new ethers.Wallet(senderPrivateKey, provider);

//   // ERC20 Token Contract ABI and Bytecode
//   const erc20ABI = Memcoin.abi;
//   const erc20Bytecode = Memcoin.bytecode; // Replace with actual compiled bytecode for your ERC20 contract

//   // ERC20 Token Contract ABI and Bytecode
//   const NFTABI = NFT.abi;
//   const NFTBytecode = NFT.bytecode; // Replace with actual compiled bytecode for your ERC20 contract
//   const openai = new OpenAI({
//     apiKey:
//       "",
//     dangerouslyAllowBrowser: true,
//   });

//   const getWalletDetails = async () => {
//     try {
//       const address = account.address;

//       return `Address - ${address}

//       Balance - ${data.displayValue} FLOW`;
//     } catch (error) {
//       console.error("Error fetching wallet details:", error.message || error);
//     }
//   };

//   // transaction
//   const executeTransaction = async (prompt: any) => {
//     try {
//       const completion = await openai.chat.completions.create({
//         model: "gpt-3.5-turbo",
//         temperature: 0.5,
//         max_tokens: 100,
//         messages: [
//           {
//             role: "user",
//             content: `Extract transaction details from this prompt: ${prompt}. Provide a JSON object with "to" (recipient address) and "value" (amount in Flow).`,
//           },
//         ],
//       });

//       const response = completion.choices[0].message.content;
//       console.log("AI Response:", response);

//       const { to, value } = JSON.parse(response);

//       console.log("to-> ", to, " value-> ", value);
//       // Execute the transaction

//       const transaction = prepareTransaction({
//         to,
//         chain,
//         client,
//         value: toWei("1"),
//       });

//       const tx = await await sendAndConfirmTransaction({
//         transaction,
//         account,
//       });

//       return `
//         Transaction Completed
//         Transaction Hash - ${tx.transactionHash}
//       `;
//     } catch (error) {
//       console.error("Error:", error.message || error);
//     }
//   };

//   // Function to deploy ERC20 token
//   const NFTERC20Token = async (prompt) => {
//     try {
//       const completion = await openai.chat.completions.create({
//         model: "gpt-4",
//         temperature: 0.5,
//         max_tokens: 150,
//         messages: [
//           {
//             role: "user",
//             content: `Extract token deployment details from this prompt: "${prompt}". Provide a JSON object with "name", "symbol" (in tokens, not Wei).`,
//           },
//         ],
//       });

//       const response = completion.choices[0].message.content;
//       console.log("AI Response:", response);

//       const { name, symbol, initialSupply } = JSON.parse(response);

//       // Deploy ERC20 Token
//       console.log(`Deploying NFT Token: ${name} (${symbol})`);

//       //const initialSupplyInWei = ethers.parseUnits(initialSupply.toString(), "ether");
//       const factory = new ethers.ContractFactory(NFTABI, NFTBytecode, signer);

//       const contract = await factory.deploy();
//       // console.log("Deployment transaction sent:", contract.deployTransaction.hash);

//       console.log("Waiting for deployment confirmation...");
//       //  await contract.deployed();

//       // console.log(`Token deployed at address: ${contract.address}`);
//       console.log(`NFT deployment completed`);
//       return `NFT deployment done`;
//     } catch (error) {
//       console.error("Error deploying NFT:", error.message || error);
//     }
//   };

//   // Function to deploy ERC20 token
//   const deployERC20Token = async (prompt) => {
//     try {
//       const completion = await openai.chat.completions.create({
//         model: "gpt-4",
//         temperature: 0.5,
//         max_tokens: 150,
//         messages: [
//           {
//             role: "user",
//             content: `Extract token deployment details from this prompt: "${prompt}". Provide a JSON object with "name", "symbol", and "initialSupply" (in tokens, not Wei).`,
//           },
//         ],
//       });

//       const response = completion.choices[0].message.content;
//       console.log("AI Response:", response);

//       const { name, symbol, initialSupply } = JSON.parse(response);

//       // Deploy ERC20 Token
//       console.log(
//         `Deploying ERC20 Token: ${name} (${symbol}) with initial supply of ${initialSupply}...`
//       );

//       const initialSupplyInWei = ethers.parseUnits(
//         initialSupply.toString(),
//         "ether"
//       );
//       const factory = new ethers.ContractFactory(
//         erc20ABI,
//         erc20Bytecode,
//         signer
//       );

//       const contract = await factory.deploy();
//       // console.log("Deployment transaction sent:", contract.deployTransaction.hash);

//       console.log("Waiting for deployment confirmation...");
//       //  await contract.deployed();

//       // console.log(`Token deployed at address: ${contract.address}`);
//       console.log(`Token deployed done`);
//       return `ERC20 deployment completed`;
//     } catch (error) {
//       console.error("Error deploying ERC20 token:", error.message || error);
//     }
//   };

//   // Function to check price increase
//   const checkPriceIncrease = async (prompt) => {
//     try {
//       const completion = await openai.chat.completions.create({
//         model: "gpt-4",
//         temperature: 0.5,
//         max_tokens: 100,
//         messages: [
//           {
//             role: "user",
//             content: `Extract token symbol, currency, and the fixed price from this prompt: "${prompt}". Provide a JSON object with "symbol", "currency", and "fixedPrice".`,
//           },
//         ],
//       });

//       const response = completion.choices[0].message.content;
//       console.log("AI Response:", response);

//       const { symbol, currency, fixedPrice } = JSON.parse(response);
//       const currencyPair = `${symbol.toUpperCase()}-${currency.toUpperCase()}`;

//       // Fetch live token price from Coinbase
//       const apiUrl = `https://api.coinbase.com/v2/prices/${currencyPair}/spot`;
//       const apiResponse = await axios.get(apiUrl);

//       const currentPrice = parseFloat(apiResponse.data.data.amount);
//       const targetPrice = parseFloat(fixedPrice) * 1.1; // 10% increase threshold

//       console.log(
//         `Current Price of ${symbol.toUpperCase()} in ${currency.toUpperCase()}: $${currentPrice}`
//       );
//       console.log(`Target Price (10% increase): $${targetPrice}`);

//       if (currentPrice >= targetPrice) {
//         console.log("Buy recommendation triggered.");
//         return "Buy";
//       } else {
//         console.log("No buy recommendation. Price hasn't increased enough.");
//         return "Hold";
//       }
//     } catch (error) {
//       console.error("Error checking price increase:", error.message || error);
//     }
//   };

//   const checkPriceDrop = async (prompt) => {
//     try {
//       const completion = await openai.chat.completions.create({
//         model: "gpt-4",
//         temperature: 0.5,
//         max_tokens: 100,
//         messages: [
//           {
//             role: "user",
//             content: `Extract token symbol, currency, and the fixed price from this prompt: "${prompt}". Provide a JSON object with "symbol", "currency", and "fixedPrice".`,
//           },
//         ],
//       });

//       const response = completion.choices[0].message.content;
//       console.log("AI Response:", response);

//       const { symbol, currency, fixedPrice } = JSON.parse(response);
//       const currencyPair = `${symbol.toUpperCase()}-${currency.toUpperCase()}`;

//       // Fetch live token price from Coinbase
//       const apiUrl = `https://api.coinbase.com/v2/prices/${currencyPair}/spot`;
//       const apiResponse = await axios.get(apiUrl);

//       const currentPrice = parseFloat(apiResponse.data.data.amount);
//       const targetPrice = parseFloat(fixedPrice) * 0.95; // 5% drop threshold
//       // return `
//       // Current Price of ${symbol.toUpperCase()} in ${currency.toUpperCase()}: $${currentPrice}
//       //   Target Price (5% drop): $${targetPrice}
//       // `;

//       if (currentPrice <= targetPrice) {
//         console.log("Buy recommendation triggered.");
//         return "Buy";
//       } else {
//         console.log("No buy recommendation. Price hasn't dropped enough.");
//         return "Hold";
//       }
//     } catch (error) {
//       console.error("Error checking price drop:", error.message || error);
//     }
//   };

//   const getTokenPrice = async (prompt) => {
//     try {
//       const completion = await openai.chat.completions.create({
//         model: "gpt-4",
//         temperature: 0.5,
//         max_tokens: 100,
//         messages: [
//           {
//             role: "user",
//             content: `Extract cryptocurrency symbol and currency pair from this prompt: "${prompt}". Provide a JSON object with "symbol" (e.g., BTC) and "currency" (e.g., USD).`,
//           },
//         ],
//       });

//       const response = completion.choices[0].message.content;
//       console.log("AI Response:", response);

//       const { symbol, currency } = JSON.parse(response);
//       const currencyPair = `${symbol.toUpperCase()}-${currency.toUpperCase()}`;

//       // Fetch token price from Coinbase
//       const apiUrl = `https://api.coinbase.com/v2/prices/${currencyPair}/spot`;
//       const apiResponse = await axios.get(apiUrl);

//       const price = apiResponse.data.data.amount;
//       return `${symbol.toUpperCase()} current price in ${currency.toUpperCase()}: $${price}`;
//     } catch (error) {
//       console.error("Error fetching token price:", error.message || error);
//     }
//   };

//   const handleUserPrompt = async (userPrompt) => {
//     try {
//       if (userPrompt.toLowerCase().includes("transfer")) {
//         return await executeTransaction(userPrompt);
//       } else if (
//         userPrompt.toLowerCase().includes("wallet details") ||
//         userPrompt.toLowerCase().includes("balance")
//       ) {
//         return await getWalletDetails();
//       } else if (
//         userPrompt.toLowerCase().includes("deploy token") ||
//         userPrompt.toLowerCase().includes("deploy a token")
//       ) {
//         return await deployERC20Token(userPrompt);
//       } else if (
//         userPrompt.toLowerCase().includes("deploy nft") ||
//         userPrompt.toLowerCase().includes("nft")
//       ) {
//         return await NFTERC20Token(userPrompt);
//       } else if (userPrompt.toLowerCase().includes("price")) {
//         return await getTokenPrice(userPrompt);
//       } else if (
//         userPrompt.toLowerCase().includes("price drop") ||
//         userPrompt.toLowerCase().includes("drop")
//       ) {
//         const result = await checkPriceDrop(userPrompt);
//         console.log(`Result: ${result}`);
//         return result;
//       } else if (
//         userPrompt.toLowerCase().includes("price increase") ||
//         userPrompt.toLowerCase().includes("increase")
//       ) {
//         const result = await checkPriceIncrease(userPrompt);
//         console.log(`Result: ${result}`);
//         return result;
//       } else {
//         console.log(
//           "Unsupported prompt. Please specify 'Transfer', 'Wallet details', or 'Deploy token' or 'NFT Deploy' or 'Current Price' or 'Price drop' or 'Price increase'"
//         );
//       }
//     } catch (error) {
//       console.error("Error handling user prompt:", error.message || error);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!input.trim() || isLoading) return;

//     const userMessage = {
//       id: Date.now().toString(),
//       content: input.trim(),
//       isUser: true,
//     };

//     console.log("input,", input);

//     setMessages((prev) => [...prev, userMessage]);
//     setInput("");
//     setIsLoading(true);
//     const message = await handleUserPrompt(input);
//     console.log(message);

//     // sendNotification({
//     //   title: "Transaction Completed",
//     //   options: {
//     //     body: "This is your notification message.",
//     //   },
//     // });

//     // Simulate AI response
//     setTimeout(() => {
//       const aiMessage = {
//         id: (Date.now() + 1).toString(),
//         content: message,
//         isUser: false,
//       };
//       setMessages((prev) => [...prev, aiMessage]);
//       setIsLoading(false);
//     }, 1000);
//   };

//   return (
//     <div className='w-full max-w-3xl mx-auto h-[600px] glass-panel rounded-2xl flex flex-col'>
//       <div className='flex-1 p-6 space-y-4 overflow-y-auto'>
//         {messages.map((message) => (
//           <div
//             key={message.id}
//             className={`flex ${
//               message.isUser ? "justify-end" : "justify-start"
//             }`}
//           >
//             <div
//               className={`max-w-[80%] p-4 rounded-2xl animate-enter ${
//                 message.isUser
//                   ? "bg-primary text-white"
//                   : "bg-surface border border-border"
//               }`}
//             >
//               {message.content}
//             </div>
//           </div>
//         ))}
//         {isLoading && (
//           <div className='flex justify-start'>
//             <div className='bg-surface border border-border max-w-[80%] p-4 rounded-2xl animate-pulse'>
//               <div className='flex space-x-2'>
//                 <div className='w-2 h-2 rounded-full bg-primary/20 animate-bounce' />
//                 <div className='w-2 h-2 bg-primary/20 rounded-full animate-bounce [animation-delay:0.2s]' />
//                 <div className='w-2 h-2 bg-primary/20 rounded-full animate-bounce [animation-delay:0.4s]' />
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       <form onSubmit={handleSubmit} className='p-4 border-t border-border'>
//         <div className='flex space-x-4'>
//           <input
//             type='text'
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             placeholder='Type your message...'
//             className='flex-1 input-primary'
//           />
//           <button
//             type='submit'
//             disabled={!input.trim() || isLoading}
//             className='button-primary !px-4'
//           >
//             <Send className='w-5 h-5' />
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

const DEFAULT_PROMPTS = {
  flow: [
    "Transfer 0.001 Flow to 0xF4c37eDCF86F96263a70294637a5BE0Df1B4E65f",
    "Get wallet details and balances",
    "Deploy token named Memcoin with symbol MMC and initial supply 1000000",
    "Deploy NFT named Memcoin with symbol MMC",
    "Get the current price of FLOW in USD",
    "Check if FLOW drops 5% from $0.6 in USD. If yes, suggest buying",
    "Check if FLOW increases 10% above $0.6 in USD. If yes, suggest buying",
  ],
  base: [
    "Show my wallet details. Check my wallet balance as well. Use all tools to perform this task.",
    "What is the current price of the TRU token? Use get_spot_price_tool and csv_data_retriever_tool tools to perform this task.",
    "I want to buy ETH. Compare the price of current ETH with the historical data. If the drop is more than 1%, suggest. You can use all the tools to perform this task.",
    "Transfer 0.0001 ETH to 0xce89266Ee43023198ae02cd600f4dd81F165D18E.",
    "Register a basename neuronova.basetest.eth",
    "Deploy an ERC20 token with a ticker of 'NEURONOVA', the name 'NEURONOVA', and a total supply of 1000000.",
    "What was the price of ETH 4 hours ago?. Use get_spot_price_tool and csv_data_retriever_tool tools to perform this task.",
  ],
};

export const ChatInterface = ({ selectedAgent }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const lastItemRef = useRef(null);

  const activeWallet = useActiveWallet();
  const account = useActiveAccount();
  const { data } = useWalletBalance({
    address: account?.address,
    client,
    chain,
  });

  useEffect(() => {
    setInput("");
  }, [selectedAgent?.id]);

  const handleScrollToLast = () => {
    lastItemRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    handleScrollToLast();
  }, [messages]);

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(senderPrivateKey, provider);

  // ERC20 Token Contract ABI and Bytecode
  const erc20ABI = Memcoin.abi;
  const erc20Bytecode = Memcoin.bytecode; // Replace with actual compiled bytecode for your ERC20 contract

  // ERC20 Token Contract ABI and Bytecode
  const NFTABI = NFT.abi;
  const NFTBytecode = NFT.bytecode; // Replace with actual compiled bytecode for your ERC20 contract

  const getWalletDetails = async () => {
    try {
      const address = account.address;

      return `Address - ${address} 

      Balance - ${data.displayValue} FLOW`;
    } catch (error) {
      console.error("Error fetching wallet details:", error.message || error);
    }
  };

  // transaction
  const executeTransaction = async (prompt: any) => {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0.5,
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: `Extract transaction details from this prompt: ${prompt}. Provide a JSON object with "to" (recipient address) and "value" (amount in Flow).`,
          },
        ],
      });

      const response = completion.choices[0].message.content;
      console.log("AI Response:", response);

      const { to, value } = JSON.parse(response);

      console.log("to-> ", to, " value-> ", value);
      // Execute the transaction

      const transaction = prepareTransaction({
        to,
        chain,
        client,
        value: toWei("1"),
      });

      const tx = await sendAndConfirmTransaction({
        transaction,
        account,
      });

      return `
        Transaction Completed
        Transaction Hash - ${tx.transactionHash}
      `;
    } catch (error) {
      console.error("Error:", error.message || error);
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
      const address = await contract.getAddress();
      // console.log(`Token deployed at address: ${contract.address}`);
      console.log(`NFT deployment completed`);
      await pushNotification({
        title: "NFT Created",
        body: "Success",
      });
      return `Contract Address - ${address}
      NFT deployment completed`;
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
      const factory = new ethers.ContractFactory(
        erc20ABI,
        erc20Bytecode,
        signer
      );

      const contract = await factory.deploy();
      const address = await contract.getAddress();
      // console.log("Deployment transaction sent:", contract.deployTransaction.hash);

      console.log("Waiting for deployment confirmation...");
      //  await contract.deployed();

      // console.log(`Token deployed at address: ${contract.address}`);
      console.log(`Token deployed done`);
      await pushNotification({
        title: "Meme coin created",
        body: "Success",
      });
      return `Contract Address - ${address}
      ERC20 deployment completed`;
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

  const handleUserPrompt = async (userPrompt) => {
    try {
      if (selectedAgent.id === "base") {
        return await apiFn({ prompt: userPrompt });
      }

      if (userPrompt.toLowerCase().includes("transfer")) {
        return await executeTransaction(userPrompt);
      } else if (
        userPrompt.toLowerCase().includes("wallet details") ||
        userPrompt.toLowerCase().includes("balance")
      ) {
        return await getWalletDetails();
      } else if (
        userPrompt.toLowerCase().includes("deploy token") ||
        userPrompt.toLowerCase().includes("deploy a token")
      ) {
        return await deployERC20Token(userPrompt);
      } else if (
        userPrompt.toLowerCase().includes("deploy nft") ||
        userPrompt.toLowerCase().includes("nft")
      ) {
        return await NFTERC20Token(userPrompt);
      } else if (userPrompt.toLowerCase().includes("price")) {
        return await getTokenPrice(userPrompt);
      } else if (
        userPrompt.toLowerCase().includes("price drop") ||
        userPrompt.toLowerCase().includes("drop")
      ) {
        const result = await checkPriceDrop(userPrompt);
        console.log(`Result: ${result}`);
        return result;
      } else if (
        userPrompt.toLowerCase().includes("price increase") ||
        userPrompt.toLowerCase().includes("increase")
      ) {
        const result = await checkPriceIncrease(userPrompt);
        console.log(`Result: ${result}`);
        return result;
      } else {
        return "Unsupported prompt. Please specify 'Transfer', 'Wallet details', or 'Deploy token' or 'NFT Deploy' or 'Current Price' or 'Price drop' or 'Price increase'";
      }
    } catch (error) {
      console.error("Error handling user prompt:", error.message || error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    const message = await handleUserPrompt(input);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: message,
        isUser: false,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className='w-full max-w-3xl mx-auto h-[600px] glass-panel rounded-2xl flex flex-col'>
      <div className='flex-1 p-6 space-y-4 overflow-y-auto'>
        <div className='grid grid-cols-1 gap-3 mb-6'>
          {DEFAULT_PROMPTS[selectedAgent?.id].map((prompt, index) => (
            <button
              key={index}
              onClick={() => handlePromptClick(prompt)}
              className='p-3 text-left transition-colors duration-200 border rounded-lg bg-surface hover:bg-surface-muted border-border/50'
            >
              {prompt}
            </button>
          ))}
        </div>

        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${
              message.isUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl animate-enter ${
                message.isUser
                  ? "bg-primary text-white"
                  : "bg-surface border border-border"
              }`}
            >
              {message.content}
            </div>
            <p ref={index === messages.length - 1 ? lastItemRef : null}> </p>
          </div>
        ))}
        {isLoading && (
          <div className='flex justify-start'>
            <div className='bg-surface border border-border max-w-[80%] p-4 rounded-2xl animate-pulse'>
              <div className='flex space-x-2'>
                <div className='w-2 h-2 rounded-full bg-primary/20 animate-bounce' />
                <div className='w-2 h-2 bg-primary/20 rounded-full animate-bounce [animation-delay:0.2s]' />
                <div className='w-2 h-2 bg-primary/20 rounded-full animate-bounce [animation-delay:0.4s]' />
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className='p-4 border-t border-border'>
        <div className='flex space-x-4'>
          <input
            type='text'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Type your message...'
            className='flex-1 input-primary'
          />
          <button
            type='submit'
            disabled={!input.trim() || isLoading}
            className='button-primary !px-4'
          >
            <Send className='w-5 h-5' />
          </button>
        </div>
      </form>
    </div>
  );
};
