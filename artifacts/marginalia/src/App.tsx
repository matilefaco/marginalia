import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { LogoMark } from "@/components/LogoMark";
import { Navbar } from "@/components/Navbar";

// We'll import pages later. For now, placeholders to wire up routing.
import Home from "@/pages/Home";
import Explore from "@/pages/Explore";
import Library from "@/pages/Library";
import Profile from "@/pages/Profile";
import BookHub from "@/pages/BookHub";
import Reader from "@/pages/Reader";
import Thread from "@/pages/Thread";

const queryClient = new QueryClient();

function Splash() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background bg-paper">
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-1000">
        <div className="w-24 h-24 mb-6">
          <LogoMark />
        </div>
        <h1 className="font-serif italic text-4xl text-foreground mb-4">Marginalia</h1>
        <p className="font-sans font-light tracking-[0.2em] uppercase text-sm text-foreground/60">
          Leia junto. Sinta junto.
        </p>
      </div>
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  const hideNavbar = location.startsWith('/reader/');

  return (
    <div className="min-h-[100dvh] flex flex-col w-full max-w-md mx-auto relative bg-background shadow-2xl">
      <div className="flex-1 pb-20">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/explore" component={Explore} />
          <Route path="/library" component={Library} />
          <Route path="/profile" component={Profile} />
          <Route path="/book/:id" component={BookHub} />
          <Route path="/reader/:id" component={Reader} />
          <Route path="/thread/:id" component={Thread} />
          <Route component={NotFound} />
        </Switch>
      </div>
      {!hideNavbar && <Navbar />}
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          {showSplash ? <Splash /> : <Router />}
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;