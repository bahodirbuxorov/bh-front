import React from 'react';
import { WifiOff, X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

/**
 * NetworkBanner
 * Shows a sticky top banner when the browser goes offline.
 * Driven by uiStore.networkError — automatically set by initNetworkListeners()
 */
export const NetworkBanner: React.FC = () => {
    const { networkError, setNetworkError } = useUIStore();
    if (!networkError) return null;
    return (
        <div role="alert" className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between gap-3 bg-amber-500 px-4 py-2.5 shadow-lg">
            <div className="flex items-center gap-2 text-white">
                <WifiOff className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">Internet aloqasi yo'q — ma'lumotlar yangilanmayapti</span>
            </div>
            <button
                onClick={() => setNetworkError(false)}
                aria-label="Yopish"
                className="text-white/80 hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white rounded"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};
