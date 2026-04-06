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

// ─── Profile loader ───────────────────────────────────────────────────────────

// Strip unknown columns from the upsert payload and retry
async function upsertProfileSafe(
  userId: string,
  data: Record<string, unknown>
): Promise<{ error: import("@supabase/supabase-js").PostgrestError | null }> {
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...data }, { onConflict: "id" });

  if (error && error.code === "PGRST204") {
    // One or more columns are missing from the schema cache.
    // Save recognised local-only fields and retry without them.
    const LOCALLY_SAVED = ["avatar_color", "email"] as const;
    const safeData = { ...data };

    for (const col of LOCALLY_SAVED) {
      if (col in safeData) {
        if (col === "avatar_color" && safeData[col]) {
          lsSet(`mg_avatar_color_${userId}`, safeData[col] as string);
        }
        if (col === "email" && safeData[col]) {
          lsSet(`mg_email_${userId}`, safeData[col] as string);
        }
        delete safeData[col];
      }
    }

    const { error: error2 } = await supabase
      .from("profiles")
      .upsert({ id: userId, ...safeData }, { onConflict: "id" });
    return { error: error2 };
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

  // ─── signIn: accepts e-mail OR @username ────────────────────────────────────
  const signIn = async (identifier: string, password: string) => {
    let loginEmail = identifier.trim();

    const isEmail = /\S+@\S+\.\S+/.test(loginEmail);

    if (!isEmail) {
      // Username lookup — try the profiles table first
      const cleanUsername = loginEmail.replace(/^@/, "");
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", cleanUsername)
        .maybeSingle();

      if (profileRow?.email) {
        loginEmail = profileRow.email;
      } else {
        // Email column may not exist yet — check localStorage by scanning keys
        const localEmail = lsGet(`mg_username_email_${cleanUsername}`);
        if (localEmail) {
          loginEmail = localEmail;
        } else {
          return {
            error:
              "Usuário não encontrado. Tente entrar com seu e-mail diretamente.",
          };
        }
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });
    if (error) {
      if (
        error.message.toLowerCase().includes("invalid") ||
        error.message.toLowerCase().includes("credentials")
      ) {
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

      // Save username→email mapping in localStorage so username-login works
      // even before the email column exists in the DB
      lsSet(`mg_username_email_${username}`, email);
      lsSet(`mg_email_${userId}`, email);
      if (avatarColor) lsSet(`mg_avatar_color_${userId}`, avatarColor);

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
