import React, { useState, useMemo } from 'react';
import {
    User, TrendingUp, AlertCircle, ChevronRight, X, FileText, Plus,
    Phone, Mail, MapPin, Building2,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { mockSalesInvoices } from '../../../mocks';
import { formatCurrency, formatDate } from '../../../utils';
import { useUIStore } from '../../../store/uiStore';

interface Customer {
    name: string;
    totalSales: number;
    totalDebt: number;
    invoiceCount: number;
    lastDate: string;
    status: 'vip' | 'regular' | 'risky';
    // extended fields (from add form)
    phone?: string;
    email?: string;
    address?: string;
    company?: string;
}

const EMPTY_FORM = { name: '', phone: '', email: '', address: '', company: '' };

export const Customer360: React.FC = () => {
    const { addToast } = useUIStore();
    const [selected, setSelected] = useState<Customer | null>(null);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    // Extra customers added manually
    const [extra, setExtra] = useState<Customer[]>([]);

    // Customers derived from invoices
    const fromInvoices = useMemo<Customer[]>(() => {
        const map = new Map<string, Customer>();
        mockSalesInvoices.forEach(inv => {
            const existing = map.get(inv.counterparty) ?? {
                name: inv.counterparty, totalSales: 0, totalDebt: 0,
                invoiceCount: 0, lastDate: inv.date, status: 'regular' as const,
            };
            existing.totalSales += inv.total;
            existing.totalDebt += (inv.total - inv.paid);
            existing.invoiceCount++;
            if (inv.date > existing.lastDate) existing.lastDate = inv.date;
            map.set(inv.counterparty, existing);
        });
        return Array.from(map.values()).map(c => ({
            ...c,
            status: (c.totalSales > 30000000 ? 'vip' : c.totalDebt > c.totalSales * 0.3 ? 'risky' : 'regular') as 'vip' | 'regular' | 'risky',
        })).sort((a, b) => b.totalSales - a.totalSales);
    }, []);

    const customers = useMemo(() => [...fromInvoices, ...extra], [fromInvoices, extra]);

    const customerInvoices = useMemo(() =>
        selected ? mockSalesInvoices.filter(i => i.counterparty === selected.name).slice(0, 10) : [],
        [selected]
    );

    const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    const statusCfg = {
        vip: { variant: 'purple' as const, label: '⭐ VIP', bg: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800' },
        regular: { variant: 'info' as const, label: 'Doimiy', bg: '' },
        risky: { variant: 'danger' as const, label: '⚠️ Qarzdor', bg: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' },
    };

    const validateForm = () => {
        const errs: Record<string, string> = {};
        if (!form.name.trim()) errs.name = 'Mijoz nomi majburiy';
        if (customers.some(c => c.name.toLowerCase() === form.name.trim().toLowerCase()))
            errs.name = 'Bu nom allaqachon mavjud';
        if (form.email && !/^[^@]+@[^@]+\.[^@]+$/.test(form.email))
            errs.email = 'Email noto\'g\'ri formatda';
        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleAdd = () => {
        if (!validateForm()) return;
        const newCustomer: Customer = {
            name: form.name.trim(),
            totalSales: 0,
            totalDebt: 0,
            invoiceCount: 0,
            lastDate: new Date().toISOString().slice(0, 10),
            status: 'regular',
            phone: form.phone || undefined,
            email: form.email || undefined,
            address: form.address || undefined,
            company: form.company || undefined,
        };
        setExtra(prev => [newCustomer, ...prev]);
        setShowAddModal(false);
        setForm(EMPTY_FORM);
        setFormErrors({});
        setSelected(newCustomer);
        addToast({ type: 'success', title: 'Mijoz qo\'shildi', message: `${newCustomer.name} ro'yxatga qo'shildi` });
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Left: customer list */}
                <div className="lg:col-span-2 space-y-3">
                    {/* Search + Add */}
                    <div className="flex gap-2">
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Mijoz qidirish..."
                            className="flex-1 h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => { setShowAddModal(true); setForm(EMPTY_FORM); setFormErrors({}); }}>
                            Qo'shish
                        </Button>
                    </div>

                    <p className="text-xs text-slate-400">{filtered.length} ta mijoz</p>

                    <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                        {filtered.length === 0 ? (
                            <div className="text-center py-10">
                                <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm text-slate-400">Mijoz topilmadi</p>
                                <button onClick={() => { setShowAddModal(true); setForm({ ...EMPTY_FORM, name: search }); setFormErrors({}); }}
                                    className="mt-2 text-xs text-indigo-500 hover:underline">
                                    "{search}" ni qo'shish
                                </button>
                            </div>
                        ) : filtered.map(c => (
                            <button key={c.name} onClick={() => setSelected(c)}
                                className={`w-full text-left p-3 rounded-xl border-2 transition-all hover:shadow-sm ${selected?.name === c.name ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : `border-slate-200 dark:border-slate-700 hover:border-slate-300 ${statusCfg[c.status].bg}`}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                                        {c.name[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{c.name}</p>
                                        <p className="text-xs text-slate-400">{c.invoiceCount > 0 ? `${c.invoiceCount} ta faktura` : 'Yangi mijoz'}</p>
                                    </div>
                                    <Badge variant={statusCfg[c.status].variant} size="sm">{statusCfg[c.status].label}</Badge>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Jami: <b className="text-slate-600 dark:text-slate-300">{formatCurrency(c.totalSales)}</b></span>
                                    {c.totalDebt > 0 && <span className="text-red-500 font-semibold">Qarz: {formatCurrency(c.totalDebt)}</span>}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: 360 detail */}
                <div className="lg:col-span-3">
                    {selected ? (
                        <div className="space-y-4">
                            <Card>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                                            {selected.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">{selected.name}</h3>
                                            {selected.company && <p className="text-xs text-slate-400">{selected.company}</p>}
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant={statusCfg[selected.status].variant} size="sm">{statusCfg[selected.status].label}</Badge>
                                                <span className="text-xs text-slate-400">So'nggi: {formatDate(selected.lastDate)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelected(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Contact info */}
                                {(selected.phone || selected.email || selected.address) && (
                                    <div className="mb-4 space-y-1.5">
                                        {selected.phone && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                <Phone className="w-3.5 h-3.5 text-slate-400" />{selected.phone}
                                            </div>
                                        )}
                                        {selected.email && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                <Mail className="w-3.5 h-3.5 text-slate-400" />{selected.email}
                                            </div>
                                        )}
                                        {selected.address && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />{selected.address}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: 'Jami savdo', value: formatCurrency(selected.totalSales), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                                        { label: 'Qarz (qarizi)', value: formatCurrency(selected.totalDebt), icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
                                        { label: 'Fakturalar', value: selected.invoiceCount.toString(), icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                                    ].map(s => (
                                        <div key={s.label} className={`${s.bg} rounded-xl p-3`}>
                                            <s.icon className={`w-4 h-4 ${s.color} mb-1`} />
                                            <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                                            <p className="text-xs text-slate-400">{s.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Debt bar */}
                                {selected.totalSales > 0 && (
                                    <div className="mt-4">
                                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                                            <span>To'lov darajasi</span>
                                            <span>{(((selected.totalSales - selected.totalDebt) / selected.totalSales) * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full"
                                                style={{ width: `${Math.min(100, ((selected.totalSales - selected.totalDebt) / selected.totalSales) * 100)}%` }} />
                                        </div>
                                    </div>
                                )}
                            </Card>

                            {customerInvoices.length > 0 ? (
                                <Card padding={false}>
                                    <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">So'nggi fakturalar</h4>
                                    </div>
                                    <div className="divide-y divide-slate-50 dark:divide-slate-700">
                                        {customerInvoices.map(inv => (
                                            <div key={inv.id} className="flex items-center gap-3 px-4 py-3">
                                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                                <span className="text-xs font-mono text-indigo-600">{inv.number}</span>
                                                <span className="text-xs text-slate-400">{formatDate(inv.date)}</span>
                                                <span className="ml-auto text-sm font-semibold text-slate-800 dark:text-white">{formatCurrency(inv.total)}</span>
                                                <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'partial' ? 'warning' : 'danger'} size="sm">
                                                    {inv.status === 'paid' ? "To'langan" : inv.status === 'partial' ? 'Qisman' : "To'lanmagan"}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            ) : (
                                <Card className="text-center py-8">
                                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-sm text-slate-400">Hali fakturalar yo'q</p>
                                </Card>
                            )}
                        </div>
                    ) : (
                        <Card className="flex flex-col items-center justify-center py-20 text-center">
                            <User className="w-12 h-12 text-slate-300 mb-4" />
                            <p className="text-sm font-medium text-slate-500">Mijozni tanlang</p>
                            <p className="text-xs text-slate-400 mt-1">360° ko'rinish uchun mijoz kartasini bosing</p>
                            <Button variant="outline" size="sm" icon={<Plus className="w-4 h-4" />} className="mt-4"
                                onClick={() => { setShowAddModal(true); setForm(EMPTY_FORM); setFormErrors({}); }}>
                                Yangı mijoz qo'shish
                            </Button>
                        </Card>
                    )}
                </div>
            </div>

            {/* Add Customer Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Yangi mijoz qo'shish"
                footer={<>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>Bekor qilish</Button>
                    <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleAdd}>Qo'shish</Button>
                </>}
            >
                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                            Mijoz ismi / kompaniya nomi <span className="text-red-500">*</span>
                        </label>
                        <input
                            autoFocus
                            value={form.name}
                            onChange={e => { setForm(p => ({ ...p, name: e.target.value })); if (formErrors.name) setFormErrors(p => ({ ...p, name: '' })); }}
                            placeholder="Masalan: Alisher Umarov yoki Baraka MChJ"
                            className={`w-full h-10 px-3 text-sm border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.name ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                        />
                        {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                    </div>

                    {/* Company */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                            <Building2 className="w-3 h-3 inline mr-1" />Kompaniya (ixtiyoriy)
                        </label>
                        <input
                            value={form.company}
                            onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                            placeholder="Korporativ mijoz bo'lsa..."
                            className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                                <Phone className="w-3 h-3 inline mr-1" />Telefon
                            </label>
                            <input
                                value={form.phone}
                                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                placeholder="+998 90 000 00 00"
                                className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                                <Mail className="w-3 h-3 inline mr-1" />Email
                            </label>
                            <input
                                value={form.email}
                                onChange={e => { setForm(p => ({ ...p, email: e.target.value })); if (formErrors.email) setFormErrors(p => ({ ...p, email: '' })); }}
                                placeholder="email@example.com"
                                className={`w-full h-9 px-3 text-sm border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.email ? 'border-red-400' : 'border-slate-200 dark:border-slate-600'}`}
                            />
                            {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                            <MapPin className="w-3 h-3 inline mr-1" />Manzil (ixtiyoriy)
                        </label>
                        <input
                            value={form.address}
                            onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                            placeholder="Shahar, ko'cha, uy..."
                            className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
};
