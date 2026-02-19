import React from 'react';
import { cn } from '../../utils';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: boolean;
    hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, padding = true, hover = false }) => {
    return (
        <div
            className={cn(
                'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl shadow-sm',
                padding && 'p-5',
                hover && 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
                className
            )}
        >
            {children}
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: React.ReactNode;
    iconBg?: string;
    loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    change,
    changeType = 'neutral',
    icon,
    iconBg = 'bg-indigo-100 dark:bg-indigo-900/30',
    loading = false,
}) => {
    if (loading) {
        return (
            <Card>
                <div className="space-y-3 animate-pulse">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-7 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
            </Card>
        );
    }

    return (
        <Card className="hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
                    {change && (
                        <p
                            className={cn(
                                'text-xs font-medium',
                                changeType === 'positive' && 'text-green-600 dark:text-green-400',
                                changeType === 'negative' && 'text-red-600 dark:text-red-400',
                                changeType === 'neutral' && 'text-slate-500 dark:text-slate-400'
                            )}
                        >
                            {change}
                        </p>
                    )}
                </div>
                <div className={cn('p-2.5 rounded-xl', iconBg)}>
                    <span className="text-indigo-600 dark:text-indigo-400">{icon}</span>
                </div>
            </div>
        </Card>
    );
};
