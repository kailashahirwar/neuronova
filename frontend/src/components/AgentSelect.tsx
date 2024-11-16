import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useDisconnect, useActiveWallet } from "thirdweb/react";
import { toast } from "@/components/ui/use-toast";

export const agents = [
  {
    id: "flow",
    name: "Flow Agent",
    description: "Specialise with Flow blockchain",
  },
  {
    id: "base",
    name: "Base Agent",
    description: "Specialise with Base blokchain",
  },
  // { id: "writer", name: "Content Writer", description: "Expert in writing and editing" },
];

export const AgentSelect = ({ setSelectedAgent, selectedAgent }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { disconnect } = useDisconnect();
  const wallet = useActiveWallet();

  const handleDisconnect = async () => {
    try {
      disconnect(wallet);
      toast({
        title: "Disconnected",
        description: "Your wallet has been disconnected",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to disconnect wallet",
      });
    }
  };

  return (
    <div className='relative w-full max-w-md'>
      <div className='flex items-center justify-between mb-8'>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='flex-1 p-4 glass-panel rounded-xl flex items-center justify-between group transition-all duration-300 hover:bg-surface mr-4'
        >
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center'>
              <div className='w-5 h-5 rounded-full bg-primary/10' />
            </div>
            <div className='text-left'>
              <p className='font-medium'>{selectedAgent.name}</p>
              <p className='text-sm text-primary-soft'>
                {selectedAgent.description}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-primary-soft transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        <button
          onClick={handleDisconnect}
          className='button-secondary px-4 py-2'
        >
          Disconnect
        </button>
      </div>

      {isOpen && (
        <div className='absolute top-full left-0 w-full mt-2 glass-panel rounded-xl overflow-hidden animate-scale-up z-50'>
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => {
                setSelectedAgent(agent);
                setIsOpen(false);
              }}
              className='w-full p-4 flex items-center space-x-3 transition-colors duration-200 hover:bg-surface'
            >
              <div className='w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center'>
                <div className='w-5 h-5 rounded-full bg-primary/10' />
              </div>
              <div className='text-left'>
                <p className='font-medium'>{agent.name}</p>
                <p className='text-sm text-primary-soft'>{agent.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
