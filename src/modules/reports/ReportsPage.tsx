import React, { useState } from 'react';
import { Download, FileText, BarChart3, Receipt } from 'lucide-react';
import { PageHeader } from '../../components/ui/Misc';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useLanguageStore } from '../../store/languageStore';
import { useUIStore } from '../../store/uiStore';
import { useCompanyStore } from '../../store/authStore';
import { useTaxStore } from '../../store/taxStore';
import { formatCurrency } from '../../utils';
import { exportTableToPDF, exportTableToExcel } from '../../lib/pdfExport';
import { QQSReport } from './QQSReport';
import { ReportBuilder } from './ReportBuilder';

type ReportTab = 'ready' | 'builder' | 'qqs';

const reportTypes = [
    { id: 'warehouse', label: 'Ombor balansi', icon: '📦', desc: 'Joriy inventar holati va qoldiqlari' },
    { id: 'pnl', label: 'Foyda va zarar', icon: '📊', desc: 'Daromad, xarajat va sof foyda' },
    { id: 'cashflow', label: 'Pul oqimi', icon: '💰', desc: 'Kassa va bank harakatlari' },
    { id: 'production', label: 'Ishlab chiqarish xarajati', icon: '🏭', desc: 'Mahsulot tannarxi tahlili' },
    { id: 'debt', label: 'Mijozlar qarzi', icon: '👥', desc: "To'lanmagan hisob-fakturalar" },
];

const warehouseData = [
    { product: "Bug'doy uni (1-nav)", qty: '1,250 kg', cost: 4800, total: 6000000 },
    { product: 'Shakar', qty: '85 kg', cost: 7200, total: 612000 },
    { product: "Non (bug'doy)", qty: '850 dona', cost: 3500, total: 2975000 },
    { product: 'Makaron', qty: '430 kg', cost: 8500, total: 3655000 },
];

const pnlRows = [
    { label: 'Savdo daromadi', amount: 82000000, type: 'income' },
    { label: 'Xom ashyo xarajati', amount: -22050000, type: 'expense' },
    { label: 'Ish haqi', amount: -12250000, type: 'expense' },
    { label: 'Kommunal xarajatlar', amount: -4900000, type: 'expense' },
    { label: 'Transport', amount: -3920000, type: 'expense' },
    { label: 'Boshqa xarajatlar', amount: -5880000, type: 'expense' },
];

export const ReportsPage: React.FC = () => {
    const { t } = useLanguageStore();
    const { addToast } = useUIStore();
    const { activeCompany } = useCompanyStore();
    const { qqsEnabled } = useTaxStore();

    const [reportTab, setReportTab] = useState<ReportTab>('ready');
    const [selectedReport, setSelectedReport] = useState('pnl');
    const [dateFrom, setDateFrom] = useState('2026-01-01');
    const [dateTo, setDateTo] = useState('2026-02-28');

    const company = { name: activeCompany?.name ?? 'Mini Buxgalter', tin: activeCompany?.tin };

    const handleExportPDF = () => {
        if (selectedReport === 'pnl') {
            exportTableToPDF(
                `Foyda va Zarar Hisoboti — ${dateFrom} / ${dateTo}`,
                [{ header: "Ko'rsatkich", dataKey: 'label' }, { header: 'Summa', dataKey: 'amount', isNumber: true }],
                pnlRows.map(r => ({ label: r.label, amount: formatCurrency(Math.abs(r.amount)) })),
                company,
                'foyda_zarar'
            );
        } else if (selectedReport === 'warehouse') {
            exportTableToPDF(
                'Ombor Balansi',
                [
                    { header: 'Mahsulot', dataKey: 'product' },
                    { header: 'Miqdor', dataKey: 'qty' },
                    { header: 'Narx/birlik', dataKey: 'cost', isNumber: true },
                    { header: 'Jami', dataKey: 'total', isNumber: true },
                ],
                warehouseData.map(r => ({ ...r, cost: formatCurrency(r.cost), total: formatCurrency(r.total) })),
                company,
                'ombor_balansi'
            );
        } else {
            addToast({ type: 'info', title: 'Hisobot tayyorlanmoqda', message: 'Tez orada qo\'shiladi' });
        }
    };

    const handleExportExcel = () => {
        if (selectedReport === 'pnl') {
            exportTableToExcel(
                'Foyda va Zarar',
                [{ header: "Ko'rsatkich", dataKey: 'label' }, { header: 'Summa', dataKey: 'amount' }],
                pnlRows.map(r => ({ label: r.label, amount: r.amount })),
                'foyda_zarar'
            );
        } else if (selectedReport === 'warehouse') {
            exportTableToExcel(
                'Ombor Balansi',
                [
                    { header: 'Mahsulot', dataKey: 'product' },
                    { header: 'Miqdor', dataKey: 'qty' },
                    { header: 'Narx/birlik', dataKey: 'cost' },
                    { header: 'Jami', dataKey: 'total' },
                ],
                warehouseData,
                'ombor_balansi'
            );
        } else {
            addToast({ type: 'info', title: 'Tayyorlanmoqda', message: "Tez orada qo'shiladi" });
        }
    };

    return (
        <div className="space-y-5 animate-fade-in">
            <PageHeader
                title={t('reports')}
                subtitle="Moliyaviy va operatsion hisobotlar"
                actions={
                    reportTab === 'ready' ? (
                        <div className="flex gap-2">
                            <Button variant="outline" icon={<Download className="w-4 h-4" />} onClick={handleExportExcel}>Excel</Button>
                            <Button variant="primary" icon={<Download className="w-4 h-4" />} onClick={handleExportPDF}>PDF</Button>
                        </div>
                    ) : undefined
                }
            />

            {/* Top tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                {([
                    { id: 'ready' as const, label: 'Tayyor hisobotlar', icon: FileText },
                    { id: 'builder' as const, label: 'Hisobot quruvchi', icon: BarChart3 },
                    { id: 'qqs' as const, label: 'QQS hisoboti', icon: Receipt, disabled: !qqsEnabled },
                ] as { id: ReportTab; label: string; icon: React.FC<{ className?: string }>; disabled?: boolean }[]).map(({ id, label, icon: Icon, disabled }) => (
                    <button key={id} onClick={() => !disabled && setReportTab(id)} disabled={disabled}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${reportTab === id ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'} disabled:opacity-40 disabled:cursor-not-allowed`}>
                        <Icon className="w-3.5 h-3.5" />{label}
                        {id === 'qqs' && !qqsEnabled && <Badge variant="default" size="sm">O'chirilgan</Badge>}
                    </button>
                ))}
            </div>

            {/* ── Ready reports ──────────────────────────────────────── */}
            {reportTab === 'ready' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                    <div className="space-y-3">
                        <Card>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Filtrlar</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Dan</label>
                                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full h-8 px-2 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Gacha</label>
                                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full h-8 px-2 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                </div>
                            </div>
                        </Card>
                        <Card padding={false}>
                            <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hisobot turi</h3>
                            </div>
                            <div className="py-1">
                                {reportTypes.map(r => (
                                    <button key={r.id} onClick={() => setSelectedReport(r.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${selectedReport === r.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                        <span className="text-lg">{r.icon}</span>
                                        <div>
                                            <p className={`text-sm font-medium ${selectedReport === r.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'}`}>{r.label}</p>
                                            <p className="text-xs text-slate-400 truncate">{r.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-3">
                        <Card padding={false}>
                            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{reportTypes.find(r => r.id === selectedReport)?.label}</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">{dateFrom} — {dateTo}</p>
                                </div>
                                <FileText className="w-5 h-5 text-slate-300" />
                            </div>

                            {selectedReport === 'pnl' && (
                                <div className="p-5 space-y-4">
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: 'Jami daromad', value: 82000000, color: 'text-green-600' },
                                            { label: 'Jami xarajat', value: 49000000, color: 'text-red-500' },
                                            { label: 'Sof foyda', value: 33000000, color: 'text-indigo-600' },
                                        ].map(item => (
                                            <div key={item.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                                                <p className={`text-lg font-bold mt-1 ${item.color}`}>{formatCurrency(item.value)}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-0 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-700">
                                        {pnlRows.map((row, i) => (
                                            <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                <span className="text-sm text-slate-700 dark:text-slate-200">{row.label}</span>
                                                <span className={`text-sm font-semibold ${row.type === 'income' ? 'text-green-600' : 'text-slate-700 dark:text-slate-200'}`}>
                                                    {row.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(row.amount))}
                                                </span>
                                            </div>
                                        ))}
                                        <div className="flex items-center justify-between px-4 py-4 bg-indigo-50 dark:bg-indigo-900/20">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">Sof foyda</span>
                                            <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(33000000)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedReport === 'warehouse' && (
                                <div className="p-5">
                                    <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div className="grid grid-cols-5 gap-4 px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 text-xs font-semibold text-slate-500 uppercase">
                                            <span className="col-span-2">Mahsulot</span><span className="text-right">Miqdor</span><span className="text-right">Narx/birlik</span><span className="text-right">Jami qiymat</span>
                                        </div>
                                        {warehouseData.map((row, i) => (
                                            <div key={i} className="grid grid-cols-5 gap-4 px-4 py-3 border-t border-slate-50 dark:border-slate-700/50 items-center text-sm">
                                                <span className="col-span-2 font-medium text-slate-800 dark:text-white">{row.product}</span>
                                                <span className="text-right text-slate-600 dark:text-slate-300">{row.qty}</span>
                                                <span className="text-right text-slate-600 dark:text-slate-300">{formatCurrency(row.cost)}</span>
                                                <span className="text-right font-semibold text-slate-800 dark:text-white">{formatCurrency(row.total)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-600 text-sm font-bold">
                                            <span className="text-slate-700 dark:text-slate-200">Jami ombor qiymati</span>
                                            <span className="text-indigo-600">{formatCurrency(warehouseData.reduce((s, r) => s + r.total, 0))}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!['pnl', 'warehouse'].includes(selectedReport) && (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-4 text-3xl">
                                        {reportTypes.find(r => r.id === selectedReport)?.icon}
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{reportTypes.find(r => r.id === selectedReport)?.label}</h3>
                                    <p className="text-xs text-slate-400 mt-1">Hisobot tayyorlanmoqda...</p>
                                    <Button variant="primary" className="mt-4" onClick={handleExportPDF}>
                                        <Download className="w-4 h-4" /> Yuklab olish
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            )}

            {/* ── Report Builder ──────────────────────────────────────── */}
            {reportTab === 'builder' && <ReportBuilder />}

            {/* ── QQS ────────────────────────────────────────────────── */}
            {reportTab === 'qqs' && (
                <Card padding={false}>
                    <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">QQS Hisoboti</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{dateFrom} — {dateTo}</p>
                    </div>
                    <QQSReport dateFrom={dateFrom} dateTo={dateTo} />
                </Card>
            )}
        </div>
    );
};
