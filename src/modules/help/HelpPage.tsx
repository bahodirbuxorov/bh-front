import React from 'react';
import { HelpCircle, Book, MessageCircle, Phone, Mail } from 'lucide-react';
import { PageHeader } from '../../components/ui/Misc';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const HelpPage: React.FC = () => {
    return (
        <div className="space-y-5 animate-fade-in">
            <PageHeader title="Yordam markazi" subtitle="Qo'llanmalar, qo'llov va aloqa" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                    { icon: Book, title: "Foydalanuvchi qo'llanmasi", desc: "Mini Buxgalter tizimidan foydalanish bo'yicha to'liq qo'llanma", action: "Ko'rish", color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600" },
                    { icon: MessageCircle, title: "Jonli chat qo'llab-quvvatlash", desc: "Bizning mutaxassislar bilan bevosita suhbatlashing", action: "Chat boshlash", color: "bg-green-100 dark:bg-green-900/30 text-green-600" },
                    { icon: Phone, title: "Telefon qo'llab-quvvatlash", desc: "Ish kunlari 9:00 - 18:00 oralig'ida qo'ng'iroq qiling", action: "Qo'ng'iroq qilish", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
                ].map(({ icon: Icon, title, desc, action, color }) => (
                    <Card key={title} hover>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{desc}</p>
                        <Button variant="secondary" size="sm" className="w-full">{action}</Button>
                    </Card>
                ))}
            </div>

            <Card>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Ko'p so'raladigan savollar</h3>
                <div className="space-y-3">
                    {[
                        { q: "Yangi kompaniya qanday qo'shiladi?", a: "Sozlamalar → Kompaniya profili bo'limidan yoki bosh ekrandagi 'Yangi kompaniya' tugmasini bosib qo'shishingiz mumkin." },
                        { q: "Omborda mahsulot miqdori qanday yangilanadi?", a: "Xarid yoki ishlab chiqarish buyurtmasi yaratilganda ombor avtomatik yangilanadi. Qo'lda ham kirim kiritish mumkin." },
                        { q: "Hisobotni PDF formatida yuklab olish mumkinmi?", a: "Ha, Hisobotlar bo'limiga o'tib, kerakli hisobot turini tanlang va 'PDF yuklab olish' tugmasini bosing." },
                        { q: "Ikki faktorli autentifikatsiya qanday yoqiladi?", a: "Sozlamalar → Xavfsizlik bo'limidan 2FA ni yoqishingiz mumkin. Hozirda bu funksiya ishlab chiqilmoqda." },
                    ].map(({ q, a }, i) => (
                        <details key={i} className="group">
                            <summary className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl cursor-pointer text-sm font-medium text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors list-none">
                                <span className="flex items-center gap-2"><HelpCircle className="w-4 h-4 text-indigo-500" />{q}</span>
                                <span className="text-slate-400 group-open:rotate-180 transition-transform">▾</span>
                            </summary>
                            <div className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{a}</div>
                        </details>
                    ))}
                </div>
            </Card>

            <Card>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Bizga yozing</h3>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Mavzu</label>
                        <input placeholder="Muammo yoki savolni tasvirlab bering" className="w-full h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Xabar</label>
                        <textarea rows={4} placeholder="Batafsil yozing..." className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                    </div>
                    <Button variant="primary" icon={<Mail className="w-4 h-4" />}>Yuborish</Button>
                </div>
            </Card>
        </div>
    );
};
