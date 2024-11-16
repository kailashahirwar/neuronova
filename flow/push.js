const ethers = require("ethers");
require("dotenv").config();
const PushAPI = require("@pushprotocol/restapi");
const express = require('express')
const app = express()
const port = 3000

app.use(express.json());

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io");
const privateKey = process.env.PUSH_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

async function sendNotification(title1, body1) {
    try {
        const userAlice = await PushAPI.PushAPI.initialize(wallet,{env:PushAPI.CONSTANTS.ENV.STAGING});
        const sendNotifRes = await userAlice.channel.send(['*'], {
            notification: { title: title1, body: body1 },
        });
        console.log("Notification Sent: ", sendNotifRes);
    } catch (error) {
        console.error("Error sending notification: ", error);
    }
}

app.post('/', (req, res) => {
    console.log(req.body)
    sendNotification(req.body.title, req.body.body);
    res.send('Push notification sent successfully!')
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})