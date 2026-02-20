import React, { useState } from 'react';
import { Users, Copy, Check, TrendingUp, DollarSign, Plus } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useUIStore } from '../../../store/uiStore';
import { formatCurrency } from '../../../utils';

interface Reseller {
    id: string;
    name: string;
    email: string;
    commission: number;   // %
    clients: number;
    mrr: number;          // Monthly recurring revenue (UZS)
    status: 'active' | 'pending' | 'suspended';
    joinedAt: string;
}

const mockResellers: Reseller[] = [
    { id: 'r-1', name: 'Toshkent IT Partners', email: 'info@tashit.uz', commission: 20, clients: 14, mrr: 7000000, status: 'active', joinedAt: '2025-10-01' },
    { id: 'r-2', name: 'Samarqand Digital', email: 'samar@digital.uz', commission: 15, clients: 6, mrr: 2400000, status: 'active', joinedAt: '2025-11-15' },
    { id: 'r-3', name: 'Fergana Software House', email: 'fsh@fsh.uz', commission: 18, clients: 2, mrr: 600000, status: 'pending', joinedAt: '2026-01-20' },
    { id: 'r-4', name: 'Buxoro Technologies', email: 'info@buxtex.uz', commission: 12, clients: 0, mrr: 0, status: 'suspended', joinedAt: '2025-09-01' },
];

const statusBadge: Record<Reseller['status'], { variant: 'success' | 'warning' | 'danger'; label: string }> = {
    active: { variant: 'success', label: 'Faol' },
    pending: { variant: 'warning', label: 'Kutmoqda' },
    suspended: { variant: 'danger', label: 'To\'xtatildi' },
};

export const ResellerTab: React.FC = () => {
    const { addToast } = useUIStore();
    const [resellers, setResellers] = useState<Reseller[]>(mockResellers);
    const [globalCommission, setGlobalCommission] = useState(15);
    const [copied, setCopied] = useState(false);
    const [showInvite, setShowInvite] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [newCommission, setNewCommission] = useState(15);

    const inviteLink = `https://app.minibuxgalter.uz/reseller/invite?ref=OWNER_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        addToast({ type: 'success', title: 'Nusxalandi', message: 'Taklif havolasi buferga saqlandi' });
    };

    const handleInvite = () => {
        if (!newEmail.trim()) return;
        const newR: Reseller = {
            id: `r-${Date.now()}`,
            name: newEmail.split('@')[0],
            email: newEmail,
            commission: newCommission,
            clients: 0,
            mrr: 0,
            status: 'pending',
            joinedAt: new Date().toISOString().split('T')[0],
        };
        setResellers(prev => [...prev, newR]);
        setNewEmail('');
        setShowInvite(false);
        addToast({ type: 'success', title: 'Taklif yuborildi', message: `${newEmail} ga taklif emaili jo'natildi` });
    };

    const totalMRR = resellers.filter(r => r.status === 'active').reduce((s, r) => s + r.mrr, 0);
    const totalClients = resellers.filter(r => r.status === 'active').reduce((s, r) => s + r.clients, 0);

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Faol resellers', value: resellers.filter(r => r.status === 'active').length.toString(), icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                    { label: 'Jami klientlar', value: totalClients.toString(), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                    { label: 'Jami MRR', value: formatCurrency(totalMRR), icon: DollarSign, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
                ].map(s => (
                    <Card key={s.label} className="!p-4">
                        <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-2`}>
                            <s.icon className={`w-4 h-4 ${s.color}`} />
                        </div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{s.value}</p>
                        <p className="text-xs text-slate-400">{s.label}</p>
                    </Card>
                ))}
            </div>

            {/* Invite link */}
            <Card>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Taklif havolasi</h3>
                <div className="flex gap-2">
                    <input readOnly value={inviteLink}
                        className="flex-1 h-9 px-3 text-xs font-mono border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 focus:outline-none" />
                    <Button variant="secondary" size="sm" icon={copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />} onClick={handleCopy}>
                        {copied ? 'Nusxalandi' : 'Nusxalash'}
                    </Button>
                </div>
                <p className="text-xs text-slate-400 mt-2">Bu havola orqali ro'yxatdan o'tgan reseller sizning hisobingizga bog'lanadi.</p>
            </Card>

            {/* Global commission */}
            <Card>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Standart komissiya</h3>
                <div className="flex items-center gap-3">
                    <input type="number" min={5} max={40} value={globalCommission}
                        onChange={e => setGlobalCommission(Number(e.target.value))}
                        className="w-24 h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <span className="text-sm text-slate-500">% — yangi resellerlar uchun standart</span>
                </div>
            </Card>

            {/* Reseller list */}
            <Card padding={false}>
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Resellers ({resellers.length})</h3>
                    <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowInvite(v => !v)}>
                        Taklif qilish
                    </Button>
                </div>

                {/* Invite form */}
                {showInvite && (
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800">
                        <div className="flex gap-2">
                            <input type="email" placeholder="email@example.com" value={newEmail}
                                onChange={e => setNewEmail(e.target.value)}
                                className="flex-1 h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            <input type="number" min={5} max={40} value={newCommission}
                                onChange={e => setNewCommission(Number(e.target.value))}
                                className="w-20 h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            <span className="text-sm text-slate-500 self-center">%</span>
                            <Button variant="primary" size="sm" onClick={handleInvite}>Yuborish</Button>
                        </div>
                    </div>
                )}

                {/* List */}
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {resellers.map(r => (
                        <div key={r.id} className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                                {r.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{r.name}</p>
                                <p className="text-xs text-slate-400">{r.email} · Qo'shilgan: {r.joinedAt}</p>
                            </div>
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-800 dark:text-white">{r.clients} klient</p>
                                <p className="text-xs text-slate-400">{formatCurrency(r.mrr)}/oy</p>
                            </div>
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-indigo-600">{r.commission}%</p>
                                <p className="text-xs text-slate-400">komissiya</p>
                            </div>
                            <Badge variant={statusBadge[r.status].variant} dot>
                                {statusBadge[r.status].label}
                            </Badge>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};
