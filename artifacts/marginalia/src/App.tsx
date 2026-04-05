import { useState } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/context/AppContext";
import { LogoMark } from "@/components/LogoMark";
import { Navbar } from "@/components/Navbar";

import { OnboardingWelcomeScreen } from "@/screens/onboarding/OnboardingWelcomeScreen";
import { OnboardingGenresScreen } from "@/screens/onboarding/OnboardingGenresScreen";
import { OnboardingSpoilerScreen } from "@/screens/onboarding/OnboardingSpoilerScreen";
import { OnboardingBooksScreen } from "@/screens/onboarding/OnboardingBooksScreen";
import { SignUpScreen } from "@/screens/auth/SignUpScreen";

import { HomeScreen } from "@/screens/main/HomeScreen";
import { ExploreScreen } from "@/screens/main/ExploreScreen";
import { NewMarginScreen } from "@/screens/main/NewMarginScreen";
import { LibraryScreen } from "@/screens/main/LibraryScreen";
import { BookDetailScreen } from "@/screens/main/BookDetailScreen";
import { ProfileScreen } from "@/screens/main/ProfileScreen";
import { NotificationsScreen } from "@/screens/main/NotificationsScreen";
import { SettingsScreen } from "@/screens/main/SettingsScreen";
import { ThreadScreen } from "@/screens/main/ThreadScreen";
import NotFound from "@/pages/not-found";

import type { SpoilerPreference } from "@/data/constants";

const queryClient = new QueryClient();

function Splash() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF8F3]"
      style={{ backgroundImage: "radial-gradient(circle, rgba(189,171,156,0.12) 1px, transparent 1px)", backgroundSize: "5px 5px" }}
    >
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
        <div className="w-16 h-20 mb-6">
          <LogoMark />
        </div>
        <h1 className="font-serif italic text-[38px] text-[#454545] mb-3">Marginalia</h1>
        <p className="font-sans font-light tracking-[0.22em] uppercase text-[10px] text-[#AE8F7D]">
          Leia junto. Sinta junto.
        </p>
      </div>
    </div>
  );
}

type OnboardingStep = "welcome" | "genres" | "spoiler" | "signup" | "books" | "done";

function OnboardingFlow() {
  const { updatePreferredGenres, updateSpoilerPreference, completeOnboarding, currentUser } = useApp();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [pendingGenres, setPendingGenres] = useState<string[]>(currentUser.preferredGenres);
  const [pendingSpoiler, setPendingSpoiler] = useState<SpoilerPreference>(currentUser.spoilerPreference);

  if (step === "welcome") {
    return (
      <OnboardingWelcomeScreen
        onStart={() => setStep("genres")}
        onLogin={() => setStep("signup")}
      />
    );
  }

  if (step === "genres") {
    return (
      <OnboardingGenresScreen
        selected={pendingGenres}
        onContinue={(genres) => {
          setPendingGenres(genres);
          updatePreferredGenres(genres);
          setStep("spoiler");
        }}
      />
    );
  }

  if (step === "spoiler") {
    return (
      <OnboardingSpoilerScreen
        selected={pendingSpoiler}
        onContinue={(pref) => {
          setPendingSpoiler(pref);
          updateSpoilerPreference(pref);
          setStep("signup");
        }}
      />
    );
  }

  if (step === "signup") {
    return (
      <SignUpScreen
        onComplete={() => setStep("books")}
        onBack={() => setStep("spoiler")}
      />
    );
  }

  if (step === "books") {
    return (
      <OnboardingBooksScreen
        onComplete={() => {
          completeOnboarding();
        }}
      />
    );
  }

  return null;
}

const NO_NAVBAR_PATHS = ["/nova-margem", "/notifications", "/settings"];

function MainApp() {
  const [location] = useLocation();
  const hideNavbar =
    NO_NAVBAR_PATHS.includes(location) ||
    location.startsWith("/thread/");

  return (
    <div className="min-h-[100dvh] flex flex-col w-full max-w-md mx-auto relative bg-[#FAF8F3] shadow-2xl">
      <div className="flex-1 pb-20">
        <Switch>
          <Route path="/" component={HomeScreen} />
          <Route path="/explore" component={ExploreScreen} />
          <Route path="/nova-margem" component={NewMarginScreen} />
          <Route path="/library" component={LibraryScreen} />
          <Route path="/book/:id" component={BookDetailScreen} />
          <Route path="/profile" component={ProfileScreen} />
          <Route path="/notifications" component={NotificationsScreen} />
          <Route path="/settings" component={SettingsScreen} />
          <Route path="/thread/:id" component={ThreadScreen} />
          <Route component={NotFound} />
        </Switch>
      </div>
      {!hideNavbar && <Navbar />}
    </div>
  );
}

function AppContent() {
  const { onboardingCompleted } = useApp();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    setTimeout(() => setShowSplash(false), 2200);
    return <Splash />;
  }

  if (!onboardingCompleted) {
    return (
      <div className="min-h-[100dvh] flex flex-col w-full max-w-md mx-auto bg-[#FAF8F3] shadow-2xl">
        <OnboardingFlow />
      </div>
    );
  }

  return <MainApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppContent />
          </WouterRouter>
        </AppProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
