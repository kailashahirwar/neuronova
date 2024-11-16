import axios from "axios";
import OpenAI from "openai";
import { createThirdwebClient, defineChain } from "thirdweb";

export const client = createThirdwebClient({
  clientId: "b7ec49e0de8497c8b0c4ef039205bf79",
});

export const chain = defineChain({
  id: 545,
  name: "Flow",
  nativeCurrency: { name: "Flow", symbol: "FLOW", decimals: 18 },
  blockExplorers: [
    {
      name: "Flow Testnet",
      url: "https://testnet.flowdiver.io",
    },
  ],
  testnet: true,
});

const openAiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
const apiUrl = import.meta.env.VITE_API_URL;
const pinataAPIToken = import.meta.env.VITE_PINATA_TOKEN;
export const openai = new OpenAI({
  apiKey: openAiApiKey,
  dangerouslyAllowBrowser: true,
});

export const apiFn = async ({ prompt }) => {
  try {
    const result = await axios({
      url: "https://api.nexaflow.xyz/api/cors/6738de37c4843fadfbfc6885",
      method: "post",
      data: {
        method: "post",
        data: {
          prompt,
        },
      },
      headers: {
        "x-api-key": "Bs1YgxhKcS5DH.8sPh+",
      },
    });
    return result?.data?.response;
  } catch (error) {
    console.log(error);
    return "Error Occurred";
  }
};

export const pushNotification = async (data) => {
  try {
    const result = await axios({
      url: "https://api.nexaflow.xyz/api/cors/67391434c4843fadfbfc68a6",
      method: "post",
      data: {
        method: "post",
        data,
      },
      headers: {
        "x-api-key": "Bs1YgxhKcS5DH.8sPh+",
      },
    });
    return result?.data?.response;
  } catch (error) {
    console.log(error);
    return "Error Occurred";
  }
};

export const pinToIPFS = async (data) => {
  let url = "https://api.pinata.cloud/pinning";
  let options = null;

  url += "/pinFileToIPFS";
  options = {
    maxBodyLength: "Infinity",
    headers: {
      "Content-Type": `multipart/form-data`,
      Authorization: `Bearer ${pinataAPIToken}`,
    },
  };

  const result = await axios.post(url, data, options);
  return result;
};
