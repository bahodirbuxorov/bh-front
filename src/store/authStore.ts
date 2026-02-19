import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Company } from '../types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
}

interface CompanyState {
    companies: Company[];
    activeCompany: Company | null;
    setActiveCompany: (company: Company) => void;
    setCompanies: (companies: Company[]) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: (user) => set({ user, isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),
        }),
        { name: 'mini-buxgalter-auth' }
    )
);

export const useCompanyStore = create<CompanyState>()(
    persist(
        (set) => ({
            companies: [],
            activeCompany: null,
            setActiveCompany: (company) => set({ activeCompany: company }),
            setCompanies: (companies) => set({ companies }),
        }),
        { name: 'mini-buxgalter-company' }
    )
);
