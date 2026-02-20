import React, { useState } from 'react';
import { Plus, CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { formatCurrency } from '../../../utils';
import { useUIStore } from '../../../store/uiStore';

type PRStatus = 'draft' | 'pending' | 'approved' | 'ordered' | 'rejected';
type PRPriority = 'urgent' | 'normal' | 'low';

interface PurchaseRequisition {
    id: string;
    number: string;
    product: string;
    qty: number;
    unit: string;
    estimatedPrice: number;
    reason: string;
    priority: PRPriority;
    status: PRStatus;
    createdBy: string;
    approvedBy?: string;
    date: string;
}

const mockPRs: PurchaseRequisition[] = [
    { id: '1', number: 'PR-2026-001', product: "Bug'doy uni", qty: 500, unit: 'kg', estimatedPrice: 2400000, reason: 'Ishlab chiqarish uchun', priority: 'urgent', status: 'approved', createdBy: 'Hamza Y.', approvedBy: 'Direktor', date: '2026-02-18' },
    { id: '2', number: 'PR-2026-002', product: 'Qadoq materiallari', qty: 1000, unit: 'dona', estimatedPrice: 1500000, reason: 'Stok kam', priority: 'normal', status: 'pending', createdBy: 'Sarvar T.', date: '2026-02-19' },
    { id: '3', number: 'PR-2026-003', product: 'Osh tuzi', qty: 100, unit: 'kg', estimatedPrice: 250000, reason: 'Oylik ehtiyoj', priority: 'low', status: 'draft', createdBy: 'Malika R.', date: '2026-02-20' },
];

const STATUS_CFG: Record<PRStatus, { variant: 'default' | 'warning' | 'success' | 'info' | 'danger'; label: string }> = {
    draft: { variant: 'default', label: 'Qoralama' },
    pending: { variant: 'warning', label: 'Kutilmoqda' },
    approved: { variant: 'success', label: 'Tasdiqlandi' },
    ordered: { variant: 'info', label: 'Buyurtma qil.' },
    rejected: { variant: 'danger', label: 'Rad etildi' },
};

const PRIORITY_CFG: Record<PRPriority, { color: string; label: string }> = {
    urgent: { color: 'bg-red-500', label: '🔴 Shoshilinch' },
    normal: { color: 'bg-amber-400', label: '🟡 Oddiy' },
    low: { color: 'bg-emerald-400', label: '🟢 Past' },
};

const STEPS: PRStatus[] = ['draft', 'pending', 'approved', 'ordered'];

export const PurchaseRequisitions: React.FC = () => {
    const { addToast } = useUIStore();
    const [prs, setPrs] = useState<PurchaseRequisition[]>(mockPRs);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ product: '', qty: '', unit: 'kg', price: '', reason: '', priority: 'normal' as PRPriority });

    const create = () => {
        if (!form.product || !form.qty) return;
        const pr: PurchaseRequisition = {
            id: Date.now().toString(), number: `PR-2026-${String(prs.length + 4).padStart(3, '0')}`,
            product: form.product, qty: Number(form.qty), unit: form.unit,
            estimatedPrice: Number(form.price) * Number(form.qty),
            reason: form.reason, priority: form.priority, status: 'draft',
            createdBy: 'Siz', date: '2026-02-20',
        };
        setPrs(p => [pr, ...p]);
        setShowModal(false);
        setForm({ product: '', qty: '', unit: 'kg', price: '', reason: '', priority: 'normal' });
        addToast({ type: 'success', title: 'PR yaratildi', message: pr.number });
    };

    const advance = (id: string) => {
        setPrs(p => p.map(pr => {
            if (pr.id !== id) return pr;
            const idx = STEPS.indexOf(pr.status);
            if (idx >= STEPS.length - 1) return pr;
            const next = STEPS[idx + 1];
            const approvedBy = next === 'approved' ? 'Direktor' : pr.approvedBy;
            addToast({ type: 'success', title: STATUS_CFG[next].label, message: `${pr.number} → ${STATUS_CFG[next].label}` });
            return { ...pr, status: next, approvedBy };
        }));
    };

    const reject = (id: string) => {
        setPrs(p => p.map(pr => pr.id === id ? { ...pr, status: 'rejected' } : pr));
        addToast({ type: 'error', title: 'PR rad etildi', message: "So'rov qaytarildi" });
    };

    // Count by status
    const counts = STEPS.reduce((acc, s) => { acc[s] = prs.filter(p => p.status === s).length; return acc; }, {} as Record<string, number>);

    return (
        <div className="space-y-5">
            {/* Pipeline summary */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {STEPS.map((s, i) => (
                    <React.Fragment key={s}>
                        <div className="shrink-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-center min-w-24">
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{counts[s] ?? 0}</p>
                            <p className="text-xs text-slate-400">{STATUS_CFG[s].label}</p>
                        </div>
                        {i < STEPS.length - 1 && <div className="flex items-center shrink-0 text-slate-300"><ArrowRight className="w-4 h-4" /></div>}
                    </React.Fragment>
                ))}
                <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowModal(true)} className="ml-auto shrink-0 self-center">
                    Yangi so'rov
                </Button>
            </div>

            {/* PR list */}
            <div className="space-y-3">
                {prs.map(pr => (
                    <Card key={pr.id} padding={false}>
                        <div className="flex items-start gap-4 p-4">
                            <div className={`w-1 self-stretch rounded-full shrink-0 ${PRIORITY_CFG[pr.priority].color}`} />
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="text-xs font-mono text-indigo-600 font-semibold">{pr.number}</span>
                                    <Badge variant={STATUS_CFG[pr.status].variant} size="sm">{STATUS_CFG[pr.status].label}</Badge>
                                    <span className="text-xs text-slate-400">{PRIORITY_CFG[pr.priority].label}</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-white">{pr.product}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{pr.qty} {pr.unit} · Taxm: {formatCurrency(pr.estimatedPrice)} · {pr.reason}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                    <span>Kim yaratdi: <b className="text-slate-600 dark:text-slate-300">{pr.createdBy}</b></span>
                                    {pr.approvedBy && <span>Kim tasdiqladi: <b className="text-emerald-600">{pr.approvedBy}</b></span>}
                                    <span>{pr.date}</span>
                                </div>
                                {/* Progress bar */}
                                <div className="flex gap-1 mt-2">
                                    {STEPS.map(s => {
                                        const sIdx = STEPS.indexOf(s);
                                        const prIdx = STEPS.indexOf(pr.status);
                                        return <div key={s} className={`flex-1 h-1 rounded-full transition-all ${sIdx <= prIdx && pr.status !== 'rejected' ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-600'}`} />;
                                    })}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 shrink-0">
                                {pr.status !== 'ordered' && pr.status !== 'rejected' && (
                                    <Button variant="secondary" size="sm" icon={<CheckCircle className="w-3.5 h-3.5" />} onClick={() => advance(pr.id)}>
                                        {pr.status === 'draft' ? 'Yuborish' : pr.status === 'pending' ? 'Tasdiqlash' : 'Buyurtma'}
                                    </Button>
                                )}
                                {pr.status === 'pending' && (
                                    <Button variant="danger" size="sm" icon={<AlertTriangle className="w-3.5 h-3.5" />} onClick={() => reject(pr.id)}>
                                        Rad
                                    </Button>
                                )}
                                {pr.status === 'ordered' && <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium"><CheckCircle className="w-4 h-4" /> Buyurtma</div>}
                                {pr.status === 'rejected' && <div className="flex items-center gap-1 text-xs text-red-500 font-medium"><AlertTriangle className="w-4 h-4" /> Rad etildi</div>}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Yangi xarid so'rovi"
                footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Bekor</Button><Button variant="primary" onClick={create}>Yuborish</Button></>}>
                <div className="space-y-3">
                    {[
                        { label: 'Mahsulot nomi', key: 'product', placeholder: "Masalan: Bug'doy uni" },
                        { label: 'Sabab', key: 'reason', placeholder: 'Nima uchun kerak?' },
                    ].map(({ label, key, placeholder }) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
                            <input value={form[key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                                className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    ))}
                    <div className="grid grid-cols-3 gap-3">
                        <div><label className="block text-xs font-medium text-slate-500 mb-1">Miqdor</label>
                            <input type="number" value={form.qty} onChange={e => setForm(p => ({ ...p, qty: e.target.value }))}
                                className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                        <div><label className="block text-xs font-medium text-slate-500 mb-1">Birlik</label>
                            <select value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                                className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                {['kg', 'litr', 'dona', 'metr', 'quti'].map(u => <option key={u}>{u}</option>)}
                            </select></div>
                        <div><label className="block text-xs font-medium text-slate-500 mb-1">Taxminiy narx/birlik</label>
                            <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="so'm"
                                className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Muhimlik</label>
                        <div className="flex gap-2">
                            {(['urgent', 'normal', 'low'] as PRPriority[]).map(p => (
                                <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))}
                                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${form.priority === p ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-600 text-slate-500'}`}>
                                    {PRIORITY_CFG[p].label}
                                </button>
                            ))}
                        </div>
                    </div>
                    {form.qty && form.price && (
                        <div className="flex justify-between text-sm font-semibold pt-2 border-t border-slate-100 dark:border-slate-700">
                            <span>Taxminiy jami:</span>
                            <span className="text-indigo-600">{formatCurrency(Number(form.qty) * Number(form.price))}</span>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};
