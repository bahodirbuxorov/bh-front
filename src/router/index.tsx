import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';

// Auth Pages
import { LoginPage } from '../modules/auth/LoginPage';
import { RegisterPage } from '../modules/auth/RegisterPage';
import { SelectCompanyPage } from '../modules/auth/SelectCompanyPage';

// Module Pages
import { DashboardPage } from '../modules/dashboard/DashboardPage';
import { WarehousePage } from '../modules/warehouse/WarehousePage';
import { ProductionPage } from '../modules/production/ProductionPage';
import { SalesPage } from '../modules/sales/SalesPage';
import { PurchasesPage } from '../modules/purchases/PurchasesPage';
import { CashBankPage } from '../modules/cashbank/CashBankPage';
import { ReportsPage } from '../modules/reports/ReportsPage';
import { AnalyticsPage } from '../modules/analytics/AnalyticsPage';
import { SettingsPage } from '../modules/settings/SettingsPage';
import { HelpPage } from '../modules/help/HelpPage';
import { NotFoundPage } from '../modules/notfound/NotFoundPage';

export const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Auth */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/select-company" element={<SelectCompanyPage />} />

                {/* App */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/warehouse/*" element={<WarehousePage />} />
                    <Route path="/production/*" element={<ProductionPage />} />
                    <Route path="/sales/*" element={<SalesPage />} />
                    <Route path="/purchases/*" element={<PurchasesPage />} />
                    <Route path="/cashbank" element={<CashBankPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/settings/*" element={<SettingsPage />} />
                    <Route path="/help" element={<HelpPage />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
};
