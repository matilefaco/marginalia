import { createContext, useContext, useState, type ReactNode } from "react";
import {
  MOCK_BOOKS,
  MOCK_MARGINS,
  MOCK_PROGRESS,
  MOCK_USERS,
  MOCK_NOTIFICATIONS,
  type User,
  type Book,
  type Margin,
  type BookProgress,
  type Notification,
} from "../data/mockData";
import type { SpoilerPreference } from "../data/constants";

interface AppState {
  currentUser: User;
  books: Book[];
  margins: Margin[];
  progress: BookProgress[];
  notifications: Notification[];
  onboardingCompleted: boolean;
  onboardingStep: number;
}

interface AppActions {
  updateSpoilerPreference: (pref: SpoilerPreference) => void;
  updatePreferredGenres: (genres: string[]) => void;
  updateBookProgress: (bookId: number, updates: Partial<BookProgress>) => void;
  addMargin: (margin: Omit<Margin, "id" | "createdAt" | "reactions" | "commentsCount" | "userName" | "userInitials">) => void;
  addReaction: (marginId: number, reaction: string) => void;
  completeOnboarding: () => void;
  setOnboardingStep: (step: number) => void;
  getProgressForBook: (bookId: number) => BookProgress | undefined;
  markNotificationRead: (id: number) => void;
}

const AppContext = createContext<(AppState & AppActions) | null>(null);

const me = MOCK_USERS.find((u) => u.id === "user_me")!;

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(me);
  const [books] = useState<Book[]>(MOCK_BOOKS);
  const [margins, setMargins] = useState<Margin[]>(MOCK_MARGINS);
  const [progress, setProgress] = useState<BookProgress[]>(MOCK_PROGRESS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  const updateSpoilerPreference = (pref: SpoilerPreference) => {
    setCurrentUser((u) => ({ ...u, spoilerPreference: pref }));
  };

  const updatePreferredGenres = (genres: string[]) => {
    setCurrentUser((u) => ({ ...u, preferredGenres: genres }));
  };

  const updateBookProgress = (bookId: number, updates: Partial<BookProgress>) => {
    setProgress((prev) => {
      const existing = prev.find((p) => p.bookId === bookId && p.userId === "user_me");
      if (existing) {
        return prev.map((p) =>
          p.bookId === bookId && p.userId === "user_me" ? { ...p, ...updates } : p
        );
      }
      return [
        ...prev,
        {
          id: `p_${bookId}`,
          userId: "user_me",
          bookId,
          status: "reading",
          currentPage: 0,
          currentChapter: "",
          currentPercent: 0,
          lastOpenedAt: new Date().toISOString(),
          ...updates,
        } as BookProgress,
      ];
    });
  };

  const addMargin = (
    margin: Omit<Margin, "id" | "createdAt" | "reactions" | "commentsCount" | "userName" | "userInitials">
  ) => {
    const newMargin: Margin = {
      ...margin,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      reactions: {},
      commentsCount: 0,
      userName: currentUser.name,
      userInitials: currentUser.initials,
    };
    setMargins((prev) => [newMargin, ...prev]);
    setCurrentUser((u) => ({
      ...u,
      stats: { ...u.stats, totalMargins: u.stats.totalMargins + 1 },
    }));
  };

  const addReaction = (marginId: number, reaction: string) => {
    setMargins((prev) =>
      prev.map((m) => {
        if (m.id !== marginId) return m;
        const reactions = { ...m.reactions };
        reactions[reaction] = (reactions[reaction] || 0) + 1;
        return { ...m, reactions };
      })
    );
  };

  const completeOnboarding = () => setOnboardingCompleted(true);

  const getProgressForBook = (bookId: number) =>
    progress.find((p) => p.bookId === bookId && p.userId === "user_me");

  const markNotificationRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        books,
        margins,
        progress,
        notifications,
        onboardingCompleted,
        onboardingStep,
        updateSpoilerPreference,
        updatePreferredGenres,
        updateBookProgress,
        addMargin,
        addReaction,
        completeOnboarding,
        setOnboardingStep,
        getProgressForBook,
        markNotificationRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
