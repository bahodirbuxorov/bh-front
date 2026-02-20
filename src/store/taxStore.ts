import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TaxSystem = 'general' | 'simplified' | 'qqs';

interface TaxState {
    /** QQS (QQS - Qo'shilgan Qiymat Solig'i = O'QS) yoqilganmi */
    qqsEnabled: boolean;
    /** QQS stavkasi foizda (default: 12) */
    qqsRate: number;
    /** Foyda solig'i stavkasi % */
    profitTaxRate: number;
    /** Ijtimoiy to'lov % */
    socialTaxRate: number;
    /** Soliq tizimi */
    taxSystem: TaxSystem;

    setQQSEnabled: (v: boolean) => void;
    setQQSRate: (v: number) => void;
    setProfitTaxRate: (v: number) => void;
    setSocialTaxRate: (v: number) => void;
    setTaxSystem: (v: TaxSystem) => void;
}

export const useTaxStore = create<TaxState>()(
    persist(
        (set) => ({
            qqsEnabled: true,
            qqsRate: 12,
            profitTaxRate: 15,
            socialTaxRate: 12,
            taxSystem: 'qqs',

            setQQSEnabled: (v) => set({ qqsEnabled: v }),
            setQQSRate: (v) => set({ qqsRate: v }),
            setProfitTaxRate: (v) => set({ profitTaxRate: v }),
            setSocialTaxRate: (v) => set({ socialTaxRate: v }),
            setTaxSystem: (v) => set({ taxSystem: v }),
        }),
        { name: 'mini-buxgalter-tax' }
    )
);

/** Subtotaldan QQS summasini hisoblash */
export function calcQQS(subtotal: number, rate: number): number {
    return Math.round(subtotal * (rate / 100));
}

/** Grand total (QQS bilan) */
export function calcGrandTotal(subtotal: number, rate: number): number {
    return subtotal + calcQQS(subtotal, rate);
}

/** Narx QQS bilan birga bo'lsa, soliqsiz narxni aniqlash */
export function extractSubtotal(totalWithQQS: number, rate: number): number {
    return Math.round(totalWithQQS / (1 + rate / 100));
}
