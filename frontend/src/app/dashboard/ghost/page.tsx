'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, AlertTriangle, TrendingDown, Database, Server, Link2, ArrowRight, RefreshCw, Layers, CheckCircle2, PackageSearch } from 'lucide-react';
import { getGhostInventory, createGhostInventory } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useLiveRefresh } from '@/lib/useLiveRefresh';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Link from 'next/link';

interface GhostItem {
   id: string;
   shipment_id: string;
   digital_count: number;
   physical_prob: number;
   delta: number;
   confidence: number;
   last_scan: string;
}

export default function GhostForensics() {
   const [inventory, setInventory] = useState<GhostItem[]>([]);
   const [mounted, setMounted] = useState(false);

   useEffect(() => {
      setMounted(true);
   }, []);

   const [loading, setLoading] = useState(true);
   const [selected, setSelected] = useState<GhostItem | null>(null);

   const loadInventory = useCallback(async () => {
      try {
         setLoading(true);
         const data = await getGhostInventory();
         setInventory(data);
         if (data.length > 0) setSelected(data[0]);
      } catch (error) {
         console.error('Failed to load ghost inventory:', error);
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      loadInventory();
   }, [loadInventory]);

   useLiveRefresh(loadInventory);

   const stats = useMemo(() => {
      const totalDelta = inventory.reduce((acc, item) => acc + Math.abs(item.delta), 0);
      const avgConfidence = inventory.reduce((acc, item) => acc + item.confidence, 0) / (inventory.length || 1);
      const criticalCases = inventory.filter(item => Math.abs(item.delta) > 5).length;
      return { totalDelta, avgConfidence, criticalCases };
   }, [inventory]);

   if (loading) {
      return (
         <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <RefreshCw className="text-primary animate-spin" size={48} />
            <p className="text-white/40 font-mono text-xs uppercase tracking-widest animate-pulse">Reconciling Physical vs Digital Inventory...</p>
         </div>
      );
   }

   return (
    <div className="space-y-8">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="glass-morphism p-6 rounded-3xl border border-white/5 space-y-2">
            <span className="text-[10px] font-black text-white/30 tracking-widest uppercase block">Total Discrepancy</span>
            <div className="flex items-baseline gap-2">
               <span className="text-4xl font-black text-danger">{stats.totalDelta}</span>
               <span className="text-xs font-bold text-white/40">UNITS</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
               <motion.div className="h-full bg-danger" initial={{ width: 0 }} animate={{ width: "70%" }} />
            </div>
         </div>

         <div className="glass-morphism p-6 rounded-3xl border border-white/5 space-y-2">
            <span className="text-[10px] font-black text-white/30 tracking-widest uppercase block">System Confidence</span>
            <div className="flex items-baseline gap-2">
               <span className="text-4xl font-black text-accent">{Math.round(stats.avgConfidence * 100)}%</span>
               <CheckCircle2 size={16} className="text-accent" />
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
               <motion.div className="h-full bg-accent" initial={{ width: 0 }} animate={{ width: `${stats.avgConfidence * 100}%` }} />
            </div>
         </div>

         <div className="md:col-span-2 glass-morphism p-6 rounded-3xl border border-white/5 flex items-center gap-6">
            <div className="flex-1">
               <span className="text-[10px] font-black text-white/30 tracking-widest uppercase block mb-2">Inventory Drift Rate</span>
               <div className="h-24 w-full relative">
                  {mounted && (
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={inventory.slice(-10)}>
                           <Bar dataKey="delta">
                              {inventory.slice(-10).map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.delta > 0 ? '#10b981' : '#ef4444'} />
                              ))}
                           </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                  )}
               </div>
            </div>
            <div className="text-right space-y-1">
               <div className="text-xs font-black text-white uppercase tracking-tighter">Drift detected</div>
               <div className="text-2xl font-black text-white">±14.2%</div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Sidebar: Case Signals */}
         <div className="lg:col-span-1 space-y-6">
            <div className="glass-morphism p-6 rounded-3xl border border-white/5 space-y-4">
               <div className="flex items-center gap-3 text-secondary">
                  <Ghost size={24} />
                  <h3 className="text-lg font-black italic tracking-tighter uppercase">Signal Logic</h3>
               </div>
               <p className="text-xs text-white/40 leading-relaxed italic">"Comparing digital telemetry against sensor-inferred physical presence."</p>
               
               <div className="space-y-3 pt-4 border-t border-white/5">
                  <SignalIcon icon={<Database size={14}/>} label="ERP Ledger Variance" val="High" />
                  <SignalIcon icon={<Server size={14}/>} label="RFID Anchor Gap" val="Med" />
                  <SignalIcon icon={<Layers size={14}/>} label="Volumetric Shift" val="Low" />
               </div>
            </div>

            {stats.criticalCases > 0 && (
               <div className="p-6 bg-danger/10 border border-danger/20 rounded-3xl space-y-2">
                  <div className="flex items-center gap-2 text-danger">
                     <AlertTriangle size={16} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Critical Alert</span>
                  </div>
                  <p className="text-xs text-white/80 font-medium">Detected {stats.criticalCases} major discrepancies exceeding error tolerance.</p>
               </div>
            )}
         </div>

         {/* Main Table Content */}
         <div className="lg:col-span-3 glass-morphism rounded-3xl border border-white/5 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/2">
               <div>
                  <h3 className="text-xl font-bold text-white italic uppercase tracking-tighter">Mismatch Forensics Caseboard</h3>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Real-time sync between physical reality and ledger</p>
               </div>
               <button onClick={loadInventory} className="p-2 glass-morphism rounded-xl border border-white/10 text-white/40 hover:text-white transition-all">
                  <RefreshCw size={18} />
               </button>
            </div>
            
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="border-b border-white/5 bg-white/2">
                        <th className="p-6 text-[10px] font-black text-white/30 tracking-widest uppercase">ID</th>
                        <th className="p-6 text-[10px] font-black text-white/30 tracking-widest uppercase">Shipment</th>
                        <th className="p-6 text-[10px] font-black text-white/30 tracking-widest uppercase text-center">Digital Count</th>
                        <th className="p-6 text-[10px] font-black text-white/30 tracking-widest uppercase text-center">Physical Prob.</th>
                        <th className="p-6 text-[10px] font-black text-white/30 tracking-widest uppercase text-center">Delta (Gap)</th>
                        <th className="p-6 text-[10px] font-black text-white/30 tracking-widest uppercase text-right">Last Scan</th>
                        <th className="p-6"></th>
                     </tr>
                  </thead>
                  <tbody>
                     {inventory.map(item => (
                        <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                           <td className="p-6 text-xs font-mono text-white/40">{item.id}</td>
                           <td className="p-6">
                              <div className="text-sm font-bold text-white">{item.shipment_id}</div>
                              <div className="text-[9px] text-white/20 uppercase tracking-widest font-black">Tracking Active</div>
                           </td>
                           <td className="p-6 text-sm font-mono text-white/60 text-center">{item.digital_count}</td>
                           <td className="p-6 text-center">
                              <span className={cn(
                                 "text-xs font-black px-2 py-1 rounded",
                                 item.physical_prob > 0.9 ? "text-accent" : "text-warning"
                              )}>
                                 {Math.round(item.physical_prob * 100)}%
                              </span>
                           </td>
                           <td className={cn("p-6 text-sm font-black text-center", item.delta !== 0 ? "text-danger" : "text-accent")}>
                              {item.delta > 0 ? "+" : ""}{item.delta}
                           </td>
                           <td className="p-6 text-right text-[10px] font-mono text-white/30">
                              {new Date(item.last_scan).toLocaleTimeString()}
                           </td>
                           <td className="p-6">
                              <Link href="/dashboard/impossible" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                                 <ArrowRight size={16} />
                              </Link>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               {inventory.length === 0 && (
                  <div className="p-32 text-center">
                     <div className="flex flex-col items-center gap-6 opacity-30">
                        <div className="relative">
                           <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full animate-pulse" />
                           <PackageSearch size={80} className="relative z-10 text-accent" />
                        </div>
                        <div className="space-y-2">
                           <h4 className="text-lg font-black uppercase tracking-[0.2em] text-white">System Parity Confirmed</h4>
                           <p className="text-xs font-medium text-white/60 italic max-w-sm mx-auto">"Physical and digital inventory are in perfect phase. No forensics required."</p>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
   );
}

function SignalIcon({ icon, label, val }: any) {
   return (
      <div className="flex justify-between items-center bg-white/2 p-3 rounded-xl border border-white/5">
         <div className="flex items-center gap-3">
            <div className="text-primary">{icon}</div>
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{label}</span>
         </div>
         <span className={cn(
            "text-[9px] font-black uppercase px-1.5 py-0.5 rounded",
            val === 'High' ? "bg-danger/20 text-danger" : val === 'Med' ? "bg-warning/20 text-warning" : "bg-accent/20 text-accent"
         )}>{val}</span>
      </div>
   );
}
