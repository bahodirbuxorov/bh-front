import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, Check } from 'lucide-react';
import { useCompanyStore } from '../../store/authStore';
import type { Company } from '../../types';

export const SelectCompanyPage: React.FC = () => {
    const { companies, activeCompany, setActiveCompany } = useCompanyStore();
    const navigate = useNavigate();

    const handleSelect = (company: Company) => {
        setActiveCompany(company);
        navigate('/dashboard');
    };

    const industryEmoji: Record<string, string> = {
        'Savdo': '🛒',
        'Ishlab chiqarish': '🏭',
        'Eksport': '🌍',
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                        <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kompaniya tanlang</h1>
                    <p className="text-slate-500 text-sm mt-1">Qaysi kompaniya bilan ishlashni xohlaysiz?</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {companies.map((company) => (
                        <button
                            key={company.id}
                            onClick={() => handleSelect(company)}
                            className={`group relative bg-white dark:bg-slate-800 border-2 rounded-2xl p-6 text-left hover:shadow-lg transition-all duration-200 ${activeCompany?.id === company.id
                                    ? 'border-indigo-500 shadow-md shadow-indigo-100 dark:shadow-indigo-900/30'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                                }`}
                        >
                            {activeCompany?.id === company.id && (
                                <div className="absolute top-3 right-3 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                            )}
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 shadow-sm">
                                <span className="text-white text-xl font-bold">
                                    {industryEmoji[company.industry || ''] || company.name[0]}
                                </span>
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-tight mb-1">
                                {company.name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{company.industry}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">STIR: {company.tin}</p>
                            <div className={`flex items-center gap-1 text-xs font-medium mt-3 ${activeCompany?.id === company.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                                } transition-colors`}>
                                Kirish <ArrowRight className="w-3 h-3" />
                            </div>
                        </button>
                    ))}

                    {/* Add new company card */}
                    <button
                        onClick={() => navigate('/register')}
                        className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-left hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all duration-200 group"
                    >
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center mb-3 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                            <span className="text-2xl">+</span>
                        </div>
                        <h3 className="font-semibold text-slate-600 dark:text-slate-400 text-sm">Yangi kompaniya</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Ro'yxatdan o'tkazish</p>
                    </button>
                </div>
            </div>
        </div>
    );
};
