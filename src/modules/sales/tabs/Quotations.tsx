import React, { useState } from 'react';
import { Plus, ArrowRight, FileText, Send, Check, Trash2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { formatCurrency } from '../../../utils';
import { useUIStore } from '../../../store/uiStore';

type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'invoiced';

interface QuoteLine { product: string; qty: number; price: number; }
interface Quotation {
    id: string;
    number: string;
    customer: string;
    date: string;
    validUntil: string;
    lines: QuoteLine[];
    status: QuoteStatus;
    total: number;
}

const mockQuotations: Quotation[] = [
    {
        id: 'q1', number: 'QUO-2026-001', customer: 'Sarbon Supermarket', date: '2026-02-15', validUntil: '2026-02-28', status: 'accepted',
        lines: [{ product: "Non (bug'doy)", qty: 500, price: 3500 }, { product: 'Makaron', qty: 200, price: 8500 }], total: 3450000
    },
    {
        id: 'q2', number: 'QUO-2026-002', customer: 'Hamkor Savdo', date: '2026-02-17', validUntil: '2026-03-01', status: 'sent',
        lines: [{ product: 'Shakar', qty: 100, price: 7200 }], total: 720000
    },
    {
        id: 'q3', number: 'QUO-2026-003', customer: 'Yangi Bozor', date: '2026-02-18', validUntil: '2026-03-05', status: 'draft',
        lines: [{ product: 'Qandolat', qty: 50, price: 45000 }], total: 2250000
    },
];

const STATUS_CFG: Record<QuoteStatus, { variant: 'default' | 'info' | 'success' | 'danger' | 'warning'; label: string }> = {
    draft: { variant: 'default', label: 'Qoralama' },
    sent: { variant: 'info', label: 'Yuborildi' },
    accepted: { variant: 'success', label: 'Qabul qilindi' },
    declined: { variant: 'danger', label: 'Rad etildi' },
    invoiced: { variant: 'purple' as unknown as 'success', label: 'Fakturalandi' },
};

const PIPELINE: QuoteStatus[] = ['draft', 'sent', 'accepted', 'invoiced'];

export const Quotations: React.FC = () => {
    const { addToast } = useUIStore();
    const [quotes, setQuotes] = useState<Quotation[]>(mockQuotations);
    const [showModal, setShowModal] = useState(false);
    const [customer, setCustomer] = useState('');
    const [lines, setLines] = useState<QuoteLine[]>([{ product: '', qty: 1, price: 0 }]);

    const addLine = () => setLines(p => [...p, { product: '', qty: 1, price: 0 }]);
    const removeLine = (i: number) => setLines(p => p.filter((_, j) => j !== i));
    const updateLine = (i: number, f: keyof QuoteLine, v: string | number) =>
        setLines(p => p.map((l, j) => j === i ? { ...l, [f]: v } : l));
    const linesTotal = lines.reduce((s, l) => s + l.qty * l.price, 0);

    const handleCreate = () => {
        if (!customer.trim()) return;
        const nowId = Math.random().toString(36).slice(2, 6).toUpperCase();
        const newQ: Quotation = {
            id: nowId, number: `QUO-2026-${String(quotes.length + 4).padStart(3, '0')}`,
            customer, date: '2026-02-20', validUntil: '2026-03-06',
            lines: lines.filter(l => l.product), status: 'draft', total: linesTotal,
        };
        setQuotes(p => [newQ, ...p]);
        setShowModal(false);
        setCustomer(''); setLines([{ product: '', qty: 1, price: 0 }]);
        addToast({ type: 'success', title: 'Taklif yaratildi', message: newQ.number });
    };

    const advance = (id: string) => {
        setQuotes(p => p.map(q => {
            if (q.id !== id) return q;
            const idx = PIPELINE.indexOf(q.status);
            if (idx >= PIPELINE.length - 1) return q;
            const next = PIPELINE[idx + 1];
            addToast({ type: 'success', title: 'Holat o\'zgartirildi', message: `${q.number} → ${STATUS_CFG[next].label}` });
            return { ...q, status: next };
        }));
    };

    const toInvoice = (id: string) => {
        setQuotes(p => p.map(q => q.id === id ? { ...q, status: 'invoiced' } : q));
        addToast({ type: 'success', title: 'Faktura yaratildi', message: 'Savdo moduliga o\'tkazildi' });
    };

    return (
        <div className="space-y-5">
            {/* Pipeline count */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {PIPELINE.map((s, i) => (
                    <React.Fragment key={s}>
                        <div className="shrink-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-center min-w-24">
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{quotes.filter(q => q.status === s).length}</p>
                            <p className="text-xs text-slate-400">{STATUS_CFG[s].label}</p>
                        </div>
                        {i < PIPELINE.length - 1 && <div className="flex items-center text-slate-300"><ArrowRight className="w-4 h-4" /></div>}
                    </React.Fragment>
                ))}
                <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowModal(true)} className="ml-auto shrink-0 self-center">
                    Yangi taklif
                </Button>
            </div>

            {/* Quotation cards */}
            <div className="space-y-3">
                {quotes.map(q => (
                    <Card key={q.id} padding={false} className="overflow-hidden">
                        <div className="flex items-center gap-4 p-4">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-mono font-semibold text-indigo-600">{q.number}</span>
                                    <Badge variant={STATUS_CFG[q.status].variant} size="sm">{STATUS_CFG[q.status].label}</Badge>
                                    <span className="text-xs text-slate-400">{q.date} · Muddat: {q.validUntil}</span>
                                </div>
                                <p className="text-sm font-medium text-slate-800 dark:text-white mt-0.5">{q.customer}</p>
                                <p className="text-xs text-slate-400">{q.lines.length} mahsulot · {q.lines.map(l => l.product).filter(Boolean).slice(0, 2).join(', ')}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-base font-bold text-slate-900 dark:text-white">{formatCurrency(q.total)}</p>
                                <div className="flex gap-1 mt-1 justify-end">
                                    {q.status === 'accepted' && (
                                        <Button variant="primary" size="sm" icon={<Check className="w-3 h-3" />} onClick={() => toInvoice(q.id)}>
                                            Faktura
                                        </Button>
                                    )}
                                    {q.status !== 'invoiced' && q.status !== 'declined' && (
                                        <Button variant="secondary" size="sm" icon={<Send className="w-3 h-3" />} onClick={() => advance(q.id)}>
                                            {q.status === 'draft' ? 'Yuborish' : q.status === 'sent' ? 'Tasdiqlash' : '→'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="flex h-1">
                            {PIPELINE.map(s => {
                                const idx = PIPELINE.indexOf(q.status);
                                const sIdx = PIPELINE.indexOf(s);
                                return <div key={s} className={`flex-1 ${sIdx <= idx ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`} />;
                            })}
                        </div>
                    </Card>
                ))}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Yangi tijorat taklifi"
                footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Bekor</Button><Button variant="primary" onClick={handleCreate}>Yaratish</Button></>}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mijoz nomi</label>
                        <input value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Mijoz nomi..."
                            className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    {lines.map((l, i) => (
                        <div key={i} className="grid grid-cols-10 gap-2 items-center">
                            <input value={l.product} onChange={e => updateLine(i, 'product', e.target.value)} placeholder="Mahsulot"
                                className="col-span-5 h-8 px-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                            <input type="number" value={l.qty} onChange={e => updateLine(i, 'qty', Number(e.target.value))}
                                className="col-span-2 h-8 px-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                            <input type="number" value={l.price} onChange={e => updateLine(i, 'price', Number(e.target.value))} placeholder="Narx"
                                className="col-span-2 h-8 px-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                            <button onClick={() => removeLine(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" icon={<Plus className="w-3 h-3" />} onClick={addLine}>Qator qo'shish</Button>
                    <div className="flex justify-between font-semibold text-sm pt-2 border-t border-slate-100 dark:border-slate-700">
                        <span>Jami:</span><span className="text-indigo-600">{formatCurrency(linesTotal)}</span>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
