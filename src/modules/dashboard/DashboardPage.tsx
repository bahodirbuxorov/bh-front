import React from 'react';
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
    TrendingUp, TrendingDown, DollarSign, CreditCard, Banknote, Calculator,
    AlertTriangle, Clock, Users
} from 'lucide-react';
import { StatCard, Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useLanguageStore } from '../../store/languageStore';
import { useCompanyStore } from '../../store/authStore';
import {
    monthlyRevenueData,
    profitTrendData,
    expensePieData,
    mockInventory,
} from '../../utils/mockData';
import { formatCurrency } from '../../utils';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                {payload.map((entry, i) => (
                    <p key={i} className="text-sm font-bold" style={{ color: entry.color }}>
                        {entry.name}: {formatCurrency(entry.value)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export const DashboardPage: React.FC = () => {
    const { t } = useLanguageStore();
    const { activeCompany } = useCompanyStore();

    const lowStockItems = mockInventory.filter((i) => i.status === 'low_stock' || i.status === 'out_of_stock');

    const kpis = [
        {
            title: t('totalRevenue'),
            value: formatCurrency(82000000),
            change: '▲ 20.6% o\'tgan oyga nisbatan',
            changeType: 'positive' as const,
            icon: <TrendingUp className="w-5 h-5" />,
            iconBg: 'bg-green-100 dark:bg-green-900/30',
        },
        {
            title: t('totalExpenses'),
            value: formatCurrency(49000000),
            change: '▲ 19.5% o\'tgan oyga nisbatan',
            changeType: 'negative' as const,
            icon: <TrendingDown className="w-5 h-5" />,
            iconBg: 'bg-red-100 dark:bg-red-900/30',
        },
        {
            title: t('profit'),
            value: formatCurrency(33000000),
            change: '▲ 22.2% o\'tgan oyga nisbatan',
            changeType: 'positive' as const,
            icon: <DollarSign className="w-5 h-5" />,
            iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
        },
        {
            title: t('taxAmount'),
            value: formatCurrency(3300000),
            change: "Fevral uchun hisoblangan",
            changeType: 'neutral' as const,
            icon: <Calculator className="w-5 h-5" />,
            iconBg: 'bg-purple-100 dark:bg-purple-900/30',
        },
        {
            title: t('cashBalance'),
            value: formatCurrency(15400000),
            change: "Naqd pul hisobida",
            changeType: 'neutral' as const,
            icon: <Banknote className="w-5 h-5" />,
            iconBg: 'bg-amber-100 dark:bg-amber-900/30',
        },
        {
            title: t('bankBalance'),
            value: formatCurrency(38700000),
            change: "Bank schyotida",
            changeType: 'neutral' as const,
            icon: <CreditCard className="w-5 h-5" />,
            iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                        {t('dashboard')}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {activeCompany?.name} · Fevral 2026
                    </p>
                </div>
                <Badge variant="success" dot>Barcha tizimlar ishlayapti</Badge>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {kpis.map((kpi, i) => (
                    <div key={i} className={i < 3 ? 'col-span-1' : 'col-span-1'}>
                        <StatCard {...kpi} />
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Monthly Revenue */}
                <Card className="lg:col-span-2 p-5" padding={false}>
                    <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('monthlyRevenue')}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">So'm hisobida · Oxirgi 6 oy</p>
                    </div>
                    <div className="p-5">
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={monthlyRevenueData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-700" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="revenue" name="Daromad" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Expense Pie */}
                <Card padding={false}>
                    <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Xarajatlar tarkibi</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Kategoriyalar bo'yicha</p>
                    </div>
                    <div className="p-5 flex flex-col items-center">
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie data={expensePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value">
                                    {expensePieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value}%`, '']} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full mt-1">
                            {expensePieData.map((item) => (
                                <div key={item.name} className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                                    <span className="text-xs text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 ml-auto">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Expenses vs Income Bar */}
                <Card className="lg:col-span-3 p-5" padding={false}>
                    <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('expensesVsIncome')}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Oylar kesimida solishtirish</p>
                    </div>
                    <div className="p-5">
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={monthlyRevenueData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-700" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="revenue" name="Daromad" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expenses" name="Xarajatlar" fill="#e2e8f0" radius={[4, 4, 0, 0]} className="dark:fill-slate-700" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Profit Trend Area */}
                <Card className="lg:col-span-2" padding={false}>
                    <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('profitTrend')}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Sof foyda tendentsiyasi</p>
                    </div>
                    <div className="p-5">
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={profitTrendData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-700" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="profit" name="Foyda" stroke="#6366f1" strokeWidth={2.5} fill="url(#profitGrad)" dot={{ fill: '#6366f1', r: 4 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Low stock */}
                <Card>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('lowStockWarning')}</h3>
                            <p className="text-xs text-slate-400">{lowStockItems.length} ta mahsulot</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {lowStockItems.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{item.name}</span>
                                <Badge variant={item.status === 'out_of_stock' ? 'danger' : 'warning'} size="sm" dot>
                                    {item.quantity} {item.unit}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Tax deadline */}
                <Card>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                            <Clock className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('upcomingTaxDeadline')}</h3>
                            <p className="text-xs text-slate-400">Kelgusi 30 kun ichida</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {[
                            { name: "ÖÖS hisoboti (Fevral)", date: "25-Fevral", days: 6, urgent: true },
                            { name: "Ijtimoiy to'lov", date: "10-Mart", days: 19, urgent: false },
                            { name: "Foyda solig'i", date: "20-Mart", days: 29, urgent: false },
                        ].map((tax) => (
                            <div key={tax.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                <div>
                                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{tax.name}</p>
                                    <p className="text-xs text-slate-400">{tax.date}</p>
                                </div>
                                <Badge variant={tax.urgent ? 'danger' : 'warning'} size="sm">{tax.days} kun</Badge>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Outstanding receivables */}
                <Card>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('outstandingReceivables')}</h3>
                            <p className="text-xs text-slate-400">Kutilayotgan to'lovlar</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {[
                            { name: "Baraka Bozor", amount: 6400000, days: 3 },
                            { name: "Mehribon MChJ", amount: 3600000, days: 2 },
                            { name: "Toshkent Ozon", amount: 21500000, days: 0 },
                        ].map((r) => (
                            <div key={r.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                <div>
                                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{r.name}</p>
                                    <p className="text-xs text-slate-400">{r.days > 0 ? `${r.days} kun kechikkan` : 'Bugun muddati'}</p>
                                </div>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0 ml-2">{formatCurrency(r.amount)}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};
