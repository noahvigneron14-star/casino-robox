import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Layout } from "@/components/layout";
import LoginPage from "@/pages/login";
import Home from "@/pages/home";
import CrashGame from "@/pages/crash";
import MinesGame from "@/pages/mines";
import TowersGame from "@/pages/towers";
import PlinkoGame from "@/pages/plinko";
import DiceGame from "@/pages/dice";
import SlotsGame from "@/pages/slots";
import CasesGame from "@/pages/cases";
import CoinFlipGame from "@/pages/coinflip";
import Profile from "@/pages/profile";
import Leaderboard from "@/pages/leaderboard";
import Promotions from "@/pages/promotions";
import NotFound from "@/pages/not-found";

import { getCurrentSession } from "@/lib/accounts";
import { useCasinoStore } from "@/store/use-casino-store";

const queryClient = new QueryClient();

function AuthGate() {
  const [authed, setAuthed] = useState(false);
  const { loadSession } = useCasinoStore();

  useEffect(() => {
    document.documentElement.classList.add("dark");
    const session = getCurrentSession();
    if (session) {
      loadSession();
      setAuthed(true);
    }
  }, []);

  const handleLogin = () => {
    loadSession();
    setAuthed(true);
  };

  const handleLogout = () => {
    setAuthed(false);
  };

  if (!authed) {
    return <LoginPage onSuccess={handleLogin} />;
  }

  return (
    <WouterRouter base="">
      <Layout onLogout={handleLogout}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/crash" component={CrashGame} />
          <Route path="/mines" component={MinesGame} />
          <Route path="/towers" component={TowersGame} />
          <Route path="/plinko" component={PlinkoGame} />
          <Route path="/dice" component={DiceGame} />
          <Route path="/slots" component={SlotsGame} />
          <Route path="/cases" component={CasesGame} />
          <Route path="/coinflip" component={CoinFlipGame} />
          <Route path="/profile" component={Profile} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/promotions" component={Promotions} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthGate />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
