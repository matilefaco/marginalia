import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface SupabaseProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  bio: string | null;
  city: string | null;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  avatar_color: string | null;
  email: string | null;
  reader_type_title: string | null;
  reader_type_description: string | null;
  reading_signature: string | null;
}

export interface SignUpParams {
  email: string;
  password: string;
  username: string;
  fullName: string;
  bio?: string;
  avatarColor?: string;
}

interface AuthContextType {
  session: Session | null;
  supabaseUser: SupabaseUser | null;
  profile: SupabaseProfile | null;
  authLoading: boolean;
  signIn: (identifier: string, password: string) => Promise<{ error: string | null }>;
  signUp: (params: SignUpParams) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Omit<SupabaseProfile, "id">>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Local-storage helpers ───────────────────────────────────────────────────

function lsGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function lsSet(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch {}
}

// ─── Profile upsert — resilient to missing columns ───────────────────────────
//
// Supabase returns PGRST204 ("Could not find the 'x' column…") when the schema
// cache doesn't know about a column.  We parse the column name out of the error
// message, save it locally if we track it, then retry — recursively — until the
// upsert succeeds or we run out of retries.

function persistColumnLocally(col: string, value: unknown, userId: string) {
  if (!value) return;
  if (col === "avatar_color") lsSet(`mg_avatar_color_${userId}`, value as string);
  if (col === "email")        lsSet(`mg_email_${userId}`,        value as string);
}

async function upsertProfileSafe(
  userId: string,
  data: Record<string, unknown>,
  excluded: Set<string> = new Set()
): Promise<{ error: import("@supabase/supabase-js").PostgrestError | null }> {
  // Build payload, skipping any columns we've already excluded
  const payload: Record<string, unknown> = { id: userId };
  for (const [k, v] of Object.entries(data)) {
    if (!excluded.has(k)) payload[k] = v;
  }

  const { error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" });

  if (error?.code === "PGRST204" && excluded.size < 10) {
    // Parse the missing column name from the error message
    // e.g. "Could not find the 'email' column of 'profiles' in the schema cache"
    const match = error.message.match(/the '([^']+)' column/);
    const missingCol = match?.[1];

    if (missingCol && !excluded.has(missingCol)) {
      // Save this column's value to localStorage as a fallback
      persistColumnLocally(missingCol, data[missingCol], userId);

      // Retry without the problematic column
      return upsertProfileSafe(userId, data, new Set([...excluded, missingCol]));
    }

    // Can't determine the missing column — bail out with the original error
    return { error };
  }

  return { error };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<SupabaseProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const loadProfile = async (userId: string, userEmail?: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      // Merge localStorage fallbacks for columns that may not exist in DB yet
      const localAvatarColor = lsGet(`mg_avatar_color_${userId}`);
      const localEmail = lsGet(`mg_email_${userId}`) ?? userEmail ?? null;

      const merged: SupabaseProfile = {
        ...data,
        avatar_color: data.avatar_color ?? localAvatarColor ?? "#697962",
        email: data.email ?? localEmail,
      };

      // Keep localStorage in sync with whatever DB returns
      if (data.avatar_color) lsSet(`mg_avatar_color_${userId}`, data.avatar_color);
      if (data.email) lsSet(`mg_email_${userId}`, data.email);

      setProfile(merged);
    }
  };

  const refreshProfile = async () => {
    if (supabaseUser) {
      await loadProfile(supabaseUser.id, supabaseUser.email);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id, session.user.email).finally(() =>
          setAuthLoading(false)
        );
      } else {
        setAuthLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id, session.user.email);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── resolveEmail: username → email via server-side index ───────────────────
  const resolveEmailFromUsername = async (username: string): Promise<string | null> => {
    const clean = username.toLowerCase().replace(/^@/, "").trim();

    // 1. Try server-side index (authoritative, works across devices)
    try {
      const res = await fetch("/api/auth/resolve-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: clean }),
      });
      if (res.ok) {
        const data = await res.json() as { email?: string };
        if (data.email) return data.email;
      }
    } catch {
      // network error — fall through to fallbacks
    }

    // 2. Fallback: try Supabase profiles table (email column, if it exists)
    try {
      const { data: row } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("username", clean)
        .maybeSingle();
      if (row?.email) {
        // Backfill to server index so future logins on any device work
        fetch("/api/auth/register-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: clean, email: row.email, userId: row.id }),
        }).catch(() => {});
        return row.email as string;
      }
    } catch {
      // profiles.email column might not exist
    }

    // 3. Last resort: localStorage cache (same device only)
    const cached = lsGet(`mg_username_email_${clean}`);
    if (cached) {
      // Backfill to server index if we have a userId cached too
      const userId = lsGet(`mg_userid_${clean}`);
      if (userId) {
        fetch("/api/auth/register-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: clean, email: cached, userId }),
        }).catch(() => {});
      }
    }
    return cached ?? null;
  };

  // ─── signIn: accepts e-mail OR username ──────────────────────────────────────
  const signIn = async (identifier: string, password: string) => {
    const trimmed = identifier.trim();
    const isEmail = /\S+@\S+\.\S+/.test(trimmed);

    let loginEmail = trimmed;

    if (!isEmail) {
      const resolved = await resolveEmailFromUsername(trimmed);
      if (!resolved) {
        return {
          error:
            "Usuário não encontrado. Verifique o nome de usuário ou use seu e-mail.",
        };
      }
      loginEmail = resolved;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("invalid") || msg.includes("credentials") || msg.includes("email not confirmed")) {
        return { error: "E-mail/usuário ou senha incorretos. Tente novamente." };
      }
      return { error: error.message };
    }

    return { error: null };
  };

  // ─── signUp ──────────────────────────────────────────────────────────────────
  const signUp = async ({
    email,
    password,
    username,
    fullName,
    bio,
    avatarColor,
  }: SignUpParams) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, full_name: fullName },
      },
    });
    if (error) return { error: error.message };

    if (data.user) {
      const userId = data.user.id;

      // ── Persist username→email to server-side index (works across all devices) ──
      lsSet(`mg_username_email_${username}`, email); // localStorage fallback
      lsSet(`mg_userid_${username.toLowerCase()}`, userId); // for backfill during login
      lsSet(`mg_email_${userId}`, email);
      if (avatarColor) lsSet(`mg_avatar_color_${userId}`, avatarColor);

      // Server-side persistent mapping (fire and forget — does not block signup)
      fetch("/api/auth/register-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.toLowerCase(), email, userId }),
      }).catch((e) => console.warn("[signUp] register-username failed:", e));

      await upsertProfileSafe(userId, {
        username,
        full_name: fullName,
        bio: bio || null,
        avatar_color: avatarColor || "#697962",
        email,
      });

      await loadProfile(userId, email);
    }

    return { error: null };
  };

  // ─── signOut ─────────────────────────────────────────────────────────────────
  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
    setSupabaseUser(null);
  };

  // ─── updateProfile ───────────────────────────────────────────────────────────
  const updateProfile = async (
    updates: Partial<Omit<SupabaseProfile, "id">>
  ) => {
    if (!supabaseUser) return { error: "Não autenticado" };

    // Optimistic update
    setProfile((prev) => (prev ? { ...prev, ...updates } : prev));

    const { error } = await upsertProfileSafe(
      supabaseUser.id,
      updates as Record<string, unknown>
    );

    if (error) {
      // Rollback
      await loadProfile(supabaseUser.id, supabaseUser.email);
      return { error: error.message };
    }

    // Confirm from DB
    await loadProfile(supabaseUser.id, supabaseUser.email);
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        supabaseUser,
        profile,
        authLoading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
