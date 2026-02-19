import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils';

interface Column<T> {
    key: string;
    header: string;
    render?: (row: T) => React.ReactNode;
    align?: 'left' | 'center' | 'right';
    width?: string;
    sortable?: boolean;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    rowKey: (row: T) => string;
    onRowClick?: (row: T) => void;
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;
    emptyMessage?: string;
}

// Memoised row to prevent re-renders when parent re-renders
const TableRow = React.memo(function TableRow<T>({
    row, columns, rowKey, onRowClick,
}: { row: T; columns: Column<T>[]; rowKey: (row: T) => string; onRowClick?: (row: T) => void }) {
    return (
        <tr
            key={rowKey(row)}
            onClick={() => onRowClick?.(row)}
            className={cn(
                'hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors',
                onRowClick && 'cursor-pointer'
            )}
        >
            {columns.map((col) => (
                <td
                    key={col.key}
                    className={cn(
                        'px-4 py-3.5 text-slate-700 dark:text-slate-200 whitespace-nowrap',
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    )}
                >
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                </td>
            ))}
        </tr>
    );
}) as <T>(props: { row: T; columns: Column<T>[]; rowKey: (row: T) => string; onRowClick?: (row: T) => void }) => React.ReactElement;

export function Table<T>({ columns, data, rowKey, onRowClick, loading, error, onRetry, emptyMessage = "Ma'lumot yo'q" }: TableProps<T>) {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const handleSort = useCallback((key: string) => {
        setSortKey(prev => {
            if (prev === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return key; }
            setSortDir('asc');
            return key;
        });
    }, []);

    const sortedData = useMemo(() => sortKey ? [...data].sort((a, b) => {
        const av = (a as Record<string, unknown>)[sortKey];
        const bv = (b as Record<string, unknown>)[sortKey];
        if (av === bv) return 0;
        const cmp = String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
    }) : data, [data, sortKey, sortDir]);

    const SortIcon = useCallback(({ colKey }: { colKey: string }) => {
        if (sortKey !== colKey) return <ChevronsUpDown className="w-3 h-3 opacity-40" />;
        return sortDir === 'asc'
            ? <ChevronUp className="w-3 h-3 text-indigo-500" />
            : <ChevronDown className="w-3 h-3 text-indigo-500" />;
    }, [sortKey, sortDir]);

    const HeaderRow = (
        <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50">
                {columns.map((col) => (
                    <th
                        key={col.key}
                        onClick={col.sortable ? () => handleSort(col.key) : undefined}
                        className={cn(
                            'px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap',
                            col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                            col.width,
                            col.sortable && 'cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 select-none focus-visible:outline-none'
                        )}
                        tabIndex={col.sortable ? 0 : undefined}
                        onKeyDown={col.sortable ? (e) => e.key === 'Enter' || e.key === ' ' ? handleSort(col.key) : undefined : undefined}
                        aria-sort={col.sortable ? (sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}
                    >
                        <span className="inline-flex items-center gap-1">
                            {col.header}
                            {col.sortable && <SortIcon colKey={col.key} />}
                        </span>
                    </th>
                ))}
            </tr>
        </thead>
    );

    // ── Error state ──────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="overflow-hidden rounded-xl border border-red-200 dark:border-red-800">
                <table className="w-full text-sm">{HeaderRow}</table>
                <div className="py-12 text-center bg-white dark:bg-slate-800">
                    <div className="w-12 h-12 mx-auto mb-3 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-white mb-1">Ma'lumotlarni yuklashda xato</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{error}</p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400"
                        >
                            <RefreshCw className="w-3 h-3" />
                            Qayta urinish
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ── Loading state ────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm">
                    {HeaderRow}
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                        {[...Array(8)].map((_, i) => (
                            <tr key={i}>
                                {columns.map((col, ci) => (
                                    <td key={col.key} className="px-4 py-3.5">
                                        <div
                                            className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
                                            style={{ width: `${55 + ((i * columns.length + ci) % 5) * 8}%`, animationDelay: `${(i * columns.length + ci) * 25}ms` }}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    // ── Empty state ──────────────────────────────────────────────────────────
    if (data.length === 0) {
        return (
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm">{HeaderRow}</table>
                <div className="py-16 text-center bg-white dark:bg-slate-800">
                    <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                        <span className="text-2xl">📭</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    // ── Data table ───────────────────────────────────────────────────────────
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    {HeaderRow}
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                        {sortedData.map((row) => (
                            <TableRow key={rowKey(row)} row={row} columns={columns} rowKey={rowKey} onRowClick={onRowClick} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (p: number) => void;
    totalItems?: number;
    pageSize?: number;
}

export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange, totalItems, pageSize }) => {
    if (totalPages <= 1) return null;

    const from = (page - 1) * (pageSize || 10) + 1;
    const to = Math.min(page * (pageSize || 10), totalItems || 0);

    const getPages = () => {
        const half = 2;
        let start = Math.max(1, page - half);
        let end = Math.min(totalPages, page + half);
        if (end - start < 4) {
            if (start === 1) end = Math.min(5, totalPages);
            else start = Math.max(1, end - 4);
        }
        const pages: number[] = [];
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    const btnCls = 'w-8 h-8 text-sm rounded-lg font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500';

    return (
        <div className="flex items-center justify-between px-1 py-2">
            {totalItems !== undefined && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {from}–{to} / {totalItems} ta
                </p>
            )}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    aria-label="Oldingi sahifa"
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                {getPages().map((p) => (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        aria-label={`${p}-sahifa`}
                        aria-current={p === page ? 'page' : undefined}
                        className={cn(
                            btnCls,
                            p === page
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        )}
                    >
                        {p}
                    </button>
                ))}
                {totalPages > 5 && page < totalPages - 2 && (
                    <>
                        <span className="text-slate-400 px-1">…</span>
                        <button onClick={() => onPageChange(totalPages)} aria-label={`${totalPages}-sahifa`}
                            className={cn(btnCls, 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700')}>
                            {totalPages}
                        </button>
                    </>
                )}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    aria-label="Keyingi sahifa"
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
