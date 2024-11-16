import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThirdwebProvider } from "thirdweb/react";
import Index from "./pages/Index";
import Aibuilder from "./pages/Aibuilder";

const queryClient = new QueryClient();

const App = () => (
  <ThirdwebProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Index />} />
            <Route path='/ai-builder' element={<Aibuilder />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThirdwebProvider>
);

export default App;
