'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, AlertCircle, TrendingUp, ShieldCheck } from 'lucide-react';
import { useLiveRefresh } from '@/lib/useLiveRefresh';
import { cn } from '@/lib/utils';

interface IntelligenceEvent {
    title: string;
    severity: 'Critical' | 'Elevated' | 'Stable';
    impact: number;
    source: string;
}

export default function IntelligenceTicker() {
    const [events, setEvents] = useState<IntelligenceEvent[]>([
        {
            title: "Analyzing global supply chain vectors...",
            severity: "Stable",
            impact: 0,
            source: "System"
        }
    ]);

    const onIntelligence = React.useCallback((event: any) => {
        if (event && event.title) {
            setEvents(prev => [event, ...prev].slice(0, 5));
        }
    }, []);

    useLiveRefresh(
        undefined, 
        undefined, 
        onIntelligence
    );

    const current = events[0];

    return (
        <div className="w-full bg-black/60 border-b border-white/5 backdrop-blur-md h-12 flex items-center px-10 gap-8 overflow-hidden">
            <div className="flex items-center gap-2 shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Live Intelligence Feed</span>
            </div>

            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={current.title}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                        className="flex items-center gap-4"
                    >
                         <div className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                            current.severity === 'Critical' ? "bg-danger text-white glow-shadow-danger" :
                            current.severity === 'Elevated' ? "bg-accent text-white glow-shadow-accent" :
                            "bg-white/10 text-white/40"
                         )}>
                            {current.severity}
                         </div>
                         <p className="text-sm font-black text-white italic truncate max-w-2xl uppercase tracking-tight">
                            {current.title}
                         </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="flex items-center gap-8 shrink-0">
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Impact:</span>
                    <span className="text-xs font-bold text-white">{current.impact}%</span>
                </div>
                <div className="flex items-center gap-3">
                    <ShieldCheck size={14} className="text-secondary" />
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{current.source}</span>
                </div>
                <div className="text-[10px] font-mono text-white/20 border-l border-white/10 pl-8">
                    {new Date().toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
}
