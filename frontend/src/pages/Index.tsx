import { AuthSection } from "@/components/AuthSection";
import { agents, AgentSelect } from "@/components/AgentSelect";
import { ChatInterface } from "@/components/ChatInterface";
import { useState } from "react";
import { useDisconnect, useActiveWallet, useAutoConnect } from "thirdweb/react";
import { client, chain } from "@/utils/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const connect = useAutoConnect({
    client,
    chain,
  });
  const activeWallet = useActiveWallet();
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);
  console.log("active wallet", activeWallet);

  return (
    <div className='min-h-screen w-full bg-surface-soft px-4 py-12'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex items-center justify-between w-full'>
          <h3 className='font-medium text-2xl text-black '>Neuronova</h3>
          <Link
            to='/ai-builder'
            className='font-medium text-lg no-underline text-black '
          >
            <Button variant='outline'> AI Builder</Button>
          </Link>
        </div>
        {!activeWallet ? (
          <div className='min-h-[80vh] flex items-center justify-center'>
            <AuthSection />
          </div>
        ) : (
          <div className='space-y-12'>
            <div className='flex justify-center'>
              <AgentSelect
                setSelectedAgent={setSelectedAgent}
                selectedAgent={selectedAgent}
              />
            </div>
            <ChatInterface selectedAgent={selectedAgent} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
