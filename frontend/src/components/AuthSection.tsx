import { useState } from "react";
import { AnimatedLogo } from "./AnimatedLogo";
import { useConnectModal } from "thirdweb/react";
import { toast } from "@/components/ui/use-toast";
import { client } from "@/utils/utils";
import { defineChain } from "thirdweb/chains";

export const AuthSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { connect, isConnecting } = useConnectModal();

  const chain = defineChain({
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

  const handleAuth = async () => {
    try {
      setIsLoading(true);
      const wallet = await connect({ client, chain });
      wallet.autoConnect({ client });

      console.log("connected to wallet: ", wallet);
      toast({
        title: "Successfully connected",
        description: "Your wallet has been connected successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: "Failed to connect wallet. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full max-w-md mx-auto p-8 glass-panel rounded-2xl animate-fade-up'>
      <div className='flex flex-col items-center space-y-8'>
        {/* <AnimatedLogo /> */}
        <div className=' flex flex-col items-center justify-center relative w-full'>
          <img src='/logo.png' className='h-[250px]' />
          <p className='text-center text-md font-medium absolute bottom-0 '>
            {" "}
            Decentralised AI infrastructure for web3 & blockchain ecosystems
          </p>
        </div>

        <div className='text-center space-y-2'>
          <p className='text-primary-soft'>
            Connect your wallet to get started
          </p>
        </div>

        <button
          onClick={handleAuth}
          disabled={isLoading}
          className='button-primary w-full flex items-center justify-center space-x-2'
        >
          {isLoading ? (
            <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
          ) : (
            "Connect Wallet"
          )}
        </button>

        <p className='text-sm text-primary-muted'>
          By connecting, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
};
