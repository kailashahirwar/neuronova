require("dotenv").config();
const OpenAI = require('openai');
const ethers = require("ethers");

const provider = new ethers.JsonRpcProvider( process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.SENDER_PRIVATE_KEY, provider);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY  // Ensure API key is loaded from the .env file
  });

const executeTransaction = async (prompt) => {
    try {
       

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            temperature: 0.5,
            max_tokens: 100,
            messages: [{ role: "user", content: `Extract transaction details from this prompt: "${prompt}". Provide a JSON object with "to" (recipient address) and "value" (amount in Flow).` }] 
          });


        const response = completion.choices[0].message.content;
        console.log("AI Response:", response);

        const { to, value } = JSON.parse(response);

        // Convert the value to Wei (smallest unit of ETH)
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
        console.error("Error:", error.message || error);
    }
};

// Example usage
const userPrompt = "Transfer 0.001 Flow to 0xF4c37eDCF86F96263a70294637a5BE0Df1B4E65f";
executeTransaction(userPrompt);
