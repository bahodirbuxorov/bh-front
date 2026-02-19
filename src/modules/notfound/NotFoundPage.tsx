import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center">
                    <span className="text-5xl font-black text-indigo-300 dark:text-indigo-600">404</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sahifa topilmadi</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
                    Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan.
                </p>
                <div className="flex gap-3 justify-center">
                    <Button variant="secondary" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
                        Orqaga
                    </Button>
                    <Button variant="primary" icon={<Home className="w-4 h-4" />} onClick={() => navigate('/dashboard')}>
                        Bosh sahifaga
                    </Button>
                </div>
            </div>
        </div>
    );
};
