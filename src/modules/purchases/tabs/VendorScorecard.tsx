import React from 'react';
import { Star, TrendingUp, Package, Clock } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { formatCurrency } from '../../../utils';

interface Vendor {
    id: string;
    name: string;
    category: string;
    scores: { price: number; quality: number; delivery: number; communication: number };
    totalOrders: number;
    totalValue: number;
    onTimeRate: number;
    defectRate: number;
    lastOrder: string;
    status: 'preferred' | 'approved' | 'probation';
}

const vendors: Vendor[] = [
    {
        id: '1', name: 'Toshkent Tegirmoni', category: 'Xom ashyo', totalOrders: 24, totalValue: 48000000,
        scores: { price: 4.5, quality: 4.8, delivery: 4.2, communication: 4.6 }, onTimeRate: 92, defectRate: 1.2, lastOrder: '2026-02-18', status: 'preferred'
    },
    {
        id: '2', name: 'Sharq Kimyo', category: 'Qadoq materiallari', totalOrders: 12, totalValue: 12500000,
        scores: { price: 3.8, quality: 4.0, delivery: 3.5, communication: 4.1 }, onTimeRate: 79, defectRate: 3.5, lastOrder: '2026-02-10', status: 'approved'
    },
    {
        id: '3', name: 'Fermer Market', category: 'Oziq-ovqat', totalOrders: 36, totalValue: 72000000,
        scores: { price: 4.9, quality: 4.7, delivery: 4.8, communication: 4.5 }, onTimeRate: 97, defectRate: 0.5, lastOrder: '2026-02-20', status: 'preferred'
    },
    {
        id: '4', name: 'AgroSupply', category: 'Xom ashyo', totalOrders: 8, totalValue: 8200000,
        scores: { price: 3.2, quality: 3.0, delivery: 2.8, communication: 3.5 }, onTimeRate: 65, defectRate: 7.2, lastOrder: '2026-01-28', status: 'probation'
    },
];

const StarRating: React.FC<{ value: number; max?: number }> = ({ value, max = 5 }) => (
    <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-600'}`} />
        ))}
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-1">{value.toFixed(1)}</span>
    </div>
);

export const VendorScorecard: React.FC = () => {
    const statusCfg = {
        preferred: { variant: 'success' as const, label: '⭐ Preferred' },
        approved: { variant: 'info' as const, label: 'Tasdiqlangan' },
        probation: { variant: 'danger' as const, label: '⚠️ Probatsiya' },
    };

    return (
        <div className="space-y-5">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Preferred', count: vendors.filter(v => v.status === 'preferred').length, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                    { label: 'Tasdiqlangan', count: vendors.filter(v => v.status === 'approved').length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { label: 'Probatsiya', count: vendors.filter(v => v.status === 'probation').length, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {vendors.sort((a, b) => {
                    const avgA = Object.values(a.scores).reduce((s, v) => s + v, 0) / 4;
                    const avgB = Object.values(b.scores).reduce((s, v) => s + v, 0) / 4;
                    return avgB - avgA;
                }).map((vendor, idx) => {
                    const avgScore = Object.values(vendor.scores).reduce((s, v) => s + v, 0) / 4;
                    return (
                        <Card key={vendor.id} className={idx === 0 ? 'ring-2 ring-emerald-300 dark:ring-emerald-700' : ''}>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{vendor.name}</h3>
                                        {idx === 0 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">🏆 #1</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={statusCfg[vendor.status].variant} size="sm">{statusCfg[vendor.status].label}</Badge>
                                        <span className="text-xs text-slate-400">{vendor.category}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{avgScore.toFixed(1)}</p>
                                    <p className="text-xs text-slate-400">umumiy ball</p>
                                </div>
                            </div>

                            {/* Score categories */}
                            <div className="space-y-2 mb-4">
                                {([
                                    { key: 'price', label: 'Narx raqobatbardoshligi' },
                                    { key: 'quality', label: 'Mahsulot sifati' },
                                    { key: 'delivery', label: 'Yetkazish aniqligi' },
                                    { key: 'communication', label: 'Muloqot' },
                                ] as { key: keyof typeof vendor.scores; label: string }[]).map(({ key, label }) => (
                                    <div key={key} className="flex items-center gap-3">
                                        <span className="text-xs text-slate-500 dark:text-slate-400 w-40 shrink-0">{label}</span>
                                        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(vendor.scores[key] / 5) * 100}%` }} />
                                        </div>
                                        <StarRating value={vendor.scores[key]} />
                                    </div>
                                ))}
                            </div>

                            {/* KPIs */}
                            <div className="grid grid-cols-4 gap-2 text-center">
                                {[
                                    { icon: Package, label: 'Buyurtmalar', value: vendor.totalOrders, color: 'text-indigo-600' },
                                    { icon: TrendingUp, label: 'Jami qiymat', value: formatCurrency(vendor.totalValue), color: 'text-emerald-600', small: true },
                                    { icon: Clock, label: 'O\'z vaqtida', value: `${vendor.onTimeRate}%`, color: vendor.onTimeRate > 85 ? 'text-emerald-600' : 'text-red-500' },
                                    { icon: Star, label: 'Nuqson', value: `${vendor.defectRate}%`, color: vendor.defectRate < 2 ? 'text-emerald-600' : 'text-red-500' },
                                ].map(s => (
                                    <div key={s.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2">
                                        <p className={`${s.small ? 'text-xs' : 'text-sm'} font-bold ${s.color}`}>{s.value}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
