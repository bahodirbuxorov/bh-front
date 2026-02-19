import React from 'react';
import { getInitials, cn } from '../../utils';

interface AvatarProps {
    name: string;
    src?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeClasses = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' };

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = 'md', className }) => {
    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={cn('rounded-full object-cover ring-2 ring-white dark:ring-slate-800', sizeClasses[size], className)}
            />
        );
    }
    return (
        <div
            className={cn(
                'rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold ring-2 ring-white dark:ring-slate-800',
                sizeClasses[size],
                className
            )}
        >
            {getInitials(name)}
        </div>
    );
};

// PageHeader component
interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
    return (
        <div className="flex items-start justify-between mb-6">
            <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
                {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
    );
};

// EmptyState component
interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon = '📭', title, description, action }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-4 text-3xl">
                {icon}
            </div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
            {description && <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-xs">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
};

// Skeleton component
interface SkeletonProps {
    className?: string;
    lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, lines = 1 }) => {
    return (
        <div className="space-y-2">
            {[...Array(lines)].map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        'h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse',
                        i === lines - 1 && lines > 1 && 'w-3/4',
                        className
                    )}
                />
            ))}
        </div>
    );
};
