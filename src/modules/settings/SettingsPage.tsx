import React, { useState } from 'react';
import { Building2, Users, Calculator, DollarSign, Globe } from 'lucide-react';
import { PageHeader } from '../../components/ui/Misc';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useLanguageStore } from '../../store/languageStore';
import { useUIStore } from '../../store/uiStore';
import { useCompanyStore } from '../../store/authStore';
import type { Language } from '../../i18n';

const tabs = [
    { id: 'company', label: 'Kompaniya profili', icon: Building2 },
    { id: 'users', label: 'Foydalanuvchilar', icon: Users },
    { id: 'tax', label: 'Soliq qoidalari', icon: Calculator },
    { id: 'currency', label: 'Valyuta', icon: DollarSign },
    { id: 'language', label: 'Til', icon: Globe },
];

const roles = [
    { id: 'admin', label: 'Admin', desc: 'To\'liq kirish huquqi', badge: 'danger' as const },
    { id: 'accountant', label: 'Buxgalter', desc: 'Moliya va hisobot', badge: 'purple' as const },
    { id: 'sales', label: 'Savdogar', desc: 'Savdo moduli', badge: 'success' as const },
    { id: 'warehouse', label: 'Omborchi', desc: 'Ombor va inventar', badge: 'info' as const },
    { id: 'production', label: 'Ishlab chiqarish', desc: 'Ishlab chiqarish moduli', badge: 'warning' as const },
    { id: 'manager', label: 'Menejer', desc: 'Faqat ko\'rish', badge: 'default' as const },
];

const mockUsers = [
    { id: '1', name: 'Alisher Karimov', email: 'alisher@sarbon.uz', role: 'admin', active: true },
    { id: '2', name: 'Nodira Hasanova', email: 'nodira@sarbon.uz', role: 'accountant', active: true },
    { id: '3', name: 'Jamshid Yusupov', email: 'jamshid@sarbon.uz', role: 'sales', active: true },
    { id: '4', name: 'Gulnora Raximova', email: 'gulnora@sarbon.uz', role: 'warehouse', active: false },
];

const languages: { code: Language; label: string; native: string; flag: string }[] = [
    { code: 'uz', label: "O'zbek (lotin)", native: "O'zbekcha", flag: '🇺🇿' },
    { code: 'ru', label: 'Русский', native: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'kk', label: "Qaraqalpaq", native: "Qaraqalpaqsha", flag: '🌐' },
];

export const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('company');
    const { language, setLanguage, t } = useLanguageStore();
    const { addToast } = useUIStore();
    const { activeCompany } = useCompanyStore();

    const handleSave = () => addToast({ type: 'success', title: 'Muvaffaqiyatli saqlandi', message: 'Sozlamalar yangilandi' });

    return (
        <div className="space-y-5 animate-fade-in">
            <PageHeader title={t('settings')} subtitle="Tizim va kompaniya sozlamalari" />

            <div className="flex flex-col lg:flex-row gap-5">
                {/* Sidebar tabs */}
                <div className="lg:w-56 shrink-0">
                    <Card padding={false}>
                        <nav className="py-2">
                            {tabs.map(({ id, label, icon: Icon }) => (
                                <button key={id} onClick={() => setActiveTab(id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all ${activeTab === id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                    <Icon className="w-4 h-4 shrink-0" />{label}
                                </button>
                            ))}
                        </nav>
                    </Card>
                </div>

                {/* Content */}
                <div className="flex-1">
                    {activeTab === 'company' && (
                        <Card>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">Kompaniya profili</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl mb-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0">
                                        {activeCompany?.name?.[0] || 'S'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-white">{activeCompany?.name}</p>
                                        <p className="text-xs text-slate-500">{activeCompany?.industry} · STIR: {activeCompany?.tin}</p>
                                    </div>
                                    <Button variant="secondary" size="sm" className="ml-auto">Logo o'zgartirish</Button>
                                </div>
                                {[
                                    { label: 'Kompaniya nomi', value: activeCompany?.name || '' },
                                    { label: 'STIR (INN)', value: activeCompany?.tin || '' },
                                    { label: 'Soha', value: activeCompany?.industry || '' },
                                    { label: 'Manzil', value: "Toshkent, O'zbekiston" },
                                    { label: 'Telefon', value: '+998 71 200 00 00' },
                                ].map(({ label, value }) => (
                                    <div key={label}>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</label>
                                        <input defaultValue={value} className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                ))}
                                <Button variant="primary" onClick={handleSave}>{t('save')}</Button>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'users' && (
                        <div className="space-y-4">
                            {/* Roles */}
                            <Card>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Rollar va huquqlar</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {roles.map(role => (
                                        <div key={role.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-semibold text-slate-800 dark:text-white">{role.label}</span>
                                                <Badge variant={role.badge} size="sm">{role.id}</Badge>
                                            </div>
                                            <p className="text-xs text-slate-400">{role.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Users */}
                            <Card>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Foydalanuvchilar</h3>
                                    <Button variant="primary" size="sm">Taklif yuborish</Button>
                                </div>
                                <div className="space-y-2">
                                    {mockUsers.map(user => (
                                        <div key={user.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                {user.name[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-800 dark:text-white">{user.name}</p>
                                                <p className="text-xs text-slate-400">{user.email}</p>
                                            </div>
                                            <Badge variant={roles.find(r => r.id === user.role)?.badge || 'default'} size="sm">{user.role}</Badge>
                                            <Badge variant={user.active ? 'success' : 'default'} size="sm" dot>{user.active ? 'Faol' : 'Nofaol'}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'tax' && (
                        <Card>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">Soliq qoidalari</h3>
                            <div className="space-y-4">
                                {[
                                    { label: "QQS stavkasi (%)", defaultValue: "12" },
                                    { label: "Foyda solig'i stavkasi (%)", defaultValue: "15" },
                                    { label: "Ijtimoiy to'lov stavkasi (%)", defaultValue: "12" },
                                    { label: "Shaxsiy daromad solig'i (%)", defaultValue: "12" },
                                ].map(({ label, defaultValue }) => (
                                    <div key={label}>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</label>
                                        <input type="number" defaultValue={defaultValue} className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                ))}
                                <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900 rounded-xl">
                                    <div>
                                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Soliq hisoboti rejimi</p>
                                        <p className="text-xs text-amber-600 dark:text-amber-400">Hozirgi holat: Umumiy soliq tizimi</p>
                                    </div>
                                    <select className="h-8 px-2 text-xs border border-amber-200 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                                        <option>Umumiy tizim</option><option>Soddalashtirilgan</option><option>QQS to'lovchi</option>
                                    </select>
                                </div>
                                <Button variant="primary" onClick={handleSave}>{t('save')}</Button>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'currency' && (
                        <Card>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">Valyuta sozlamalari</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Asosiy valyuta</label>
                                    <select defaultValue="UZS" className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option value="UZS">UZS — O'zbek so'mi</option>
                                        <option value="USD">USD — AQSh dollari</option>
                                        <option value="EUR">EUR — Yevro</option>
                                        <option value="RUB">RUB — Rossiya rubli</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Hozirgi kurslar</p>
                                    {[
                                        { code: 'USD', name: 'AQSh dollari', rate: '12,750' },
                                        { code: 'EUR', name: 'Yevro', rate: '13,820' },
                                        { code: 'RUB', name: 'Rossiya rubli', rate: '138' },
                                    ].map(c => (
                                        <div key={c.code} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                            <div>
                                                <p className="text-sm font-medium text-slate-800 dark:text-white">{c.code}</p>
                                                <p className="text-xs text-slate-400">{c.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-slate-800 dark:text-white">1 {c.code} = {c.rate} so'm</p>
                                                <p className="text-xs text-slate-400">O'zbekiston MBB kursi</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="primary" onClick={handleSave}>{t('save')}</Button>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'language' && (
                        <Card>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">Interfeys tili</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {languages.map(lang => (
                                    <button key={lang.code} onClick={() => { setLanguage(lang.code); addToast({ type: 'success', title: 'Til o\'zgartirildi', message: lang.native }); }}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${language === lang.code ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                        <span className="text-3xl">{lang.flag}</span>
                                        <div>
                                            <p className={`text-sm font-semibold ${language === lang.code ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-white'}`}>{lang.label}</p>
                                            <p className="text-xs text-slate-400">{lang.native}</p>
                                        </div>
                                        {language === lang.code && (
                                            <div className="ml-auto w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs">✓</span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};
