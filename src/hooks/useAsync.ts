import { useCallback, useReducer } from 'react';

// ─── State machine ────────────────────────────────────────────────────────────
type State<T> =
    | { status: 'idle'; data: null; error: null }
    | { status: 'loading'; data: T | null; error: null }
    | { status: 'success'; data: T; error: null }
    | { status: 'error'; data: T | null; error: string };

type Action<T> =
    | { type: 'START' }
    | { type: 'SUCCESS'; payload: T }
    | { type: 'ERROR'; payload: string }
    | { type: 'RESET' };

function reducer<T>(state: State<T>, action: Action<T>): State<T> {
    switch (action.type) {
        case 'START': return { status: 'loading', data: state.data, error: null };
        case 'SUCCESS': return { status: 'success', data: action.payload, error: null };
        case 'ERROR': return { status: 'error', data: state.data, error: action.payload };
        case 'RESET': return { status: 'idle', data: null, error: null };
        default: return state;
    }
}

const INITIAL = { status: 'idle' as const, data: null, error: null };

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAsync<T, Args extends unknown[] = []>() {
    const [state, dispatch] = useReducer(reducer<T>, INITIAL as State<T>);

    const execute = useCallback(async (fn: (...args: Args) => Promise<T>, ...args: Args) => {
        dispatch({ type: 'START' });
        try {
            const data = await fn(...args);
            dispatch({ type: 'SUCCESS', payload: data });
            return data;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Noma\'lum xato yuz berdi';
            dispatch({ type: 'ERROR', payload: msg });
            throw err;
        }
    }, []);

    const reset = useCallback(() => dispatch({ type: 'RESET' }), []);
    const retry = useCallback((fn: (...args: Args) => Promise<T>, ...args: Args) =>
        execute(fn, ...args), [execute]);

    return {
        ...state,
        isIdle: state.status === 'idle',
        isLoading: state.status === 'loading',
        isSuccess: state.status === 'success',
        isError: state.status === 'error',
        execute,
        retry,
        reset,
    };
}
