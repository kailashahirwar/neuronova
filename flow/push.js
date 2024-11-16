const ethers = require("ethers");
require("dotenv").config();



const PushAPI = require("@pushprotocol/restapi");


const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io");
const privateKey = process.env.PUSH_KEY; // Replace with your wallet's private key (testnet)
const wallet = new ethers.Wallet(privateKey, provider);



async function sendNotification() {
   

    try {
       
        const userAlice = await PushAPI.PushAPI.initialize(wallet,{env:PushAPI.CONSTANTS.ENV.STAGING});
        const sendNotifRes = await userAlice.channel.send(['*'], {
            notification: { title: 'test', body: 'test' },
        });
        console.log("Notification Sent: ", sendNotifRes);
    } catch (error) {
        console.error("Error sending notification: ", error);
    }
}

sendNotification();
