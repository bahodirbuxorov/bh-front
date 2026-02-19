import React from 'react';
import { cn } from '../../utils';

interface BadgeProps {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
    size?: 'sm' | 'md';
    children: React.ReactNode;
    className?: string;
    dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
    variant = 'default',
    size = 'sm',
    children,
    className,
    dot,
}) => {
    const base = 'inline-flex items-center gap-1.5 font-medium rounded-full';

    const variants = {
        default: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
        success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    };

    const sizes = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
    };

    const dotColors = {
        default: 'bg-slate-400',
        success: 'bg-green-500',
        warning: 'bg-amber-500',
        danger: 'bg-red-500',
        info: 'bg-blue-500',
        purple: 'bg-purple-500',
    };

    return (
        <span className={cn(base, variants[variant], sizes[size], className)}>
            {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
            {children}
        </span>
    );
};
