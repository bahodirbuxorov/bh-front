import React, { useMemo, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

import { mockInventory } from '../../../mocks';
import { formatCurrency } from '../../../utils';

type AgeBucket = '0-30' | '30-60' | '60-90' | '90+';

interface AgedItem {
    id: string;
    name: string;
    type: string;
    quantity: number;
    unit: string;
    averageCost: number;
    totalValue: number;
    daysInStock: number;
    bucket: AgeBucket;
}

// Deterministic "days in stock" based on item id
function getDaysInStock(id: string): number {
    const seed = id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    return (seed * 17 + 7) % 120; // 0–119 days
}

function getBucket(days: number): AgeBucket {
    if (days < 30) return '0-30';
    if (days < 60) return '30-60';
    if (days < 90) return '60-90';
    return '90+';
}

const BUCKET_CONFIG: Record<AgeBucket, { label: string; color: string; bg: string; text: string; border: string; icon: string }> = {
    '0-30': { label: '0–30 kun', color: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', icon: '🟢' },
    '30-60': { label: '30–60 kun', color: 'bg-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', icon: '🟡' },
    '60-90': { label: '60–90 kun', color: 'bg-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800', icon: '🟠' },
    '90+': { label: '90+ kun', color: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800', icon: '🔴' },
};

export const InventoryAging: React.FC = () => {
    const [selectedBucket, setSelectedBucket] = useState<AgeBucket | 'all'>('all');

    const agedItems: AgedItem[] = useMemo(() =>
        mockInventory.map(item => {
            const days = getDaysInStock(item.id);
            return {
                id: item.id,
                name: item.name,
                type: item.type,
                quantity: item.quantity,
                unit: item.unit,
                averageCost: item.averageCost,
                totalValue: item.quantity * item.averageCost,
                daysInStock: days,
                bucket: getBucket(days),
            };
        }),
        []
    );

    const bucketSummary = useMemo(() => {
        const summary: Record<AgeBucket, { count: number; value: number }> = {
            '0-30': { count: 0, value: 0 }, '30-60': { count: 0, value: 0 },
            '60-90': { count: 0, value: 0 }, '90+': { count: 0, value: 0 },
        };
        agedItems.forEach(i => { summary[i.bucket].count++; summary[i.bucket].value += i.totalValue; });
        return summary;
    }, [agedItems]);

    const frozenValue = useMemo(() =>
        agedItems.filter(i => i.bucket === '60-90' || i.bucket === '90+').reduce((s, i) => s + i.totalValue, 0),
        [agedItems]
    );

    const displayed = selectedBucket === 'all' ? agedItems : agedItems.filter(i => i.bucket === selectedBucket);

    const typeLabel = { raw: 'Xom ashyo', semi: 'Yarim tayyor', finished: 'Tayyor mahsulot' };

    return (
        <div className="space-y-5">
            {/* Frozen inventory alert */}
            {frozenValue > 0 && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-red-800 dark:text-red-300">Muzlatilgan inventar</p>
                        <p className="text-xs text-red-600 dark:text-red-400">
                            60+ kun omborда turgan mahsulotlar qiymati: <span className="font-bold">{formatCurrency(frozenValue)}</span>
                        </p>
                    </div>
                </div>
            )}

            {/* Bucket filter cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {(Object.keys(BUCKET_CONFIG) as AgeBucket[]).map(bucket => {
                    const cfg = BUCKET_CONFIG[bucket];
                    const s = bucketSummary[bucket];
                    const isSelected = selectedBucket === bucket;
                    return (
                        <button key={bucket} onClick={() => setSelectedBucket(selectedBucket === bucket ? 'all' : bucket)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${isSelected ? cfg.border + ' ' + cfg.bg : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{cfg.icon}</span>
                                <span className={`text-xs font-semibold ${isSelected ? cfg.text : 'text-slate-500 dark:text-slate-400'}`}>{cfg.label}</span>
                            </div>
                            <p className={`text-xl font-bold ${isSelected ? cfg.text : 'text-slate-800 dark:text-white'}`}>{s.count}</p>
                            <p className="text-xs text-slate-400">{formatCurrency(s.value)}</p>
                        </button>
                    );
                })}
            </div>

            {/* Heatmap table */}
            <Card padding={false}>
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {selectedBucket === 'all' ? "Barcha mahsulotlar" : `${BUCKET_CONFIG[selectedBucket].label} — ${displayed.length} ta`}
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                {['Mahsulot', 'Turi', 'Miqdor', 'Narx/birlik', 'Jami qiymat', 'Omborda (kun)', 'Holat'].map(h => (
                                    <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-left last:text-center">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {displayed.sort((a, b) => b.daysInStock - a.daysInStock).map(item => {
                                const cfg = BUCKET_CONFIG[item.bucket];
                                return (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{item.name}</td>
                                        <td className="px-4 py-3 text-slate-500">{typeLabel[item.type as keyof typeof typeLabel]}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{item.quantity} {item.unit}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatCurrency(item.averageCost)}</td>
                                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">{formatCurrency(item.totalValue)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full max-w-20">
                                                    <div className={`h-full ${cfg.color} rounded-full`}
                                                        style={{ width: `${Math.min(100, (item.daysInStock / 120) * 100)}%` }} />
                                                </div>
                                                <span className={`text-xs font-mono font-semibold ${cfg.text}`}>{item.daysInStock}k</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                                                {cfg.icon} {cfg.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
