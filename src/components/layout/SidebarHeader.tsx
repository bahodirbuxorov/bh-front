import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Factory,
    ShoppingCart,
    Truck,
    Wallet,
    FileBarChart,
    TrendingUp,
    Settings,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
    Building2,
    LogOut,
    Bell,
    Sun,
    Moon,
    Globe,
    Check,
    Menu,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore, useCompanyStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import type { Language } from '../../i18n';
import { cn } from '../../utils';
import { Avatar } from '../ui/Misc';

const navItems = [
    { path: '/dashboard', label: 'dashboard', icon: LayoutDashboard },
    { path: '/warehouse', label: 'warehouse', icon: Package },
    { path: '/production', label: 'production', icon: Factory },
    { path: '/sales', label: 'sales', icon: ShoppingCart },
    { path: '/purchases', label: 'purchases', icon: Truck },
    { path: '/cashbank', label: 'cashBank', icon: Wallet },
    { path: '/reports', label: 'reports', icon: FileBarChart },
    { path: '/analytics', label: 'analytics', icon: TrendingUp },
];

const bottomItems = [
    { path: '/settings', label: 'settings', icon: Settings },
    { path: '/help', label: 'help', icon: HelpCircle },
];

type NavKey = keyof typeof import('../../i18n').translations.uz;

export const Sidebar: React.FC = () => {
    const { sidebarCollapsed, toggleSidebar, setMobileSidebarOpen, mobileSidebarOpen } = useUIStore();
    const { t } = useLanguageStore();
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => location.pathname.startsWith(path);

    const NavItem = ({ path, label, icon: Icon }: { path: string; label: NavKey; icon: React.ElementType }) => (
        <button
            onClick={() => {
                navigate(path);
                setMobileSidebarOpen(false);
            }}
            className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative',
                isActive(path)
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
            )}
            title={sidebarCollapsed ? t(label) : undefined}
        >
            {isActive(path) && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 rounded-r-full" />
            )}
            <Icon className={cn('w-5 h-5 shrink-0 transition-colors', isActive(path) ? 'text-indigo-600 dark:text-indigo-400' : '')} />
            {!sidebarCollapsed && <span className="truncate">{t(label)}</span>}
        </button>
    );

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-slate-200 dark:border-slate-700', sidebarCollapsed && 'justify-center')}>
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-white" />
                </div>
                {!sidebarCollapsed && (
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Mini Buxgalter</p>
                        <p className="text-xs text-slate-400 truncate">ERP Tizimi</p>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavItem key={item.path} path={item.path} label={item.label as NavKey} icon={item.icon} />
                ))}
            </nav>

            {/* Bottom */}
            <div className="px-3 py-3 border-t border-slate-200 dark:border-slate-700 space-y-1">
                {bottomItems.map((item) => (
                    <NavItem key={item.path} path={item.path} label={item.label as NavKey} icon={item.icon} />
                ))}
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    'hidden lg:flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex-shrink-0 transition-sidebar relative',
                    sidebarCollapsed ? 'w-[68px]' : 'w-60'
                )}
            >
                <SidebarContent />
                {/* Collapse button */}
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-colors shadow-sm z-10"
                >
                    {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                </button>
            </aside>

            {/* Mobile Drawer */}
            {mobileSidebarOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                        onClick={() => setMobileSidebarOpen(false)}
                    />
                    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-2xl lg:hidden flex flex-col animate-slide-in">
                        <SidebarContent />
                    </aside>
                </>
            )}
        </>
    );
};

export const Header: React.FC = () => {
    const { companies, activeCompany, setActiveCompany } = useCompanyStore();
    const { user, logout } = useAuthStore();
    const { isDark, toggleTheme } = useThemeStore();
    const { notifications, markNotificationRead } = useUIStore();
    const { language, setLanguage, t } = useLanguageStore();
    const { setMobileSidebarOpen } = useUIStore();
    const navigate = useNavigate();

    const [showCompanyMenu, setShowCompanyMenu] = useState(false);
    const [showNotifs, setShowNotifs] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const languages: { code: Language; label: string; flag: string }[] = [
        { code: 'uz', label: "O'zbek", flag: '🇺🇿' },
        { code: 'ru', label: 'Русский', flag: '🇷🇺' },
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'kk', label: "Qaraqalpaq", flag: '' },
    ];

    return (
        <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 gap-3 shrink-0">
            {/* Mobile menu button */}
            <button
                className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setMobileSidebarOpen(true)}
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Company switcher */}
            <div className="relative">
                <button
                    onClick={() => setShowCompanyMenu(!showCompanyMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200 max-w-48"
                >
                    <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">{activeCompany?.name?.[0] || 'S'}</span>
                    </div>
                    <span className="truncate">{activeCompany?.name || 'Kompaniya tanlang'}</span>
                    <ChevronRight className="w-3 h-3 rotate-90 shrink-0 text-slate-400" />
                </button>
                {showCompanyMenu && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 py-1.5 animate-fade-in">
                        <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Kompaniyalar</p>
                        {companies.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => { setActiveCompany(c); setShowCompanyMenu(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm text-left"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                                    <span className="text-white text-xs font-bold">{c.name[0]}</span>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-white text-sm truncate">{c.name}</p>
                                    <p className="text-xs text-slate-400">{c.industry}</p>
                                </div>
                                {activeCompany?.id === c.id && <Check className="w-4 h-4 text-indigo-600 ml-auto shrink-0" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-1" />

            {/* Language */}
            <div className="relative">
                <button
                    onClick={() => setShowLangMenu(!showLangMenu)}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <Globe className="w-5 h-5" />
                </button>
                {showLangMenu && (
                    <div className="absolute top-full right-0 mt-1 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 py-1.5 animate-fade-in">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => { setLanguage(lang.code); setShowLangMenu(false); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <span>{lang.flag || '🌐'}</span>
                                <span>{lang.label}</span>
                                {language === lang.code && <Check className="w-4 h-4 text-indigo-600 ml-auto" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Dark mode toggle */}
            <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={isDark ? t('lightMode') : t('darkMode')}
            >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <div className="relative">
                <button
                    onClick={() => setShowNotifs(!showNotifs)}
                    className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                </button>
                {showNotifs && (
                    <div className="absolute top-full right-0 mt-1 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 animate-fade-in">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{t('notifications')}</p>
                            {unreadCount > 0 && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">{unreadCount} yangi</span>}
                        </div>
                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                            {notifications.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => markNotificationRead(n.id)}
                                    className={cn(
                                        'w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors',
                                        !n.read && 'bg-indigo-50/50 dark:bg-indigo-900/20'
                                    )}
                                >
                                    <p className="text-sm font-medium text-slate-800 dark:text-white">{n.title}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                                    <p className="text-xs text-slate-400 mt-1">{n.date}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* User menu */}
            <div className="relative">
                <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <Avatar name={user?.name || 'User'} size="sm" />
                </button>
                {showUserMenu && (
                    <div className="absolute top-full right-0 mt-1 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 py-1.5 animate-fade-in">
                        <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-700">
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{user?.name}</p>
                            <p className="text-xs text-slate-400">{user?.email}</p>
                        </div>
                        <button
                            onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <Settings className="w-4 h-4" /> {t('settings')}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <LogOut className="w-4 h-4" /> {t('logout')}
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};
