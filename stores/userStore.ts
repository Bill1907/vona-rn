import { identifyUser } from "@/lib/amplitude";
import { User } from "@/types";
import { create } from "zustand";

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });

    // Identify user in Amplitude when user data is set
    if (user) {
      identifyUser(user.id, {
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
        platform: "mobile",
      });
    }
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}));
