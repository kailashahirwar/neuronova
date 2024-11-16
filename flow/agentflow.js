require("dotenv").config();
const OpenAI = require("openai");
const ethers = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.SENDER_PRIVATE_KEY, provider);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to fetch wallet details and balance
const getWalletDetails = async () => {
  try {
    const balance = await provider.getBalance(signer.address);
    console.log(`Wallet Address: ${signer.address}`);
    console.log(`Balance: ${ethers.formatEther(balance)} FLOW`);
  } catch (error) {
    console.error("Error fetching wallet details:", error.message || error);
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
          content: `Extract transaction details from this prompt: "${prompt}". Provide a JSON object with "to" (recipient address) and "value" (amount in ETH).`,
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
    } else {
      console.log("Unsupported prompt. Please specify 'Transfer' or 'Wallet details'.");
    }
  } catch (error) {
    console.error("Error handling user prompt:", error.message || error);
  }
};

// Example usage
const userPrompt1 = "Transfer 0.001 ETH to 0xF4c37eDCF86F96263a70294637a5BE0Df1B4E65f";
const userPrompt2 = "Get wallet details and balances";

// Call for transfer
//handleUserPrompt(userPrompt1);

// Call for wallet details
handleUserPrompt(userPrompt2);
