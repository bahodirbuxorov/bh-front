import React, { useState, useMemo } from 'react';
import { Download, Sliders, Eye } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Pagination } from '../../components/ui/Table';
import { formatCurrency, formatDate } from '../../utils';
import { exportTableToPDF, exportTableToExcel } from '../../lib/pdfExport';
import { mockSalesInvoices, mockPurchaseInvoices, mockInventory, mockTransactions } from '../../mocks';
import { useCompanyStore } from '../../store/authStore';

type DataSource = 'sales' | 'purchases' | 'inventory' | 'transactions';

interface ColumnDef {
    key: string;
    label: string;
    isNumber?: boolean;
    render?: (row: Record<string, unknown>) => string;
}

const SOURCES: { id: DataSource; label: string; icon: string }[] = [
    { id: 'sales', label: 'Savdo', icon: '🛒' },
    { id: 'purchases', label: 'Xaridlar', icon: '📦' },
    { id: 'inventory', label: 'Inventar', icon: '🏪' },
    { id: 'transactions', label: 'Tranzaksiyalar', icon: '💳' },
];

const ALL_COLUMNS: Record<DataSource, ColumnDef[]> = {
    sales: [
        { key: 'number', label: 'Faktura №' },
        { key: 'counterparty', label: 'Mijoz' },
        { key: 'date', label: 'Sana', render: r => formatDate(r.date as string) },
        { key: 'dueDate', label: 'Muddat', render: r => formatDate(r.dueDate as string) },
        { key: 'total', label: 'Jami', isNumber: true, render: r => formatCurrency(r.total as number) },
        { key: 'paid', label: "To'langan", isNumber: true, render: r => formatCurrency(r.paid as number) },
        { key: 'status', label: 'Holat', render: r => ({ paid: "To'langan", partial: 'Qisman', unpaid: "To'lanmagan" }[r.status as string] ?? (r.status as string)) },
    ],
    purchases: [
        { key: 'number', label: 'Faktura №' },
        { key: 'counterparty', label: 'Yetkazib beruvchi' },
        { key: 'date', label: 'Sana', render: r => formatDate(r.date as string) },
        { key: 'total', label: 'Jami', isNumber: true, render: r => formatCurrency(r.total as number) },
        { key: 'paid', label: "To'langan", isNumber: true, render: r => formatCurrency(r.paid as number) },
        { key: 'status', label: 'Holat', render: r => ({ paid: "To'langan", partial: 'Qisman', unpaid: "To'lanmagan" }[r.status as string] ?? (r.status as string)) },
    ],
    inventory: [
        { key: 'name', label: 'Mahsulot nomi' },
        { key: 'type', label: 'Turi', render: r => ({ raw: 'Xom ashyo', semi: 'Yarim tayyor', finished: 'Tayyor' }[r.type as string] ?? (r.type as string)) },
        { key: 'unit', label: "O'lchov birligi" },
        { key: 'quantity', label: 'Miqdor', isNumber: true, render: r => `${r.quantity} ${r.unit}` },
        { key: 'averageCost', label: "O'rtacha narx", isNumber: true, render: r => formatCurrency(r.averageCost as number) },
        { key: 'status', label: 'Holat', render: r => ({ in_stock: 'Omborda', low_stock: 'Kam', out_of_stock: "Yo'q" }[r.status as string] ?? '') },
    ],
    transactions: [
        { key: 'date', label: 'Sana', render: r => formatDate(r.date as string) },
        { key: 'type', label: 'Turi', render: r => r.type === 'income' ? 'Kirim' : 'Chiqim' },
        { key: 'category', label: 'Kategoriya' },
        { key: 'amount', label: 'Summa', isNumber: true, render: r => formatCurrency(r.amount as number) },
        { key: 'reference', label: 'Referens', render: r => (r.reference as string) ?? '—' },
        { key: 'balance', label: 'Balans', isNumber: true, render: r => formatCurrency((r.balance as number) ?? 0) },
    ],
};

const SOURCE_DATA: Record<DataSource, Record<string, unknown>[]> = {
    sales: mockSalesInvoices as unknown as Record<string, unknown>[],
    purchases: mockPurchaseInvoices as unknown as Record<string, unknown>[],
    inventory: mockInventory as unknown as Record<string, unknown>[],
    transactions: mockTransactions as unknown as Record<string, unknown>[],
};

const PAGE_SIZE = 10;

export const ReportBuilder: React.FC = () => {
    const { activeCompany } = useCompanyStore();
    const [source, setSource] = useState<DataSource>('sales');
    const [selectedKeys, setSelectedKeys] = useState<string[]>(['number', 'counterparty', 'date', 'total', 'status']);
    const [dateFrom, setDateFrom] = useState('2026-01-01');
    const [dateTo, setDateTo] = useState('2026-02-28');
    const [page, setPage] = useState(1);

    const availableCols = ALL_COLUMNS[source];

    const toggleKey = (key: string) => {
        setSelectedKeys(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
        setPage(1);
    };

    const handleSourceChange = (s: DataSource) => {
        setSource(s);
        setSelectedKeys(ALL_COLUMNS[s].slice(0, 5).map(c => c.key));
        setPage(1);
    };

    const filtered = useMemo(() => {
        let rows = SOURCE_DATA[source];
        if (source === 'sales' || source === 'purchases' || source === 'transactions') {
            rows = rows.filter(r => {
                const d = r.date as string;
                return d >= dateFrom && d <= dateTo;
            });
        }
        return rows;
    }, [source, dateFrom, dateTo]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const activeCols = availableCols.filter(c => selectedKeys.includes(c.key));

    const tableColumns = activeCols.map(c => ({
        key: c.key,
        header: c.label,
        align: c.isNumber ? 'right' as const : 'left' as const,
        render: c.render ? (row: Record<string, unknown>) => <span>{c.render!(row)}</span> : undefined,
    }));

    const company = { name: activeCompany?.name ?? 'Mini Buxgalter', tin: activeCompany?.tin };
    const title = `${SOURCES.find(s => s.id === source)?.label ?? ''} Hisoboti — ${dateFrom} / ${dateTo}`;

    const handlePDF = () => exportTableToPDF(
        title,
        activeCols.map(c => ({ header: c.label, dataKey: c.key, isNumber: c.isNumber })),
        pageRows.map(row => {
            const out: Record<string, unknown> = {};
            activeCols.forEach(c => { out[c.key] = c.render ? c.render(row) : row[c.key]; });
            return out;
        }),
        company,
        `hisobot_${source}`
    );

    const handleExcel = () => exportTableToExcel(
        title,
        activeCols.map(c => ({ header: c.label, dataKey: c.key })),
        pageRows.map(row => {
            const out: Record<string, unknown> = {};
            activeCols.forEach(c => { out[c.key] = c.render ? c.render(row) : row[c.key]; });
            return out;
        }),
        `hisobot_${source}`
    );

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Data source */}
            <Card>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5" /> Ma'lumot manbai
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SOURCES.map(s => (
                        <button key={s.id} onClick={() => handleSourceChange(s.id)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all text-left ${source === s.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                            <span className="text-lg">{s.icon}</span>{s.label}
                        </button>
                    ))}
                </div>
            </Card>

            {/* Filters & Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date range */}
                {(source !== 'inventory') && (
                    <Card>
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Sana oralig'i</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Dan</label>
                                <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                                    className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Gacha</label>
                                <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
                                    className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        </div>
                    </Card>
                )}

                {/* Column selector */}
                <Card className={source === 'inventory' ? 'md:col-span-2' : ''}>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Ko'rsatiladigan ustunlar</h3>
                    <div className="flex flex-wrap gap-2">
                        {availableCols.map(c => (
                            <button key={c.key} onClick={() => toggleKey(c.key)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${selectedKeys.includes(c.key) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-400'}`}>
                                {c.label}
                            </button>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Preview */}
            <Card padding={false}>
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">Ko'rinish</span>
                        <Badge variant="default">{filtered.length} ta</Badge>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={handleExcel}>Excel</Button>
                        <Button variant="primary" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={handlePDF}>PDF</Button>
                    </div>
                </div>
                <Table
                    columns={tableColumns}
                    data={pageRows}
                    rowKey={row => (row.id as string) ?? String(Math.random())}
                    emptyMessage="Tanlangan filtrlar bo'yicha ma'lumot yo'q"
                />
                <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700">
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
                </div>
            </Card>
        </div>
    );
};
