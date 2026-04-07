import { createContext, useContext, useState, useMemo, useEffect, useCallback, type ReactNode } from "react";
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
  spoilerPreference: "protected",
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
  progressLoading: boolean;
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
    avatarId: profile.avatar_id || undefined,
    initials,
    readerType: "observador",
    readingSignature:
      profile.reading_signature || "Cada livro me deixa diferente",
    spoilerPreference: "protected",
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

/* ── DB row → BookProgress ──────────────────────────────────────────────── */
function dbRowToProgress(row: {
  id: number;
  userId: string;
  bookId: number;
  status: string;
  currentPage: number;
  currentChapter: string;
  currentPercent: number;
  updatedAt: string | Date;
}): BookProgress {
  return {
    id: `p_${row.bookId}_${row.userId}`,
    userId: row.userId,
    bookId: row.bookId,
    status: row.status as BookProgress["status"],
    currentPage: row.currentPage,
    currentChapter: row.currentChapter,
    currentPercent: row.currentPercent,
    lastOpenedAt: new Date(row.updatedAt).toISOString(),
  };
}

/* ── DB row → Margin ────────────────────────────────────────────────────── */
function dbRowToMargin(
  row: {
    id: number;
    userId: string;
    bookId: number;
    bookTitle: string;
    bookAuthor: string;
    excerpt: string;
    commentary: string;
    postType: string;
    spoilerLevel: string;
    visibility: string;
    referenceType: string;
    page: number | null;
    chapter: string | null;
    reactions: unknown;
    commentsCount: number;
    createdAt: string | Date;
    parentEcoId?: number | null;
  },
  user: User
): Margin {
  return {
    id: row.id,
    userId: row.userId,
    bookId: row.bookId,
    bookTitle: row.bookTitle,
    bookAuthor: row.bookAuthor,
    excerpt: row.excerpt,
    referenceType: row.referenceType as Margin["referenceType"],
    page: row.page ?? undefined,
    chapter: row.chapter ?? undefined,
    postType: row.postType as Margin["postType"],
    commentary: row.commentary,
    spoilerLevel: row.spoilerLevel as Margin["spoilerLevel"],
    visibility: row.visibility as Margin["visibility"],
    reactions: (row.reactions as Record<string, number>) ?? {},
    commentsCount: row.commentsCount,
    createdAt: new Date(row.createdAt).toISOString(),
    userName: user.name,
    userInitials: user.initials,
  };
}

/* ── API helpers ─────────────────────────────────────────────────────────── */
const API = "/api";

async function apiFetch<T>(url: string, opts?: RequestInit): Promise<T | null> {
  try {
    const r = await fetch(url, opts);
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { profile, supabaseUser } = useAuth();

  const baseUser: User = useMemo(() => {
    if (profile && supabaseUser) {
      return buildUserFromProfile(profile, supabaseUser.id, supabaseUser.email || "");
    }
    return mockMe;
  }, [profile, supabaseUser]);

  // ── User Preferences (localStorage, inherited from onboarding) ──────────
  const [userPrefs, setUserPrefs] = useState<UserPreferences>(DEFAULT_PREFS);

  useEffect(() => {
    const uid = baseUser.id;
    let prefs = loadFromStorage<UserPreferences | null>(`mg_prefs_${uid}`, null);
    if (!prefs && uid !== "user_me") {
      const pending = loadFromStorage<UserPreferences | null>("mg_prefs_user_me", null);
      if (pending) {
        prefs = pending;
        saveToStorage(`mg_prefs_${uid}`, prefs);
      }
    }
    setUserPrefs(prefs ? { ...DEFAULT_PREFS, ...prefs, notifications: { ...DEFAULT_PREFS.notifications, ...(prefs.notifications ?? {}) }, privacy: { ...DEFAULT_PREFS.privacy, ...(prefs.privacy ?? {}) } } : DEFAULT_PREFS);
  }, [baseUser.id]);

  const currentUser: User = useMemo(() => ({
    ...baseUser,
    spoilerPreference: userPrefs.spoilerPreference,
    preferredGenres: userPrefs.preferredGenres,
  }), [baseUser, userPrefs.spoilerPreference, userPrefs.preferredGenres]);

  const [books] = useState<Book[]>(MOCK_BOOKS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [onboardingCompleted] = useState(() => localStorage.getItem("marginalia_onboarded") === "true");
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [lastUsedReaction, setLastUsedReaction] = useState<string | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);

  // Community margins (from mock data) — kept mutable so reaction counts update visually
  const [communityMargins, setCommunityMargins] = useState<Margin[]>(MOCK_MARGINS);

  // User-specific state
  const [userProgress, setUserProgress] = useState<BookProgress[]>([]);
  const [userReactions, setUserReactions] = useState<Record<number, string>>({});
  const [savedMargins, setSavedMargins] = useState<number[]>([]);
  const [userMargins, setUserMargins] = useState<Margin[]>([]);

  /* ── Load user data: localStorage first, then hydrate from DB ── */
  useEffect(() => {
    const uid = currentUser.id;
    if (uid === "user_me") {
      setUserProgress([]);
      setUserReactions({});
      setSavedMargins([]);
      setUserMargins([]);
      return;
    }

    // Fast load from localStorage
    setUserProgress(loadFromStorage<BookProgress[]>(`mg_progress_${uid}`, []));
    setUserReactions(loadFromStorage<Record<number, string>>(`mg_reactions_${uid}`, {}));
    setSavedMargins(loadFromStorage<number[]>(`mg_saved_${uid}`, []));
    setUserMargins(loadFromStorage<Margin[]>(`mg_margins_${uid}`, []));

    // Authoritative hydration from DB
    setProgressLoading(true);
    Promise.all([
      apiFetch<unknown[]>(`${API}/user-books/${uid}`),
      apiFetch<unknown[]>(`${API}/user-margins/${uid}`),
    ]).then(([booksRows, marginsRows]) => {
      if (booksRows && Array.isArray(booksRows) && booksRows.length > 0) {
        const loaded = (booksRows as Parameters<typeof dbRowToProgress>[0][]).map(dbRowToProgress);
        setUserProgress(loaded);
        saveToStorage(`mg_progress_${uid}`, loaded);
      }
      if (marginsRows && Array.isArray(marginsRows) && marginsRows.length > 0) {
        const loaded = (marginsRows as Parameters<typeof dbRowToMargin>[0][]).map((r) => dbRowToMargin(r, currentUser));
        setUserMargins(loaded);
        saveToStorage(`mg_margins_${uid}`, loaded);
      }
    }).finally(() => setProgressLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id]);

  // Persist reactions & saved margins to localStorage
  useEffect(() => {
    if (currentUser.id === "user_me") return;
    saveToStorage(`mg_reactions_${currentUser.id}`, userReactions);
  }, [userReactions, currentUser.id]);

  useEffect(() => {
    if (currentUser.id === "user_me") return;
    saveToStorage(`mg_saved_${currentUser.id}`, savedMargins);
  }, [savedMargins, currentUser.id]);

  // Merge MOCK_PROGRESS + user progress, user entries win
  const progress = useMemo<BookProgress[]>(() => {
    const uid = currentUser.id;
    const filteredMock = MOCK_PROGRESS.filter(
      (p) => !(p.userId === "user_me" && uid !== "user_me")
    );
    return [...filteredMock, ...userProgress];
  }, [userProgress, currentUser.id]);

  // Merge community margins + user-posted margins
  const margins = useMemo<Margin[]>(() => {
    return [...userMargins, ...communityMargins];
  }, [userMargins, communityMargins]);

  const savePrefs = (next: UserPreferences) => {
    setUserPrefs(next);
    saveToStorage(`mg_prefs_${currentUser.id}`, next);
  };

  const updateSpoilerPreference = (pref: SpoilerPreference) =>
    savePrefs({ ...userPrefs, spoilerPreference: pref });

  const updatePreferredGenres = (genres: string[]) =>
    savePrefs({ ...userPrefs, preferredGenres: genres });

  const updateNotificationPref = (key: keyof NotificationPrefs, value: boolean) =>
    savePrefs({ ...userPrefs, notifications: { ...userPrefs.notifications, [key]: value } });

  const updatePrivacyPref = (key: keyof PrivacyPrefs, value: boolean) =>
    savePrefs({ ...userPrefs, privacy: { ...userPrefs.privacy, [key]: value } });

  const updateProfile = (_data: { firstName?: string; lastName?: string; bio?: string; username?: string; city?: string; email?: string; avatarColor?: string; readerType?: string; instagram?: string; tiktok?: string }) => {};

  /* ── Book Progress: optimistic update + DB persist ──────────────────── */
  const updateBookProgress = useCallback(
    (bookId: number, updates: Partial<BookProgress>) => {
      const uid = currentUser.id;

      // 1. Optimistic local update
      setUserProgress((prev) => {
        const existing = prev.find((p) => p.bookId === bookId && p.userId === uid);
        const next = existing
          ? prev.map((p) => p.bookId === bookId && p.userId === uid ? { ...p, ...updates } : p)
          : [
              ...prev,
              {
                id: `p_${bookId}_${uid}`,
                userId: uid,
                bookId,
                status: "reading" as const,
                currentPage: 0,
                currentChapter: "",
                currentPercent: 0,
                lastOpenedAt: new Date().toISOString(),
                ...updates,
              },
            ];
        // Cache to localStorage immediately
        saveToStorage(`mg_progress_${uid}`, next);
        return next;
      });

      // 2. Persist to DB (fire and forget)
      if (uid !== "user_me") {
        apiFetch(`${API}/user-books/${uid}/${bookId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: updates.status,
            currentPage: updates.currentPage,
            currentChapter: updates.currentChapter,
            currentPercent: updates.currentPercent,
          }),
        }).catch((e) => console.error("[updateBookProgress] API error:", e));
      }
    },
    [currentUser.id]
  );

  /* ── Add Margin: optimistic + DB persist ────────────────────────────── */
  const addMargin = useCallback(
    (margin: Omit<Margin, "id" | "createdAt" | "reactions" | "commentsCount" | "userName" | "userInitials">) => {
      const uid = currentUser.id;
      const tempId = Date.now();
      const newMargin: Margin = {
        ...margin,
        id: tempId,
        createdAt: new Date().toISOString(),
        reactions: {},
        commentsCount: 0,
        userName: currentUser.name,
        userInitials: currentUser.initials,
      };

      // Optimistic add
      setUserMargins((prev) => {
        const next = [newMargin, ...prev];
        saveToStorage(`mg_margins_${uid}`, next);
        return next;
      });

      // Persist to DB
      if (uid !== "user_me") {
        apiFetch<{ id: number }>(`${API}/user-margins`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: uid,
            bookId: margin.bookId,
            bookTitle: margin.bookTitle,
            bookAuthor: margin.bookAuthor,
            excerpt: margin.excerpt,
            commentary: margin.commentary,
            postType: margin.postType,
            spoilerLevel: margin.spoilerLevel,
            visibility: margin.visibility,
            referenceType: margin.referenceType,
            page: margin.page ?? null,
            chapter: margin.chapter ?? null,
            parentEcoId: (margin as { parentEcoId?: number }).parentEcoId ?? null,
          }),
        }).then((saved) => {
          if (saved?.id && saved.id !== tempId) {
            // Replace temp ID with real DB ID
            setUserMargins((prev) => {
              const next = prev.map((m) => m.id === tempId ? { ...m, id: saved.id } : m);
              saveToStorage(`mg_margins_${uid}`, next);
              return next;
            });
          }
        }).catch((e) => console.error("[addMargin] API error:", e));
      }
    },
    [currentUser]
  );

  const addReaction = (marginId: number, emoji: string) => {
    const prevEmoji = userReactions[marginId];

    const applyReactionToList = (list: Margin[], addingEmoji: string, removingEmoji: string | undefined): Margin[] =>
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
      setUserReactions((prev) => { const next = { ...prev }; delete next[marginId]; return next; });
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
      prev.includes(marginId) ? prev.filter((id) => id !== marginId) : [...prev, marginId]
    );
  };

  const completeOnboarding = () => {
    localStorage.setItem("marginalia_onboarded", "true");
  };

  const getProgressForBook = (bookId: number) =>
    progress.find((p) => p.bookId === bookId && p.userId === currentUser.id);

  const markNotificationRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser: {
          ...currentUser,
          stats: {
            ...currentUser.stats,
            totalMargins: userMargins.length,
          },
        },
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
        progressLoading,
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
