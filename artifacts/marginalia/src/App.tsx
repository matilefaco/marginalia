import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppProvider, useApp } from "@/context/AppContext";
import { LogoMark } from "@/components/LogoMark";
import { Navbar } from "@/components/Navbar";

import { OnboardingWelcomeScreen } from "@/screens/onboarding/OnboardingWelcomeScreen";
import { OnboardingGenresScreen } from "@/screens/onboarding/OnboardingGenresScreen";
import { OnboardingSpoilerScreen } from "@/screens/onboarding/OnboardingSpoilerScreen";
import { OnboardingBooksScreen } from "@/screens/onboarding/OnboardingBooksScreen";
import { SignUpScreen } from "@/screens/auth/SignUpScreen";
import { LoginScreen } from "@/screens/auth/LoginScreen";

import { HomeScreen } from "@/screens/main/HomeScreen";
import { ExploreScreen } from "@/screens/main/ExploreScreen";
import { NewMarginScreen } from "@/screens/main/NewMarginScreen";
import { LibraryScreen } from "@/screens/main/LibraryScreen";
import { BookDetailScreen } from "@/screens/main/BookDetailScreen";
import { ProfileScreen } from "@/screens/main/ProfileScreen";
import { NotificationsScreen } from "@/screens/main/NotificationsScreen";
import { SettingsScreen } from "@/screens/main/SettingsScreen";
import { PreferencesNotificationsScreen } from "@/screens/main/PreferencesNotificationsScreen";
import { PreferencesPrivacyScreen } from "@/screens/main/PreferencesPrivacyScreen";
import { AboutScreen } from "@/screens/main/AboutScreen";
import { ThreadScreen } from "@/screens/main/ThreadScreen";
import { EcoScreen } from "@/screens/main/EcoScreen";
import { UserProfileScreen } from "@/screens/main/UserProfileScreen";
import { PublicBookScreen } from "@/screens/main/PublicBookScreen";
import NotFound from "@/pages/not-found";

import type { SpoilerPreference } from "@/data/constants";

const queryClient = new QueryClient();

function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF8F3]"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(189,171,156,0.12) 1px, transparent 1px)",
        backgroundSize: "5px 5px",
      }}
    >
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
        <div className="w-16 h-20 mb-6">
          <LogoMark />
        </div>
        <h1 className="font-serif italic text-[38px] text-[#3D3D3D] mb-2">Marginalia</h1>
        <p className="font-sans font-light tracking-[0.22em] uppercase text-[10px] text-[#AE8F7D]">
          Leia junto. Sinta junto.
        </p>
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#FAF8F3]">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#AE8F7D] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

type OnboardingStep = "welcome" | "genres" | "signup" | "spoiler" | "books" | "login";

function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const { updatePreferredGenres, updateSpoilerPreference, completeOnboarding } = useApp();
  const { signUp, updateProfile } = useAuth();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [pendingGenres, setPendingGenres] = useState<string[]>([]);
  const [pendingSpoiler, setPendingSpoiler] = useState<SpoilerPreference | null>(null);
  const [signupError, setSignupError] = useState("");

  const finish = () => {
    completeOnboarding();
    onComplete();
  };

  if (step === "welcome") {
    return (
      <OnboardingWelcomeScreen
        onStart={() => setStep("genres")}
        onLogin={() => setStep("login")}
      />
    );
  }

  if (step === "login") {
    return (
      <LoginScreen
        onLogin={finish}
        onBack={() => setStep("welcome")}
      />
    );
  }

  if (step === "genres") {
    return (
      <OnboardingGenresScreen
        selected={pendingGenres}
        onContinue={(genres) => {
          setPendingGenres(genres);
          setStep("signup");
        }}
        onBack={() => setStep("welcome")}
      />
    );
  }

  if (step === "signup") {
    return (
      <SignUpScreen
        externalError={signupError}
        onComplete={async (data) => {
          setSignupError("");
          const { error } = await signUp({
            email: data.email,
            password: data.password,
            username: data.username.replace(/^@/, ""),
            fullName: data.lastName
              ? `${data.firstName} ${data.lastName}`
              : data.firstName,
            bio: data.bio,
          });
          if (error) {
            setSignupError(error);
            return;
          }
          updatePreferredGenres(pendingGenres);
          await updateProfile({ avatar_id: data.avatarId });
          setStep("spoiler");
        }}
        onBack={() => setStep("genres")}
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
          setStep("books");
        }}
        onBack={() => setStep("signup")}
      />
    );
  }

  if (step === "books") {
    return <OnboardingBooksScreen onComplete={finish} onBack={() => setStep("spoiler")} />;
  }

  return null;
}

const NO_NAVBAR_PATHS = [
  "/nova-margem",
  "/notifications",
  "/settings",
  "/settings/notifications",
  "/settings/privacy",
  "/settings/about",
];

function MainApp() {
  const [location] = useLocation();
  const hideNavbar = NO_NAVBAR_PATHS.includes(location) || location.startsWith("/thread/") || location.startsWith("/eco/");

  return (
    <div className="min-h-[100dvh] flex flex-col w-full max-w-md mx-auto relative bg-[#FAF8F3] shadow-2xl overflow-x-hidden">
      <div className="flex-1 pb-20 overflow-x-hidden">
        <Switch>
          <Route path="/" component={HomeScreen} />
          <Route path="/explore" component={ExploreScreen} />
          <Route path="/nova-margem" component={NewMarginScreen} />
          <Route path="/library" component={LibraryScreen} />
          <Route path="/book/:id" component={BookDetailScreen} />
          <Route path="/profile" component={ProfileScreen} />
          <Route path="/notifications" component={NotificationsScreen} />
          <Route path="/settings" component={SettingsScreen} />
          <Route path="/settings/notifications" component={PreferencesNotificationsScreen} />
          <Route path="/settings/privacy" component={PreferencesPrivacyScreen} />
          <Route path="/settings/about" component={AboutScreen} />
          <Route path="/thread/:id" component={ThreadScreen} />
          <Route path="/eco/:id" component={EcoScreen} />
          <Route path="/user/:id" component={UserProfileScreen} />
          <Route path="/perfil/:username" component={UserProfileScreen} />
          <Route component={NotFound} />
        </Switch>
      </div>
      {!hideNavbar && <Navbar />}
    </div>
  );
}

function AppContent() {
  const { session, authLoading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);
  const [location] = useLocation();
  // Determined once after auth resolves — true if user had no session on first load.
  // Stays stable even when signUp() creates a new session mid-onboarding.
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    if (!authLoading && needsOnboarding === null) {
      setNeedsOnboarding(!session);
    }
  }, [authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Public routes — accessible without auth, no splash */
  if (location.startsWith("/livro/")) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Switch>
          <Route path="/livro/:id" component={PublicBookScreen} />
        </Switch>
      </div>
    );
  }

  if (!splashDone) {
    return <Splash onDone={() => setSplashDone(true)} />;
  }

  if (authLoading || needsOnboarding === null) {
    return <LoadingDots />;
  }

  if (needsOnboarding && !onboardingDone) {
    return (
      <div className="min-h-[100dvh] flex flex-col w-full max-w-md mx-auto bg-[#FAF8F3] shadow-2xl">
        <OnboardingFlow onComplete={() => setOnboardingDone(true)} />
      </div>
    );
  }

  return <MainApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <AppContent />
            </WouterRouter>
          </AppProvider>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
