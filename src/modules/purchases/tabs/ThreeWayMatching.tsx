import React, { useMemo } from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { mockPurchaseInvoices } from '../../../mocks';
import { formatCurrency } from '../../../utils';

type MatchStatus = 'match' | 'variance' | 'missing';

interface MatchRecord {
    id: string;
    poNumber: string;
    receiptNumber: string;
    invoiceNumber: string;
    supplier: string;
    poAmount: number;
    receivedQty: number;
    invoiceAmount: number;
    matchStatus: MatchStatus;
    variancePct: number;
    varianceType?: string;
}

const buildRecords = (): MatchRecord[] => {
    return mockPurchaseInvoices.slice(0, 8).map((inv, i) => {
        const poAmount = inv.total;
        // Simulate slight variance for some records
        const scenario = i % 3;
        const receivedQty = scenario === 1 ? inv.total * 0.95 : inv.total;
        const invoiceAmount = scenario === 2 ? inv.total * 1.08 : inv.total;
        const diff = Math.abs(invoiceAmount - poAmount) / poAmount * 100;
        const status: MatchStatus = diff < 1 ? 'match' : diff < 10 ? 'variance' : 'missing';
        return {
            id: inv.id,
            poNumber: `PO-${inv.number}`,
            receiptNumber: `GRN-${inv.number}`,
            invoiceNumber: inv.number,
            supplier: inv.counterparty,
            poAmount,
            receivedQty,
            invoiceAmount,
            matchStatus: status,
            variancePct: diff,
            varianceType: scenario === 1 ? 'Miqdor farqi' : scenario === 2 ? 'Narx farqi' : undefined,
        };
    });
};

const STATUS_CFG: Record<MatchStatus, { icon: typeof CheckCircle; color: string; bg: string; border: string; label: string }> = {
    match: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', label: '✅ Mos' },
    variance: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', label: '⚠️ Farq bor' },
    missing: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', label: '❌ Katta farq' },
};

export const ThreeWayMatching: React.FC = () => {
    const records = useMemo(() => buildRecords(), []);

    const counts = useMemo(() => ({
        match: records.filter(r => r.matchStatus === 'match').length,
        variance: records.filter(r => r.matchStatus === 'variance').length,
        missing: records.filter(r => r.matchStatus === 'missing').length,
    }), [records]);

    return (
        <div className="space-y-5">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                {(Object.entries(STATUS_CFG) as [MatchStatus, typeof STATUS_CFG.match][]).map(([key, cfg]) => (
                    <div key={key} className={`${cfg.bg} border ${cfg.border} rounded-xl p-4 text-center`}>
                        <cfg.icon className={`w-6 h-6 ${cfg.color} mx-auto mb-2`} />
                        <p className={`text-2xl font-bold ${cfg.color}`}>{counts[key]}</p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{cfg.label}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <Card padding={false}>
                <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">3-Tomonlama Moslashtirish</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Xarid buyurtmasi ↔ Qabul varaqasi ↔ Faktura</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[700px]">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                {['Yetkazibberuvchi', 'PO raqami', 'GRN raqami', 'Faktura', 'PO summa', 'Qabul qiymati', 'Faktura summasi', 'Holat'].map(h => (
                                    <th key={h} className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase text-left">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {records.map(r => {
                                const cfg = STATUS_CFG[r.matchStatus];
                                return (
                                    <tr key={r.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${r.matchStatus !== 'match' ? cfg.bg : ''}`}>
                                        <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-white max-w-28 truncate">{r.supplier}</td>
                                        <td className="px-3 py-2.5 text-xs font-mono text-indigo-600">{r.poNumber}</td>
                                        <td className="px-3 py-2.5 text-xs font-mono text-slate-500">{r.receiptNumber}</td>
                                        <td className="px-3 py-2.5 text-xs font-mono text-slate-500">{r.invoiceNumber}</td>
                                        <td className="px-3 py-2.5 font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(r.poAmount)}</td>
                                        <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{formatCurrency(r.receivedQty)}</td>
                                        <td className="px-3 py-2.5">
                                            <span className={`font-semibold ${r.invoiceAmount > r.poAmount ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
                                                {formatCurrency(r.invoiceAmount)}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <div className="flex flex-col gap-1">
                                                <Badge variant={r.matchStatus === 'match' ? 'success' : r.matchStatus === 'variance' ? 'warning' : 'danger'} size="sm">
                                                    {cfg.label}
                                                </Badge>
                                                {r.variancePct > 0 && (
                                                    <span className={`text-xs ${cfg.color}`}>
                                                        {r.variancePct.toFixed(1)}% {r.varianceType}
                                                    </span>
                                                )}
                                            </div>
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
