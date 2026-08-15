import { supabase } from "@/services/supabase";
import { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { Profile } from "@/types/user";

// Auth State

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (
    updates: Partial<Profile>,
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  teardown: () => void;
}

// Auth Store

// In-flight guard — concurrent calls reuse the same promise
let initPromise: Promise<void> | null = null;

// Subscription reference for teardown
let authSubscription: { unsubscribe: () => void } | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isInitialized: false,

  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
    });
  },

  setProfile: (profile) => set({ profile }),

  // fetch data from profile table

  fetchProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error.message);
        return;
      }

      set({ profile: data });
    } catch (err) {
      console.error("Profile fetch unexpected error:", err);
    }
  },

  //  Profile update

  updateProfile: async (updates: Partial<Profile>) => {
    const { user } = get();

    if (!user) return { success: false, error: "User not authenticated" };

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Fix: if profile is null so, it will not crash
      set({ profile: data });
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to update profile",
      };
    }
  },

  // Logout

  signOut: async () => {
    set({ isLoading: true });
    await supabase.auth.signOut();
    set({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
    });
  },

  // par auth check on App startup

  initializeAuth: async () => {
    // Reuse in-flight promise if already initializing
    if (initPromise) return initPromise;

    initPromise = (async () => {
      try {
        set({ isLoading: true });

        // Teardown any existing listener before registering a new one
        authSubscription?.unsubscribe();
        authSubscription = null;

        // Existing session check
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          set({ session, user: session.user });
          await get().fetchProfile(session.user.id);
        } else {
          set({ session: null, user: null, profile: null });
        }

        // Store subscription so it can be torn down later
        const { data } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            if (session?.user) {
              set({ session, user: session.user });
              await get().fetchProfile(session.user.id);
            } else {
              set({ user: null, session: null, profile: null });
            }
          },
        );
        authSubscription = data.subscription;
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        set({ isLoading: false, isInitialized: true });
        initPromise = null;
      }
    })();

    return initPromise;
  },

  // Teardown — listener unsubscribe karo (e.g. app unmount pe)
  teardown: () => {
    authSubscription?.unsubscribe();
    authSubscription = null;
  },
}));
