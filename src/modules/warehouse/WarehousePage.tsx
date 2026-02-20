import React, { useState } from 'react';
import { Plus, ArrowUpDown, Package, Camera, Clock, Bell } from 'lucide-react';
import { PageHeader } from '../../components/ui/Misc';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SearchBar, Select } from '../../components/ui/Input';
import { Table, Pagination } from '../../components/ui/Table';
import { Card } from '../../components/ui/Card';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import { useLanguageStore } from '../../store/languageStore';
import { useUIStore } from '../../store/uiStore';
import { mockInventory } from '../../utils/mockData';
import { formatCurrency } from '../../utils';
import type { InventoryItem } from '../../types';
import { BarcodeScanner } from './tabs/BarcodeScanner';
import { InventoryAging } from './tabs/InventoryAging';
import { SmartAlerts } from './tabs/SmartAlerts';

const PAGE_SIZE = 10;

type ActiveTab = 'inventory' | 'movements' | 'scanner' | 'aging' | 'alerts';

export const WarehousePage: React.FC = () => {
    const { t } = useLanguageStore();
    const { addToast } = useUIStore();
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<InventoryItem | null>(null);
    const [activeTab, setActiveTab] = useState<ActiveTab>('inventory');

    const [newItem, setNewItem] = useState({ name: '', type: 'raw', unit: 'kg', quantity: '', minQuantity: '', averageCost: '' });

    const filtered = mockInventory.filter((item) => {
        const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === 'all' || item.type === typeFilter;
        return matchSearch && matchType;
    });

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const statusBadge = (status: InventoryItem['status']) => {
        const map = { in_stock: 'success', low_stock: 'warning', out_of_stock: 'danger' } as const;
        const labels = { in_stock: t('inStock'), low_stock: t('lowStock'), out_of_stock: t('outOfStock') };
        return <Badge variant={map[status]} dot size="sm">{labels[status]}</Badge>;
    };

    const typeBadge = (type: InventoryItem['type']) => {
        const map = { raw: 'info', semi: 'purple', finished: 'success' } as const;
        const labels = { raw: t('raw'), semi: t('semi'), finished: t('finished') };
        return <Badge variant={map[type]} size="sm">{labels[type]}</Badge>;
    };

    const stockMovements = [
        { id: '1', item: "Bug'doy uni", type: 'in', qty: 500, unit: 'kg', date: '2026-02-18', ref: 'PUR-2026-001' },
        { id: '2', item: 'Shakar', type: 'out', qty: 50, unit: 'kg', date: '2026-02-17', ref: 'PROD-002' },
        { id: '3', item: 'Paxta moyi', type: 'out', qty: 25, unit: 'litr', date: '2026-02-16', ref: 'PROD-001' },
        { id: '4', item: 'Makaron', type: 'in', qty: 200, unit: 'kg', date: '2026-02-15', ref: 'PROD-003' },
    ];

    return (
        <div className="space-y-5 animate-fade-in">
            <PageHeader
                title={t('warehouse')}
                subtitle="Inventar va zaxiralarni boshqarish"
                actions={
                    <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
                        {t('addItem')}
                    </Button>
                }
            />

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex-wrap">
                {[
                    { key: 'inventory', label: t('inventory'), icon: Package },
                    { key: 'movements', label: t('stockMovements'), icon: ArrowUpDown },
                    { key: 'scanner', label: 'Barkod Skaner', icon: Camera },
                    { key: 'aging', label: 'Inventar Yoshi', icon: Clock },
                    { key: 'alerts', label: 'Ogohlantirishlar', icon: Bell },
                ].map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key as ActiveTab)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === key
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        <Icon className="w-4 h-4" />{label}
                    </button>
                ))}
            </div>

            {activeTab === 'inventory' && (
                <Card padding={false}>
                    {/* Filters */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-wrap gap-3 items-center">
                        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Mahsulot qidirish..." className="w-64" />
                        <Select
                            options={[
                                { label: 'Barcha turlar', value: 'all' },
                                { label: t('raw'), value: 'raw' },
                                { label: t('semi'), value: 'semi' },
                                { label: t('finished'), value: 'finished' },
                            ]}
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                            className="w-40"
                        />
                        <div className="ml-auto flex gap-2">
                            <Badge variant="success" dot>{mockInventory.filter(i => i.status === 'in_stock').length} omborda</Badge>
                            <Badge variant="warning" dot>{mockInventory.filter(i => i.status === 'low_stock').length} kam</Badge>
                            <Badge variant="danger" dot>{mockInventory.filter(i => i.status === 'out_of_stock').length} yo'q</Badge>
                        </div>
                    </div>

                    <div className="p-4">
                        <Table
                            columns={[
                                { key: 'name', header: t('itemName'), sortable: true, render: (row) => <span className="font-medium text-slate-800 dark:text-white">{row.name}</span> },
                                { key: 'type', header: t('itemType'), sortable: true, render: (row) => typeBadge(row.type) },
                                { key: 'unit', header: t('unit') },
                                {
                                    key: 'quantity', header: t('quantity'), align: 'right', sortable: true, render: (row) => (
                                        <span className={row.quantity === 0 ? 'text-red-600 font-bold' : 'font-medium'}>{row.quantity} {row.unit}</span>
                                    )
                                },
                                { key: 'averageCost', header: t('averageCost'), align: 'right', sortable: true, render: (row) => formatCurrency(row.averageCost) },
                                { key: 'status', header: t('status'), render: (row) => statusBadge(row.status) },
                                {
                                    key: 'actions', header: t('actions'), align: 'right', render: (row) => (
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="sm">{t('edit')}</Button>
                                            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(row)} className="text-red-500 hover:text-red-700 hover:bg-red-50">{t('delete')}</Button>
                                        </div>
                                    )
                                },
                            ]}
                            data={paged}
                            rowKey={(row) => row.id}
                        />
                        <div className="mt-3">
                            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
                        </div>
                    </div>
                </Card>
            )}

            {activeTab === 'movements' && (
                <Card padding={false}>
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('stockMovements')}</h3>
                    </div>
                    <div className="p-4">
                        <Table
                            columns={[
                                { key: 'date', header: t('date') },
                                { key: 'item', header: t('itemName'), render: (row) => <span className="font-medium">{row.item}</span> },
                                {
                                    key: 'type', header: 'Turi', render: (row) => (
                                        <Badge variant={row.type === 'in' ? 'success' : 'danger'} dot size="sm">
                                            {row.type === 'in' ? 'Kirim' : 'Chiqim'}
                                        </Badge>
                                    )
                                },
                                { key: 'qty', header: t('quantity'), align: 'right', render: (row) => `${row.qty} ${row.unit}` },
                                { key: 'ref', header: 'Hujjat', render: (row) => <span className="text-indigo-600 dark:text-indigo-400 font-medium text-xs">{row.ref}</span> },
                            ]}
                            data={stockMovements}
                            rowKey={(row) => row.id}
                        />
                    </div>
                </Card>
            )}

            {activeTab === 'scanner' && <BarcodeScanner />}
            {activeTab === 'aging' && <InventoryAging />}
            {activeTab === 'alerts' && <SmartAlerts />}

            {/* Add Item Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={t('addItem')}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>{t('cancel')}</Button>
                        <Button variant="primary" onClick={() => {
                            if (!newItem.name.trim()) {
                                addToast({ type: 'error', title: 'Xato', message: "Mahsulot nomi kiritilishi shart" });
                                return;
                            }
                            setShowAddModal(false);
                            setNewItem({ name: '', type: 'raw', unit: 'kg', quantity: '', minQuantity: '', averageCost: '' });
                            addToast({ type: 'success', title: 'Mahsulot qo\'shildi', message: `${newItem.name} muvaffaqiyatli qo'shildi` });
                        }}>{t('save')}</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('itemName')}</label>
                        <input value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} placeholder="Mahsulot nomi" className="w-full h-10 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Select label={t('itemType')} value={newItem.type} onChange={e => setNewItem(p => ({ ...p, type: e.target.value }))} options={[{ label: t('raw'), value: 'raw' }, { label: t('semi'), value: 'semi' }, { label: t('finished'), value: 'finished' }]} />
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('unit')}</label>
                            <input value={newItem.unit} onChange={e => setNewItem(p => ({ ...p, unit: e.target.value }))} placeholder="kg, litr, dona..." className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Boshlang'ich miqdor</label>
                            <input type="number" value={newItem.quantity} onChange={e => setNewItem(p => ({ ...p, quantity: e.target.value }))} placeholder="0" className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Min. miqdor (ogohlantirish)</label>
                            <input type="number" value={newItem.minQuantity} onChange={e => setNewItem(p => ({ ...p, minQuantity: e.target.value }))} placeholder="0" className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('averageCost')} (so'm)</label>
                        <input type="number" value={newItem.averageCost} onChange={e => setNewItem(p => ({ ...p, averageCost: e.target.value }))} placeholder="0" className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={() => addToast({ type: 'success', title: "O'chirildi", message: `${confirmDelete?.name} o'chirildi` })}
                title="Mahsulotni o'chirish"
                message={`"${confirmDelete?.name}" mahsulotini o'chirishni tasdiqlaysizmi?`}
            />
        </div>
    );
};
