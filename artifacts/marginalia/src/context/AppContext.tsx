import { createContext, useContext, useState, useMemo, type ReactNode } from "react";
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
import { useAuth } from "./AuthContext";

interface AppState {
  currentUser: User;
  books: Book[];
  margins: Margin[];
  progress: BookProgress[];
  notifications: Notification[];
  onboardingCompleted: boolean;
  onboardingStep: number;
  userReactions: Record<number, string>;
  lastUsedReaction: string | null;
  savedMargins: number[];
}

interface AppActions {
  updateSpoilerPreference: (pref: SpoilerPreference) => void;
  updatePreferredGenres: (genres: string[]) => void;
  updateProfile: (data: { firstName?: string; lastName?: string; bio?: string; username?: string; city?: string; email?: string; avatarColor?: string; readerType?: string; instagram?: string; tiktok?: string }) => void;
  updateBookProgress: (bookId: number, updates: Partial<BookProgress>) => void;
  addMargin: (margin: Omit<Margin, "id" | "createdAt" | "reactions" | "commentsCount" | "userName" | "userInitials">) => void;
  addReaction: (marginId: number, emoji: string) => void;
  toggleSaveMargin: (marginId: number) => void;
  completeOnboarding: () => void;
  setOnboardingStep: (step: number) => void;
  getProgressForBook: (bookId: number) => BookProgress | undefined;
  markNotificationRead: (id: number) => void;
}

const AppContext = createContext<(AppState & AppActions) | null>(null);

const mockMe = MOCK_USERS.find((u) => u.id === "user_me")!;

function buildUserFromProfile(
  profile: import("./AuthContext").SupabaseProfile,
  userId: string,
  email: string
): User {
  const nameParts = (profile.full_name || "Leitor").split(" ");
  const firstName = nameParts[0] || "Leitor";
  const lastName = nameParts.slice(1).join(" ") || "";
  const name = lastName ? `${firstName} ${lastName}` : firstName;
  const initials = (
    firstName.charAt(0) + (lastName?.charAt(0) || "")
  ).toUpperCase();
  return {
    id: userId,
    name,
    firstName,
    lastName,
    username: profile.username || "@leitor",
    email,
    bio: profile.bio || "",
    city: profile.city || "",
    instagram: profile.instagram_handle || "",
    tiktok: profile.tiktok_handle || "",
    avatarColor: profile.avatar_color || "#697962",
    initials,
    readerType: "observador",
    readingSignature:
      profile.reading_signature || "Cada livro me deixa diferente",
    spoilerPreference: "chapter",
    preferredGenres: [],
    favoriteAuthors: [],
    stats: {
      booksRead: 0,
      totalMargins: 0,
      totalHighlights: 0,
      debates: 0,
    },
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { profile, supabaseUser } = useAuth();

  const currentUser: User = useMemo(() => {
    if (profile && supabaseUser) {
      return buildUserFromProfile(profile, supabaseUser.id, supabaseUser.email || "");
    }
    return mockMe;
  }, [profile, supabaseUser]);

  const [books] = useState<Book[]>(MOCK_BOOKS);
  const [margins, setMargins] = useState<Margin[]>(MOCK_MARGINS);
  const [progress, setProgress] = useState<BookProgress[]>(MOCK_PROGRESS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [onboardingCompleted] = useState(() =>
    localStorage.getItem("marginalia_onboarded") === "true"
  );
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [userReactions, setUserReactions] = useState<Record<number, string>>({});
  const [lastUsedReaction, setLastUsedReaction] = useState<string | null>(null);
  const [savedMargins, setSavedMargins] = useState<number[]>([]);

  const updateSpoilerPreference = (_pref: SpoilerPreference) => {};

  const updatePreferredGenres = (_genres: string[]) => {};

  const updateProfile = (_data: { firstName?: string; lastName?: string; bio?: string; username?: string; city?: string; email?: string; avatarColor?: string; readerType?: string; instagram?: string; tiktok?: string }) => {};

  const updateBookProgress = (bookId: number, updates: Partial<BookProgress>) => {
    setProgress((prev) => {
      const existing = prev.find(
        (p) => p.bookId === bookId && p.userId === "user_me"
      );
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
  };

  const addReaction = (marginId: number, emoji: string) => {
    const prevEmoji = userReactions[marginId];
    if (prevEmoji === emoji) {
      setUserReactions((prev) => {
        const next = { ...prev };
        delete next[marginId];
        return next;
      });
      setMargins((prev) =>
        prev.map((m) => {
          if (m.id !== marginId) return m;
          const reactions = { ...m.reactions } as Record<string, number>;
          reactions[emoji] = Math.max(0, (reactions[emoji] || 1) - 1);
          if (reactions[emoji] === 0) delete reactions[emoji];
          return { ...m, reactions };
        })
      );
    } else {
      setUserReactions((prev) => ({ ...prev, [marginId]: emoji }));
      setLastUsedReaction(emoji);
      setMargins((prev) =>
        prev.map((m) => {
          if (m.id !== marginId) return m;
          const reactions = { ...m.reactions } as Record<string, number>;
          if (prevEmoji) {
            reactions[prevEmoji] = Math.max(0, (reactions[prevEmoji] || 1) - 1);
            if (reactions[prevEmoji] === 0) delete reactions[prevEmoji];
          }
          reactions[emoji] = (reactions[emoji] || 0) + 1;
          return { ...m, reactions };
        })
      );
    }
  };

  const toggleSaveMargin = (marginId: number) => {
    setSavedMargins((prev) =>
      prev.includes(marginId)
        ? prev.filter((id) => id !== marginId)
        : [...prev, marginId]
    );
  };

  const completeOnboarding = () => {
    localStorage.setItem("marginalia_onboarded", "true");
  };

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
        userReactions,
        lastUsedReaction,
        savedMargins,
        updateSpoilerPreference,
        updatePreferredGenres,
        updateProfile,
        updateBookProgress,
        addMargin,
        addReaction,
        toggleSaveMargin,
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
