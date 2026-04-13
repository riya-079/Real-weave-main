'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Play, AlertCircle, TrendingDown, DollarSign, Globe, Layers, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const scenarios = [
  { id: 'S1', name: 'Port Labor Strike', impact: 0.82, risk: 'High', color: '#ef4444' },
  { id: 'S2', name: 'Suez Congestion', impact: 0.45, risk: 'Medium', color: '#f59e0b' },
  { id: 'S3', name: 'Chip Shortage v2', impact: 0.94, risk: 'Extreme', color: '#ec4899' },
  { id: 'S4', name: 'Arctic Route Open', impact: -0.21, risk: 'Opportunity', color: '#10b981' },
];

const rippleData = [
  { node: 'Supplier A', delay: 4 },
  { node: 'Warehouse 1', delay: 12 },
  { node: 'Last Mile', delay: 18 },
  { node: 'Customer Trust', delay: 25 },
];

export default function FutureDreaming() {
  const [selected, setSelected] = useState(scenarios[0]);
  const [simulating, setSimulating] = useState(false);

  const runSimulation = () => {
    setSimulating(true);
    setTimeout(() => setSimulating(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-primary/5 p-8 rounded-3xl border border-primary/20">
         <div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter">FUTURE DREAMING LAB</h2>
            <p className="text-white/40 max-w-xl mt-2 font-medium">
               Simulate alternate realities and identify hidden ripple effects before they manifest in physical space.
            </p>
         </div>
         <button 
           onClick={runSimulation}
           disabled={simulating}
           className="px-10 py-5 bg-primary text-white rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all disabled:opacity-50 glow-shadow-primary uppercase tracking-widest text-sm"
         >
           {simulating ? 'SIMULATING...' : <><Play fill="white" size={20} /> RUN SCENARIO ENGINE</>}
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Scenario Selection */}
         <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em] mb-4 opacity-40">Active Scenarios</h3>
            {scenarios.map(s => (
              <div 
                key={s.id}
                onClick={() => setSelected(s)}
                className={cn(
                  "p-6 rounded-2xl border cursor-pointer transition-all flex justify-between items-center group",
                  selected.id === s.id ? "bg-white/10 border-white/20" : "glass-morphism border-white/5 hover:bg-white/5"
                )}
              >
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-white/20 group-hover:text-white transition-colors">
                      {s.id}
                    </div>
                    <div>
                       <h4 className="text-white font-bold">{s.name}</h4>
                       <p className="text-[10px] text-white/30 uppercase tracking-widest">{s.risk} RISK</p>
                    </div>
                 </div>
                 <div className={cn("text-xl font-black", selected.id === s.id ? "text-primary" : "text-white/20")}>
                   {s.impact > 0 ? '+' : ''}{(s.impact * 100).toFixed(0)}%
                 </div>
              </div>
            ))}
         </div>

         {/* Simulation Visualization */}
         <div className="lg:col-span-2 glass-morphism rounded-3xl border border-white/5 p-10 flex flex-col relative overflow-hidden h-[600px]">
             {simulating ? (
                <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-md flex items-center justify-center">
                   <div className="flex flex-col items-center gap-6">
                      <div className="w-24 h-24 relative">
                         <div className="absolute inset-0 border-4 border-primary rounded-full animate-ping opacity-20" />
                         <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                      <p className="text-primary font-mono tracking-tighter text-lg animate-pulse">COLLATING FUTURE STATES...</p>
                   </div>
                </div>
             ) : null}

             <div className="flex justify-between items-start mb-10">
                <div>
                   <h3 className="text-2xl font-bold text-white mb-2">{selected.name}</h3>
                   <div className="flex gap-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                         <DollarSign size={14} className="text-accent" />
                         <span className="text-[10px] font-bold text-white uppercase tracking-widest">$420k Proj. Loss</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                         <Globe size={14} className="text-primary" />
                         <span className="text-[10px] font-bold text-white uppercase tracking-widest">Global Hub C-4</span>
                      </div>
                   </div>
                </div>
                <div className="px-6 py-2 glass-morphism border border-white/10 rounded-xl text-white/60 text-xs font-bold italic">
                   PROBABILITY: 0.14
                </div>
             </div>

             <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest">Ripple Effect Intensity</h4>
                   <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={rippleData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#fff1" vertical={false} />
                            <XAxis dataKey="node" stroke="#fff3" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#fff3" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{ fill: '#fff1' }} contentStyle={{ background: '#0f172a', border: '1px solid #fff2' }} />
                            <Bar dataKey="delay" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                <div className="space-y-6">
                   <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest">Hidden Chain Reactions</h4>
                   <div className="space-y-4">
                      <ReactionItem title="Inventory Starvation" desc="Delayed deliveries force local hub into emergency redistribution mode." severity="Critical" />
                      <ReactionItem title="Contractual Penalty" desc="Threshold for delivery windows exceeded at 4 out of 10 nodes." severity="High" />
                      <ReactionItem title="Trust Erosion" desc="Partner confidence predicted to drop by 14% in EU region." severity="Medium" />
                   </div>
                </div>
             </div>
             
             {/* Decorative Elements */}
             <div className="absolute bottom-[-100px] right-[-100px] w-80 h-80 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
         </div>
      </div>
    </div>
  );
}

function ReactionItem({ title, desc, severity }: any) {
  const colors:any = { Critical: 'text-danger', High: 'text-warning', Medium: 'text-primary' };
  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex gap-4">
       <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0 bg-current", colors[severity])} />
       <div>
          <h5 className="text-sm font-bold text-white leading-none mb-1">{title}</h5>
          <p className="text-[10px] text-white/40 italic leading-tight">{desc}</p>
       </div>
    </div>
  );
}
