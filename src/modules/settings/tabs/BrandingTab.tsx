import React, { useRef, useState } from 'react';
import { Upload, RotateCcw, Palette, Image as ImageIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useBrandStore, applyBrandColors } from '../../../store/brandStore';
import { useUIStore } from '../../../store/uiStore';

const COLOR_PRESETS = [
    { name: 'Indigo', primary: '#6366f1', accent: '#8b5cf6' },
    { name: 'Blue', primary: '#3b82f6', accent: '#0ea5e9' },
    { name: 'Emerald', primary: '#10b981', accent: '#06b6d4' },
    { name: 'Rose', primary: '#f43f5e', accent: '#f97316' },
    { name: 'Amber', primary: '#f59e0b', accent: '#eab308' },
    { name: 'Slate', primary: '#475569', accent: '#64748b' },
];

export const BrandingTab: React.FC = () => {
    const { logoUrl, primaryColor, accentColor, appName, tagline, setBrand, resetBrand } = useBrandStore();
    const { addToast } = useUIStore();
    const fileRef = useRef<HTMLInputElement>(null);
    const [localName, setLocalName] = useState(appName);
    const [localTagline, setLocalTagline] = useState(tagline);
    const [localPrimary, setLocalPrimary] = useState(primaryColor);
    const [localAccent, setLocalAccent] = useState(accentColor);

    const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            addToast({ type: 'error', title: 'Xato', message: 'Faqat rasm fayllar qabul qilinadi' });
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setBrand({ logoUrl: reader.result as string });
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        setBrand({ appName: localName, tagline: localTagline, primaryColor: localPrimary, accentColor: localAccent });
        applyBrandColors(localPrimary, localAccent);
        addToast({ type: 'success', title: 'Brend yangilandi', message: 'Sidebar va sarlavha yangilandi' });
    };

    const handleReset = () => {
        resetBrand();
        setLocalName('Mini Buxgalter');
        setLocalTagline('ERP Tizimi');
        setLocalPrimary('#6366f1');
        setLocalAccent('#8b5cf6');
        applyBrandColors('#6366f1', '#8b5cf6');
        addToast({ type: 'info', title: 'Brend tiklandi', message: 'Standart sozlamalarga qaytildi' });
    };

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Logo */}
            <Card>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-indigo-500" /> Logo
                </h3>
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-700/50 shrink-0">
                        {logoUrl ? (
                            <img src={logoUrl} alt="logo" className="w-full h-full object-contain p-1" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold">
                                {localName[0] ?? 'M'}
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                        <Button variant="secondary" size="sm" icon={<Upload className="w-3.5 h-3.5" />} onClick={() => fileRef.current?.click()}>
                            Logo yuklash
                        </Button>
                        {logoUrl && (
                            <Button variant="ghost" size="sm" onClick={() => setBrand({ logoUrl: null })}>
                                O'chirish
                            </Button>
                        )}
                        <p className="text-xs text-slate-400">PNG, JPG, SVG · Max 2MB · Tavsiya: 200×200px</p>
                    </div>
                </div>
            </Card>

            {/* App name & tagline */}
            <Card>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Ilova nomi</h3>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Ilova nomi (Sidebar yuqorisida ko'rinadi)</label>
                        <input
                            value={localName}
                            onChange={e => setLocalName(e.target.value)}
                            maxLength={30}
                            className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Tavsif (Sidebar pastki qism)</label>
                        <input
                            value={localTagline}
                            onChange={e => setLocalTagline(e.target.value)}
                            maxLength={40}
                            className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            </Card>

            {/* Color presets */}
            <Card>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-indigo-500" /> Rang sxemasi
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                    {COLOR_PRESETS.map(p => (
                        <button
                            key={p.name}
                            onClick={() => { setLocalPrimary(p.primary); setLocalAccent(p.accent); }}
                            className={`group flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${localPrimary === p.primary ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-600'}`}
                        >
                            <div className="flex gap-1">
                                <div className="w-4 h-4 rounded-full" style={{ background: p.primary }} />
                                <div className="w-4 h-4 rounded-full" style={{ background: p.accent }} />
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{p.name}</span>
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Asosiy rang</label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={localPrimary} onChange={e => setLocalPrimary(e.target.value)}
                                className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer p-0.5 bg-white" />
                            <input value={localPrimary} onChange={e => setLocalPrimary(e.target.value)}
                                className="flex-1 h-9 px-3 text-sm font-mono border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Aktsent rang</label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={localAccent} onChange={e => setLocalAccent(e.target.value)}
                                className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer p-0.5 bg-white" />
                            <input value={localAccent} onChange={e => setLocalAccent(e.target.value)}
                                className="flex-1 h-9 px-3 text-sm font-mono border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Preview */}
            <Card>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Ko'rinish oldindan ko'rish</h3>
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: localPrimary }}>
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg font-bold">
                        {logoUrl ? <img src={logoUrl} alt="logo" className="w-full h-full object-contain rounded-xl p-0.5" /> : localName[0]}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">{localName || 'Mini Buxgalter'}</p>
                        <p className="text-xs text-white/70">{localTagline || 'ERP Tizimi'}</p>
                    </div>
                </div>
            </Card>

            <div className="flex gap-3">
                <Button variant="primary" onClick={handleSave}>Saqlash va qo'llash</Button>
                <Button variant="outline" icon={<RotateCcw className="w-4 h-4" />} onClick={handleReset}>Standartga qaytarish</Button>
            </div>
        </div>
    );
};
