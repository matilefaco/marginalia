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
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (params: SignUpParams) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Omit<SupabaseProfile, "id">>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<SupabaseProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (!error && data) {
      setProfile(data as SupabaseProfile);
    }
  };

  const refreshProfile = async () => {
    if (supabaseUser) {
      await loadProfile(supabaseUser.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setAuthLoading(false));
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
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

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
      await supabase.from("profiles").upsert({
        id: data.user.id,
        username,
        full_name: fullName,
        bio: bio || null,
        avatar_color: avatarColor || "#697962",
      });
      await loadProfile(data.user.id);
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
    setSupabaseUser(null);
  };

  const updateProfile = async (updates: Partial<Omit<SupabaseProfile, "id">>) => {
    if (!supabaseUser) return { error: "Não autenticado" };
    // Optimistic update for instant UI feedback
    setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: supabaseUser.id, ...updates }, { onConflict: "id" });
    if (error) {
      // Rollback optimistic update on error
      await loadProfile(supabaseUser.id);
      return { error: error.message };
    }
    // Reload from DB to confirm the saved values are reflected
    await loadProfile(supabaseUser.id);
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
