import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/context/AppContext";
import Index from "./pages/Index.tsx";
import FleetDetail from "./pages/FleetDetail.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import CarMarket from "./pages/market/CarMarket.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AccountMfa from "./pages/AccountMfa.tsx";
import NotFound from "./pages/NotFound.tsx";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useApp();
  const [aal, setAal] = useState<string | null | "loading">("loading");
  useEffect(() => {
    supabase.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data }) => {
      setAal(data?.currentLevel ?? null);
    });
  }, [currentUser?.id]);
  if (!currentUser) return <Navigate to="/auth" replace />;
  if (currentUser.role !== "admin") return <Navigate to="/" replace />;
  if (aal === "loading") return null;
  if (aal !== "aal2") return <Navigate to="/account/mfa" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/fleet/:slug" element={<FleetDetail />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/account/mfa" element={<AccountMfa />} />
      <Route path="/market" element={<CarMarket />} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
