import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useAuthStore, useCompanyStore } from '../../store/authStore';
import { mockUser, mockCompanies } from '../../utils/mockData';
import { Button } from '../../components/ui/Button';

const steps = [
    { id: 1, title: 'Shaxsiy ma\'lumotlar', desc: 'Foydalanuvchi ma\'lumotlari' },
    { id: 2, title: 'Kompaniya', desc: 'Biznes ma\'lumotlari' },
    { id: 3, title: 'Tayyor', desc: 'Ro\'yxatdan o\'tish yakunlandi' },
];

export const RegisterPage: React.FC = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();
    const { setCompanies, setActiveCompany } = useCompanyStore();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '', email: '', password: '',
        companyName: '', industry: '', tin: '',
    });

    const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

    const handleFinish = async () => {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1000));
        login(mockUser);
        setCompanies(mockCompanies);
        setActiveCompany(mockCompanies[0]);
        setLoading(false);
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                        <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mini Buxgalter</h1>
                    <p className="text-slate-500 text-sm mt-1">Yangi kompaniya ro'yxatdan o'tkazish</p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {steps.map((s, i) => (
                        <React.Fragment key={s.id}>
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step > s.id ? 'bg-green-500 text-white' : step === s.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                                    }`}>
                                    {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                                </div>
                                <span className={`text-sm font-medium hidden sm:block ${step === s.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                                    {s.title}
                                </span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`flex-1 h-0.5 max-w-16 rounded-full transition-all ${step > s.id ? 'bg-green-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
                    {step === 1 && (
                        <div className="space-y-4 animate-fade-in">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Shaxsiy ma'lumotlar</h2>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">To'liq ism</label>
                                <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Alisher Karimov" className="w-full h-10 px-3.5 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Elektron pochta</label>
                                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="alisher@email.uz" className="w-full h-10 px-3.5 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Parol</label>
                                <input type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="••••••••" className="w-full h-10 px-3.5 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                            </div>
                            <Button onClick={() => setStep(2)} variant="primary" size="lg" className="w-full mt-2">
                                Keyingi <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-fade-in">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Kompaniya ma'lumotlari</h2>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kompaniya nomi</label>
                                <input value={form.companyName} onChange={e => update('companyName', e.target.value)} placeholder="Sarbon Savdo MChJ" className="w-full h-10 px-3.5 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Soha</label>
                                <select value={form.industry} onChange={e => update('industry', e.target.value)} className="w-full h-10 px-3.5 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                                    <option value="">Soha tanlang</option>
                                    <option>Savdo</option>
                                    <option>Ishlab chiqarish</option>
                                    <option>Xizmat ko'rsatish</option>
                                    <option>Agrosanoat</option>
                                    <option>Boshqa</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">STIR (INN)</label>
                                <input value={form.tin} onChange={e => update('tin', e.target.value)} placeholder="302145678" className="w-full h-10 px-3.5 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                            </div>
                            <div className="flex gap-2 mt-2">
                                <Button onClick={() => setStep(1)} variant="secondary" size="lg" className="flex-1">
                                    <ArrowLeft className="w-4 h-4" /> Orqaga
                                </Button>
                                <Button onClick={() => setStep(3)} variant="primary" size="lg" className="flex-1">
                                    Keyingi <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center animate-fade-in">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Tayyor!</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Kompaniyangiz muvaffaqiyatli ro'yxatdan o'tdi. Tizimdan foydalanishni boshlashingiz mumkin.</p>
                            <Button onClick={handleFinish} variant="primary" size="lg" loading={loading} className="w-full">
                                Tizimga kirish <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    {step !== 3 && (
                        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
                            Hisobingiz bormi?{' '}
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">Kirish</Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
