import React, { useState, useMemo } from 'react';
import { User, TrendingUp, AlertCircle, ChevronRight, X, FileText } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { mockSalesInvoices } from '../../../mocks';
import { formatCurrency, formatDate } from '../../../utils';

interface Customer {
    name: string;
    totalSales: number;
    totalDebt: number;
    invoiceCount: number;
    lastDate: string;
    status: 'vip' | 'regular' | 'risky';
}

export const Customer360: React.FC = () => {
    const [selected, setSelected] = useState<Customer | null>(null);
    const [search, setSearch] = useState('');

    const customers = useMemo<Customer[]>(() => {
        const map = new Map<string, Customer>();
        mockSalesInvoices.forEach(inv => {
            const existing = map.get(inv.counterparty) ?? {
                name: inv.counterparty, totalSales: 0, totalDebt: 0,
                invoiceCount: 0, lastDate: inv.date, status: 'regular' as const,
            };
            existing.totalSales += inv.total;
            existing.totalDebt += (inv.total - inv.paid);
            existing.invoiceCount++;
            if (inv.date > existing.lastDate) existing.lastDate = inv.date;
            map.set(inv.counterparty, existing);
        });
        return Array.from(map.values()).map(c => ({
            ...c,
            status: (c.totalSales > 30000000 ? 'vip' : c.totalDebt > c.totalSales * 0.3 ? 'risky' : 'regular') as 'vip' | 'regular' | 'risky',
        })).sort((a, b) => b.totalSales - a.totalSales);
    }, []);

    const customerInvoices = useMemo(() =>
        selected ? mockSalesInvoices.filter(i => i.counterparty === selected.name).slice(0, 10) : [],
        [selected]
    );

    const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    const statusCfg = {
        vip: { variant: 'purple' as const, label: '⭐ VIP', bg: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800' },
        regular: { variant: 'info' as const, label: 'Doimiy', bg: '' },
        risky: { variant: 'danger' as const, label: '⚠️ Qarzdor', bg: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' },
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Left: customer list */}
            <div className="lg:col-span-2 space-y-3">
                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Mijoz qidirish..."
                    className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                    {filtered.map(c => (
                        <button key={c.name} onClick={() => setSelected(c)}
                            className={`w-full text-left p-3 rounded-xl border-2 transition-all hover:shadow-sm ${selected?.name === c.name ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : `border-slate-200 dark:border-slate-700 hover:border-slate-300 ${statusCfg[c.status].bg}`}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {c.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{c.name}</p>
                                    <p className="text-xs text-slate-400">{c.invoiceCount} ta faktura</p>
                                </div>
                                <Badge variant={statusCfg[c.status].variant} size="sm">{statusCfg[c.status].label}</Badge>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Jami: <b className="text-slate-600 dark:text-slate-300">{formatCurrency(c.totalSales)}</b></span>
                                {c.totalDebt > 0 && <span className="text-red-500 font-semibold">Qarz: {formatCurrency(c.totalDebt)}</span>}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right: 360 detail */}
            <div className="lg:col-span-3">
                {selected ? (
                    <div className="space-y-4">
                        <Card>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                                        {selected.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{selected.name}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Badge variant={statusCfg[selected.status].variant} size="sm">{statusCfg[selected.status].label}</Badge>
                                            <span className="text-xs text-slate-400">So'nggi: {formatDate(selected.lastDate)}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelected(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Jami savdo', value: formatCurrency(selected.totalSales), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                                    { label: 'Qarz (qarizi)', value: formatCurrency(selected.totalDebt), icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
                                    { label: 'Fakturalar', value: selected.invoiceCount.toString(), icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                                ].map(s => (
                                    <div key={s.label} className={`${s.bg} rounded-xl p-3`}>
                                        <s.icon className={`w-4 h-4 ${s.color} mb-1`} />
                                        <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                                        <p className="text-xs text-slate-400">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Debt bar */}
                            {selected.totalSales > 0 && (
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                                        <span>To'lov darajasi</span>
                                        <span>{(((selected.totalSales - selected.totalDebt) / selected.totalSales) * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full"
                                            style={{ width: `${Math.min(100, ((selected.totalSales - selected.totalDebt) / selected.totalSales) * 100)}%` }} />
                                    </div>
                                </div>
                            )}
                        </Card>

                        <Card padding={false}>
                            <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">So'nggi fakturalar</h4>
                            </div>
                            <div className="divide-y divide-slate-50 dark:divide-slate-700">
                                {customerInvoices.map(inv => (
                                    <div key={inv.id} className="flex items-center gap-3 px-4 py-3">
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                        <span className="text-xs font-mono text-indigo-600">{inv.number}</span>
                                        <span className="text-xs text-slate-400">{formatDate(inv.date)}</span>
                                        <span className="ml-auto text-sm font-semibold text-slate-800 dark:text-white">{formatCurrency(inv.total)}</span>
                                        <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'partial' ? 'warning' : 'danger'} size="sm">
                                            {inv.status === 'paid' ? "To'langan" : inv.status === 'partial' ? 'Qisman' : "To'lanmagan"}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                ) : (
                    <Card className="flex flex-col items-center justify-center py-20 text-center">
                        <User className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="text-sm font-medium text-slate-500">Mijozni tanlang</p>
                        <p className="text-xs text-slate-400 mt-1">360° ko'rinish uchun mijoz kartasini bosing</p>
                    </Card>
                )}
            </div>
        </div>
    );
};
