import React, { useMemo } from 'react';
import { Download } from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useTaxStore } from '../../store/taxStore';
import { mockSalesInvoices, mockPurchaseInvoices } from '../../mocks';
import { formatCurrency } from '../../utils';
import { exportTableToPDF, exportTableToExcel } from '../../lib/pdfExport';
import { useCompanyStore } from '../../store/authStore';

interface QQSProps {
    dateFrom: string;
    dateTo: string;
}

export const QQSReport: React.FC<QQSProps> = ({ dateFrom, dateTo }) => {
    const { qqsRate } = useTaxStore();
    const { activeCompany } = useCompanyStore();

    const filteredSales = useMemo(() => mockSalesInvoices.filter(inv =>
        inv.date >= dateFrom && inv.date <= dateTo
    ), [dateFrom, dateTo]);

    const filteredPurchases = useMemo(() => mockPurchaseInvoices.filter(inv =>
        inv.date >= dateFrom && inv.date <= dateTo
    ), [dateFrom, dateTo]);

    const salesSubtotal = filteredSales.reduce((s, inv) => s + Math.round(inv.total / (1 + qqsRate / 100)), 0);
    const salesQQS = filteredSales.reduce((s, inv) => s + (inv.total - Math.round(inv.total / (1 + qqsRate / 100))), 0);

    const purchasesSubtotal = filteredPurchases.reduce((s, inv) => s + Math.round(inv.total / (1 + qqsRate / 100)), 0);
    const purchasesQQS = filteredPurchases.reduce((s, inv) => s + (inv.total - Math.round(inv.total / (1 + qqsRate / 100))), 0);

    const payableQQS = Math.max(0, salesQQS - purchasesQQS);
    const company = { name: activeCompany?.name ?? 'Mini Buxgalter', tin: activeCompany?.tin };

    const handleExportPDF = () => {
        exportTableToPDF(
            `QQS Hisoboti (${qqsRate}%) — ${dateFrom} / ${dateTo}`,
            [
                { header: 'Ko\'rsatkich', dataKey: 'label' },
                { header: 'Soliqsiz summa', dataKey: 'subtotal', isNumber: true },
                { header: `QQS (${qqsRate}%)`, dataKey: 'qqs', isNumber: true },
                { header: 'Jami', dataKey: 'total', isNumber: true },
            ],
            [
                { label: 'Chiquvchi QQS (Savdo)', subtotal: formatCurrency(salesSubtotal), qqs: formatCurrency(salesQQS), total: formatCurrency(salesSubtotal + salesQQS) },
                { label: 'Kiruvchi QQS (Xarid)', subtotal: formatCurrency(purchasesSubtotal), qqs: formatCurrency(purchasesQQS), total: formatCurrency(purchasesSubtotal + purchasesQQS) },
                { label: "To'lanadigan QQS", subtotal: '', qqs: formatCurrency(payableQQS), total: '' },
            ],
            company,
            'qqs_hisobot'
        );
    };

    const handleExportExcel = () => {
        exportTableToExcel(
            'QQS Hisobot',
            [
                { header: 'Ko\'rsatkich', dataKey: 'label' },
                { header: 'Subtotal', dataKey: 'subtotal' },
                { header: 'QQS', dataKey: 'qqs' },
                { header: 'Jami', dataKey: 'total' },
            ],
            [
                { label: 'Chiquvchi QQS (Savdo)', subtotal: salesSubtotal, qqs: salesQQS, total: salesSubtotal + salesQQS },
                { label: 'Kiruvchi QQS (Xarid)', subtotal: purchasesSubtotal, qqs: purchasesQQS, total: purchasesSubtotal + purchasesQQS },
                { label: "To'lanadigan QQS", subtotal: 0, qqs: payableQQS, total: payableQQS },
            ],
            'qqs_hisobot'
        );
    };

    return (
        <div className="p-5 space-y-5">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: `Chiquvchi QQS (Savdo, ${qqsRate}%)`, value: salesQQS, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
                    { label: `Kiruvchi QQS (Xarid, ${qqsRate}%)`, value: purchasesQQS, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                    { label: "Budjetga to'lanadigan QQS", value: payableQQS, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                ].map(c => (
                    <div key={c.label} className={`${c.bg} rounded-xl p-4`}>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{c.label}</p>
                        <p className={`text-lg font-bold ${c.color}`}>{formatCurrency(c.value)}</p>
                    </div>
                ))}
            </div>

            {/* Detail table */}
            <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-700">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                            {["Ko'rsatkich", 'Fakturalar soni', "Soliqsiz summa", `QQS (${qqsRate}%)`, 'Jami'].map(h => (
                                <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left last:text-right">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                            <td className="px-4 py-3.5 font-medium text-slate-800 dark:text-white">Chiquvchi QQS (Savdo)</td>
                            <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{filteredSales.length}</td>
                            <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{formatCurrency(salesSubtotal)}</td>
                            <td className="px-4 py-3.5 text-red-500 font-semibold">{formatCurrency(salesQQS)}</td>
                            <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-white text-right">{formatCurrency(salesSubtotal + salesQQS)}</td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                            <td className="px-4 py-3.5 font-medium text-slate-800 dark:text-white">Kiruvchi QQS (Xarid)</td>
                            <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{filteredPurchases.length}</td>
                            <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{formatCurrency(purchasesSubtotal)}</td>
                            <td className="px-4 py-3.5 text-emerald-600 font-semibold">−{formatCurrency(purchasesQQS)}</td>
                            <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-white text-right">{formatCurrency(purchasesSubtotal + purchasesQQS)}</td>
                        </tr>
                        <tr className="bg-indigo-50 dark:bg-indigo-900/20">
                            <td className="px-4 py-4 font-bold text-slate-900 dark:text-white" colSpan={3}>Budjetga to'lanadigan QQS</td>
                            <td className="px-4 py-4 font-bold text-indigo-600 text-lg" colSpan={2} align="right">{formatCurrency(payableQQS)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl">
                <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">QQS to'lov muddati</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">Har chorakning oxirgi oyida 20-gacha</p>
                </div>
                <Badge variant="warning">20-mart 2026</Badge>
            </div>

            {/* Export */}
            <div className="flex gap-2">
                <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExportExcel}>Excel</Button>
                <Button variant="primary" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExportPDF}>PDF Yuklab olish</Button>
            </div>
        </div>
    );
};
