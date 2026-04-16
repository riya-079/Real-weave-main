'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Lock, Users, Zap, EyeOff, Shield, Radio, MessageSquare, Globe, Activity, Fingerprint, ShieldAlert, Send } from 'lucide-react';
import { createSharedRiskPattern, getAnomalies, getOrganizations, getSharedRiskPatterns } from '@/lib/api';
import { useLiveRefresh } from '@/lib/useLiveRefresh';
import { cn } from '@/lib/utils';

interface Signal {
  id: string;
  type: string;
  origin: string;
  confidence: number;
  details: string;
}

interface Partner {
  id: string;
  name: string;
  trust: number;
  contribution: string;
}

interface SharedRiskPattern {
   id: string;
   anomaly_id?: string | null;
   title: string;
   details: string;
   shared_by: string;
   visibility: string;
   status: string;
   confidence: number;
   partner_count: number;
   created_at?: string;
}

export default function WhisperNetwork() {
   const [signatures, setSignatures] = useState<Signal[]>([]);
   const [partners, setPartners] = useState<Partner[]>([]);
   const [history, setHistory] = useState<SharedRiskPattern[]>([]);
   const [selectedSignalId, setSelectedSignalId] = useState<string>('');
   const [shareState, setShareState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
   const [loading, setLoading] = useState(true);

   const loadData = useCallback(async () => {
      try {
         setLoading(true);
         const [anomalies, organizations, sharedHistory] = await Promise.all([
            getAnomalies(),
            getOrganizations(),
            getSharedRiskPatterns(),
         ]);

         const nextSignals = anomalies.map((anomaly: any, i: number) => ({
            id: anomaly.id,
            type: anomaly.type,
            origin: i % 2 === 0 ? 'Encrypted Node A' : 'Private Peer',
            confidence: anomaly.confidence,
            details: anomaly.explanation,
         }));
         
         setSignatures(nextSignals);
         if (nextSignals.length > 0 && !selectedSignalId) setSelectedSignalId(nextSignals[0].id);
         
         setPartners(organizations.map((org: any) => ({
            id: org.id,
            name: org.name,
            trust: org.trust_score,
            contribution: org.trust_score > 0.8 ? 'High' : 'Active',
         })));
         setHistory(sharedHistory);
      } catch (error) {
         console.error('Failed to load whisper network:', error);
      } finally {
         setLoading(false);
      }
   }, [selectedSignalId]);

   useEffect(() => { loadData(); }, [loadData]);
   
   useLiveRefresh(
      loadData,
      undefined,
      undefined,
      (newSignal: any) => {
         if (newSignal && newSignal.id) {
            setSignatures(prev => {
               // Prevent duplicates
               if (prev.some(s => s.id === newSignal.id)) return prev;
               return [newSignal, ...prev].slice(0, 15);
            });
         }
      }
   );

   const selectedSignal = signatures.find(s => s.id === selectedSignalId) || (signatures.length > 0 ? signatures[0] : null);

   const sharePattern = async () => {
      if (!selectedSignal) return;
      setShareState('saving');
      try {
         await createSharedRiskPattern({
            id: `pattern-${Date.now()}`,
            anomaly_id: selectedSignal.id,
            title: selectedSignal.type,
            details: selectedSignal.details,
            shared_by: 'REAL_WEAVE_SYSTEM',
            visibility: 'network',
            status: 'broadcasting',
            confidence: selectedSignal.confidence,
            partner_count: partners.length,
         });
         setShareState('saved');
         setTimeout(() => setShareState('idle'), 3000);
      } catch (error) {
         setShareState('error');
      }
   };

   if (loading && signatures.length === 0) {
      return (
         <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Radio className="text-secondary animate-pulse" size={64} />
            <p className="text-white/40 font-mono text-xs uppercase tracking-widest animate-pulse">Scanning encrypted frequencies...</p>
         </div>
      );
   }

   return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative p-10 rounded-[40px] border border-white/5 overflow-hidden bg-gradient-to-br from-secondary/20 to-primary/10">
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="space-y-4 max-w-xl text-center md:text-left">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                  <Lock size={12} className="text-secondary" />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">End-to-End Encrypted Risk Relay</span>
               </div>
               <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Whisper Network</h2>
               <p className="text-white/60 font-medium italic leading-relaxed">
                  Contribute and receive anonymized risk signatures from across the entire weave. 
                  Learn from the failures of others without compromising proprietary data structures.
               </p>
               <div className="flex gap-4 pt-2 justify-center md:justify-start">
                  <button 
                     onClick={sharePattern}
                     disabled={shareState === 'saving'}
                     className="px-8 py-3 bg-white text-background rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all glow-shadow-white"
                  >
                     {shareState === 'saving' ? 'Broadcasting...' : <><Send size={16} /> Broadcast Signal</>}
                  </button>
                  <button className="px-8 py-3 glass-morphism border border-white/10 rounded-2xl text-white font-black text-xs uppercase tracking-widest">
                     Anonymity Tunnel
                  </button>
               </div>
            </div>
            
            <div className="hidden md:block w-64 h-64 bg-secondary/10 rounded-full relative">
               <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 border-2 border-dashed border-secondary/20 rounded-full" />
               <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} className="absolute inset-8 border-2 border-dashed border-primary/20 rounded-full" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <Radio size={64} className="text-secondary opacity-40" />
               </div>
            </div>
         </div>
         {/* Background Glow */}
         <div className="absolute top-[-50px] left-[-50px] w-96 h-96 bg-secondary/10 blur-[120px] rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-420px)]">
         {/* Signal Stream */}
         <div className="lg:col-span-5 flex flex-col gap-4">
            <h3 className="text-[10px] font-black text-white/30 tracking-widest uppercase px-2">Incoming Signals</h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
               {signatures.map(s => (
                  <motion.div
                     key={s.id}
                     onClick={() => setSelectedSignalId(s.id)}
                     className={cn(
                        "p-6 rounded-3xl border cursor-pointer transition-all relative group",
                        selectedSignalId === s.id ? "glass-morphism border-secondary/40 glow-shadow-secondary" : "bg-white/2 border-white/5 hover:bg-white/5"
                     )}
                  >
                     <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                           <Activity size={12} className="text-secondary" />
                           <span className="text-[10px] font-mono text-white/20 uppercase">{s.origin}</span>
                        </div>
                        <span className="text-[9px] font-black text-accent uppercase tracking-widest">{(s.confidence * 100).toFixed(0)}% Confidence</span>
                     </div>
                     <h4 className="text-lg font-black text-white italic tracking-tighter uppercase transition-colors group-hover:text-secondary">{s.type}</h4>
                     <p className="text-xs text-white/40 font-medium italic line-clamp-2 mt-2">"{s.details}"</p>
                  </motion.div>
               ))}
            </div>
         </div>

         {/* Signal Decryption / Deep Analysis */}
         <div className="lg:col-span-7 glass-morphism rounded-[40px] border border-white/5 overflow-hidden flex flex-col bg-white/1">
            {selectedSignal ? (
               <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                  <div className="flex justify-between items-start">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-secondary border border-white/10">
                           <Fingerprint size={32} />
                        </div>
                        <div>
                           <div className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Decrypted Metadata</div>
                           <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{selectedSignal.type}</h3>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                     <div className="p-6 bg-white/2 rounded-3xl border border-white/5 space-y-4">
                        <h4 className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                           <Globe size={12} /> Network Consensus
                        </h4>
                        <div className="flex -space-x-3">
                           {partners.slice(0, 6).map(p => (
                              <div key={p.id} className="w-10 h-10 rounded-full border-2 border-background bg-secondary/20 flex items-center justify-center text-xs text-white/40">
                                 {p.name.charAt(0)}
                              </div>
                           ))}
                           <div className="w-10 h-10 rounded-full border-2 border-background bg-white/10 flex items-center justify-center text-[10px] text-white/60 font-black">+24</div>
                        </div>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Shared by 32 organizations in the last 24h</p>
                     </div>
                     <div className="p-6 bg-white/2 rounded-3xl border border-white/5 space-y-2">
                        <h4 className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                           <ShieldAlert size={12} /> Threat Vector
                        </h4>
                        <div className="text-2xl font-black text-white uppercase italic">Critical Drift</div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${selectedSignal.confidence * 100}%` }} className="h-full bg-secondary" />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h4 className="text-xs font-black text-white/30 uppercase tracking-widest">Full Anonymized Report</h4>
                     <p className="text-lg text-white/80 font-medium italic leading-relaxed bg-white/2 p-8 rounded-3xl border border-white/5">
                        "{selectedSignal.details}"
                     </p>
                  </div>

                  <div className="flex gap-4">
                     <button className="flex-1 py-4 bg-secondary/10 border border-secondary/20 text-secondary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-secondary/20 transition-all">
                        Request Verification
                     </button>
                     <button className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                        Append Internal Case
                     </button>
                  </div>
               </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-white/20 gap-4">
                  <Fingerprint size={48} />
                  <p className="text-xs font-black tracking-widest uppercase italic">Select signal to decrypt</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
