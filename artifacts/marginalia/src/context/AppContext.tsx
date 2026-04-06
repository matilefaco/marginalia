import { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from "react";
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

export interface NotificationPrefs {
  reactions: boolean;
  comments: boolean;
  replies: boolean;
  saves: boolean;
  trendingBooks: boolean;
  recommendations: boolean;
  updates: boolean;
  email: boolean;
  inApp: boolean;
}

export interface PrivacyPrefs {
  profilePublic: boolean;
  showInstagram: boolean;
  showTikTok: boolean;
  showCity: boolean;
  showGenres: boolean;
  showStats: boolean;
  showEcos: boolean;
  showCurrentBooks: boolean;
  allowRecommendations: boolean;
}

export interface UserPreferences {
  spoilerPreference: SpoilerPreference;
  preferredGenres: string[];
  notifications: NotificationPrefs;
  privacy: PrivacyPrefs;
}

export const DEFAULT_PREFS: UserPreferences = {
  spoilerPreference: "all",
  preferredGenres: [],
  notifications: {
    reactions: true,
    comments: true,
    replies: true,
    saves: true,
    trendingBooks: true,
    recommendations: true,
    updates: true,
    email: false,
    inApp: true,
  },
  privacy: {
    profilePublic: true,
    showInstagram: true,
    showTikTok: true,
    showCity: true,
    showGenres: true,
    showStats: true,
    showEcos: true,
    showCurrentBooks: true,
    allowRecommendations: true,
  },
};

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
  userPrefs: UserPreferences;
}

interface AppActions {
  updateSpoilerPreference: (pref: SpoilerPreference) => void;
  updatePreferredGenres: (genres: string[]) => void;
  updateNotificationPref: (key: keyof NotificationPrefs, value: boolean) => void;
  updatePrivacyPref: (key: keyof PrivacyPrefs, value: boolean) => void;
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

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback;
}

function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { profile, supabaseUser } = useAuth();

  const baseUser: User = useMemo(() => {
    if (profile && supabaseUser) {
      return buildUserFromProfile(profile, supabaseUser.id, supabaseUser.email || "");
    }
    return mockMe;
  }, [profile, supabaseUser]);

  // ── User Preferences (localStorage, inherited from onboarding) ──────────────
  const [userPrefs, setUserPrefs] = useState<UserPreferences>(DEFAULT_PREFS);

  useEffect(() => {
    const uid = baseUser.id;
    let prefs = loadFromStorage<UserPreferences | null>(`mg_prefs_${uid}`, null);

    // First real login: inherit choices made during onboarding (stored under "user_me")
    if (!prefs && uid !== "user_me") {
      const pending = loadFromStorage<UserPreferences | null>("mg_prefs_user_me", null);
      if (pending) {
        prefs = pending;
        saveToStorage(`mg_prefs_${uid}`, prefs);
      }
    }

    setUserPrefs(prefs ? { ...DEFAULT_PREFS, ...prefs, notifications: { ...DEFAULT_PREFS.notifications, ...(prefs.notifications ?? {}) }, privacy: { ...DEFAULT_PREFS.privacy, ...(prefs.privacy ?? {}) } } : DEFAULT_PREFS);
  }, [baseUser.id]);

  // Merge prefs back into currentUser so spoilerPreference & preferredGenres stay live
  const currentUser: User = useMemo(() => ({
    ...baseUser,
    spoilerPreference: userPrefs.spoilerPreference,
    preferredGenres: userPrefs.preferredGenres,
  }), [baseUser, userPrefs.spoilerPreference, userPrefs.preferredGenres]);

  const [books] = useState<Book[]>(MOCK_BOOKS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [onboardingCompleted] = useState(() =>
    localStorage.getItem("marginalia_onboarded") === "true"
  );
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [lastUsedReaction, setLastUsedReaction] = useState<string | null>(null);

  // Community margins (from mock data) — kept mutable so reaction counts update visually
  const [communityMargins, setCommunityMargins] = useState<Margin[]>(MOCK_MARGINS);

  // --- User-specific persisted state (localStorage) ---
  // These are loaded/reset whenever the real user ID changes.
  const [userProgress, setUserProgress] = useState<BookProgress[]>([]);
  const [userReactions, setUserReactions] = useState<Record<number, string>>({});
  const [savedMargins, setSavedMargins] = useState<number[]>([]);
  const [userMargins, setUserMargins] = useState<Margin[]>([]);

  // Sync all user-specific state from localStorage when userId changes
  useEffect(() => {
    const uid = currentUser.id;
    if (uid === "user_me") {
      // Mock user: reset to clean state
      setUserProgress([]);
      setUserReactions({});
      setSavedMargins([]);
      setUserMargins([]);
      return;
    }
    setUserProgress(loadFromStorage<BookProgress[]>(`mg_progress_${uid}`, []));
    setUserReactions(loadFromStorage<Record<number, string>>(`mg_reactions_${uid}`, {}));
    setSavedMargins(loadFromStorage<number[]>(`mg_saved_${uid}`, []));
    setUserMargins(loadFromStorage<Margin[]>(`mg_margins_${uid}`, []));
  }, [currentUser.id]);

  // Persist progress changes
  useEffect(() => {
    if (currentUser.id === "user_me") return;
    saveToStorage(`mg_progress_${currentUser.id}`, userProgress);
  }, [userProgress, currentUser.id]);

  // Persist reaction changes
  useEffect(() => {
    if (currentUser.id === "user_me") return;
    saveToStorage(`mg_reactions_${currentUser.id}`, userReactions);
  }, [userReactions, currentUser.id]);

  // Persist saved margins changes
  useEffect(() => {
    if (currentUser.id === "user_me") return;
    saveToStorage(`mg_saved_${currentUser.id}`, savedMargins);
  }, [savedMargins, currentUser.id]);

  // Persist user-posted margins
  useEffect(() => {
    if (currentUser.id === "user_me") return;
    saveToStorage(`mg_margins_${currentUser.id}`, userMargins);
  }, [userMargins, currentUser.id]);

  // Merge MOCK_PROGRESS (community) + user progress, user's entries win for their books
  const progress = useMemo<BookProgress[]>(() => {
    const uid = currentUser.id;
    // Remove mock "user_me" entries when a real user is logged in (they'd own their own entries)
    const filteredMock = MOCK_PROGRESS.filter(
      (p) => !(p.userId === "user_me" && uid !== "user_me")
    );
    return [...filteredMock, ...userProgress];
  }, [userProgress, currentUser.id]);

  // Merge community margins (mutable) + user-posted margins (newest first)
  const margins = useMemo<Margin[]>(() => {
    return [...userMargins, ...communityMargins];
  }, [userMargins, communityMargins]);

  const savePrefs = (next: UserPreferences) => {
    setUserPrefs(next);
    saveToStorage(`mg_prefs_${currentUser.id}`, next);
  };

  const updateSpoilerPreference = (pref: SpoilerPreference) => {
    savePrefs({ ...userPrefs, spoilerPreference: pref });
  };

  const updatePreferredGenres = (genres: string[]) => {
    savePrefs({ ...userPrefs, preferredGenres: genres });
  };

  const updateNotificationPref = (key: keyof NotificationPrefs, value: boolean) => {
    savePrefs({ ...userPrefs, notifications: { ...userPrefs.notifications, [key]: value } });
  };

  const updatePrivacyPref = (key: keyof PrivacyPrefs, value: boolean) => {
    savePrefs({ ...userPrefs, privacy: { ...userPrefs.privacy, [key]: value } });
  };

  const updateProfile = (_data: { firstName?: string; lastName?: string; bio?: string; username?: string; city?: string; email?: string; avatarColor?: string; readerType?: string; instagram?: string; tiktok?: string }) => {};

  const updateBookProgress = (bookId: number, updates: Partial<BookProgress>) => {
    const uid = currentUser.id;
    setUserProgress((prev) => {
      const existing = prev.find(
        (p) => p.bookId === bookId && p.userId === uid
      );
      if (existing) {
        return prev.map((p) =>
          p.bookId === bookId && p.userId === uid ? { ...p, ...updates } : p
        );
      }
      return [
        ...prev,
        {
          id: `p_${bookId}_${uid}`,
          userId: uid,
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
    setUserMargins((prev) => [newMargin, ...prev]);
  };

  const addReaction = (marginId: number, emoji: string) => {
    const prevEmoji = userReactions[marginId];

    const applyReactionToList = (
      list: Margin[],
      addingEmoji: string,
      removingEmoji: string | undefined
    ): Margin[] =>
      list.map((m) => {
        if (m.id !== marginId) return m;
        const reactions = { ...m.reactions } as Record<string, number>;
        if (removingEmoji) {
          reactions[removingEmoji] = Math.max(0, (reactions[removingEmoji] || 1) - 1);
          if (reactions[removingEmoji] === 0) delete reactions[removingEmoji];
        }
        reactions[addingEmoji] = (reactions[addingEmoji] || 0) + 1;
        return { ...m, reactions };
      });

    const removeReactionFromList = (list: Margin[], removingEmoji: string): Margin[] =>
      list.map((m) => {
        if (m.id !== marginId) return m;
        const reactions = { ...m.reactions } as Record<string, number>;
        reactions[removingEmoji] = Math.max(0, (reactions[removingEmoji] || 1) - 1);
        if (reactions[removingEmoji] === 0) delete reactions[removingEmoji];
        return { ...m, reactions };
      });

    if (prevEmoji === emoji) {
      // Toggle off
      setUserReactions((prev) => {
        const next = { ...prev };
        delete next[marginId];
        return next;
      });
      setUserMargins((prev) => removeReactionFromList(prev, emoji));
      setCommunityMargins((prev) => removeReactionFromList(prev, emoji));
    } else {
      setUserReactions((prev) => ({ ...prev, [marginId]: emoji }));
      setLastUsedReaction(emoji);
      setUserMargins((prev) => applyReactionToList(prev, emoji, prevEmoji));
      setCommunityMargins((prev) => applyReactionToList(prev, emoji, prevEmoji));
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
    progress.find((p) => p.bookId === bookId && p.userId === currentUser.id);

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
        userPrefs,
        updateSpoilerPreference,
        updatePreferredGenres,
        updateNotificationPref,
        updatePrivacyPref,
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
