import React from 'react';
import { cn } from '../../utils';

// ─── Text skeleton ────────────────────────────────────────────────────────────
interface SkeletonTextProps {
    lines?: number;
    className?: string;
    widths?: string[];
}
export const SkeletonText: React.FC<SkeletonTextProps> = ({ lines = 1, widths, className }) => (
    <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }, (_, i) => (
            <div key={i} className={cn(
                'h-3.5 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse',
                widths?.[i] ?? (i === lines - 1 && lines > 1 ? 'w-3/5' : 'w-full')
            )} />
        ))}
    </div>
);

// ─── Generic rectangle skeleton ───────────────────────────────────────────────
interface SkeletonProps {
    className?: string;
    rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    style?: React.CSSProperties;
}
export const Skeleton: React.FC<SkeletonProps> = ({ className, rounded = 'md', style }) => {
    const r = { sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg', xl: 'rounded-xl', full: 'rounded-full' };
    return <div style={style} className={cn('bg-slate-200 dark:bg-slate-700 animate-pulse', r[rounded], className)} />;
};

// ─── Card skeleton ────────────────────────────────────────────────────────────
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
    <div className={cn('bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5', className)}>
        <Skeleton className="h-4 w-1/3 mb-3" rounded="full" />
        <Skeleton className="h-8 w-2/3 mb-2" rounded="md" />
        <SkeletonText lines={2} widths={['w-full', 'w-4/5']} />
    </div>
);

// ─── Table row skeleton ───────────────────────────────────────────────────────
interface SkeletonTableProps {
    rows?: number;
    columns?: number;
}
export const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 8, columns = 6 }) => (
    <div className="space-y-0">
        {/* fake header */}
        <div className="flex gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            {Array.from({ length: columns }, (_, i) => (
                <Skeleton key={i} className="h-3 flex-1 max-w-[120px]" rounded="full" />
            ))}
        </div>
        {/* fake rows */}
        {Array.from({ length: rows }, (_, r) => (
            <div key={r} className={cn(
                'flex gap-4 px-4 py-3.5 border-b border-slate-50 dark:border-slate-700/50',
                r % 2 === 0 ? '' : ''
            )}>
                {Array.from({ length: columns }, (_, c) => (
                    <Skeleton key={c} className="h-4 flex-1" rounded="md"
                        style={{ animationDelay: `${(r * columns + c) * 30}ms`, maxWidth: c === 0 ? '180px' : '120px' }}
                    />
                ))}
            </div>
        ))}
    </div>
);

// ─── Stat card skeleton (dashboard) ──────────────────────────────────────────
export const SkeletonStatCard: React.FC = () => (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-3 w-24" rounded="full" />
            <Skeleton className="h-9 w-9" rounded="xl" />
        </div>
        <Skeleton className="h-7 w-32 mb-2" rounded="md" />
        <Skeleton className="h-3 w-20" rounded="full" />
    </div>
);
