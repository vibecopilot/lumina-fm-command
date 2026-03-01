import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GroupedDashboardPage from "./pages/GroupedDashboardPage";

const queryClient = new QueryClient();

function UrlParamSync() {
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const t = searchParams.get("t");
    const u = searchParams.get("u");
    const s = searchParams.get("s");

    if (t) localStorage.setItem("token", t);
    if (u) {
      try {
        const decoded = decodeURIComponent(u);
        const userObject = JSON.parse(decoded);
        localStorage.setItem("user_details", JSON.stringify(userObject));
      } catch {
        try {
          const userObject = JSON.parse(u);
          localStorage.setItem("user_details", JSON.stringify(userObject));
        } catch (e) {
          console.error("User param parse error", e);
        }
      }
    }
    if (s) localStorage.setItem("active_site", s);

    if (t || u || s) {
      searchParams.delete("t");
      searchParams.delete("u");
      searchParams.delete("s");
      const search = searchParams.toString();
      const cleanUrl = location.pathname + (search ? `?${search}` : "") + location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [location.search, location.pathname, location.hash]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <>
          <UrlParamSync />
          <Routes>
          <Route path="/grouped-dashboard" element={<GroupedDashboardPage />} />
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
