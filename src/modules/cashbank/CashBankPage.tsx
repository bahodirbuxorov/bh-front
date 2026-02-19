import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '../../components/ui/Misc';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { useLanguageStore } from '../../store/languageStore';
import { useUIStore } from '../../store/uiStore';
import { mockTransactions } from '../../utils/mockData';
import { formatCurrency, formatDate } from '../../utils';

export const CashBankPage: React.FC = () => {
    const { t } = useLanguageStore();
    const { addToast } = useUIStore();
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [showModal, setShowModal] = useState(false);
    const [newTx, setNewTx] = useState({ type: 'income', amount: '', category: '', note: '' });

    const filtered = mockTransactions.filter(tx => filter === 'all' || tx.type === filter);

    const totalIncome = mockTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = mockTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const netBalance = totalIncome - totalExpense;

    return (
        <div className="space-y-5 animate-fade-in">
            <PageHeader
                title={t('cashBank')}
                subtitle="Kassa va bank tranzaksiyalari"
                actions={
                    <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
                        Tranzaksiya qo'shish
                    </Button>
                }
            />

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <p className="text-xs font-medium text-green-600 mb-1">Jami kirim</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
                </Card>
                <Card>
                    <p className="text-xs font-medium text-red-500 mb-1">Jami chiqim</p>
                    <p className="text-xl font-bold text-red-500">{formatCurrency(totalExpense)}</p>
                </Card>
                <Card>
                    <p className="text-xs font-medium text-indigo-600 mb-1">Sof balans</p>
                    <p className={`text-xl font-bold ${netBalance >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>{formatCurrency(netBalance)}</p>
                </Card>
            </div>

            {/* Filter */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                {[{ key: 'all', label: 'Barchasi' }, { key: 'income', label: t('income') }, { key: 'expense', label: t('expense') }].map(({ key, label }) => (
                    <button key={key} onClick={() => setFilter(key as typeof filter)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === key ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Transaction list */}
            <Card padding={false}>
                <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('transactions')}</h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filtered.map((tx) => (
                        <div key={tx.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                <span className="text-lg">{tx.type === 'income' ? '↑' : '↓'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 dark:text-white">{tx.category}</p>
                                <p className="text-xs text-slate-400">{tx.reference && <span className="text-indigo-500">{tx.reference} · </span>}{formatDate(tx.date)}</p>
                            </div>
                            <div className="text-right">
                                <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </p>
                                {tx.balance && <p className="text-xs text-slate-400">Balans: {formatCurrency(tx.balance)}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Tranzaksiya qo'shish"
                footer={<>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>{t('cancel')}</Button>
                    <Button variant="primary" onClick={() => { setShowModal(false); addToast({ type: 'success', title: 'Tranzaksiya qo\'shildi' }); }}>{t('save')}</Button>
                </>}>
                <div className="space-y-4">
                    <div className="flex gap-2">
                        {['income', 'expense'].map(type => (
                            <button key={type} onClick={() => setNewTx(p => ({ ...p, type }))}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${newTx.type === type ? (type === 'income' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700') : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                {type === 'income' ? `↑ ${t('income')}` : `↓ ${t('expense')}`}
                            </button>
                        ))}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">{t('amount')} (so'm)</label>
                        <input type="number" value={newTx.amount} onChange={e => setNewTx(p => ({ ...p, amount: e.target.value }))} placeholder="0" className="w-full h-10 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-semibold" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">{t('category')}</label>
                        <select value={newTx.category} onChange={e => setNewTx(p => ({ ...p, category: e.target.value }))} className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Kategoriya tanlang</option>
                            <option>Savdo</option><option>Xom ashyo</option><option>Ish haqi</option><option>Kommunal</option><option>Transport</option><option>Boshqa</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Izoh</label>
                        <input value={newTx.note} onChange={e => setNewTx(p => ({ ...p, note: e.target.value }))} placeholder="Qo'shimcha ma'lumot..." className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>
            </Modal>
        </div>
    );
};
