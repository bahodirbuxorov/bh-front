import React, { useState, useMemo } from 'react';
import { Bell, ShoppingCart, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { mockInventory } from '../../../mocks';
import { formatCurrency } from '../../../utils';
import { useUIStore } from '../../../store/uiStore';

export const SmartAlerts: React.FC = () => {
    const { addToast } = useUIStore();
    const [ordered, setOrdered] = useState<Set<string>>(new Set());

    const criticalItems = useMemo(() =>
        mockInventory
            .filter(i => i.status === 'out_of_stock' || i.status === 'low_stock')
            .map(item => {
                const shortfall = Math.max(0, item.minQuantity * 2 - item.quantity);
                const estimatedCost = shortfall * item.averageCost;
                const urgency = item.status === 'out_of_stock' ? 'critical' : 'warning';
                return { ...item, shortfall, estimatedCost, urgency };
            })
            .sort((a, b) => (b.urgency === 'critical' ? 1 : 0) - (a.urgency === 'critical' ? 1 : 0)),
        []
    );

    const totalShortfallValue = criticalItems.reduce((s, i) => s + i.estimatedCost, 0);

    const handleOrder = (id: string, name: string) => {
        setOrdered(prev => new Set([...prev, id]));
        addToast({ type: 'success', title: "Xarid so'rovi yaratildi", message: `${name} uchun so'rov Xaridlar moduliga yuborildi` });
    };

    const handleOrderAll = () => {
        const notOrdered = criticalItems.filter(i => !ordered.has(i.id));
        notOrdered.forEach(i => setOrdered(prev => new Set([...prev, i.id])));
        addToast({ type: 'success', title: `${notOrdered.length} ta so'rov yaratildi`, message: 'Barchasi Xaridlar moduliga yuborildi' });
    };

    return (
        <div className="space-y-5">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Kritik (yo'q)", value: criticalItems.filter(i => i.urgency === 'critical').length, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
                    { label: 'Kam stok', value: criticalItems.filter(i => i.urgency === 'warning').length, icon: TrendingDown, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                    { label: "Taxminiy xarid summasi", value: formatCurrency(totalShortfallValue), icon: ShoppingCart, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', isText: true },
                ].map(s => (
                    <Card key={s.label} className="!p-4">
                        <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-2`}>
                            <s.icon className={`w-4 h-4 ${s.color}`} />
                        </div>
                        <p className={`font-bold ${s.isText ? 'text-base' : 'text-2xl'} text-slate-900 dark:text-white`}>{s.value}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                    </Card>
                ))}
            </div>

            {criticalItems.length === 0 ? (
                <Card className="flex flex-col items-center py-16 text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mb-4" />
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Barcha stoklar yetarli!</h3>
                    <p className="text-xs text-slate-400 mt-1">Minimal stok darajasidan past mahsulot yo'q</p>
                </Card>
            ) : (
                <Card padding={false}>
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-red-500" />
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                Stok ogohlantirishlari ({criticalItems.length})
                            </h3>
                        </div>
                        {criticalItems.some(i => !ordered.has(i.id)) && (
                            <Button variant="primary" size="sm" icon={<ShoppingCart className="w-3.5 h-3.5" />} onClick={handleOrderAll}>
                                Barchasini buyurtma qilish
                            </Button>
                        )}
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {criticalItems.map(item => (
                            <div key={item.id} className={`flex items-center gap-4 p-4 transition-colors ${item.urgency === 'critical' ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                                {/* Status */}
                                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.urgency === 'critical' ? 'bg-red-500' : 'bg-amber-400'} animate-pulse`} />

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-semibold text-slate-800 dark:text-white truncate">{item.name}</span>
                                        <Badge variant={item.urgency === 'critical' ? 'danger' : 'warning'} size="sm">
                                            {item.urgency === 'critical' ? "Yo'q" : 'Kam'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-slate-400">
                                        <span>Joriy: <b className="text-slate-600 dark:text-slate-300">{item.quantity} {item.unit}</b></span>
                                        <span>Minimal: <b className="text-slate-600 dark:text-slate-300">{item.minQuantity} {item.unit}</b></span>
                                        <span>Tavsiya: <b className="text-indigo-600">+{item.shortfall.toFixed(0)} {item.unit}</b></span>
                                    </div>
                                    {/* Mini progress bar */}
                                    <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full max-w-48">
                                        <div
                                            className={`h-full rounded-full ${item.urgency === 'critical' ? 'bg-red-500' : 'bg-amber-400'}`}
                                            style={{ width: `${Math.min(100, (item.quantity / item.minQuantity) * 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Cost */}
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{formatCurrency(item.estimatedCost)}</p>
                                    <p className="text-xs text-slate-400">taxminiy summa</p>
                                </div>

                                {/* Action */}
                                {ordered.has(item.id) ? (
                                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium shrink-0">
                                        <CheckCircle className="w-4 h-4" /> Yuborildi
                                    </div>
                                ) : (
                                    <Button variant="secondary" size="sm" icon={<ShoppingCart className="w-3.5 h-3.5" />}
                                        onClick={() => handleOrder(item.id, item.name)} className="shrink-0">
                                        Buyurtma
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};
