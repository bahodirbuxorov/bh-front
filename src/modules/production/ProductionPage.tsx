import React, { useState } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { PageHeader } from '../../components/ui/Misc';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { useLanguageStore } from '../../store/languageStore';
import { useUIStore } from '../../store/uiStore';
import { mockInventory } from '../../utils/mockData';
import { formatCurrency } from '../../utils';
import { WIPTracker } from './tabs/WIPTracker';
import { QCChecklist } from './tabs/QCChecklist';
import { GanttChart } from './tabs/GanttChart';

interface BOMRow { rawMaterialId: string; name: string; qty: number; unit: string; cost: number; }

const mockOrders = [
    { id: '1', product: "Non (bug'doy)", qty: 200, status: 'completed' as const, date: '2026-02-15', totalCost: 560000 },
    { id: '2', product: 'Makaron (spaghetti)', qty: 100, status: 'in_progress' as const, date: '2026-02-18', totalCost: 390000 },
    { id: '3', product: 'Qandolat mahsuloti', qty: 500, status: 'pending' as const, date: '2026-02-19', totalCost: 1200000 },
];

export const ProductionPage: React.FC = () => {
    const { t } = useLanguageStore();
    const { addToast } = useUIStore();
    const [activeTab, setActiveTab] = useState<'bom' | 'orders' | 'wip' | 'qc' | 'gantt'>('bom');
    const [bomRows, setBomRows] = useState<BOMRow[]>([
        { rawMaterialId: '1', name: "Bug'doy uni", qty: 10, unit: 'kg', cost: 48000 },
        { rawMaterialId: '3', name: 'Osh tuzi', qty: 0.2, unit: 'kg', cost: 240 },
    ]);
    const [additionalCosts, setAdditionalCosts] = useState(5000);
    const [batchSize, setBatchSize] = useState(50);
    const [selectedProduct, setSelectedProduct] = useState('Non (bug\'doy)');
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderQty, setOrderQty] = useState(100);

    const finishedProducts = mockInventory.filter(i => i.type === 'finished');
    const rawMaterials = mockInventory.filter(i => i.type === 'raw' || i.type === 'semi');

    const totalMaterialCost = bomRows.reduce((sum, r) => sum + r.qty * r.cost, 0) * (batchSize / 10);
    const totalCost = totalMaterialCost + additionalCosts;
    const unitCost = batchSize > 0 ? totalCost / batchSize : 0;

    const addRow = () => setBomRows(prev => [...prev, { rawMaterialId: '', name: '', qty: 1, unit: 'kg', cost: 0 }]);
    const removeRow = (idx: number) => setBomRows(prev => prev.filter((_, i) => i !== idx));
    const updateRow = (idx: number, field: keyof BOMRow, value: string | number) => {
        setBomRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    };

    const statusBadge = (s: 'completed' | 'in_progress' | 'pending' | 'cancelled') => {
        const map = { completed: 'success', in_progress: 'info', pending: 'warning', cancelled: 'danger' } as const;
        const labels = { completed: 'Bajarildi', in_progress: 'Jarayonda', pending: 'Kutilmoqda', cancelled: 'Bekor qilindi' };
        return <Badge variant={map[s]} dot size="sm">{labels[s]}</Badge>;
    };

    return (
        <div className="space-y-5 animate-fade-in">
            <PageHeader
                title={t('production')}
                subtitle="Ishlab chiqarish va BOM boshqaruvi"
                actions={
                    activeTab === 'orders' && (
                        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setShowOrderModal(true)}>
                            Buyurtma yaratish
                        </Button>
                    )
                }
            />

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex-wrap">
                {[
                    { key: 'bom', label: t('bom') },
                    { key: 'orders', label: t('productionOrders') },
                    { key: 'wip', label: 'WIP Tracker' },
                    { key: 'qc', label: 'Sifat Tekshiruvi' },
                    { key: 'gantt', label: 'Gantt Jadvali' },
                ].map(({ key, label }) => (
                    <button key={key} onClick={() => setActiveTab(key as typeof activeTab)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === key ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 'bom' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 space-y-4">
                        <Card>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">BOM sozlamalari</h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Tayyor mahsulot</label>
                                    <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        {finishedProducts.map(p => <option key={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Partiya hajmi (dona)</label>
                                    <input type="number" value={batchSize} onChange={e => setBatchSize(Number(e.target.value))} className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>

                            <div className="space-y-2 mb-3">
                                <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-1">
                                    <span className="col-span-4">Xom ashyo</span>
                                    <span className="col-span-2">Miqdor</span>
                                    <span className="col-span-2">Birlik</span>
                                    <span className="col-span-3">Narx/birlik</span>
                                    <span className="col-span-1" />
                                </div>
                                {bomRows.map((row, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
                                        <select className="col-span-4 h-8 px-2 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            value={row.name} onChange={e => { const mat = rawMaterials.find(m => m.name === e.target.value); updateRow(idx, 'name', e.target.value); if (mat) { updateRow(idx, 'cost', mat.averageCost); updateRow(idx, 'unit', mat.unit); } }}>
                                            <option value="">Tanlang</option>
                                            {rawMaterials.map(m => <option key={m.id}>{m.name}</option>)}
                                        </select>
                                        <input type="number" value={row.qty} onChange={e => updateRow(idx, 'qty', Number(e.target.value))} className="col-span-2 h-8 px-2 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                        <input value={row.unit} onChange={e => updateRow(idx, 'unit', e.target.value)} className="col-span-2 h-8 px-2 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                        <input type="number" value={row.cost} onChange={e => updateRow(idx, 'cost', Number(e.target.value))} className="col-span-3 h-8 px-2 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                        <button onClick={() => removeRow(idx)} className="col-span-1 flex justify-center text-red-400 hover:text-red-600 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={addRow} icon={<Plus className="w-3 h-3" />}>Qator qo'shish</Button>
                            </div>

                            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Qo'shimcha xarajatlar:</label>
                                <input type="number" value={additionalCosts} onChange={e => setAdditionalCosts(Number(e.target.value))} className="w-36 h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                <span className="text-sm text-slate-500">so'm</span>
                            </div>
                        </Card>
                    </div>

                    {/* Cost Summary */}
                    <div>
                        <Card className="sticky top-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                                    <Calculator className="w-4 h-4 text-indigo-600" />
                                </div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Narx hisob-kitobi</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Partiya hajmi</span>
                                    <span className="font-medium text-slate-800 dark:text-white">{batchSize} dona</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Material xarajatlari</span>
                                    <span className="font-medium">{formatCurrency(totalMaterialCost)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Qo'shimcha xarajatlar</span>
                                    <span className="font-medium">{formatCurrency(additionalCosts)}</span>
                                </div>
                                <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('totalCost')}</span>
                                        <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(totalCost)}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('unitCost')}</span>
                                        <span className="text-base font-bold text-slate-900 dark:text-white">{formatCurrency(unitCost)}</span>
                                    </div>
                                </div>
                            </div>
                            <Button variant="primary" className="w-full mt-4" onClick={() => setShowOrderModal(true)}>
                                Buyurtma yaratish
                            </Button>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <Card padding={false}>
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('productionOrders')}</h3>
                    </div>
                    <div className="p-4">
                        <Table
                            columns={[
                                { key: 'id', header: '№', render: (row) => <span className="text-indigo-600 dark:text-indigo-400 font-medium">PROD-{row.id}</span> },
                                { key: 'product', header: 'Mahsulot', render: (row) => <span className="font-medium">{row.product}</span> },
                                { key: 'qty', header: 'Miqdor', align: 'right', render: (row) => `${row.qty} dona` },
                                { key: 'totalCost', header: 'Jami narx', align: 'right', render: (row) => formatCurrency(row.totalCost) },
                                { key: 'date', header: t('date') },
                                { key: 'status', header: t('status'), render: (row) => statusBadge(row.status) },
                            ]}
                            data={mockOrders}
                            rowKey={(r) => r.id}
                        />
                    </div>
                </Card>
            )}

            {activeTab === 'wip' && <WIPTracker />}
            {activeTab === 'qc' && <QCChecklist />}
            {activeTab === 'gantt' && <GanttChart />}

            <Modal isOpen={showOrderModal} onClose={() => setShowOrderModal(false)} title="Ishlab chiqarish buyurtmasi"
                footer={<>
                    <Button variant="secondary" onClick={() => setShowOrderModal(false)}>{t('cancel')}</Button>
                    <Button variant="primary" onClick={() => { setShowOrderModal(false); addToast({ type: 'success', title: 'Buyurtma yaratildi', message: `${selectedProduct} uchun buyurtma yaratildi` }); }}>{t('confirm')}</Button>
                </>}>
                <div className="space-y-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-3">
                        <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">{selectedProduct}</p>
                        <p className="text-xs text-indigo-500 mt-0.5">Birlik narxi: {formatCurrency(unitCost)}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ishlab chiqarish miqdori (dona)</label>
                        <input type="number" value={orderQty} onChange={e => setOrderQty(Number(e.target.value))} className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Xom ashyo sarfi:</span>
                            <span className="font-medium">{bomRows.map(r => `${(r.qty * orderQty / batchSize).toFixed(1)} ${r.unit} ${r.name}`).join(', ')}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold">
                            <span className="text-slate-700 dark:text-slate-200">Jami xarajat:</span>
                            <span className="text-indigo-600">{formatCurrency(unitCost * orderQty)}</span>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
