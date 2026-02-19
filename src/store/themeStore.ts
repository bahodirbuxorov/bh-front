import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
    isDark: boolean;
    toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            isDark: false,
            toggleTheme: () => {
                const newDark = !get().isDark;
                if (newDark) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
                set({ isDark: newDark });
            },
        }),
        { name: 'mini-buxgalter-theme' }
    )
);

// Initialize theme on load
export function initTheme() {
    const stored = localStorage.getItem('mini-buxgalter-theme');
    if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.state?.isDark) {
            document.documentElement.classList.add('dark');
        }
    }
}
