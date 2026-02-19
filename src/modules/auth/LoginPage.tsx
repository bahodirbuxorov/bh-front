import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuthStore, useCompanyStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { mockUser, mockCompanies } from '../../utils/mockData';
import { Button } from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('alisher@sarbon.uz');
    const [password, setPassword] = useState('password123');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();
    const { setCompanies, setActiveCompany } = useCompanyStore();
    const { t } = useLanguageStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise((r) => setTimeout(r, 800));
        login(mockUser);
        setCompanies(mockCompanies);
        setActiveCompany(mockCompanies[0]);
        setLoading(false);
        navigate('/select-company');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
                        <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mini Buxgalter</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Kichik va o'rta biznes uchun ERP tizimi</p>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('welcomeBack')}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('loginSubtitle')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('email')}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-10 px-3.5 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-700 transition-all"
                                placeholder="elektron@pochta.uz"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('password')}</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-10 px-3.5 pr-10 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-700 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded border-slate-300 text-indigo-600" />
                                <span className="text-slate-600 dark:text-slate-400">Eslab qolish</span>
                            </label>
                            <a href="#" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium">
                                Parolni unutdingizmi?
                            </a>
                        </div>

                        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
                            {!loading && <ArrowRight className="w-4 h-4" />}
                            {t('login')}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                        {t('noAccount')}{' '}
                        <Link to="/register" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium">
                            {t('register')}
                        </Link>
                    </p>
                </div>

                {/* Demo hint */}
                <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl text-center">
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">
                        🎯 Demo: Har qanday ma'lumot bilan kirishingiz mumkin
                    </p>
                </div>
            </div>
        </div>
    );
};
