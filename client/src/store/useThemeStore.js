import {create} from "zustand"

export const useThemeStore = create((set) => ({
  theme:  "emerald",
  setTheme: (theme) => {
    set({ theme });
  },
}));