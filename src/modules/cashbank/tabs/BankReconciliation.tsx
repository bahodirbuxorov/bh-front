import React, { useState, useMemo } from 'react';
import { CheckCircle, AlertTriangle, HelpCircle, Upload } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { mockTransactions } from '../../../mocks';
import { formatCurrency } from '../../../utils';
import { useUIStore } from '../../../store/uiStore';

type RecStatus = 'matched' | 'variance' | 'unmatched';

interface BankEntry { id: string; date: string; description: string; amount: number; type: 'credit' | 'debit'; }
interface RecordLine {
    systemTx: typeof mockTransactions[0] | null;
    bankEntry: BankEntry | null;
    status: RecStatus;
    diff: number;
}

const SAMPLE_BANK_STATEMENT = `2026-02-18 Savdo tushumi - Sarbon +5200000
2026-02-17 Kommunal to'lov -1200000
2026-02-16 Xarid - Toshkent Tegirmoni -3800000
2026-02-15 Savdo - Hamkor Savdo +2400000
2026-02-14 Ish haqi -4500000
2026-02-13 Kassa tushumi +890000
2026-02-12 Transport xarajati -320000`;

function parseBankStatement(text: string): BankEntry[] {
    return text.trim().split('\n').map((line, i) => {
        const parts = line.trim().split(' ');
        const date = parts[0] ?? '';
        const rawAmount = parts[parts.length - 1];
        const amount = Math.abs(parseFloat(rawAmount.replace(/[^0-9.-]/g, '')) || 0);
        const type: 'credit' | 'debit' = rawAmount.startsWith('+') ? 'credit' : 'debit';
        const description = parts.slice(1, -1).join(' ');
        return { id: `bank-${i}`, date, description, amount, type };
    }).filter(e => e.amount > 0);
}

export const BankReconciliation: React.FC = () => {
    const { addToast } = useUIStore();
    const [statement, setStatement] = useState(SAMPLE_BANK_STATEMENT);
    const [reconciled, setReconciled] = useState(false);
    const [bankEntries, setBankEntries] = useState<BankEntry[]>([]);

    const records: RecordLine[] = useMemo(() => {
        if (!reconciled || bankEntries.length === 0) return [];
        const sysTxs = mockTransactions.slice(0, 8);
        return bankEntries.map((be, i) => {
            const sys = sysTxs[i] ?? null;
            if (!sys) return { systemTx: null, bankEntry: be, status: 'unmatched', diff: be.amount };
            const diff = Math.abs(be.amount - sys.amount);
            const pct = diff / sys.amount;
            const status: RecStatus = pct < 0.01 ? 'matched' : pct < 0.15 ? 'variance' : 'unmatched';
            return { systemTx: sys, bankEntry: be, status, diff };
        });
    }, [reconciled, bankEntries]);

    const doReconcile = () => {
        const parsed = parseBankStatement(statement);
        if (parsed.length === 0) { addToast({ type: 'error', title: 'Ko\'chirma bo\'sh', message: 'Tranzaksiyalar topilmadi' }); return; }
        setBankEntries(parsed);
        setReconciled(true);
        addToast({ type: 'success', title: 'Moslashtirish bajarildi', message: `${parsed.length} ta bank tranzaksiyasi tahlil qilindi` });
    };

    const statusCfg: Record<RecStatus, { icon: typeof CheckCircle; color: string; bg: string; label: string; variant: 'success' | 'warning' | 'danger' }> = {
        matched: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10', label: '✅ Moslashdi', variant: 'success' },
        variance: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10', label: '⚠️ Farq bor', variant: 'warning' },
        unmatched: { icon: HelpCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10', label: '❓ Topilmadi', variant: 'danger' },
    };

    const counts = { matched: records.filter(r => r.status === 'matched').length, variance: records.filter(r => r.status === 'variance').length, unmatched: records.filter(r => r.status === 'unmatched').length };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Left: bank statement input */}
            <div className="lg:col-span-2 space-y-4">
                <Card>
                    <div className="flex items-center gap-2 mb-3">
                        <Upload className="w-4 h-4 text-slate-400" />
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Bank ko'chirmasi</h3>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">Quyidagi formatda joylashtiring: <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">SANA  IZOH  ±SUMMA</code></p>
                    <textarea
                        value={statement}
                        onChange={e => { setStatement(e.target.value); setReconciled(false); }}
                        rows={10}
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                    <Button variant="primary" className="w-full mt-3" onClick={doReconcile}>
                        Moslashtirish →
                    </Button>
                </Card>

                {reconciled && (
                    <div className="grid grid-cols-3 gap-2">
                        {(Object.entries(statusCfg) as [RecStatus, typeof statusCfg.matched][]).map(([key, cfg]) => (
                            <div key={key} className={`${cfg.bg} rounded-xl p-3 text-center`}>
                                <p className={`text-xl font-bold ${cfg.color}`}>{counts[key]}</p>
                                <p className="text-xs text-slate-500">{cfg.label.split(' ').slice(1).join(' ')}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right: reconciliation results */}
            <div className="lg:col-span-3">
                {reconciled ? (
                    <Card padding={false}>
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Moslashtirish natijalari</h3>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[500px] overflow-y-auto">
                            {records.map((r, i) => {
                                const cfg = statusCfg[r.status];
                                return (
                                    <div key={i} className={`p-4 ${cfg.bg} transition-colors`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
                                            {r.status === 'variance' && (
                                                <span className="text-xs text-amber-600 font-semibold">Farq: {formatCurrency(r.diff)}</span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {r.bankEntry && (
                                                <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-2.5">
                                                    <p className="text-xs text-slate-400 mb-1 font-semibold">Bank ko'chirmasi</p>
                                                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{r.bankEntry.description}</p>
                                                    <p className={`text-sm font-bold ${r.bankEntry.type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
                                                        {r.bankEntry.type === 'credit' ? '+' : '-'}{formatCurrency(r.bankEntry.amount)}
                                                    </p>
                                                    <p className="text-xs text-slate-400">{r.bankEntry.date}</p>
                                                </div>
                                            )}
                                            {r.systemTx ? (
                                                <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-2.5">
                                                    <p className="text-xs text-slate-400 mb-1 font-semibold">Tizim tranzaksiyasi</p>
                                                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{r.systemTx.category}</p>
                                                    <p className={`text-sm font-bold ${r.systemTx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                                                        {r.systemTx.type === 'income' ? '+' : '-'}{formatCurrency(r.systemTx.amount)}
                                                    </p>
                                                    <p className="text-xs text-slate-400">{r.systemTx.date}</p>
                                                </div>
                                            ) : (
                                                <div className="bg-red-50/60 dark:bg-red-900/10 rounded-lg p-2.5 flex items-center justify-center">
                                                    <p className="text-xs text-red-400">Tizimda topilmadi</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                ) : (
                    <Card className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-4 text-3xl">🏦</div>
                        <p className="text-sm font-medium text-slate-500">Bank ko'chirmasini joylashtiring</p>
                        <p className="text-xs text-slate-400 mt-1">va "Moslashtirish" tugmasini bosing</p>
                    </Card>
                )}
            </div>
        </div>
    );
};
