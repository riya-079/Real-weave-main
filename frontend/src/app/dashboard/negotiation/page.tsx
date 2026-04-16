'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, Shield, Zap, TrendingUp, ArrowRight, CheckCircle2, AlertCircle, Clock, Plus, Send, TrendingDown } from 'lucide-react';
import { getNegotiations } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useLiveRefresh } from '@/lib/useLiveRefresh';

interface Negotiation {
   id: string;
   title: string;
   participants: string[];
   status: string;
   strategy_type: string;
   current_deal: string;
}

export default function NegotiationSessions() {
   const [sessions, setSessions] = useState<Negotiation[]>([]);
   const [selected, setSelected] = useState<Negotiation | null>(null);
   const [loading, setLoading] = useState(true);
   const [message, setMessage] = useState('');

   const loadSessions = useCallback(async () => {
      try {
         setLoading(true);
         const data = await getNegotiations();
         setSessions(data);
         if (data.length > 0 && !selected) setSelected(data[0]);
      } catch (error) {
         console.error('Failed to load sessions:', error);
      } finally {
         setLoading(false);
      }
   }, [selected]);

   useEffect(() => {
      loadSessions();
   }, [loadSessions]);

   useLiveRefresh(loadSessions);

   return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">Negotiation Strategy Hub</h2>
            <p className="text-white/40 font-medium max-w-xl">Automated multi-party consensus for resolving supply chain anomalies and inventory drift.</p>
         </div>
         <button className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all glow-shadow-primary">
            <Plus size={16} /> New Strategy Session
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-280px)]">
         {/* Sidebar: Open Sessions */}
         <div className="lg:col-span-4 flex flex-col gap-4">
            <h3 className="text-[10px] font-black text-white/30 tracking-widest uppercase px-2">Active Protocols</h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
               {sessions.map(s => (
                  <motion.div
                     key={s.id}
                     onClick={() => setSelected(s)}
                     className={cn(
                        "p-5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden group",
                        selected?.id === s.id ? "glass-morphism border-primary/40 glow-shadow-primary" : "bg-white/5 border-white/5 hover:bg-white/10"
                     )}
                  >
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black text-white/20 font-mono tracking-tighter uppercase">{s.id}</span>
                        <div className={cn(
                           "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                           s.status === 'Open' ? "bg-accent/20 text-accent" : "bg-warning/20 text-warning"
                        )}>{s.status}</div>
                     </div>
                     <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{s.title}</h4>
                     <div className="flex items-center gap-3 mt-4 text-[10px] text-white/30 font-bold uppercase tracking-widest">
                        <Users size={12} /> {s.participants.length} Organizations
                     </div>
                  </motion.div>
               ))}
               {!loading && sessions.length === 0 && (
                  <div className="p-10 text-center text-white/20 italic">No active negotiations found.</div>
               )}
               {loading && sessions.length === 0 && (
                  <div className="p-10 text-center text-white/20 animate-pulse">Scanning network...</div>
               )}
            </div>
         </div>

         {/* Main View: Consensus Interface */}
         <div className="lg:col-span-8 glass-morphism rounded-[40px] border border-white/5 overflow-hidden flex flex-col relative bg-white/1">
            {selected ? (
               <>
                  {/* Summary Header */}
                  <div className="p-8 border-b border-white/5 bg-white/2 flex justify-between items-center">
                     <div className="space-y-1">
                        <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                           <Shield size={14} /> Protocol: {selected.strategy_type}
                        </div>
                        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{selected.title}</h3>
                     </div>
                     <div className="text-right">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-1">Current Proposal</span>
                        <span className="text-lg font-bold text-accent italic">{selected.current_deal}</span>
                     </div>
                  </div>

                  {/* Consensus Timeline */}
                  <div className="flex-1 p-8 overflow-y-auto space-y-8 custom-scrollbar">
                     <div className="space-y-6">
                        <TimelineItem 
                           org="System Oracle" 
                           time="10:42 AM" 
                           msg="Anomaly detected in Route A-12. Supply-side variance is 14.2%. Initiating consensus protocol." 
                           isSystem
                        />
                        {selected.participants.map((p, i) => (
                           <TimelineItem 
                              key={i} 
                              org={p} 
                              time={`${10 + i}:50 AM`} 
                              msg={i === 0 ? "Acknowledged. We are reviewing our warehouse logs for discrepancies." : "Data shared from our end. Trust DNA shows high reliability for this ledger segment."} 
                              status={i === 0 ? "Analyzing" : "Approved"}
                           />
                        ))}
                     </div>
                  </div>

                  {/* Strategy Selection / Action Bar */}
                  <div className="p-8 border-t border-white/5 bg-white/2 space-y-6">
                     <div className="grid grid-cols-3 gap-4">
                        <StrategyButton icon={<TrendingDown size={14} />} label="Cost Split" active />
                        <StrategyButton icon={<Clock size={14} />} label="Delay Waiver" />
                        <StrategyButton icon={<Users size={14} />} label="Inventory Swap" />
                     </div>
                     <div className="flex gap-4">
                        <div className="flex-1 relative">
                           <input 
                              value={message}
                              onChange={e => setMessage(e.target.value)}
                              placeholder="Type your organization's stance..."
                              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-sm text-white outline-none focus:border-primary/40 transition-all font-medium"
                           />
                           <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-xl hover:scale-105 transition-all">
                              <Send size={18} />
                           </button>
                        </div>
                     </div>
                  </div>
               </>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-white/20 gap-4">
                  <MessageSquare size={48} />
                  <p className="text-xs font-black tracking-widest uppercase italic">Awaiting Protocol Selection</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}

function TimelineItem({ org, time, msg, status, isSystem }: any) {
   return (
      <div className={cn(
         "flex gap-4 p-5 rounded-3xl border transition-all",
         isSystem ? "bg-primary/5 border-primary/10" : "bg-white/2 border-white/5 hover:bg-white/5"
      )}>
         <div className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border",
            isSystem ? "bg-primary/20 border-primary/20 text-primary" : "bg-white/5 border-white/10 text-white/40"
         )}>
            {isSystem ? <Zap size={18} /> : <Users size={18} />}
         </div>
         <div className="flex-1 space-y-1">
            <div className="flex justify-between items-center">
               <span className={cn("text-[10px] font-black uppercase tracking-widest", isSystem ? "text-primary" : "text-white/60")}>{org}</span>
               <span className="text-[9px] font-mono text-white/20">{time}</span>
            </div>
            <p className="text-sm text-white/80 font-medium leading-relaxed italic">"{msg}"</p>
            {status && (
               <div className="flex items-center gap-2 mt-2">
                  <div className={cn("w-1.5 h-1.5 rounded-full", status === 'Approved' ? "bg-accent" : "bg-warning")} />
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{status}</span>
               </div>
            )}
         </div>
      </div>
   );
}

function StrategyButton({ icon, label, active }: any) {
   return (
      <button className={cn(
         "flex items-center justify-center gap-2 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
         active ? "bg-primary border-primary text-white shadow-lg" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
      )}>
         {icon} {label}
      </button>
   );
}
