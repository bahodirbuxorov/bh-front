import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, CameraOff, Search, Plus, Minus, Info, Package, Zap } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { mockInventory } from '../../../mocks';
import { formatCurrency } from '../../../utils';
import { useUIStore } from '../../../store/uiStore';
import type { InventoryItem } from '../../../types';

export const BarcodeScanner: React.FC = () => {
    const { addToast } = useUIStore();
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [cameraActive, setCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [manualInput, setManualInput] = useState('');
    const [scanned, setScanned] = useState<InventoryItem | null>(null);
    const [qty, setQty] = useState(1);
    const [scanHistory, setScanHistory] = useState<{ item: InventoryItem; action: string; qty: number; time: string }[]>([]);
    const [isVideoReady, setIsVideoReady] = useState(false);

    const startCamera = useCallback(async () => {
        setCameraError(null);
        setIsVideoReady(false);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
            });
            streamRef.current = stream;
            // Attach stream to video element
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Explicitly call play() — required by some browsers
                try {
                    await videoRef.current.play();
                } catch {
                    // play() may throw if interrupted; srcObject is still attached
                }
            }
            setCameraActive(true);
        } catch (err) {
            const msg = err instanceof Error ? err.message : '';
            if (msg.includes('Permission') || msg.includes('NotAllowed')) {
                setCameraError('Kameraga ruxsat berilmadi. Brauzer sozlamalaridan ruxsat bering.');
            } else if (msg.includes('NotFound') || msg.includes('DevicesNotFound')) {
                setCameraError('Kamera topilmadi.');
            } else {
                setCameraError('Kamerani yoqishda xato yuz berdi.');
            }
            setCameraActive(false);
        }
    }, []);

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
        setIsVideoReady(false);
    }, []);

    // Clean up on unmount
    useEffect(() => () => stopCamera(), [stopCamera]);

    // onLoadedMetadata: video dimensions are known → play
    const handleVideoReady = useCallback(() => {
        setIsVideoReady(true);
        videoRef.current?.play().catch(() => { });
    }, []);

    // Simulate barcode scan
    const simulateScan = useCallback(() => {
        const item = mockInventory[Math.floor(Math.random() * mockInventory.length)];
        setScanned(item);
        setQty(1);
        addToast({ type: 'success', title: 'Skanerlandi!', message: item.name });
    }, [addToast]);

    const handleManualSearch = () => {
        const q = manualInput.trim().toLowerCase();
        if (!q) return;
        const found = mockInventory.find(i =>
            i.name.toLowerCase().includes(q) || i.id === q
        );
        if (found) {
            setScanned(found);
            setQty(1);
            setManualInput('');
        } else {
            addToast({ type: 'error', title: 'Topilmadi', message: `"${manualInput}" mahsulot topilmadi` });
        }
    };

    const handleAction = (action: 'in' | 'out') => {
        if (!scanned) return;
        const label = action === 'in' ? 'Kirim' : 'Chiqim';
        setScanHistory(prev => [{
            item: scanned, action: label, qty, time: new Date().toLocaleTimeString('uz-UZ'),
        }, ...prev.slice(0, 9)]);
        addToast({ type: 'success', title: `${label} amalga oshirildi`, message: `${qty} ${scanned.unit} ${scanned.name}` });
        setScanned(null);
        setQty(1);
    };

    const statusColors = { in_stock: 'success', low_stock: 'warning', out_of_stock: 'danger' } as const;
    const statusLabels = { in_stock: 'Omborda', low_stock: 'Kam qoldi', out_of_stock: "Yo'q" };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left — Camera + Input */}
            <div className="space-y-4">
                {/* Camera feed */}
                <Card padding={false} className="overflow-hidden">
                    {/* Video wrapper: always in DOM when cameraActive so the ref is attached */}
                    <div className="relative bg-slate-900" style={{ minHeight: 220 }}>
                        {/* The <video> is always rendered; hidden via opacity when not active */}
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            onLoadedMetadata={handleVideoReady}
                            className="w-full block"
                            style={{
                                display: cameraActive ? 'block' : 'none',
                                minHeight: 220,
                                objectFit: 'cover',
                            }}
                        />

                        {/* Scan frame overlay — shown when video is ready */}
                        {cameraActive && isVideoReady && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-52 h-36 relative">
                                    {/* Corner markers */}
                                    <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-indigo-400 rounded-tl-sm" />
                                    <span className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-indigo-400 rounded-tr-sm" />
                                    <span className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-indigo-400 rounded-bl-sm" />
                                    <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-indigo-400 rounded-br-sm" />
                                    {/* Scanning line */}
                                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-indigo-400/70 animate-pulse" />
                                    <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-indigo-300 whitespace-nowrap">Barkodni ramkaga kiriting</p>
                                </div>
                            </div>
                        )}

                        {/* Loading spinner while stream starts */}
                        {cameraActive && !isVideoReady && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                                <p className="text-xs text-slate-400">Kamera yuklanmoqda...</p>
                            </div>
                        )}

                        {/* Demo scan button */}
                        {cameraActive && isVideoReady && (
                            <button onClick={simulateScan}
                                className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-1.5 rounded-full transition flex items-center gap-1.5 shadow-lg">
                                <Zap className="w-3 h-3" /> Demo: Skan qilish
                            </button>
                        )}

                        {/* Idle / Error state */}
                        {!cameraActive && (
                            <div className="flex flex-col items-center justify-center py-12 text-center px-6" style={{ minHeight: 220 }}>
                                {cameraError ? (
                                    <>
                                        <CameraOff className="w-12 h-12 text-red-400 mx-auto mb-3" />
                                        <p className="text-sm text-red-400 mb-4 max-w-xs">{cameraError}</p>
                                        <Button variant="primary" size="sm" icon={<Camera className="w-4 h-4" />} onClick={startCamera}>
                                            Qayta urinish
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                                            <Camera className="w-8 h-8 text-slate-500" />
                                        </div>
                                        <p className="text-sm text-slate-400 mb-4">Barkod skaner uchun kamerani yoqing</p>
                                        <Button variant="primary" size="sm" icon={<Camera className="w-4 h-4" />} onClick={startCamera}>
                                            Kamerani yoqish
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {cameraActive && (
                        <div className="flex justify-center p-3 border-t border-slate-800">
                            <Button variant="outline" size="sm" icon={<CameraOff className="w-4 h-4" />} onClick={stopCamera}>
                                Kamerani o'chirish
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Manual input */}
                <Card>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Qo'lda qidirish</h3>
                    <div className="flex gap-2">
                        <input
                            value={manualInput}
                            onChange={e => setManualInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
                            placeholder="Mahsulot nomi yoki ID..."
                            className="flex-1 h-9 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <Button variant="primary" size="sm" icon={<Search className="w-4 h-4" />} onClick={handleManualSearch}>
                            Qidirish
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Right — Scanned result + History */}
            <div className="space-y-4">
                {scanned ? (
                    <Card>
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center shrink-0">
                                <Package className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-900 dark:text-white">{scanned.name}</h3>
                                <p className="text-xs text-slate-400">{scanned.unit} · ID: {scanned.id}</p>
                                <Badge variant={statusColors[scanned.status]} size="sm" dot className="mt-1">
                                    {statusLabels[scanned.status]}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {[
                                { label: 'Joriy stok', value: `${scanned.quantity} ${scanned.unit}`, color: 'text-slate-800 dark:text-white' },
                                { label: 'Minimal stok', value: `${scanned.minQuantity} ${scanned.unit}`, color: 'text-amber-600' },
                                { label: 'Narx/birlik', value: formatCurrency(scanned.averageCost), color: 'text-indigo-600' },
                            ].map(s => (
                                <div key={s.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                                    <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <label className="text-sm text-slate-600 dark:text-slate-300">Miqdor:</label>
                            <div className="flex items-center gap-0 border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden">
                                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-slate-600 dark:text-slate-300">
                                    <Minus className="w-3.5 h-3.5" />
                                </button>
                                <input type="number" min={1} value={qty} onChange={e => setQty(Math.max(1, Number(e.target.value)))}
                                    className="w-16 text-center text-sm bg-transparent text-slate-900 dark:text-white focus:outline-none" />
                                <button onClick={() => setQty(q => q + 1)} className="px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-slate-600 dark:text-slate-300">
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <span className="text-sm text-slate-400">{scanned.unit}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => handleAction('in')}>Kirim</Button>
                            <Button variant="danger" icon={<Minus className="w-4 h-4" />} onClick={() => handleAction('out')}>Chiqim</Button>
                            <Button variant="outline" icon={<Info className="w-4 h-4" />} onClick={() => setScanned(null)}>Bekor</Button>
                        </div>
                    </Card>
                ) : (
                    <Card className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-4">
                            <Camera className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Mahsulot skanerlanmagan</p>
                        <p className="text-xs text-slate-400 mt-1">Kamerani yoqing yoki qo'lda qidiring</p>
                    </Card>
                )}

                {/* Scan history */}
                {scanHistory.length > 0 && (
                    <Card padding={false}>
                        <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">So'nggi harakatlar</h3>
                        </div>
                        <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                            {scanHistory.map((h, i) => (
                                <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                                    <Badge variant={h.action === 'Kirim' ? 'success' : 'danger'} size="sm">{h.action}</Badge>
                                    <span className="text-sm text-slate-700 dark:text-slate-200 flex-1 truncate">{h.item.name}</span>
                                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{h.qty} {h.item.unit}</span>
                                    <span className="text-xs text-slate-400">{h.time}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};
