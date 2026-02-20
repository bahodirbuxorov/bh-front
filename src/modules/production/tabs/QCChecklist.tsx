import React, { useState } from 'react';
import { CheckSquare, XSquare, Square, ClipboardList, Plus } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useUIStore } from '../../../store/uiStore';

interface CheckItem { id: string; label: string; unit?: string; minValue?: number; maxValue?: number; }
interface QCBatch {
    id: string;
    product: string;
    batchNo: string;
    date: string;
    qty: number;
    checks: Record<string, 'pass' | 'fail' | 'pending'>;
    result: 'pass' | 'fail' | 'pending';
    inspector: string;
    notes: string;
}

const DEFAULT_CHECKS: CheckItem[] = [
    { id: 'weight', label: "Og'irlik (±5%)", unit: 'g' },
    { id: 'moisture', label: 'Namlik darajasi', unit: '%' },
    { id: 'color', label: 'Rang va ko\'rinish' },
    { id: 'smell', label: 'Hid va ta\'m' },
    { id: 'packing', label: 'Qadoqlash sifati' },
    { id: 'label', label: 'Yorliq to\'g\'riligi' },
    { id: 'expiry', label: 'Yaroqlilik muddati muhri' },
];

const mockBatches: QCBatch[] = [
    {
        id: 'QC-001', product: "Non (bug'doy)", batchNo: 'B-2026-042', date: '2026-02-18',
        qty: 500, inspector: 'Alisher K.', notes: "Og'irlik biroz past",
        checks: { weight: 'fail', moisture: 'pass', color: 'pass', smell: 'pass', packing: 'pass', label: 'pass', expiry: 'pass' },
        result: 'fail',
    },
    {
        id: 'QC-002', product: 'Makaron (spaghetti)', batchNo: 'B-2026-041', date: '2026-02-17',
        qty: 300, inspector: 'Nodira H.', notes: '',
        checks: { weight: 'pass', moisture: 'pass', color: 'pass', smell: 'pass', packing: 'pass', label: 'pass', expiry: 'pass' },
        result: 'pass',
    },
];

export const QCChecklist: React.FC = () => {
    const { addToast } = useUIStore();
    const [batches, setBatches] = useState<QCBatch[]>(mockBatches);
    const [activeBatch, setActiveBatch] = useState<QCBatch | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [newProduct, setNewProduct] = useState('');
    const [newBatchNo, setNewBatchNo] = useState('');

    const handleCheck = (checkId: string, value: 'pass' | 'fail') => {
        if (!activeBatch) return;
        const updated = { ...activeBatch, checks: { ...activeBatch.checks, [checkId]: value } };
        const allChecked = DEFAULT_CHECKS.every(c => updated.checks[c.id] !== 'pending');
        if (allChecked) {
            updated.result = Object.values(updated.checks).every(v => v === 'pass') ? 'pass' : 'fail';
        }
        setActiveBatch(updated);
        setBatches(prev => prev.map(b => b.id === updated.id ? updated : b));
    };

    const submit = () => {
        if (!activeBatch) return;
        const label = activeBatch.result === 'pass' ? 'Sifat tekshiruvi O\'tdi ✅' : 'Sifat tekshiruvi Rad etildi ❌';
        addToast({ type: activeBatch.result === 'pass' ? 'success' : 'error', title: label, message: activeBatch.product });
        setActiveBatch(null);
    };

    const createNew = () => {
        if (!newProduct || !newBatchNo) return;
        const batch: QCBatch = {
            id: `QC-${Date.now()}`, product: newProduct, batchNo: newBatchNo,
            date: new Date().toISOString().slice(0, 10),
            qty: 100, inspector: 'Inspektoringiz', notes: '',
            checks: Object.fromEntries(DEFAULT_CHECKS.map(c => [c.id, 'pending' as const])),
            result: 'pending',
        };
        setBatches(prev => [batch, ...prev]);
        setActiveBatch(batch);
        setShowNew(false);
        setNewProduct(''); setNewBatchNo('');
    };

    const checkIcon = (s: 'pass' | 'fail' | 'pending') => {
        if (s === 'pass') return <CheckSquare className="w-5 h-5 text-emerald-500" />;
        if (s === 'fail') return <XSquare className="w-5 h-5 text-red-500" />;
        return <Square className="w-5 h-5 text-slate-300" />;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Batch list */}
            <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">QC Partiyalar</h3>
                    <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowNew(v => !v)}>
                        Yangi
                    </Button>
                </div>
                {showNew && (
                    <Card className="space-y-3">
                        <input placeholder="Mahsulot nomi" value={newProduct} onChange={e => setNewProduct(e.target.value)}
                            className="w-full h-8 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        <input placeholder="Partiya raqami (masalan B-2026-043)" value={newBatchNo} onChange={e => setNewBatchNo(e.target.value)}
                            className="w-full h-8 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        <Button variant="primary" size="sm" onClick={createNew} className="w-full">Yaratish</Button>
                    </Card>
                )}
                {batches.map(b => (
                    <button key={b.id} onClick={() => setActiveBatch(b)}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all ${activeBatch?.id === b.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant={b.result === 'pass' ? 'success' : b.result === 'fail' ? 'danger' : 'warning'} size="sm">
                                {b.result === 'pass' ? "O'tdi" : b.result === 'fail' ? 'Rad' : 'Kutilmoqda'}
                            </Badge>
                            <span className="text-xs text-slate-400">{b.id}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{b.product}</p>
                        <p className="text-xs text-slate-400">{b.batchNo} · {b.date} · {b.qty} dona</p>
                        {/* Mini check summary */}
                        <div className="flex gap-1 mt-2">
                            {DEFAULT_CHECKS.map(c => (
                                <div key={c.id} className={`w-3 h-3 rounded-sm ${b.checks[c.id] === 'pass' ? 'bg-emerald-500' : b.checks[c.id] === 'fail' ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-600'}`} title={c.label} />
                            ))}
                        </div>
                    </button>
                ))}
            </div>

            {/* Checklist */}
            <div className="lg:col-span-3">
                {activeBatch ? (
                    <Card>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                                <ClipboardList className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{activeBatch.product}</h3>
                                <p className="text-xs text-slate-400">{activeBatch.batchNo} · {activeBatch.qty} dona · {activeBatch.inspector}</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-5">
                            {DEFAULT_CHECKS.map(check => {
                                const status = activeBatch.checks[check.id] ?? 'pending';
                                return (
                                    <div key={check.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${status === 'pass' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : status === 'fail' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'}`}>
                                        {checkIcon(status)}
                                        <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">{check.label}</span>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleCheck(check.id, 'pass')}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${status === 'pass' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-emerald-50'}`}>
                                                ✓ O'tdi
                                            </button>
                                            <button onClick={() => handleCheck(check.id, 'fail')}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${status === 'fail' ? 'bg-red-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-red-50'}`}>
                                                ✗ Rad
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className={`p-4 rounded-xl mb-4 ${activeBatch.result === 'pass' ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : activeBatch.result === 'fail' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : 'bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600'}`}>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">
                                Umumiy natija: {activeBatch.result === 'pass' ? "✅ O'tdi" : activeBatch.result === 'fail' ? '❌ Rad etildi' : '⏳ Baholanmagan'}
                            </p>
                        </div>

                        <Button variant="primary" className="w-full" onClick={submit}>
                            Tekshiruvni yakunlash va saqlash
                        </Button>
                    </Card>
                ) : (
                    <Card className="flex flex-col items-center justify-center py-16 text-center">
                        <ClipboardList className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="text-sm font-medium text-slate-500">Partiyani tanlang</p>
                        <p className="text-xs text-slate-400 mt-1">Yoki yangi QC yarating</p>
                    </Card>
                )}
            </div>
        </div>
    );
};
