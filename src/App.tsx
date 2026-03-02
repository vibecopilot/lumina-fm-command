import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import UrlParamSync from "./components/UrlParamSync";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>

        <UrlParamSync>

          <Routes>

            {/* Dashboard */}
            <Route path="/" element={<Index />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />

          </Routes>

        </UrlParamSync>

      </BrowserRouter>

    </TooltipProvider>
  </QueryClientProvider>
);

export default App;