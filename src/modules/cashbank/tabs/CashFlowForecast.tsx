import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { formatCurrency } from '../../../utils';
import { mockTransactions } from '../../../mocks';

type Period = '7' | '30' | '90';

function generateForecast(days: number) {
    const baseIncome = 3000000;
    const baseExpense = 1800000;
    let balance = mockTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
        - mockTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    return Array.from({ length: days }).map((_, i) => {
        const seed = Math.sin(i * 0.7) * 0.3 + Math.cos(i * 0.4) * 0.2;
        const income = Math.max(0, baseIncome + seed * baseIncome * 0.5);
        const expense = Math.max(0, baseExpense + Math.cos(i * 0.9) * baseExpense * 0.4);
        const pessimisticDelta = income * 0.7 - expense * 1.2;
        const realisticDelta = income - expense;
        const optimisticDelta = income * 1.3 - expense * 0.85;
        balance += realisticDelta;

        const date = new Date('2026-02-20');
        date.setDate(date.getDate() + i + 1);

        return {
            date: date.toISOString().slice(5, 10),
            pessimistic: Math.max(0, balance + pessimisticDelta * (i + 1) - realisticDelta * (i + 1)),
            realistic: Math.max(0, balance),
            optimistic: Math.max(0, balance + optimisticDelta * 0.3),
            income: Math.round(income),
            expense: Math.round(expense),
        };
    });
}

const PERIOD_LABELS: Record<Period, string> = { '7': '7 kun', '30': '30 kun', '90': '90 kun' };
const THRESHOLD = 5000000;

export const CashFlowForecast: React.FC = () => {
    const [period, setPeriod] = useState<Period>('30');

    const data = useMemo(() => generateForecast(Number(period)), [period]);

    const minBalance = Math.min(...data.map(d => d.realistic));
    const willGoLow = minBalance < THRESHOLD;
    const endBalance = data[data.length - 1]?.realistic ?? 0;
    const totalIncome = data.reduce((s, d) => s + d.income, 0);
    const totalExpense = data.reduce((s, d) => s + d.expense, 0);

    const fmt = (v: number) => formatCurrency(Math.round(v));

    return (
        <div className="space-y-5">
            {willGoLow && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Balans ogohlantirishи</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                            {period} kun ichida minimal balans: <b>{fmt(minBalance)}</b> — chegaradan ({fmt(THRESHOLD)}) past tushishi mumkin
                        </p>
                    </div>
                </div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Prognoz yakuniy balans', value: fmt(endBalance), color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', icon: TrendingUp },
                    { label: `Jami kirim (${PERIOD_LABELS[period]})`, value: fmt(totalIncome), color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: TrendingUp },
                    { label: `Jami chiqim (${PERIOD_LABELS[period]})`, value: fmt(totalExpense), color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', icon: AlertTriangle },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{s.label}</p>
                        <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Period selector */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                {(['7', '30', '90'] as Period[]).map(p => (
                    <button key={p} onClick={() => setPeriod(p)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                        {PERIOD_LABELS[p]}
                    </button>
                ))}
            </div>

            {/* Area Chart */}
            <Card>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{PERIOD_LABELS[period]} — Pul oqimi prognozi</h3>
                <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={data.filter((_, i) => i % (Number(period) > 30 ? 3 : 1) === 0)}>
                        <defs>
                            {[
                                { id: 'optimistic', color: '#10b981' },
                                { id: 'realistic', color: '#6366f1' },
                                { id: 'pessimistic', color: '#f59e0b' },
                            ].map(({ id, color }) => (
                                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={Math.floor(data.length / 6)} />
                        <YAxis tickFormatter={v => `${(v / 1e6).toFixed(0)}M`} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                        <Tooltip
                            formatter={(v, name) => [fmt((v as number) ?? 0), name === 'pessimistic' ? 'Pessimistik' : name === 'realistic' ? 'Realistik' : 'Optimistik']}
                            contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, fontSize: 11 }}
                            labelStyle={{ color: '#94a3b8' }}
                            itemStyle={{ color: '#e2e8f0' }}
                        />
                        <Legend formatter={(v) => v === 'pessimistic' ? 'Pessimistik' : v === 'realistic' ? 'Realistik' : 'Optimistik'} />
                        <Area type="monotone" dataKey="optimistic" stroke="#10b981" fill="url(#optimistic)" strokeWidth={2} dot={false} />
                        <Area type="monotone" dataKey="realistic" stroke="#6366f1" fill="url(#realistic)" strokeWidth={2.5} dot={false} />
                        <Area type="monotone" dataKey="pessimistic" stroke="#f59e0b" fill="url(#pessimistic)" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};
