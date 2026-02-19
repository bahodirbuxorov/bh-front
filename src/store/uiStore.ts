import { create } from 'zustand';
import type { Notification } from '../types';

interface UIState {
    sidebarCollapsed: boolean;
    mobileSidebarOpen: boolean;
    notifications: Notification[];
    toasts: Toast[];
    /** true when browser reports offline or a 0-status request fails */
    networkError: boolean;
    setSidebarCollapsed: (v: boolean) => void;
    toggleSidebar: () => void;
    setMobileSidebarOpen: (v: boolean) => void;
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    markNotificationRead: (id: string) => void;
    setNetworkError: (v: boolean) => void;
}

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        title: "Kam zaxira ogohlantirishi",
        message: "Un mahsuloti omborda kam qoldi (12 kg)",
        type: 'warning',
        read: false,
        date: '2026-02-19',
    },
    {
        id: '2',
        title: 'Soliq muddati yaqinlashmoqda',
        message: 'ÖÖS hisobotini 25-fevral gacha topshiring',
        type: 'info',
        read: false,
        date: '2026-02-18',
    },
    {
        id: '3',
        title: "To'lov keldi",
        message: "Alisher Umarov - 5,800,000 so'm",
        type: 'success',
        read: true,
        date: '2026-02-17',
    },
];

export const useUIStore = create<UIState>((set, get) => ({
    sidebarCollapsed: false,
    mobileSidebarOpen: false,
    notifications: mockNotifications,
    toasts: [],
    networkError: false,
    setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
    toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    setMobileSidebarOpen: (v) => set({ mobileSidebarOpen: v }),
    addToast: (toast) => {
        const id = Date.now().toString();
        set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
        setTimeout(() => get().removeToast(id), 3500);
    },
    removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    markNotificationRead: (id) =>
        set((s) => ({
            notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
    setNetworkError: (v) => set({ networkError: v }),
}));
