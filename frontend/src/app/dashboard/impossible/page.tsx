'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, MapPin, Clock, ShieldAlert, ChevronRight, Info, Search, Filter, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAnomalies } from '@/lib/api';

interface Anomaly {
  id: string;
  type: string;
  severity: number;
  explanation: string;
  root_causes: string[];
  confidence: number;
  event_ids: string[];
}

export default function ImpossibleEvents() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [selected, setSelected] = useState<Anomaly | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const filterInputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const data = await getAnomalies();
        setAnomalies(data);
        if (data.length > 0) {
          setSelected(data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch anomalies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnomalies();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader className="text-primary animate-spin" size={32} />
      </div>
    );
  }

  const filteredAnomalies = anomalies.filter((anom) => {
    const haystack = `${anom.id} ${anom.type} ${anom.explanation}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const archiveSelected = () => {
    if (!selected) {
      return;
    }

    const next = anomalies.filter((anom) => anom.id !== selected.id);
    setAnomalies(next);
    setSelected(next[0] ?? null);
  };

  return (
    <div className="flex gap-8 h-[calc(100vh-180px)]">
      {/* Left List */}
      <div className="w-1/3 flex flex-col gap-4">
        <div className="flex gap-4 mb-2">
           <div className="flex-1 px-4 py-2 glass-morphism rounded-xl border border-white/5 flex items-center gap-2">
              <Search size={16} className="text-white/30" />
              <input
                ref={filterInputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="text"
                placeholder="Filter events..."
                className="bg-transparent border-none outline-none text-xs text-white w-full"
              />
           </div>
            <button onClick={() => {
             filterInputRef.current?.focus();
            }} className="p-2 glass-morphism rounded-xl border border-white/5 text-white/40 hover:text-white">
              <Filter size={18} />
           </button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {filteredAnomalies.length === 0 ? (
            <div className="text-center text-white/40 py-8">No anomalies found</div>
          ) : (
            filteredAnomalies.map((anom) => (
              <motion.div
                layoutId={anom.id}
                key={anom.id}
                onClick={() => setSelected(anom)}
                className={cn(
                  "p-5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden group",
                  selected?.id === anom.id 
                    ? "glass-morphism border-primary/40 glow-shadow-primary" 
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                   <span className={cn(
                     "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest",
                     anom.severity > 0.8 ? "bg-danger/20 text-danger" : "bg-warning/20 text-warning"
                   )}>
                     {anom.severity > 0.8 ? "CRITICAL" : "ANOMALY"}
                   </span>
                   <span className="text-[10px] text-white/30 font-mono">{anom.id}</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{anom.type}</h3>
                <p className="text-xs text-white/40 line-clamp-1">{anom.explanation}</p>
                
                {selected?.id === anom.id && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary" />
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Right Detail */}
      <div className="flex-1 glass-morphism rounded-3xl border border-white/5 overflow-hidden flex flex-col relative">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div 
              key={selected.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              {/* Header */}
              <div className="p-8 border-b border-white/5 space-y-4">
                 <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                       <span className={cn(
                         "text-[10px] font-bold px-3 py-1 rounded uppercase tracking-widest mb-2 inline-block",
                         selected.severity > 0.8 ? "bg-danger/20 text-danger" : "bg-warning/20 text-warning"
                       )}>
                         {selected.severity > 0.8 ? "CRITICAL" : "ANOMALY"}
                       </span>
                       <h1 className="text-3xl font-black text-white mt-2">{selected.type}</h1>
                    </div>
                    <div className="text-right">
                       <div className="text-xs text-white/30 mb-1">CONFIDENCE</div>
                       <div className="text-2xl font-black text-accent">{(selected.confidence * 100).toFixed(0)}%</div>
                    </div>
                 </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                 {/* Explanation */}
                 <section>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                       <AlertCircle className="text-warning" size={20} />
                       Explanation
                    </h3>
                    <p className="text-white/60 leading-relaxed">{selected.explanation}</p>
                 </section>

                 {/* Root Causes */}
                 <section>
                    <h3 className="text-lg font-bold text-white mb-4">Root Causes</h3>
                    <div className="space-y-3">
                       {selected.root_causes.map((cause, i) => (
                         <div key={i} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                            <ShieldAlert className="text-warning mt-1 flex-shrink-0" size={18} />
                            <div>
                              <p className="text-white/80 font-semibold text-sm">{cause}</p>
                              <p className="text-white/40 text-xs mt-1">Potential cause of the detected anomaly</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </section>

                 {/* Severity Breakdown */}
                 <section>
                    <h3 className="text-lg font-bold text-white mb-4">Severity Assessment</h3>
                    <div className="space-y-4">
                       <div>
                         <div className="flex justify-between mb-2">
                            <span className="text-sm text-white/60">Impact Level</span>
                            <span className="text-sm font-bold text-white">{(selected.severity * 100).toFixed(0)}%</span>
                         </div>
                         <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                              className={selected.severity > 0.8 ? "bg-danger" : "bg-warning"}
                              initial={{ width: 0 }}
                              animate={{ width: `${selected.severity * 100}%` }}
                              transition={{ duration: 0.5 }}
                            />
                         </div>
                       </div>
                    </div>
                 </section>
              </div>

              {/* Footer Actions */}
              <div className="p-8 border-t border-white/5 flex gap-4">
                  <Link href="/dashboard/negotiation" className="flex-1 py-3 bg-primary hover:bg-primary/80 text-white rounded-xl font-bold transition-all text-center">
                    ESCALATE TO TEAM
                  </Link>
                  <button onClick={archiveSelected} className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-white rounded-xl font-bold transition-all">
                    ARCHIVE
                 </button>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full text-white/40">
              <p>Select an anomaly to view details</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function EvidenceStep({ loc, time, status, active = false }: { loc: string, time: string, status: string, active?: boolean }) {
  return (
    <div className="flex items-start gap-4 pl-0.5">
      <div className={cn(
        "w-5 h-5 rounded-full flex items-center justify-center z-10",
        active ? "bg-primary border-4 border-background" : "bg-white/10"
      )}>
         {active && <div className="w-1 h-1 rounded-full bg-white" />}
      </div>
      <div>
        <p className={cn("text-xs font-bold", active ? "text-white" : "text-white/30")}>{loc}</p>
        <p className="text-[10px] text-white/30 font-mono italic">{time} — {status}</p>
      </div>
    </div>
  );
}
