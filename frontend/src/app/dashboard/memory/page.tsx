'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Box, Thermometer, Zap, MapPin, Ruler, Layers, ArrowUpRight, ShieldCheck, History } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockCapsules = [
  { id: 'BATCH-2910', name: 'Neuro-Stabilizer X', origin: 'Singapore', dest: 'Berlin', status: 'In Transit', trust: 0.98, age: '4 days' },
  { id: 'BATCH-4402', name: 'Quantum Core Unit', origin: 'Seoul', dest: 'San Francisco', status: 'Delayed', trust: 0.62, age: '12 days' },
  { id: 'BATCH-1188', name: 'Synth-Fiber Coil', origin: 'Mumbai', dest: 'Dubai', status: 'Delivered', trust: 0.94, age: '2 days' },
];

export default function MemoryCapsule() {
  const [selected, setSelected] = useState(mockCapsules[0]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-3xl font-black text-white">Product Memory Capsules</h2>
            <p className="text-white/40">Each shipment is a living biography of handling and trust.</p>
         </div>
         <div className="flex gap-4">
               <button onClick={() => window.open('mailto:?subject=Memory%20Biography%20Export&body=Export%20prepared%20for%20BATCH-2910', '_self')} className="px-6 py-2 glass-morphism border border-white/5 text-white/60 text-sm font-bold rounded-lg hover:text-white">EXPORT BIOGRAPHY</button>
            <Link href="/dashboard/impossible" className="px-6 py-2 bg-accent text-white text-sm font-bold rounded-lg glow-shadow-accent">
              NEW AUDIT
            </Link>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Capsule Grid */}
         <div className="lg:col-span-1 space-y-4 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {mockCapsules.map(c => (
              <div 
                key={c.id} 
                onClick={() => setSelected(c)}
                className={cn(
                  "p-5 rounded-2xl border cursor-pointer transition-all",
                  selected.id === c.id ? "bg-primary/10 border-primary/40" : "glass-morphism border-white/5 hover:bg-white/5"
                )}
              >
                 <div className="flex justify-between items-start mb-3">
                    <Box size={24} className={selected.id === c.id ? "text-primary" : "text-white/20"} />
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", c.trust > 0.8 ? "text-accent bg-accent/10" : "text-warning bg-warning/10")}>
                      {(c.trust * 100).toFixed(0)}% TRUST
                    </span>
                 </div>
                 <h4 className="text-white font-bold text-sm mb-1">{c.name}</h4>
                 <p className="text-[10px] text-white/30 font-mono italic">{c.id} • {c.origin} → {c.dest}</p>
              </div>
            ))}
         </div>

         {/* Capsule Story */}
         <div className="lg:col-span-3 glass-morphism rounded-3xl border border-white/5 p-10 relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full">
               <div className="flex justify-between items-start mb-12">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/10 glow-shadow-primary">
                       <Box size={40} className="text-primary" />
                    </div>
                    <div>
                       <h3 className="text-4xl font-black text-white italic tracking-tight">{selected.name}</h3>
                       <p className="text-white/40 font-mono uppercase tracking-widest text-xs flex items-center gap-2 mt-1">
                         <ShieldCheck size={14} className="text-accent" /> AUTHENTICATED MEMORY CHAIN // {selected.id}
                       </p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] text-white/30 font-bold uppercase mb-1">CUMULATIVE STRESS</p>
                     <p className="text-4xl font-black text-white">0.24 <span className="text-sm text-white/40">G-Units</span></p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <MetricCard icon={<Thermometer />} label="Thermal Profile" value="4.2°C" sub="STABLE RANGE" color="text-blue-400" />
                  <MetricCard icon={<Zap />} label="Energy Signature" value="0.8 kW" sub="PULSE STEADY" color="text-yellow-400" />
                  <MetricCard icon={<Layers />} label="Custody Layers" value="4 Transfers" sub="2 UNVERIFIED" color="text-purple-400" />
               </div>

               <div className="flex-1 border-t border-white/5 pt-8">
                  <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                    <History size={16} /> BEHAVIORAL TIMELINE
                  </h4>
                  <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                     <TimelineItem title="Handover to Nexus Logistics" time="Oct 12, 14:20" status="Normal" detail="Thermal stability maintained at 4.1°C." active />
                     <TimelineItem title="Thermal Excursion Alert" time="Oct 11, 09:44" status="Warning" detail="Subtle 2°C rise detected for 14 minutes during tarmac transfer." />
                     <TimelineItem title="Origin Facility Seal" time="Oct 10, 18:00" status="Genesis" detail="Memory capsule initialized at Singapore Alpha Hub." />
                  </div>
               </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute top-[-50px] right-[-50px] w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
         </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, sub, color }: any) {
  return (
    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
      <div className={cn("mb-2", color)}>{React.cloneElement(icon, { size: 24 })}</div>
      <p className="text-[10px] text-white/40 font-bold uppercase">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-[10px] text-white/20 font-mono">{sub}</p>
    </div>
  );
}

function TimelineItem({ title, time, status, detail, active = false }: any) {
  return (
    <div className="flex items-start gap-8 pl-1">
       <div className={cn(
         "w-9 h-9 rounded-xl flex items-center justify-center z-10 border transition-all",
         active ? "bg-primary border-primary glow-shadow-primary scale-110" : "bg-card-bg border-white/10"
       )}>
          <Box size={16} className={active ? "text-white" : "text-white/20"} />
       </div>
       <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
             <h5 className={cn("font-bold text-sm", active ? "text-white" : "text-white/60")}>{title}</h5>
             <span className="text-[10px] text-white/30 font-mono">{time}</span>
          </div>
          <p className="text-xs text-white/40 leading-relaxed font-medium">{detail}</p>
       </div>
    </div>
  );
}
