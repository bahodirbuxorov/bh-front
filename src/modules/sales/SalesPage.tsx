import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/ui/Misc';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Table, Pagination } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { useLanguageStore } from '../../store/languageStore';
import { useUIStore } from '../../store/uiStore';
import { mockSalesInvoices } from '../../utils/mockData';
import { formatCurrency, formatDate } from '../../utils';
import type { Invoice } from '../../types';
import { Customer360 } from './tabs/Customer360';
import { Quotations } from './tabs/Quotations';
import { SalesPerformance } from './tabs/SalesPerformance';

const PAGE_SIZE = 10;

const statusBadge = (s: Invoice['status']) => {
    const map = { paid: 'success', partial: 'warning', unpaid: 'danger' } as const;
    const labels = { paid: "To'langan", partial: "Qisman", unpaid: "To'lanmagan" };
    return <Badge variant={map[s]} dot size="sm">{labels[s]}</Badge>;
};

export const SalesPage: React.FC = () => {
    const { t } = useLanguageStore();
    const { addToast } = useUIStore();
    const [activeTab, setActiveTab] = useState<'invoices' | 'customers' | 'quotations' | 'performance'>('invoices');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | Invoice['status']>('all');
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [lines, setLines] = useState([{ product: '', qty: 1, price: 0 }]);
    const [customer, setCustomer] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('unpaid');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const filtered = mockSalesInvoices.filter(i => {
        const matchSearch = i.counterparty.toLowerCase().includes(search.toLowerCase()) ||
            i.number.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || i.status === statusFilter;
        return matchSearch && matchStatus;
    });
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const linesTotal = lines.reduce((s, l) => s + Math.max(0, l.qty) * Math.max(0, l.price), 0);

    const addLine = () => setLines(prev => [...prev, { product: '', qty: 1, price: 0 }]);
    const removeLine = (idx: number) => setLines(prev => prev.filter((_, i) => i !== idx));
    const updateLine = (idx: number, field: string, value: string | number) =>
        setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!customer.trim()) errs.customer = "Mijoz nomi kiritilishi shart";
        const validLines = lines.filter(l => l.product.trim());
        if (validLines.length === 0) errs.lines = "Kamida bitta mahsulot qo'shing";
        lines.forEach((l, i) => {
            if (l.product.trim() && l.qty <= 0) errs[`qty_${i}`] = "Miqdor 0 dan katta bo'lishi kerak";
            if (l.product.trim() && l.price <= 0) errs[`price_${i}`] = "Narx 0 dan katta bo'lishi kerak";
        });
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        setShowModal(false);
        setCustomer('');
        setLines([{ product: '', qty: 1, price: 0 }]);
        setErrors({});
        addToast({ type: 'success', title: 'Hisob-faktura yaratildi', message: `${customer} uchun ${formatCurrency(linesTotal)}` });
    };

    const totalRevenue = mockSalesInvoices.reduce((s, i) => s + i.total, 0);
    const totalPaid = mockSalesInvoices.reduce((s, i) => s + i.paid, 0);

    return (
        <div className="space-y-5 animate-fade-in">
            <PageHeader
                title={t('sales')}
                subtitle="Savdo hisob-fakturalari va debitorlik"
                actions={
                    <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => { setShowModal(true); setErrors({}); }}>
                        {t('newInvoice')}
                    </Button>
                }
            />

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex-wrap">
                {[
                    { key: 'invoices', label: 'Fakturalar' },
                    { key: 'customers', label: 'Mijozlar 360°' },
                    { key: 'quotations', label: 'Kotirovkalar' },
                    { key: 'performance', label: 'Sotuv Tahlili' },
                ].map(({ key, label }) => (
                    <button key={key} onClick={() => setActiveTab(key as typeof activeTab)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === key ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === 'invoices' && (<>
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Jami savdo</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalRevenue)}</p>
                    </Card>
                    <Card>
                        <p className="text-xs font-medium text-green-600 mb-1">To'langan</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                    </Card>
                    <Card>
                        <p className="text-xs font-medium text-red-500 mb-1">Qoldiq (debitorlik)</p>
                        <p className="text-xl font-bold text-red-500">{formatCurrency(totalRevenue - totalPaid)}</p>
                    </Card>
                </div>

                {/* Table */}
                <Card padding={false}>
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-wrap items-center gap-3">
                        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Mijoz yoki hisob-faktura raqami..." className="w-72" />
                        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg ml-auto">
                            {(['all', 'paid', 'partial', 'unpaid'] as const).map(s => (
                                <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${statusFilter === s ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                                    {s === 'all' ? 'Barchasi' : s === 'paid' ? "To'langan" : s === 'partial' ? 'Qisman' : "To'lanmagan"}
                                </button>
                            ))}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{filtered.length} ta</p>
                    </div>
                    <div className="p-4">
                        <Table
                            columns={[
                                { key: 'number', header: t('invoiceNumber'), sortable: true, render: r => <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium text-xs">{r.number}</span> },
                                { key: 'counterparty', header: t('customer'), sortable: true, render: r => <span className="font-medium text-slate-800 dark:text-white">{r.counterparty}</span> },
                                { key: 'date', header: t('date'), sortable: true, render: r => formatDate(r.date) },
                                { key: 'dueDate', header: 'Muddati', sortable: true, render: r => formatDate(r.dueDate) },
                                { key: 'total', header: t('total'), align: 'right', sortable: true, render: r => <span className="font-semibold">{formatCurrency(r.total)}</span> },
                                { key: 'paid', header: "To'landi", align: 'right', render: r => <span className="text-green-600">{formatCurrency(r.paid)}</span> },
                                { key: 'status', header: t('status'), render: r => statusBadge(r.status) },
                            ]}
                            data={paged}
                            rowKey={r => r.id}
                        />
                        <div className="mt-3">
                            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
                        </div>
                    </div>
                </Card>
            </>)}

            {activeTab === 'customers' && <Customer360 />}
            {activeTab === 'quotations' && <Quotations />}
            {activeTab === 'performance' && <SalesPerformance />}

            {/* New Invoice Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={t('newInvoice')} size="lg"
                footer={<>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>{t('cancel')}</Button>
                    <Button variant="primary" onClick={handleSubmit}>{t('save')}</Button>
                </>}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('customer')} <span className="text-red-500">*</span></label>
                            <input
                                value={customer}
                                onChange={e => { setCustomer(e.target.value); if (errors.customer) setErrors(p => ({ ...p, customer: '' })); }}
                                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                placeholder="Mijoz nomi"
                                className={`w-full h-9 px-3 text-sm border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.customer ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                            />
                            {errors.customer && <p className="text-xs text-red-500 mt-1">{errors.customer}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">To'lov holati</label>
                            <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}
                                className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="unpaid">To'lanmagan</option>
                                <option value="partial">Qisman to'langan</option>
                                <option value="paid">To'langan</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 uppercase px-1">
                            <span className="col-span-5">Mahsulot <span className="text-red-500">*</span></span>
                            <span className="col-span-2">Miqdor</span>
                            <span className="col-span-3">Narx (so'm)</span>
                            <span className="col-span-1 text-right">Jami</span>
                            <span className="col-span-1" />
                        </div>
                        {lines.map((line, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
                                <input value={line.product}
                                    onChange={e => { updateLine(idx, 'product', e.target.value); if (errors.lines) setErrors(p => ({ ...p, lines: '' })); }}
                                    placeholder="Mahsulot nomi"
                                    className={`col-span-5 h-8 px-2 text-xs border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${errors.lines ? 'border-red-400' : 'border-slate-200 dark:border-slate-600'}`} />
                                <input type="number" min={1} value={line.qty}
                                    onChange={e => updateLine(idx, 'qty', Math.max(0, Number(e.target.value)))}
                                    className={`col-span-2 h-8 px-2 text-xs border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${errors[`qty_${idx}`] ? 'border-red-400' : 'border-slate-200 dark:border-slate-600'}`} />
                                <input type="number" min={0} value={line.price}
                                    onChange={e => updateLine(idx, 'price', Math.max(0, Number(e.target.value)))}
                                    className={`col-span-3 h-8 px-2 text-xs border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${errors[`price_${idx}`] ? 'border-red-400' : 'border-slate-200 dark:border-slate-600'}`} />
                                <span className="col-span-1 flex items-center justify-end text-xs font-semibold text-indigo-600 dark:text-indigo-400 truncate">
                                    {(line.qty * line.price / 1000000).toFixed(1)}M
                                </span>
                                <button onClick={() => removeLine(idx)} disabled={lines.length === 1}
                                    className="col-span-1 flex items-center justify-center text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                        {errors.lines && <p className="text-xs text-red-500">{errors.lines}</p>}
                        <Button variant="outline" size="sm" onClick={addLine} icon={<Plus className="w-3 h-3" />}>Qator qo'shish</Button>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-3 flex justify-between items-center">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('total')}</span>
                        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(linesTotal)}</span>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
