import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar, Header } from './SidebarHeader';
import { ToastContainer } from '../ui/Toast';
import { useAuthStore } from '../../store/authStore';

export const MainLayout: React.FC = () => {
    const { isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 lg:p-6 animate-fade-in">
                    <Outlet />
                </main>
            </div>
            <ToastContainer />
        </div>
    );
};
