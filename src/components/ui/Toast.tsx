import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { cn } from '../../utils';

const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
};

const colors = {
    success: 'border-l-green-500 text-green-700 dark:text-green-400',
    error: 'border-l-red-500 text-red-700 dark:text-red-400',
    warning: 'border-l-amber-500 text-amber-700 dark:text-amber-400',
    info: 'border-l-blue-500 text-blue-700 dark:text-blue-400',
};

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useUIStore();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={cn(
                        'flex items-start gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-l-4 rounded-lg px-4 py-3 shadow-lg animate-slide-in',
                        colors[toast.type]
                    )}
                >
                    <span className="shrink-0 mt-0.5">{icons[toast.type]}</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{toast.title}</p>
                        {toast.message && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{toast.message}</p>
                        )}
                    </div>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mt-0.5"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};
