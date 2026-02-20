import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BrandState {
    /** Base64 yoki URL — null bo'lsa default gradient avatar */
    logoUrl: string | null;
    /** Hex rang — sidebar va tugmalarda ishlatiladi */
    primaryColor: string;
    accentColor: string;
    /** Dastur nomi (sidebar yuqorisida ko'rinadi) */
    appName: string;
    /** Qisqa tavsif ("ERP Tizimi") */
    tagline: string;

    setBrand: (patch: Partial<Omit<BrandState, 'setBrand' | 'resetBrand'>>) => void;
    resetBrand: () => void;
}

const DEFAULTS = {
    logoUrl: null,
    primaryColor: '#6366f1',  // indigo-500
    accentColor: '#8b5cf6',   // violet-500
    appName: 'Mini Buxgalter',
    tagline: 'ERP Tizimi',
};

export const useBrandStore = create<BrandState>()(
    persist(
        (set) => ({
            ...DEFAULTS,
            setBrand: (patch) => set((s) => ({ ...s, ...patch })),
            resetBrand: () => set(DEFAULTS),
        }),
        { name: 'mini-buxgalter-brand' }
    )
);

/**
 * Apply brand CSS variables to <html>.
 * Call once on app startup + whenever primaryColor changes.
 */
export function applyBrandColors(primaryColor: string, accentColor: string) {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', primaryColor);
    root.style.setProperty('--brand-accent', accentColor);

    // Derive lighter/darker shades (simple approach)
    root.style.setProperty('--brand-primary-light', primaryColor + '20'); // 12% opacity
    root.style.setProperty('--brand-primary-dark', primaryColor);
}
