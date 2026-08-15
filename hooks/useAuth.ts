import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";

// useAuth Hook

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    user,
    session,
    profile,
    isLoading: isStoreLoading,
    isInitialized,
    signOut: storeSignOut,
    fetchProfile,
    setSession,
  } = useAuthStore();

  // Sign In

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        setError(signInError.message);
        return { success: false, error: signInError.message };
      }

      if (data.user) {
        await fetchProfile(data.user.id);
      }

      return { success: true, data };
    } catch (err: any) {
      const msg = err.message || "An unexpected error occurred during sign in.";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Sign Up

  const signUp = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || "",
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return { success: false, error: signUpError.message };
      }

      // Store mein session set karo taaki layout redirect sahi se ho
      if (data.session) {
        setSession(data.session);
      }

      // Fix: signup ke baad bhi profile fetch karo
      if (data.user) {
        await fetchProfile(data.user.id);
      }

      return { success: true, data };
    } catch (err: any) {
      const msg = err.message || "An unexpected error occurred during sign up.";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Sign Out

  const signOut = async () => {
    setLoading(true);
    setError(null);

    try {
      await storeSignOut();
      return { success: true };
    } catch (err: any) {
      const msg = err.message || "Failed to sign out.";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Clear Error
  //   clear all error manually from the UI

  const clearError = () => setError(null);

  return {
    user,
    session,
    profile,
    isAuthenticated: !!session?.user,
    isLoading: loading || isStoreLoading,
    isInitialized,
    error,

    signIn,
    signUp,
    signOut,
    clearError,
  };
};
