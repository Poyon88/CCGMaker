import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isGuest: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setGuest: (isGuest: boolean) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isGuest: false,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setGuest: (isGuest) => set({ isGuest }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ user: null, session: null, isGuest: false, isLoading: false }),
}));
