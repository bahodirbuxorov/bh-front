import React, { useState } from 'react';
import { RadialBarChart, RadialBar, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Pencil } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { formatCurrency } from '../../../utils';

interface BudgetLine {
    id: string;
    category: string;
    emoji: string;
    planned: number;
    actual: number;
}

const DEFAULT_BUDGETS: BudgetLine[] = [
    { id: '1', category: 'Xom ashyo xaridlari', emoji: '📦', planned: 25000000, actual: 22050000 },
    { id: '2', category: 'Ish haqi', emoji: '👥', planned: 15000000, actual: 14800000 },
    { id: '3', category: 'Kommunal xarajatlar', emoji: '⚡', planned: 5000000, actual: 5900000 },
    { id: '4', category: 'Transport', emoji: '🚚', planned: 4500000, actual: 4200000 },
    { id: '5', category: 'Marketing', emoji: '📢', planned: 3000000, actual: 4800000 },
    { id: '6', category: 'Boshqa', emoji: '🔧', planned: 6000000, actual: 5100000 },
];

export const BudgetVsActual: React.FC = () => {
    const [budgets, setBudgets] = useState<BudgetLine[]>(DEFAULT_BUDGETS);
    const [editId, setEditId] = useState<string | null>(null);

    const totalPlanned = budgets.reduce((s, b) => s + b.planned, 0);
    const totalActual = budgets.reduce((s, b) => s + b.actual, 0);
    const overallPct = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;

    const radialData = [{ name: 'Reja', value: 100, fill: '#e2e8f0' }, { name: 'Haqiqiy', value: Math.min(150, overallPct), fill: overallPct > 100 ? '#ef4444' : '#6366f1' }];

    const update = (id: string, field: 'planned' | 'actual', value: number) =>
        setBudgets(p => p.map(b => b.id === id ? { ...b, [field]: value } : b));

    return (
        <div className="space-y-5">
            {/* Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* RadialBar chart */}
                <Card className="flex flex-col items-center justify-center">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Umumiy ijro</p>
                    <div className="relative">
                        <ResponsiveContainer width={120} height={120}>
                            <RadialBarChart cx={60} cy={60} innerRadius={38} outerRadius={55} startAngle={90} endAngle={-270} data={radialData}>
                                <RadialBar dataKey="value" cornerRadius={8} />
                                <Tooltip formatter={(v) => `${((v as number) ?? 0).toFixed(0)}%`} contentStyle={{ display: 'none' }} />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className={`text-xl font-bold ${overallPct > 100 ? 'text-red-500' : 'text-indigo-600'}`}>{overallPct.toFixed(0)}%</span>
                            <span className="text-xs text-slate-400">ijro</span>
                        </div>
                    </div>
                </Card>

                {/* KPIs */}
                <div className="lg:col-span-3 grid grid-cols-3 gap-3">
                    {[
                        { label: 'Reja', value: formatCurrency(totalPlanned), color: 'text-slate-700 dark:text-white', bg: 'bg-slate-50 dark:bg-slate-700/50' },
                        { label: 'Haqiqiy', value: formatCurrency(totalActual), color: overallPct > 100 ? 'text-red-500' : 'text-emerald-600', bg: overallPct > 100 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20' },
                        { label: 'Farq', value: formatCurrency(Math.abs(totalActual - totalPlanned)), color: totalActual > totalPlanned ? 'text-red-500' : 'text-emerald-600', bg: totalActual > totalPlanned ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20' },
                    ].map(s => (
                        <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
                            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Budget lines */}
            <Card padding={false}>
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Kategoriyalar bo'yicha</h3>
                    <Button variant="outline" size="sm" icon={<Plus className="w-3.5 h-3.5" />}
                        onClick={() => setBudgets(p => [...p, { id: Date.now().toString(), category: 'Yangi kategoriya', emoji: '📋', planned: 1000000, actual: 0 }])}>
                        Qo'shish
                    </Button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {budgets.map(b => {
                        const pct = b.planned > 0 ? (b.actual / b.planned) * 100 : 0;
                        const isOver = pct > 100;
                        const diff = b.actual - b.planned;
                        const isEditing = editId === b.id;

                        return (
                            <div key={b.id} className={`p-4 ${isOver ? 'bg-red-50/30 dark:bg-red-900/5' : ''}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-lg shrink-0">{b.emoji}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-slate-800 dark:text-white truncate">{b.category}</span>
                                            <Badge variant={isOver ? 'danger' : pct > 80 ? 'warning' : 'success'} size="sm">
                                                {pct.toFixed(0)}%
                                            </Badge>
                                            {isOver && <span className="text-xs text-red-500 font-semibold">+{formatCurrency(diff)}</span>}
                                            {!isOver && diff < 0 && <span className="text-xs text-emerald-500 font-semibold">Tejam: {formatCurrency(Math.abs(diff))}</span>}
                                        </div>
                                    </div>
                                    <button onClick={() => setEditId(isEditing ? null : b.id)} className="text-slate-300 hover:text-indigo-500 transition-colors">
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {isEditing ? (
                                    <div className="grid grid-cols-2 gap-3 mb-2">
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">Reja</label>
                                            <input type="number" value={b.planned} onChange={e => update(b.id, 'planned', Number(e.target.value))}
                                                className="w-full h-8 px-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">Haqiqiy</label>
                                            <input type="number" value={b.actual} onChange={e => update(b.id, 'actual', Number(e.target.value))}
                                                className="w-full h-8 px-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-2">
                                        <span>Reja: <b className="text-slate-600 dark:text-slate-300">{formatCurrency(b.planned)}</b></span>
                                        <span>Haqiqiy: <b className={isOver ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}>{formatCurrency(b.actual)}</b></span>
                                    </div>
                                )}

                                <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : pct > 80 ? 'bg-amber-400' : 'bg-indigo-500'}`}
                                        style={{ width: `${Math.min(100, pct)}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};
