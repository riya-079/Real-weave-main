'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, Activity, Globe, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const suppliers = [
  { 
    id: 'S-NX01', name: 'Nexus Logistics Hub', type: 'Transporter', trust: 0.94, 
    data: [
      { subject: 'Punctuality', A: 95 },
      { subject: 'Quality', A: 90 },
      { subject: 'Disclosure', A: 98 },
      { subject: 'Crisis Response', A: 85 },
      { subject: 'Consistency', A: 92 },
    ]
  },
  { 
    id: 'S-QW42', name: 'Quantum Warehousing', type: 'Warehouse', trust: 0.72, 
    data: [
      { subject: 'Punctuality', A: 65 },
      { subject: 'Quality', A: 80 },
      { subject: 'Disclosure', A: 45 },
      { subject: 'Crisis Response', A: 70 },
      { subject: 'Consistency', A: 75 },
    ]
  },
  { 
    id: 'S-AP88', name: 'Apex Manufacturing', type: 'Supplier', trust: 0.88, 
    data: [
      { subject: 'Punctuality', A: 88 },
      { subject: 'Quality', A: 92 },
      { subject: 'Disclosure', A: 84 },
      { subject: 'Crisis Response', A: 90 },
      { subject: 'Consistency', A: 86 },
    ]
  },
];

export default function SupplierTrust() {
  const [selected, setSelected] = React.useState(suppliers[0]);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase whitespace-pre-wrap">Supplier Trust DNA</h2>
            <p className="text-white/40 max-w-xl mt-2 font-medium">
               A multi-dimensional behavioral signature for every partner in the ecosystem. Beyond static scores to deep integrity profiling.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Supplier Sidebar */}
         <div className="space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-4 opacity-40">Ecosystem Partners</h3>
            {suppliers.map(s => (
              <div 
                key={s.id} 
                onClick={() => setSelected(s)}
                className={cn(
                  "p-6 rounded-2xl border cursor-pointer transition-all flex justify-between items-center group",
                  selected.id === s.id ? "bg-white/10 border-white/20" : "glass-morphism border-white/5 hover:bg-white/5"
                )}
              >
                 <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border transition-colors", selected.id === s.id ? "border-primary bg-primary/20 text-primary" : "border-white/10 bg-white/5 text-white/30")}>
                       <Globe size={20} />
                    </div>
                    <div>
                       <h4 className="text-white font-bold text-sm">{s.name}</h4>
                       <p className="text-[10px] text-white/30 uppercase tracking-widest">{s.type}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className={cn("text-xl font-black", s.trust > 0.9 ? "text-accent" : s.trust > 0.8 ? "text-primary" : "text-warning")}>
                       {s.trust.toFixed(2)}
                    </div>
                 </div>
              </div>
            ))}
         </div>

         {/* DNA Profile View */}
         <div className="lg:col-span-2 glass-morphism rounded-3xl border border-white/5 p-10 flex flex-col items-center">
             <div className="w-full flex justify-between items-start mb-10">
                <div className="flex gap-6 items-center">
                   <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary glow-shadow-primary">
                      <ShieldCheck size={32} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-white">{selected.name}</h3>
                      <p className="text-xs text-white/40 uppercase tracking-widest font-bold">DNA-ID: {selected.id} // VERIFIED_PROFILE</p>
                   </div>
                </div>
                <div className="px-6 py-2 bg-accent/10 border border-accent/20 rounded-xl">
                   <span className="text-accent text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 size={14} /> High Resilience
                   </span>
                </div>
             </div>

             <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="h-[350px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={selected.data}>
                         <PolarGrid stroke="#fff1" />
                         <PolarAngleAxis dataKey="subject" tick={{ fill: '#fff4', fontSize: 10 }} />
                         <Radar
                            name={selected.name}
                            dataKey="A"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.6}
                         />
                      </RadarChart>
                   </ResponsiveContainer>
                </div>

                <div className="space-y-6">
                   <h4 className="text-sm font-bold text-white uppercase tracking-widest opacity-40">Integrity Highlights</h4>
                   <div className="space-y-4">
                      <TraitItem label="Crisis Honesty" value="Elite" desc="98% data consistency during 2025 Suez blockage." />
                      <TraitItem label="Disclosure Velocity" value="Superior" desc="Anomaly reporting occurs within 0.5s of detection." />
                      <TraitItem label="Substitution Risk" value="Minimal" desc="0 instances of unverified batch substitution in 24 months." />
                   </div>
                </div>
             </div>
             
             <div className="w-full mt-12 grid grid-cols-3 gap-6 pt-10 border-t border-white/5">
                <MiniStats label="Active Shipments" value="442" icon={<Database />} />
                <MiniStats label="Anomaly Association" value="0.02%" icon={<AlertTriangle />} />
                <MiniStats label="Consistency Trend" value="+4.2%" icon={<TrendingUp />} />
             </div>
         </div>
      </div>
    </div>
  );
}

function TraitItem({ label, value, desc }: any) {
  return (
    <div className="space-y-1">
       <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-white/40 uppercase tracking-widest">{label}</span>
          <span className="text-primary italic">{value}</span>
       </div>
       <p className="text-[10px] text-white/20 italic">{desc}</p>
    </div>
  );
}

function MiniStats({ label, value, icon }: any) {
  return (
    <div className="flex items-center gap-4">
       <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-white/40">
          {React.cloneElement(icon, { size: 20 })}
       </div>
       <div>
          <p className="text-[10px] text-white/30 uppercase font-black">{label}</p>
          <p className="text-xl font-black text-white">{value}</p>
       </div>
    </div>
  );
}
