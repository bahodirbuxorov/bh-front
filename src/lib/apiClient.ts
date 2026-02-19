/**
 * src/lib/apiClient.ts
 *
 * API layer stub — ready for real Axios/fetch wiring.
 * All pages import `api` from here. When the backend is live:
 *   1. Replace the mock delay with a real `axios.create({ baseURL })`.
 *   2. The interceptor stubs below become real interceptors.
 *   3. Zero changes needed in page components.
 */
import type { ApiError, PaginatedResponse } from '../types';
import { useUIStore } from '../store/uiStore';

// ─── Base URL (switch via .env) ───────────────────────────────────────────────
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

// ─── Error classifier ─────────────────────────────────────────────────────────
export function classifyError(err: unknown): ApiError {
    if (!navigator.onLine) {
        return { status: 0, code: 'NETWORK_ERROR', message: 'Internet aloqasi yo\'q' };
    }
    if (err instanceof Response || (typeof err === 'object' && err !== null && 'status' in err)) {
        const e = err as { status: number; message?: string; code?: string };
        return {
            status: e.status,
            code: e.code ?? (e.status === 401 ? 'UNAUTHORIZED' : e.status === 403 ? 'FORBIDDEN' : e.status >= 500 ? 'SERVER_ERROR' : 'CLIENT_ERROR'),
            message: e.message ?? 'Xato yuz berdi',
        };
    }
    return { status: -1, code: 'UNKNOWN', message: 'Noma\'lum xato yuz berdi' };
}

// ─── Global error handler ─────────────────────────────────────────────────────
/**
 * Call handleApiError(err) inside catch blocks of service functions.
 * It dispatches toast, handles 401 redirect, sets network banner.
 */
export function handleApiError(err: unknown): ApiError {
    const apiErr = classifyError(err);
    const { addToast, setNetworkError } = useUIStore.getState();

    if (apiErr.status === 0) {
        setNetworkError(true);
    } else if (apiErr.status === 401) {
        addToast({ type: 'error', title: 'Sessiya tugadi', message: 'Iltimos, qayta kiring.' });
        // authStore.getState().logout(); ← uncomment when authStore has logout()
        window.location.href = '/login';
    } else if (apiErr.status >= 500) {
        addToast({ type: 'error', title: 'Server xatosi', message: 'Keyinroq urinib ko\'ring.' });
    } else if (apiErr.status >= 400) {
        addToast({ type: 'error', title: 'Xato', message: apiErr.message });
    }

    return apiErr;
}

// ─── Simulated delay (remove when real API is wired) ─────────────────────────
export function fakeDelay(ms = 600): Promise<void> {
    return new Promise(res => setTimeout(res, ms));
}

// ─── Generic paginated response builder (mock helper) ────────────────────────
export function paginate<T>(data: T[], page: number, pageSize: number): PaginatedResponse<T> {
    const start = (page - 1) * pageSize;
    return {
        data: data.slice(start, start + pageSize),
        total: data.length,
        page,
        pageSize,
        totalPages: Math.ceil(data.length / pageSize),
    };
}

// ─── Network listener (call once in App.tsx) ──────────────────────────────────
export function initNetworkListeners() {
    const { setNetworkError } = useUIStore.getState();
    window.addEventListener('offline', () => setNetworkError(true));
    window.addEventListener('online', () => setNetworkError(false));
}
