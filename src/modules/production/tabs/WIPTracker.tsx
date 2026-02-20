import React, { useState } from 'react';
import { TrendingDown, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils';
import { useUIStore } from '../../../store/uiStore';

type WIPStatus = 'raw_materials' | 'in_process' | 'quality_check' | 'finished';

interface WIPOrder {
    id: string;
    product: string;
    totalQty: number;
    completedQty: number;
    startDate: string;
    targetDate: string;
    status: WIPStatus;
    materials: { name: string; planned: number; actual: number; unit: string }[];
    scrapQty: number;
    laborHours: { planned: number; actual: number };
    unitCost: number;
}

const mockWIP: WIPOrder[] = [
    {
        id: 'WIP-001', product: "Non (bug'doy)", totalQty: 500, completedQty: 320,
        startDate: '2026-02-18', targetDate: '2026-02-21', status: 'in_process',
        materials: [
            { name: "Bug'doy uni", planned: 100, actual: 98, unit: 'kg' },
            { name: 'Osh tuzi', planned: 2, actual: 2.1, unit: 'kg' },
            { name: 'Suv', planned: 60, actual: 60, unit: 'litr' },
        ],
        scrapQty: 8, laborHours: { planned: 24, actual: 26 }, unitCost: 3200,
    },
    {
        id: 'WIP-002', product: 'Makaron (spaghetti)', totalQty: 300, completedQty: 0,
        startDate: '2026-02-19', targetDate: '2026-02-22', status: 'raw_materials',
        materials: [
            { name: "Bug'doy uni", planned: 90, actual: 88, unit: 'kg' },
            { name: 'Tuxum', planned: 30, actual: 0, unit: 'dona' },
        ],
        scrapQty: 0, laborHours: { planned: 18, actual: 4 }, unitCost: 4100,
    },
    {
        id: 'WIP-003', product: 'Qandolat mahsuloti', totalQty: 200, completedQty: 200,
        startDate: '2026-02-15', targetDate: '2026-02-20', status: 'quality_check',
        materials: [
            { name: 'Shakar', planned: 40, actual: 42, unit: 'kg' },
            { name: 'Kakao', planned: 10, actual: 10, unit: 'kg' },
        ],
        scrapQty: 3, laborHours: { planned: 12, actual: 13 }, unitCost: 8500,
    },
];

const STATUS_CONFIG: Record<WIPStatus, { label: string; color: string; bg: string; step: number }> = {
    raw_materials: { label: 'Xom ashyo', color: 'bg-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', step: 0 },
    in_process: { label: 'Jarayonda', color: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', step: 1 },
    quality_check: { label: 'Sifat tekshiruvi', color: 'bg-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20', step: 2 },
    finished: { label: 'Tayyor', color: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', step: 3 },
};

const STEPS: WIPStatus[] = ['raw_materials', 'in_process', 'quality_check', 'finished'];

export const WIPTracker: React.FC = () => {
    const { addToast } = useUIStore();
    const [orders, setOrders] = useState(mockWIP);
    const [expanded, setExpanded] = useState<string | null>('WIP-001');

    const advance = (id: string) => {
        setOrders(prev => prev.map(o => {
            if (o.id !== id) return o;
            const idx = STEPS.indexOf(o.status);
            if (idx >= STEPS.length - 1) return o;
            const next = STEPS[idx + 1];
            addToast({ type: 'success', title: 'Bosqich o\'zgartirildi', message: `${o.product} → ${STATUS_CONFIG[next].label}` });
            return { ...o, status: next };
        }));
    };

    return (
        <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-4 gap-3">
                {STEPS.map(s => {
                    const cfg = STATUS_CONFIG[s];
                    const count = orders.filter(o => o.status === s).length;
                    return (
                        <div key={s} className={`${cfg.bg} rounded-xl p-4 text-center`}>
                            <div className={`w-3 h-3 ${cfg.color} rounded-full mx-auto mb-2`} />
                            <p className="text-xl font-bold text-slate-800 dark:text-white">{count}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{cfg.label}</p>
                        </div>
                    );
                })}
            </div>

            {orders.map(order => {
                const cfg = STATUS_CONFIG[order.status];
                const progress = order.totalQty > 0 ? (order.completedQty / order.totalQty) * 100 : 0;
                const scrapPct = order.totalQty > 0 ? (order.scrapQty / order.totalQty) * 100 : 0;
                const isExpanded = expanded === order.id;
                const stepIdx = STEPS.indexOf(order.status);

                return (
                    <Card key={order.id} padding={false} className="overflow-hidden">
                        {/* Header */}
                        <button className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors text-left"
                            onClick={() => setExpanded(isExpanded ? null : order.id)}>
                            <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center shrink-0`}>
                                {order.status === 'finished' ? <CheckCircle className="w-5 h-5 text-emerald-600" />
                                    : order.status === 'quality_check' ? <AlertTriangle className="w-5 h-5 text-violet-600" />
                                        : <Clock className="w-5 h-5 text-blue-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold text-slate-800 dark:text-white">{order.product}</span>
                                    <Badge variant={order.status === 'finished' ? 'success' : order.status === 'quality_check' ? 'purple' : 'info'} size="sm">
                                        {cfg.label}
                                    </Badge>
                                    <span className="text-xs text-slate-400 ml-auto">{order.id}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full">
                                        <div className={`h-full ${cfg.color} rounded-full transition-all`} style={{ width: `${progress}%` }} />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                                        {order.completedQty}/{order.totalQty} dona · {progress.toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        </button>

                        {/* Pipeline steps */}
                        <div className="px-4 pb-3 flex items-center gap-1">
                            {STEPS.map((s, i) => (
                                <React.Fragment key={s}>
                                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-all ${i <= stepIdx ? STATUS_CONFIG[s].bg + ' ' + 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${i <= stepIdx ? STATUS_CONFIG[s].color : 'bg-slate-300'}`} />
                                        {STATUS_CONFIG[s].label}
                                    </div>
                                    {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < stepIdx ? 'bg-indigo-300' : 'bg-slate-200 dark:bg-slate-600'}`} />}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Expanded detail */}
                        {isExpanded && (
                            <div className="border-t border-slate-100 dark:border-slate-700 p-4 space-y-4">
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p className="text-xs text-slate-400 mb-0.5">Boshlanish</p>
                                        <p className="font-medium text-slate-800 dark:text-white">{order.startDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-0.5">Tugash muddati</p>
                                        <p className="font-medium text-slate-800 dark:text-white">{order.targetDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-0.5">Birlik narxi</p>
                                        <p className="font-semibold text-indigo-600">{formatCurrency(order.unitCost)}</p>
                                    </div>
                                </div>

                                {/* Materials */}
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Material sarfi</p>
                                    <div className="space-y-2">
                                        {order.materials.map(m => {
                                            const variance = m.actual - m.planned;
                                            const isOver = variance > 0;
                                            return (
                                                <div key={m.name} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5">
                                                    <span className="text-sm text-slate-700 dark:text-slate-200 flex-1">{m.name}</span>
                                                    <span className="text-xs text-slate-400">Reja: {m.planned} {m.unit}</span>
                                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Haqiqiy: {m.actual} {m.unit}</span>
                                                    {variance !== 0 && (
                                                        <span className={`text-xs font-bold ${isOver ? 'text-red-500' : 'text-emerald-500'}`}>
                                                            {isOver ? '+' : ''}{variance.toFixed(1)}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* KPIs */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingDown className="w-4 h-4 text-red-400" />
                                            <span className="text-xs font-medium text-slate-500">Chiqit (scrap)</span>
                                        </div>
                                        <p className="text-lg font-bold text-red-500">{order.scrapQty} dona</p>
                                        <p className="text-xs text-slate-400">{scrapPct.toFixed(1)}% dan partiya</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock className="w-4 h-4 text-blue-400" />
                                            <span className="text-xs font-medium text-slate-500">Mehnat soati</span>
                                        </div>
                                        <p className="text-lg font-bold text-blue-600">{order.laborHours.actual}h</p>
                                        <p className="text-xs text-slate-400">Reja: {order.laborHours.planned}h</p>
                                    </div>
                                </div>

                                {order.status !== 'finished' && (
                                    <Button variant="primary" size="sm" onClick={() => advance(order.id)}>
                                        Keyingi bosqichga o'tkazish →
                                    </Button>
                                )}
                            </div>
                        )}
                    </Card>
                );
            })}
        </div>
    );
};
