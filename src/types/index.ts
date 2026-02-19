// ─── Auth / User ──────────────────────────────────────────────────────────────
export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'accountant' | 'sales' | 'warehouse' | 'production' | 'manager';
}

export interface Company {
    id: string;
    name: string;
    logo?: string;
    industry?: string;
    tin?: string; // Tax Identification Number (INN)
    currency: string;
    country: string;
}

// ─── API Envelope ─────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface ApiError {
    status: number;         // HTTP status code: 400, 401, 403, 404, 422, 500
    code: string;           // machine-readable: "VALIDATION_ERROR", "UNAUTHORIZED" …
    message: string;        // human-readable
    details?: Record<string, string[]>; // field-level validation errors
}

export type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: ApiError };

// ─── Utility ──────────────────────────────────────────────────────────────────
export type SortOrder = 'asc' | 'desc';

export interface SortState {
    key: string;
    order: SortOrder;
}

export interface FilterParams {
    search?: string;
    status?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
}

// ─── Inventory ────────────────────────────────────────────────────────────────
export interface InventoryItem {
    id: string;
    name: string;
    type: 'raw' | 'semi' | 'finished';
    unit: string;
    quantity: number;
    minQuantity: number;
    averageCost: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
    /** ISO timestamp — set by server */
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateInventoryPayload {
    name: string;
    type: InventoryItem['type'];
    unit: string;
    quantity: number;
    minQuantity: number;
    averageCost: number;
}

export interface UpdateInventoryPayload extends Partial<CreateInventoryPayload> {
    id: string;
}

// ─── Stock Movements ──────────────────────────────────────────────────────────
export interface StockMovement {
    id: string;
    itemId: string;
    itemName: string;
    type: 'in' | 'out';
    quantity: number;
    date: string;
    reference: string;
}

// ─── Bill of Materials (BOM) ─────────────────────────────────────────────────
export interface BOMItem {
    rawMaterialId: string;
    rawMaterialName: string;
    quantity: number;
    unit: string;
    cost: number;
}

export interface BOM {
    id: string;
    finishedProductId: string;
    finishedProductName: string;
    batchSize: number;
    materials: BOMItem[];
    additionalCosts: number;
    totalCost: number;
    unitCost: number;
}

// ─── Production ───────────────────────────────────────────────────────────────
export interface ProductionOrder {
    id: string;
    bomId: string;
    productName: string;
    quantity: number;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    startDate: string;
    endDate?: string;
}

// ─── Invoice / Sales / Purchases ──────────────────────────────────────────────
export interface InvoiceLine {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;   // renamed from 'price' for API clarity
    discount?: number;   // percentage 0-100, default 0
    total: number;       // quantity * unitPrice * (1 - discount/100)
}

/** Legacy alias kept for backward compat with existing page code */
export type InvoiceItem = InvoiceLine;

export interface Invoice {
    id: string;
    number: string;
    type: 'sale' | 'purchase';
    /** Free-text name — used in mock; API will use counterpartyId */
    counterparty: string;
    counterpartyId?: string;
    lines: InvoiceLine[];
    total: number;
    paid: number;
    discount?: number;
    tax?: number;
    status: 'paid' | 'partial' | 'unpaid';
    date: string;      // ISO date
    dueDate: string;   // ISO date
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateInvoicePayload {
    type: Invoice['type'];
    counterpartyId: string;
    lines: Array<{
        productId: string;
        quantity: number;
        unitPrice: number;
        discount?: number;
    }>;
    date: string;
    dueDate: string;
    status?: Invoice['status'];
}

// ─── Cash & Bank / Transactions ───────────────────────────────────────────────
export interface Transaction {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    reference?: string;
    date: string;
    note?: string;
    balance?: number;
    accountId?: string;
}

export interface CreateTransactionPayload {
    type: Transaction['type'];
    amount: number;
    category: string;
    reference?: string;
    date: string;
    note?: string;
    accountId: string;
}

// ─── Notifications ───────────────────────────────────────────────────────────
export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    read: boolean;
    date: string;
}
