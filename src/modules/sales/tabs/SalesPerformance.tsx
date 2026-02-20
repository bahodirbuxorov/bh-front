import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { mockSalesInvoices } from '../../../mocks';
import { formatCurrency } from '../../../utils';

const SALESPEOPLE = ['Alisher K.', 'Nodira H.', 'Jamshid Y.', 'Gulnora R.', 'Bobur T.'];
const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export const SalesPerformance: React.FC = () => {
    const stats = useMemo(() => {
        return SALESPEOPLE.map((name, i) => {
            // Assign invoices in round-robin to each salesperson
            const invoices = mockSalesInvoices.filter((_, idx) => idx % SALESPEOPLE.length === i);
            const total = invoices.reduce((s, inv) => s + inv.total, 0);
            const paid = invoices.filter(inv => inv.status === 'paid').length;
            const avg = invoices.length > 0 ? total / invoices.length : 0;
            const debtRatio = invoices.length > 0
                ? invoices.reduce((s, inv) => s + (inv.total - inv.paid), 0) / total : 0;
            return { name, total, invoiceCount: invoices.length, paidCount: paid, avg, debtRatio };
        }).sort((a, b) => b.total - a.total);
    }, []);

    const topCustomers = useMemo(() => {
        const map = new Map<string, number>();
        mockSalesInvoices.forEach(inv => map.set(inv.counterparty, (map.get(inv.counterparty) ?? 0) + inv.total));
        return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
    }, []);

    const chartData = stats.map(s => ({ name: s.name.split(' ')[0], total: s.total }));

    return (
        <div className="space-y-5">
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {stats.map((s, i) => (
                    <Card key={s.name} className="!p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: COLORS[i] }}>
                                {s.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            {i === 0 && <Badge variant="warning" size="sm">🏆 #1</Badge>}
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{s.name}</p>
                        <p className="text-lg font-bold mt-1" style={{ color: COLORS[i] }}>{formatCurrency(s.total)}</p>
                        <div className="text-xs text-slate-400 space-y-0.5 mt-1">
                            <p>{s.invoiceCount} ta faktura</p>
                            <p>Avg: {formatCurrency(s.avg)}</p>
                        </div>
                        {/* Debt ratio bar */}
                        <div className="mt-2 h-1 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                            <div className="h-full bg-red-400 rounded-full" style={{ width: `${s.debtRatio * 100}%` }} />
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">Qarz: {(s.debtRatio * 100).toFixed(0)}%</p>
                    </Card>
                ))}
            </div>

            {/* Bar chart */}
            <Card>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Savdochilar bo'yicha sotuv</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} barSize={36}>
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip
                            formatter={(v) => formatCurrency((v as number) ?? 0)}
                            contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, fontSize: 12 }}
                            labelStyle={{ color: '#94a3b8' }}
                            itemStyle={{ color: '#e2e8f0' }}
                        />
                        <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            {/* Top customers */}
            <Card>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Top mijozlar</h3>
                <div className="space-y-2">
                    {topCustomers.map(([name, total], i) => {
                        const pct = topCustomers.length > 0 ? (total / topCustomers[0][1]) * 100 : 0;
                        return (
                            <div key={name} className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-800 dark:text-white truncate max-w-48">{name}</span>
                                        <span className="font-semibold text-slate-600 dark:text-slate-300 ml-2 shrink-0">{formatCurrency(total)}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};
