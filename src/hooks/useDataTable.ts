import { useState, useMemo, useCallback, useEffect } from 'react';
import type { FilterParams, SortState, SortOrder } from '../types';

interface UseDataTableOptions<T> {
    data: T[];
    pageSize?: number;
    defaultSort?: SortState;
    searchKeys?: (keyof T)[];
}

interface UseDataTableReturn<T> {
    // filtered + sorted + paginated slice
    rows: T[];
    // filter state
    search: string;
    setSearch: (v: string) => void;
    filters: FilterParams;
    setFilter: (key: keyof FilterParams, value: string) => void;
    // sort state
    sort: SortState | null;
    toggleSort: (key: string) => void;
    // pagination
    page: number;
    setPage: (p: number) => void;
    totalPages: number;
    totalItems: number;
    pageSize: number;
}

export function useDataTable<T extends Record<string, unknown>>({
    data,
    pageSize = 10,
    defaultSort,
    searchKeys = [],
}: UseDataTableOptions<T>): UseDataTableReturn<T> {
    const [search, setSearchRaw] = useState('');
    const [filters, setFilters] = useState<FilterParams>({});
    const [sort, setSort] = useState<SortState | null>(defaultSort ?? null);
    const [page, setPageRaw] = useState(1);

    const setSearch = useCallback((v: string) => { setSearchRaw(v); setPageRaw(1); }, []);
    const setFilter = useCallback((key: keyof FilterParams, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPageRaw(1);
    }, []);

    const toggleSort = useCallback((key: string) => {
        setSort(prev => {
            if (!prev || prev.key !== key) return { key, order: 'asc' };
            if (prev.order === 'asc') return { key, order: 'desc' };
            return null; // third click clears sort
        });
    }, []);

    const filtered = useMemo(() => {
        let result = data;
        if (search && searchKeys.length > 0) {
            const q = search.toLowerCase();
            result = result.filter(row =>
                searchKeys.some(k => String(row[k] ?? '').toLowerCase().includes(q))
            );
        }
        if (filters.status && filters.status !== 'all') {
            result = result.filter(row => row['status'] === filters.status);
        }
        if (filters.type && filters.type !== 'all') {
            result = result.filter(row => row['type'] === filters.type);
        }
        return result;
    }, [data, search, searchKeys, filters]);

    const sorted = useMemo(() => {
        if (!sort) return filtered;
        return [...filtered].sort((a, b) => {
            const av = a[sort.key] as string | number;
            const bv = b[sort.key] as string | number;
            const dir: SortOrder = sort.order;
            if (av < bv) return dir === 'asc' ? -1 : 1;
            if (av > bv) return dir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filtered, sort]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

    // keep page in bounds when filter changes total
    useEffect(() => {
        if (page > totalPages) setPageRaw(totalPages);
    }, [page, totalPages]);

    const rows = useMemo(
        () => sorted.slice((page - 1) * pageSize, page * pageSize),
        [sorted, page, pageSize]
    );

    return {
        rows,
        search, setSearch,
        filters, setFilter,
        sort, toggleSort,
        page, setPage: setPageRaw,
        totalPages,
        totalItems: sorted.length,
        pageSize,
    };
}
