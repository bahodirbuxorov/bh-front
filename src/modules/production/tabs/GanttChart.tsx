import React, { useMemo } from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

interface GanttOrder {
    id: string;
    product: string;
    start: string; // YYYY-MM-DD
    end: string;
    status: 'completed' | 'in_progress' | 'pending' | 'cancelled';
    completedPct: number;
}

const ORDERS: GanttOrder[] = [
    { id: 'PROD-001', product: "Non (bug'doy)", start: '2026-02-15', end: '2026-02-21', status: 'in_progress', completedPct: 64 },
    { id: 'PROD-002', product: 'Makaron (spaghetti)', start: '2026-02-17', end: '2026-02-22', status: 'in_progress', completedPct: 40 },
    { id: 'PROD-003', product: 'Qandolat mahsuloti', start: '2026-02-10', end: '2026-02-18', status: 'completed', completedPct: 100 },
    { id: 'PROD-004', product: "Limon likorasi", start: '2026-02-19', end: '2026-02-25', status: 'pending', completedPct: 0 },
    { id: 'PROD-005', product: 'Yeryong\'oq moysi', start: '2026-02-12', end: '2026-02-16', status: 'completed', completedPct: 100 },
    { id: 'PROD-006', product: 'Turshilar assortimenti', start: '2026-02-20', end: '2026-02-28', status: 'pending', completedPct: 0 },
];

const STATUS_COLORS = {
    completed: { bar: '#10b981', bg: '#d1fae5', text: '#065f46', label: 'Bajarildi' },
    in_progress: { bar: '#6366f1', bg: '#e0e7ff', text: '#3730a3', label: 'Jarayonda' },
    pending: { bar: '#f59e0b', bg: '#fef3c7', text: '#92400e', label: 'Kutilmoqda' },
    cancelled: { bar: '#ef4444', bg: '#fee2e2', text: '#991b1b', label: 'Bekor' },
};

function dateToNum(d: string): number { return new Date(d).getTime(); }

export const GanttChart: React.FC = () => {
    const rangeStart = '2026-02-10';
    const rangeEnd = '2026-02-28';
    const totalMs = dateToNum(rangeEnd) - dateToNum(rangeStart);

    const days = useMemo(() => {
        const result: string[] = [];
        let cur = new Date(rangeStart);
        const end = new Date(rangeEnd);
        while (cur <= end) {
            result.push(cur.toISOString().slice(0, 10));
            cur.setDate(cur.getDate() + 1);
        }
        return result;
    }, []);

    const today = '2026-02-20';
    const todayPct = ((dateToNum(today) - dateToNum(rangeStart)) / totalMs) * 100;

    const getBar = (order: GanttOrder) => {
        const left = ((dateToNum(order.start) - dateToNum(rangeStart)) / totalMs) * 100;
        const width = ((dateToNum(order.end) - dateToNum(order.start)) / totalMs) * 100;
        return { left: Math.max(0, left), width: Math.min(100 - left, width) };
    };

    return (
        <div className="space-y-5">
            {/* Legend */}
            <Card>
                <div className="flex flex-wrap gap-4 text-xs">
                    {Object.entries(STATUS_COLORS).map(([key, cfg]) => (
                        <div key={key} className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-sm" style={{ background: cfg.bar }} />
                            <span className="text-slate-600 dark:text-slate-300">{cfg.label}</span>
                        </div>
                    ))}
                    <div className="flex items-center gap-1.5">
                        <div className="w-0.5 h-4 bg-red-500" />
                        <span className="text-slate-600 dark:text-slate-300">Bugun</span>
                    </div>
                </div>
            </Card>

            <Card padding={false} className="overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="min-w-[700px]">
                        {/* Header: dates */}
                        <div className="flex border-b border-slate-100 dark:border-slate-700">
                            <div className="w-56 shrink-0 px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50">
                                Buyurtma
                            </div>
                            <div className="flex-1 relative bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex h-full">
                                    {days.filter((_, i) => i % 2 === 0).map(d => (
                                        <div key={d} className="flex-1 px-1 py-2.5 text-xs text-slate-400 border-l border-slate-200 dark:border-slate-700">
                                            {d.slice(5)} {/* MM-DD */}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Rows */}
                        {ORDERS.map((order, idx) => {
                            const bar = getBar(order);
                            const cfg = STATUS_COLORS[order.status];
                            return (
                                <div key={order.id} className={`flex border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30 dark:bg-slate-800/20'}`}>
                                    {/* Label */}
                                    <div className="w-56 shrink-0 px-4 py-3 flex items-center gap-2">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-800 dark:text-white truncate max-w-36">{order.product}</p>
                                            <p className="text-xs text-slate-400">{order.id}</p>
                                        </div>
                                        <Badge variant={order.status === 'completed' ? 'success' : order.status === 'in_progress' ? 'info' : order.status === 'cancelled' ? 'danger' : 'warning'} size="sm" className="shrink-0">
                                            {order.completedPct}%
                                        </Badge>
                                    </div>

                                    {/* Bar area */}
                                    <div className="flex-1 relative py-4 px-2">
                                        {/* Today line */}
                                        <div className="absolute top-0 bottom-0 w-px bg-red-400/60 z-10" style={{ left: `${todayPct}%` }} />

                                        {/* Background grid */}
                                        {days.filter((_, i) => i % 2 === 0).map((d, i) => (
                                            <div key={d} className="absolute top-0 bottom-0 w-px bg-slate-100 dark:bg-slate-700"
                                                style={{ left: `${(i / (days.filter((_, j) => j % 2 === 0).length)) * 100}%` }} />
                                        ))}

                                        {/* Bar */}
                                        <div className="absolute top-3 h-7 rounded-lg flex items-center overflow-hidden shadow-sm"
                                            style={{ left: `${bar.left}%`, width: `${bar.width}%`, background: cfg.bar, opacity: 0.85 }}>
                                            {/* Progress fill */}
                                            <div className="absolute inset-0 rounded-lg" style={{ width: `${order.completedPct}%`, background: cfg.bar, opacity: 1 }} />
                                            <div className="absolute inset-0 rounded-lg" style={{ width: `${100 - order.completedPct}%`, left: `${order.completedPct}%`, background: cfg.bar, opacity: 0.35 }} />
                                            <span className="relative z-10 px-2 text-white text-xs font-semibold truncate">
                                                {order.start.slice(5)} → {order.end.slice(5)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Card>

            {/* Summary table */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(STATUS_COLORS).map(([key, cfg]) => {
                    const count = ORDERS.filter(o => o.status === key).length;
                    return (
                        <div key={key} className="rounded-xl p-4 text-center" style={{ background: cfg.bg }}>
                            <p className="text-2xl font-bold" style={{ color: cfg.bar }}>{count}</p>
                            <p className="text-xs font-medium" style={{ color: cfg.text }}>{cfg.label}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
