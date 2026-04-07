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
  avatar_id: string | null;
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
  avatarId?: string;
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
  if (col === "avatar_id")   lsSet(`mg_avatar_id_${userId}`,    value as string);
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
      const localAvatarId = lsGet(`mg_avatar_id_${userId}`);
      const localEmail = lsGet(`mg_email_${userId}`) ?? userEmail ?? null;

      const merged: SupabaseProfile = {
        ...data,
        avatar_color: data.avatar_color ?? localAvatarColor ?? "#697962",
        avatar_id: data.avatar_id ?? localAvatarId ?? null,
        email: data.email ?? localEmail,
      };

      // Keep localStorage in sync with whatever DB returns
      if (data.avatar_color) lsSet(`mg_avatar_color_${userId}`, data.avatar_color);
      if (data.avatar_id)    lsSet(`mg_avatar_id_${userId}`,    data.avatar_id);
      if (data.email) lsSet(`mg_email_${userId}`, data.email);

      setProfile(merged);

      // ── AUTO-BACKFILL: register username→email on every login ──────────────
      // This ensures any user who logs in has their username indexed so future
      // logins by username work from any device.
      const username = (data.username as string | null)?.toLowerCase();
      const email = userEmail?.toLowerCase();
      if (username && email) {
        lsSet(`mg_username_email_${username}`, email);
        lsSet(`mg_userid_${username}`, userId);
        fetch("/api/auth/register-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, userId }),
        }).catch(() => {});
      }
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

  // ─── resolveEmailFromUsername: 4-tier lookup ─────────────────────────────────
  // Returns: email string | "__user_exists__" (found in profiles but not indexed)
  //          | null (user not found anywhere)
  const resolveEmailFromUsername = async (username: string): Promise<string | null> => {
    const clean = username.toLowerCase().replace(/^@/, "").trim();

    // ── Tier 1: Server-side username index (authoritative, cross-device) ──────
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
      // network error — fall through
    }

    // ── Tier 2: localStorage cache (same device where user signed up) ─────────
    const cached = lsGet(`mg_username_email_${clean}`);
    if (cached) {
      const cachedUserId = lsGet(`mg_userid_${clean}`);
      // Backfill to server index silently
      if (cachedUserId) {
        fetch("/api/auth/register-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: clean, email: cached, userId: cachedUserId }),
        }).catch(() => {});
      }
      return cached;
    }

    // ── Tier 3: Supabase profiles — case-insensitive username match ───────────
    // The profiles table IS publicly readable. We look up by username (ilike)
    // to get the userId, then check our index by userId.
    try {
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", clean)
        .maybeSingle();

      if (profileRow?.id) {
        // Found user in profiles — now check our index by userId
        try {
          const res = await fetch("/api/auth/resolve-by-userid", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: profileRow.id }),
          });
          if (res.ok) {
            const data = await res.json() as { email?: string };
            if (data.email) return data.email;
          }
        } catch {
          // fall through
        }
        // User exists in Supabase but email not yet in our index
        // Signal this so we can give a helpful error message
        return "__user_exists__";
      }
    } catch {
      // profiles query failed — user genuinely not found
    }

    return null;
  };

  // ─── signIn: accepts e-mail OR username ──────────────────────────────────────
  const signIn = async (identifier: string, password: string) => {
    const trimmed = identifier.trim();
    const isEmail = /\S+@\S+\.\S+/.test(trimmed);

    let loginEmail = trimmed;

    if (!isEmail) {
      const resolved = await resolveEmailFromUsername(trimmed);

      if (resolved === "__user_exists__") {
        // User's account was found but their email isn't indexed yet.
        // This happens for users who signed up before the username-login fix.
        // Once they log in with email, they'll be auto-indexed permanently.
        return {
          error:
            "Conta encontrada! Para ativar o login por nome de usuário neste dispositivo, entre com seu e-mail desta vez. Após isso, o login por nome de usuário funcionará automaticamente.",
        };
      }

      if (!resolved) {
        return {
          error: "Usuário não encontrado. Verifique o nome de usuário ou use seu e-mail.",
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
      if (msg.includes("invalid") || msg.includes("credentials")) {
        return { error: "Senha incorreta. Tente novamente." };
      }
      if (msg.includes("email not confirmed")) {
        return { error: "E-mail ainda não confirmado. Verifique sua caixa de entrada." };
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
    avatarId,
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
      if (avatarId)    lsSet(`mg_avatar_id_${userId}`,    avatarId);

      // Server-side persistent mapping — awaited so it's reliable at signup
      try {
        await fetch("/api/auth/register-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username.toLowerCase(), email, userId }),
        });
      } catch (e) {
        console.warn("[signUp] register-username failed:", e);
        // Non-fatal — backfill will happen on first successful login
      }

      await upsertProfileSafe(userId, {
        username,
        full_name: fullName,
        bio: bio || null,
        avatar_color: avatarColor || "#697962",
        avatar_id: avatarId || null,
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
