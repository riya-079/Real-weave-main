'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Fingerprint, TrendingUp, AlertCircle, CheckCircle2, Award, History, Globe, Star, Activity, UserCheck, Clock } from 'lucide-react';
import { getTrustDNA } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useLiveRefresh } from '@/lib/useLiveRefresh';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface TrustRecord {
   id: string;
   org_id: string;
   score: number;
   dimensions: Record<string, number>;
   history: Array<{ date: string; score: number }>;
}

export default function TrustDNA() {
   const [trustData, setTrustData] = useState<TrustRecord[]>([]);
   const [selected, setSelected] = useState<TrustRecord | null>(null);
   const [loading, setLoading] = useState(true);

   const loadTrust = React.useCallback(async () => {
      try {
         setLoading(true);
         const data = await getTrustDNA();
         setTrustData(data);
         if (data.length > 0 && !selected) setSelected(data[0]);
      } catch (error) {
         console.error('Failed to load Trust DNA:', error);
      } finally {
         setLoading(false);
      }
   }, [selected]);

   useEffect(() => {
      loadTrust();
   }, [loadTrust]);

   useLiveRefresh(loadTrust);

   const radarData = useMemo(() => {
      if (!selected) return [];
      return Object.entries(selected.dimensions).map(([key, val]) => ({
         subject: key.charAt(0).toUpperCase() + key.slice(1),
         A: val * 100,
         fullMark: 100,
      }));
   }, [selected]);

   if (loading && trustData.length === 0) {
      return (
         <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Fingerprint className="text-secondary animate-pulse" size={64} />
            <p className="text-white/40 font-mono text-xs uppercase tracking-widest animate-pulse">Sequencing Behavioral DNA...</p>
         </div>
      );
   }

   return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
         <div className="space-y-1">
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-[1.15] py-1">Trust DNA Matrix</h2>
            <p className="text-white/40 font-medium max-w-xl">Deep behavioral forensics to quantify reliability beyond simple KPIs.</p>
         </div>
         <div className="flex gap-4">
            <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
               <Shield className="text-accent" size={20} />
               <span className="text-[10px] font-black text-white uppercase tracking-widest">Protocol V3.2 Active</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-320px)]">
         {/* Org List */}
         <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {trustData.map(t => (
               <motion.div
                  key={t.id}
                  onClick={() => setSelected(t)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                     "p-6 rounded-[2rem] border cursor-pointer transition-all relative flex flex-col gap-4 min-h-[140px] shrink-0",
                     selected?.id === t.id ? "glass-morphism border-secondary/40 shadow-[0_0_30px_rgba(34,211,238,0.1)]" : "bg-white/5 border-white/5 hover:bg-white/10"
                  )}
               >
                  <div className="flex justify-between items-center">
                     <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-colors", selected?.id === t.id ? "bg-secondary/20 text-secondary" : "bg-white/5 text-white/40")}>
                        <Globe size={20} />
                     </div>
                     <span className={cn(
                        "text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-widest",
                        t.score > 0.8 ? "bg-accent/20 text-accent border border-accent/20" : "bg-warning/20 text-warning border border-warning/20"
                     )}>{Math.round(t.score * 100)}%</span>
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white italic uppercase tracking-tighter group-hover:text-secondary">{t.org_id}</h4>
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-0.5">Multi-state integrity</p>
                  </div>
                  
                  {selected?.id === t.id && (
                     <motion.div layoutId="active-dna" className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary rounded-l-full" />
                  )}
               </motion.div>
            ))}
         </div>

         {/* Deep Analysis */}
         <div className="lg:col-span-3 glass-morphism rounded-[40px] border border-white/5 overflow-hidden flex flex-col bg-white/1">
            {selected ? (
               <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                  {/* Top Stats */}
                  <div className="grid grid-cols-3 gap-8">
                     <div className="space-y-2">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block">Consensus Score</span>
                        <div className="text-5xl font-black text-white italic">{(selected.score * 100).toFixed(0)}</div>
                        <div className="flex items-center gap-2 text-accent">
                           <TrendingUp size={14} />
                           <span className="text-[10px] font-bold uppercase tracking-widest">+2.4% vs last scan</span>
                        </div>
                     </div>
                     <div className="col-span-2 flex items-center gap-10 border-l border-white/5 pl-10">
                        <DimensionStat label="Stability" value={selected.dimensions.stability} />
                        <DimensionStat label="Honesty" value={selected.dimensions.honesty} />
                        <DimensionStat label="Speed" value={selected.dimensions.speed} />
                        <DimensionStat label="Precision" value={selected.dimensions.precision} />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-12">
                     {/* Radar Map */}
                     <div className="space-y-6">
                        <h3 className="text-xs font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                           <Activity size={14} className="text-secondary" /> Behavioral DNA Radar
                        </h3>
                        <div className="h-72 w-full glass-morphism rounded-3xl p-6 border border-white/5 bg-white/2">
                           <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                 <PolarGrid stroke="#fff2" />
                                 <PolarAngleAxis dataKey="subject" tick={{ fill: '#fff4', fontSize: 10, fontWeight: 800 }} />
                                 <Radar name="DNA" dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} />
                              </RadarChart>
                           </ResponsiveContainer>
                        </div>
                     </div>

                     {/* Performance Log */}
                     <div className="space-y-6">
                        <h3 className="text-xs font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                           <History size={14} className="text-secondary" /> Sequencing History
                        </h3>
                        <div className="space-y-4">
                           {selected.history.map((h, i) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                                 <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-xl bg-white/5 text-white/20">
                                       <Clock size={16} />
                                    </div>
                                    <div>
                                       <div className="text-sm font-bold text-white uppercase">{h.date}</div>
                                       <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Integrity Check Completed</div>
                                    </div>
                                 </div>
                                 <div className="text-lg font-black text-white">{(h.score * 100).toFixed(0)}</div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Recommendation Banner */}
                  <div className="p-6 bg-accent/5 border border-accent/20 rounded-3xl flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <Award className="text-accent" size={32} />
                        <div>
                           <h4 className="text-sm font-black text-white uppercase tracking-widest">Preferred Partner Status</h4>
                           <p className="text-xs text-white/40 italic">This organization consistently meets high-fidelity trust markers.</p>
                        </div>
                     </div>
                     <button className="px-6 py-2 bg-accent text-white rounded-xl font-black text-[10px] uppercase tracking-widest glow-shadow-accent">
                        View Full Dossier
                     </button>
                  </div>
               </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-white/20 gap-4">
                  <UserCheck size={48} />
                  <p className="text-xs font-black tracking-widest uppercase italic">Select entity for DNA mapping</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}

function DimensionStat({ label, value }: { label: string; value: number }) {
   return (
      <div className="space-y-1">
         <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block">{label}</span>
         <span className="text-xl font-black text-white">{(value * 100).toFixed(0)}</span>
         <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full bg-secondary" initial={{ width: 0 }} animate={{ width: `${value * 100}%` }} />
         </div>
      </div>
   );
}
