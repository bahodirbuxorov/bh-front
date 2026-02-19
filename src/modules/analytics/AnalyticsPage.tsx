import React from 'react';
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { PageHeader } from '../../components/ui/Misc';
import { Card } from '../../components/ui/Card';
import { formatCurrency } from '../../utils';
import { monthlyRevenueData, expensePieData, topProductsData, profitTrendData } from '../../utils/mockData';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg text-xs">
                <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                {payload.map((e, i) => (
                    <p key={i} className="font-bold" style={{ color: e.color }}>{e.name}: {typeof e.value === 'number' && e.value > 10000 ? formatCurrency(e.value) : e.value}</p>
                ))}
            </div>
        );
    }
    return null;
};

export const AnalyticsPage: React.FC = () => {
    return (
        <div className="space-y-5 animate-fade-in">
            <PageHeader title="Tahlil va Analitika" subtitle="Biznes ko'rsatkichlarini chuqur tahlil qilish" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Revenue by month */}
                <Card padding={false}>
                    <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Oylik daromad tahlili</h3>
                        <p className="text-xs text-slate-400 mt-0.5">So'm hisobida · Oxirgi 6 oy</p>
                    </div>
                    <div className="p-5">
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={monthlyRevenueData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1_000_000).toFixed(0)}M`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="revenue" name="Daromad" stroke="#6366f1" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: '#6366f1', r: 4 }} />
                                <Area type="monotone" dataKey="expenses" name="Xarajatlar" stroke="#ef4444" strokeWidth={2} fill="url(#expGrad)" dot={{ fill: '#ef4444', r: 3 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Most profitable products */}
                <Card padding={false}>
                    <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Eng foydali mahsulotlar</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Foyda bo'yicha reytingi</p>
                    </div>
                    <div className="p-5">
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={topProductsData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1_000_000).toFixed(0)}M`} />
                                <YAxis type="category" dataKey="product" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={90} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="profit" name="Foyda" fill="#6366f1" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Expense distribution */}
                <Card padding={false}>
                    <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Xarajatlar taqsimoti</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Kategoriyalar bo'yicha foiz ulushi</p>
                    </div>
                    <div className="p-5 flex flex-col lg:flex-row items-center gap-4">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={expensePieData} cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3} dataKey="value">
                                    {expensePieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value}%`, '']} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2 shrink-0 w-full max-w-48">
                            {expensePieData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: item.color }} />
                                        <span className="text-xs text-slate-600 dark:text-slate-400">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Profit trend */}
                <Card padding={false}>
                    <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Foyda o'sish dinamikasi</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Sof foyda tendentsiyasi</p>
                    </div>
                    <div className="p-5">
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={profitTrendData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1_000_000).toFixed(0)}M`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="profit" name="Foyda" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
                            </LineChart>
                        </ResponsiveContainer>
                        <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="text-slate-500">O'tgan oyga nisbatan o'sish:</span>
                            <span className="font-bold text-green-600">▲ +22.2%</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
