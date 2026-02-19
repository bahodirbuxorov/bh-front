/**
 * src/mocks/index.ts
 *
 * All development mock data lives here.
 * UI components import from here (or via the legacy re-export in src/utils/mockData.ts).
 * When the real API is ready, replace these exports with real service calls — zero UI changes needed.
 */
import type { InventoryItem, Invoice, Transaction, Company, User } from '../types';

// ─── Auth mocks ───────────────────────────────────────────────────────────────
export const mockUser: User = {
    id: 'u-1',
    name: 'Alisher Karimov',
    email: 'alisher@sarbon.uz',
    role: 'admin',
};

export const mockCompanies: Company[] = [
    { id: 'c-1', name: 'Sarbon Savdo MChJ', industry: 'Savdo', tin: '302145678', currency: 'UZS', country: 'UZ' },
    { id: 'c-2', name: 'Baraka Ishlab Chiqarish', industry: 'Ishlab chiqarish', tin: '302987654', currency: 'UZS', country: 'UZ' },
    { id: 'c-3', name: 'Global Export Group', industry: 'Eksport', tin: '303112233', currency: 'USD', country: 'UZ' },
];

// ─── Seed helpers (deterministic — no random per render) ──────────────────────
const PRODUCTS = [
    "Bug'doy uni (1-nav)", "Shakar", "Osh tuzi", "Paxta moyi", "Non (bug'doy)",
    "Makaron (spaghetti)", "Yarim tayyor xamir", "Qandolat mahsuloti", "Guruch",
    "Mosh", "Loviya", "Kartoshka", "Piyoz", "Sarimsoq", "Sharbat kontsentrati",
    "Mineral suv", "Pechenye", "Tort asosi", "Limon kislotasi", "Kraxmal",
    "Qovoq", "Tarvuz", "Qovun", "Olma", "Nok", "Uzum", "Shaftoli", "O'rik",
    "Limon", "Anor", "Pomidor", "Bodring", "Qalampir", "Karam", "Sabzi",
    "Lavlagi", "Kichik non", "Kreker", "Chaqaloq ovqati", "Sut kukuni",
];

const UNITS = ['kg', 'litr', 'dona', 'qop', 'metr', 'g', 'tonna'] as const;
const TYPES = ['raw', 'semi', 'finished'] as const;

const CLIENTS = [
    'Alisher Umarov', 'Baraka Bozor', 'Mehribon MChJ', 'Sarvar Qodirov', 'Toshkent Ozon',
    'Farrux Salimov', 'Jahon Savdo', 'Nodira Xoliqova', 'Rustam Trading', 'Yangi Hayot',
    'Samarqand Savdo', 'Namangan Shirkat', 'Andijon Market', 'Buxoro Eksport', "Farg'ona Tegirmon",
    'Xorazm Ish. Chiq.', 'Qashqadaryo Trade', 'Surxondaryo Group', 'Jizzax Partners', 'Sirdaryo Agro',
    'Toshkent Sut', 'Nukus Shirkat', 'Termiz Dehqon', 'Urganch Agro', 'Guliston Foods',
    'Qarshi Savdo', 'Navoi Metals', 'Fergana Valley Co.', 'Zarafshon MChJ', 'Amudaryo Trade',
];
const SUPPLIERS = [
    'Fergana Tegirmoni', 'Sirdaryo Shakar', 'Andijan Moy', 'Namangan Qand', 'Toshkent Flour',
    'Samarqand Agro', 'Buxoro Oils', 'Xorazm Foods', 'Qashqadaryo Grain', 'Jizzax Sugar',
    'Toshkent Kimyo', 'Angren Coal', 'Almaliq Metals', 'Chirchiq Chem', 'Bekabad Steel',
];
const CATEGORIES = ['Savdo', 'Xom ashyo', 'Ish haqi', 'Kommunal', 'Transport', 'Boshqa', 'Investitsiya', 'Soliq'];

/** Deterministic pseudo-random — avoids hydration mismatch on re-import */
const seed = (n: number) => {
    let x = Math.sin(n + 1) * 10000;
    return x - Math.floor(x);
};
const rnd = (min: number, max: number, i: number) => Math.floor(seed(i) * (max - min + 1)) + min;

const isoDate = (daysAgo: number): string => {
    const d = new Date(2026, 1, 19);   // 19 Feb 2026
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
};

// ─── Inventory (500 items) ───────────────────────────────────────────────────
export const mockInventory: InventoryItem[] = Array.from({ length: 500 }, (_, i) => {
    const base = PRODUCTS[i % PRODUCTS.length];
    const name = i < PRODUCTS.length ? base : `${base} (${Math.floor(i / PRODUCTS.length) + 1})`;
    const qty = rnd(0, 3000, i * 7);
    const min = rnd(50, 400, i * 7 + 1);
    const status: InventoryItem['status'] =
        qty === 0 ? 'out_of_stock' : qty < min ? 'low_stock' : 'in_stock';
    return {
        id: `inv-${i + 1}`,
        name,
        type: TYPES[i % 3],
        unit: UNITS[i % UNITS.length],
        quantity: qty,
        minQuantity: min,
        averageCost: rnd(500, 30000, i * 7 + 2),
        status,
        createdAt: isoDate(rnd(30, 365, i * 7 + 3)),
    };
});

// ─── Sales Invoices (300 items) ───────────────────────────────────────────────
const INV_STATUSES: Invoice['status'][] = ['paid', 'partial', 'unpaid'];

export const mockSalesInvoices: Invoice[] = Array.from({ length: 300 }, (_, i) => {
    const total = rnd(500_000, 80_000_000, i * 11);
    const status = INV_STATUSES[i % 3];
    const paid = status === 'paid' ? total : status === 'partial' ? Math.floor(total * 0.4) : 0;
    const daysAgo = rnd(0, 180, i * 11 + 1);
    return {
        id: `sale-${i + 1}`,
        number: `INV-2026-${String(i + 1).padStart(4, '0')}`,
        type: 'sale',
        counterparty: CLIENTS[i % CLIENTS.length],
        counterpartyId: `cust-${(i % CLIENTS.length) + 1}`,
        lines: [],
        total,
        paid,
        status,
        date: isoDate(daysAgo),
        dueDate: isoDate(Math.max(0, daysAgo - 30)),
        createdAt: isoDate(daysAgo),
    };
});

// ─── Purchase Invoices (200 items) ────────────────────────────────────────────
export const mockPurchaseInvoices: Invoice[] = Array.from({ length: 200 }, (_, i) => {
    const total = rnd(300_000, 50_000_000, i * 13);
    const status = INV_STATUSES[i % 3];
    const paid = status === 'paid' ? total : status === 'partial' ? Math.floor(total * 0.5) : 0;
    const daysAgo = rnd(0, 120, i * 13 + 1);
    return {
        id: `pur-${i + 1}`,
        number: `PUR-2026-${String(i + 1).padStart(4, '0')}`,
        type: 'purchase',
        counterparty: SUPPLIERS[i % SUPPLIERS.length],
        counterpartyId: `supp-${(i % SUPPLIERS.length) + 1}`,
        lines: [],
        total,
        paid,
        status,
        date: isoDate(daysAgo),
        dueDate: isoDate(Math.max(0, daysAgo - 30)),
        createdAt: isoDate(daysAgo),
    };
});

// ─── Cash transactions (120 items) ────────────────────────────────────────────
export const mockTransactions: Transaction[] = (() => {
    let balance = 40_000_000;
    return Array.from({ length: 120 }, (_, i) => {
        const type: Transaction['type'] = i % 3 === 2 ? 'expense' : 'income';
        const amount = rnd(200_000, 12_000_000, i * 17);
        balance = type === 'income' ? balance + amount : balance - amount;
        return {
            id: `txn-${i + 1}`,
            type,
            amount,
            category: CATEGORIES[i % CATEGORIES.length],
            reference: i % 2 === 0 ? `INV-2026-${String(rnd(1, 300, i * 17)).padStart(4, '0')}` : undefined,
            date: isoDate(rnd(0, 120, i * 17 + 1)),
            balance: Math.max(0, balance),
            accountId: i % 2 === 0 ? 'acc-checking' : 'acc-savings',
        };
    });
})();

// ─── Chart / Dashboard Data ───────────────────────────────────────────────────
export const monthlyRevenueData = [
    { month: 'Sen', revenue: 48_000_000, expenses: 31_000_000 },
    { month: 'Okt', revenue: 52_000_000, expenses: 34_000_000 },
    { month: 'Noy', revenue: 61_000_000, expenses: 38_000_000 },
    { month: 'Dek', revenue: 75_000_000, expenses: 45_000_000 },
    { month: 'Yan', revenue: 68_000_000, expenses: 41_000_000 },
    { month: 'Fev', revenue: 82_000_000, expenses: 49_000_000 },
];

export const profitTrendData = [
    { month: 'Sep', profit: 17_000_000 },
    { month: 'Oct', profit: 18_000_000 },
    { month: 'Nov', profit: 23_000_000 },
    { month: 'Dec', profit: 30_000_000 },
    { month: 'Jan', profit: 27_000_000 },
    { month: 'Feb', profit: 33_000_000 },
];

export const expensePieData = [
    { name: 'Xom ashyo', value: 45, color: '#6366f1' },
    { name: 'Ish haqi', value: 25, color: '#8b5cf6' },
    { name: 'Kommunal', value: 10, color: '#06b6d4' },
    { name: 'Transport', value: 8, color: '#10b981' },
    { name: 'Boshqa', value: 12, color: '#f59e0b' },
];

export const topProductsData = [
    { product: 'Non', profit: 12_500_000 },
    { product: 'Makaron', profit: 9_800_000 },
    { product: 'Qandolat', profit: 7_200_000 },
    { product: 'Shakar paketi', profit: 5_400_000 },
    { product: 'Un (...)', profit: 3_900_000 },
];
