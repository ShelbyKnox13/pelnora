import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/useAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Team from "@/pages/Team";
import Earnings from "@/pages/Earnings";
import AutoPool from "@/pages/AutoPool";
import Withdrawals from "@/pages/Withdrawals";
import Admin from "@/pages/Admin";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import { useEffect } from "react";

function Router() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Handle /signup route with referral ID
    const handleSignupRoute = () => {
      const url = new URL(window.location.href);
      const ref = url.searchParams.get('ref');
      if (ref) {
        // Store the referral ID in sessionStorage
        sessionStorage.setItem('referralId', ref);
        // Redirect to home page
        setLocation('/');
      }
    };

    handleSignupRoute();
  }, [setLocation]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/team" component={Team} />
      <Route path="/earnings" component={Earnings} />
      <Route path="/auto-pool" component={AutoPool} />
      <Route path="/withdrawals" component={Withdrawals} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/signup" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
