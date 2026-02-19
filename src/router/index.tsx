import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

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
            <ErrorBoundary>
                <Routes>
                    {/* Auth */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/select-company" element={<SelectCompanyPage />} />

                    {/* App — each page wrapped in its own ErrorBoundary so one crash doesn't kill the whole shell */}
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
                        <Route path="/warehouse/*" element={<ErrorBoundary><WarehousePage /></ErrorBoundary>} />
                        <Route path="/production/*" element={<ErrorBoundary><ProductionPage /></ErrorBoundary>} />
                        <Route path="/sales/*" element={<ErrorBoundary><SalesPage /></ErrorBoundary>} />
                        <Route path="/purchases/*" element={<ErrorBoundary><PurchasesPage /></ErrorBoundary>} />
                        <Route path="/cashbank" element={<ErrorBoundary><CashBankPage /></ErrorBoundary>} />
                        <Route path="/reports" element={<ErrorBoundary><ReportsPage /></ErrorBoundary>} />
                        <Route path="/analytics" element={<ErrorBoundary><AnalyticsPage /></ErrorBoundary>} />
                        <Route path="/settings/*" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
                        <Route path="/help" element={<ErrorBoundary><HelpPage /></ErrorBoundary>} />
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </ErrorBoundary>
        </BrowserRouter>
    );
};
