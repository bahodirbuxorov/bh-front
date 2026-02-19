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
    tin?: string; // Tax Identification Number
    currency: string;
    country: string;
}

export interface InventoryItem {
    id: string;
    name: string;
    type: 'raw' | 'semi' | 'finished';
    unit: string;
    quantity: number;
    minQuantity: number;
    averageCost: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface StockMovement {
    id: string;
    itemId: string;
    itemName: string;
    type: 'in' | 'out';
    quantity: number;
    date: string;
    reference: string;
}

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

export interface ProductionOrder {
    id: string;
    bomId: string;
    productName: string;
    quantity: number;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    startDate: string;
    endDate?: string;
}

export interface InvoiceLine {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
}

export interface Invoice {
    id: string;
    number: string;
    type: 'sale' | 'purchase';
    counterparty: string; // customer or supplier
    lines: InvoiceLine[];
    total: number;
    paid: number;
    status: 'paid' | 'partial' | 'unpaid';
    date: string;
    dueDate: string;
}

export interface Transaction {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    reference?: string;
    date: string;
    note?: string;
    balance?: number;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    read: boolean;
    date: string;
}
