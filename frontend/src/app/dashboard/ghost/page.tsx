'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Ghost, Search, AlertTriangle, TrendingDown, Database, Server, Link2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const ghostCases = [
  { id: 'GH-001', item: 'Medical Ventilator Component', recorded: 420, inferred: 382, mismatch: -38, reason: 'Probable Physical Substitution', status: 'Active' },
  { id: 'GH-002', item: 'Semiconductor Grade Silicon', recorded: 1000, inferred: 1045, mismatch: +45, reason: 'Duplicate Log Entry detected at Node 4', status: 'Under Review' },
  { id: 'GH-003', item: 'Cold-Chain Insulin', recorded: 2500, inferred: 2100, mismatch: -400, reason: 'Shadow Transfer suspected beyond Geo-Fence', status: 'Critical' },
];

export default function GhostForensics() {
  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end mb-4">
         <div>
            <div className="flex items-center gap-3 mb-2">
               <Ghost className="text-secondary" size={32} />
               <h2 className="text-4xl font-black text-white italic tracking-tighter">GHOST INVENTORY FORENSICS</h2>
            </div>
            <p className="text-white/40 max-w-2xl font-medium">
               Detecting the delta between digital records and probable physical reality. Our forensics engine identifies shadow transfers and stock inflation in real-time.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Mismatch Explorer */}
         <div className="lg:col-span-1 space-y-6">
            <div className="glass-morphism p-6 rounded-3xl border border-white/5 space-y-4">
               <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] opacity-40">Forensic Confidence</h3>
               <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-primary">0.94</span>
                  <TrendingDown size={24} className="text-danger -rotate-45" />
               </div>
               <p className="text-[10px] text-white/30 italic">Confidence level in digital-physical synchronization across the network.</p>
            </div>
            
            <div className="glass-morphism p-6 rounded-3xl border border-white/5 space-y-4">
               <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] opacity-40">System Signals</h3>
               <div className="space-y-3">
                  <SignalItem icon={<Database />} label="Record Inflation Detect" />
                  <SignalItem icon={<Server />} label="Physical Movement Delta" />
                  <SignalItem icon={<Link2 />} label="Hash Divergence" />
               </div>
            </div>
         </div>

         {/* Case Table */}
         <div className="lg:col-span-3 glass-morphism rounded-3xl border border-white/5 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/2">
               <h3 className="text-xl font-bold text-white italic">Active Mismatch Cases</h3>
               <Link href="/dashboard/impossible" className="px-6 py-2 glass-morphism border border-white/10 text-white font-bold text-xs rounded-lg hover:bg-white/5">
                  FULL RECONCILIATION
               </Link>
            </div>
            
            <div className="flex-1 overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="border-b border-white/5">
                        <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Case ID</th>
                        <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Asset Category</th>
                        <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-widest text-center">Digital Log</th>
                        <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-widest text-center">Physical Reality</th>
                        <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-widest text-center">Delta</th>
                        <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-widest">Suspected Reason</th>
                        <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-widest"></th>
                     </tr>
                  </thead>
                  <tbody>
                     {ghostCases.map(c => (
                        <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                           <td className="p-6 text-sm font-mono text-white/60">{c.id}</td>
                           <td className="p-6 text-sm font-bold text-white">{c.item}</td>
                           <td className="p-6 text-sm font-mono text-white/40 text-center">{c.recorded}</td>
                           <td className="p-6 text-sm font-mono text-white/80 text-center">{c.inferred}</td>
                           <td className={cn("p-6 text-sm font-black text-center", c.mismatch < 0 ? "text-danger" : "text-accent")}>
                              {c.mismatch > 0 ? "+" : ""}{c.mismatch}
                           </td>
                           <td className="p-6 text-[10px] font-bold text-white/40 uppercase italic max-w-[200px] leading-tight">{c.reason}</td>
                           <td className="p-6">
                                 <Link href="/dashboard/impossible" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                                 <ArrowRight size={16} />
                                 </Link>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            
            <div className="p-6 bg-danger/5 border-t border-danger/10 flex items-center gap-4">
               <AlertTriangle className="text-danger shrink-0" size={24} />
               <p className="text-xs text-danger font-bold italic uppercase tracking-wider">
                  Critical Warning: Shadow transfer detected in Regional Hub 14. 400 Insulin units unaccounted for in physical space.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

function SignalItem({ icon, label }: any) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/2 rounded-xl border border-white/5">
       <div className="text-primary">{icon}</div>
       <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{label}</span>
    </div>
  );
}
