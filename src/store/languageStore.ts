import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '../i18n';
import { translations } from '../i18n';

interface LanguageState {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof translations.uz) => string;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set, get) => ({
            language: 'uz',
            setLanguage: (language) => set({ language }),
            t: (key) => translations[get().language][key] || key,
        }),
        { name: 'mini-buxgalter-language' }
    )
);
