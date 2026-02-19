import type { InventoryItem, Invoice, Transaction, Company, User } from '../types';

export const mockCompanies: Company[] = [
    { id: '1', name: 'Sarbon Savdo MChJ', industry: 'Savdo', tin: '302145678', currency: 'UZS', country: 'UZ' },
    { id: '2', name: 'Baraka Ishlab Chiqarish', industry: 'Ishlab chiqarish', tin: '302987654', currency: 'UZS', country: 'UZ' },
    { id: '3', name: 'Global Export Group', industry: 'Eksport', tin: '303112233', currency: 'USD', country: 'UZ' },
];

export const mockUser: User = { id: '1', name: 'Alisher Karimov', email: 'alisher@sarbon.uz', role: 'admin' };

// ─── Helpers ─────────────────────────────────────────────────────────────────
const PRODUCTS = [
    "Bug'doy uni (1-nav)", "Shakar", "Osh tuzi", "Paxta moyi", "Non (bug'doy)",
    "Makaron (spaghetti)", "Yarim tayyor xamir", "Qandolat mahsuloti", "Guruch",
    "Mosh", "Loviya", "Kartoshka", "Piyoz", "Sarimsoq", "Sharbat kontsentrati",
    "Mineral suv", "Pechenye", "Tort asosi", "Limon kislotasi", "Kraxmal",
];
const UNITS = ['kg', 'litr', 'dona', 'qop', 'metr', 'litr', 'g'];
const TYPES = ['raw', 'semi', 'finished'] as const;
const STATUSES = ['in_stock', 'low_stock', 'out_of_stock'] as const;
const CLIENTS = [
    'Alisher Umarov', 'Baraka Bozor', 'Mehribon MChJ', 'Sarvar Qodirov', 'Toshkent Ozon',
    'Farrux Salimov', 'Jahon Savdo', 'Nodira Xoliqova', 'Rustam Trading', 'Yangi Hayot',
    'Samarqand Savdo', 'Namangan Shirkat', 'Andijon Market', 'Buxoro Eksport', 'Farg\'ona Tegirmon',
    'Xorazm Ishlab Chiqarish', 'Qashqadaryo Trade', 'Surxondaryo Group', 'Jizzax Partners', 'Sirdaryo Agro',
];
const SUPPLIERS = [
    'Fergana Tegirmoni', 'Sirdaryo Shakar', 'Andijan Moy', 'Namangan Qand', 'Toshkent Flour',
    'Samarqand Agro', 'Buxoro Oils', 'Xorazm Foods', 'Qashqadaryo Grain', 'Jizzax Sugar',
];
const CATEGORIES = ['Savdo', 'Xom ashyo', 'Ish haqi', 'Kommunal', 'Transport', 'Boshqa', 'Investitsiya', 'Soliq'];

const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const isoDate = (daysAgo: number) => {
    const d = new Date(2026, 1, 19);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
};

// ─── Inventory (120 items) ────────────────────────────────────────────────────
export const mockInventory: InventoryItem[] = Array.from({ length: 120 }, (_, i) => {
    const name = PRODUCTS[i % PRODUCTS.length] + (i >= PRODUCTS.length ? ` (${Math.floor(i / PRODUCTS.length) + 1})` : '');
    const qty = rnd(0, 2000);
    const min = rnd(50, 300);
    const status: typeof STATUSES[number] = qty === 0 ? 'out_of_stock' : qty < min ? 'low_stock' : 'in_stock';
    return {
        id: String(i + 1),
        name,
        type: TYPES[i % 3],
        unit: UNITS[i % UNITS.length],
        quantity: qty,
        minQuantity: min,
        averageCost: rnd(500, 25000),
        status,
    };
});

// ─── Sales Invoices (80 items) ────────────────────────────────────────────────
const SALE_STATUSES: Invoice['status'][] = ['paid', 'partial', 'unpaid'];
export const mockSalesInvoices: Invoice[] = Array.from({ length: 80 }, (_, i) => {
    const total = rnd(500000, 50000000);
    const status = SALE_STATUSES[i % 3];
    const paid = status === 'paid' ? total : status === 'partial' ? Math.floor(total * 0.4) : 0;
    const daysAgo = rnd(0, 90);
    return {
        id: String(i + 1),
        number: `INV-2026-${String(i + 1).padStart(3, '0')}`,
        type: 'sale',
        counterparty: CLIENTS[i % CLIENTS.length],
        lines: [],
        total,
        paid,
        status,
        date: isoDate(daysAgo),
        dueDate: isoDate(daysAgo - 30),
    };
});

// ─── Purchase Invoices (50 items) ─────────────────────────────────────────────
export const mockPurchaseInvoices: Invoice[] = Array.from({ length: 50 }, (_, i) => {
    const total = rnd(300000, 30000000);
    const status = SALE_STATUSES[i % 3];
    const paid = status === 'paid' ? total : status === 'partial' ? Math.floor(total * 0.5) : 0;
    const daysAgo = rnd(0, 60);
    return {
        id: String(i + 1),
        number: `PUR-2026-${String(i + 1).padStart(3, '0')}`,
        type: 'purchase',
        counterparty: SUPPLIERS[i % SUPPLIERS.length],
        lines: [],
        total,
        paid,
        status,
        date: isoDate(daysAgo),
        dueDate: isoDate(daysAgo - 30),
    };
});

// ─── Transactions (60 items) ──────────────────────────────────────────────────
let runningBalance = 40000000;
export const mockTransactions: Transaction[] = Array.from({ length: 60 }, (_, i) => {
    const type: 'income' | 'expense' = i % 3 === 2 ? 'expense' : 'income';
    const amount = rnd(200000, 10000000);
    runningBalance = type === 'income' ? runningBalance + amount : runningBalance - amount;
    return {
        id: String(i + 1),
        type,
        amount,
        category: CATEGORIES[i % CATEGORIES.length],
        reference: i % 2 === 0 ? `INV-2026-${String(rnd(1, 80)).padStart(3, '0')}` : undefined,
        date: isoDate(rnd(0, 90)),
        balance: Math.max(0, runningBalance),
    };
});

// ─── Chart Data ───────────────────────────────────────────────────────────────
export const monthlyRevenueData = [
    { month: 'Sen', revenue: 48000000, expenses: 31000000 },
    { month: 'Okt', revenue: 52000000, expenses: 34000000 },
    { month: 'Noy', revenue: 61000000, expenses: 38000000 },
    { month: 'Dek', revenue: 75000000, expenses: 45000000 },
    { month: 'Yan', revenue: 68000000, expenses: 41000000 },
    { month: 'Fev', revenue: 82000000, expenses: 49000000 },
];

export const profitTrendData = [
    { month: 'Sep', profit: 17000000 },
    { month: 'Oct', profit: 18000000 },
    { month: 'Nov', profit: 23000000 },
    { month: 'Dec', profit: 30000000 },
    { month: 'Jan', profit: 27000000 },
    { month: 'Feb', profit: 33000000 },
];

export const expensePieData = [
    { name: 'Xom ashyo', value: 45, color: '#6366f1' },
    { name: 'Ish haqi', value: 25, color: '#8b5cf6' },
    { name: 'Kommunal', value: 10, color: '#06b6d4' },
    { name: 'Transport', value: 8, color: '#10b981' },
    { name: 'Boshqa', value: 12, color: '#f59e0b' },
];

export const topProductsData = [
    { product: 'Non', profit: 12500000 },
    { product: 'Makaron', profit: 9800000 },
    { product: 'Qandolat', profit: 7200000 },
    { product: 'Shakar paketi', profit: 5400000 },
    { product: 'Un (...)', profit: 3900000 },
];
