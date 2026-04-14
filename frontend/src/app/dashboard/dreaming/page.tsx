'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Play, AlertCircle, TrendingDown, DollarSign, Globe, Layers, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { createScenario, getScenarios } from '@/lib/api';
import { useLiveRefresh } from '@/lib/useLiveRefresh';

type Scenario = {
   id: string;
   name: string;
   description: string;
   probability: number;
   impact_score: number;
   ripple_effects: string[];
};

const rippleData = [
  { node: 'Supplier A', delay: 4 },
  { node: 'Warehouse 1', delay: 12 },
  { node: 'Last Mile', delay: 18 },
  { node: 'Customer Trust', delay: 25 },
];

export default function FutureDreaming() {
   const [scenarios, setScenarios] = useState<Scenario[]>([]);
   const [selected, setSelected] = useState<Scenario | null>(null);
  const [simulating, setSimulating] = useState(false);

   const loadScenarios = React.useCallback(async () => {
      try {
         const data = await getScenarios();
         setScenarios(data);
         setSelected((current) => {
            if (!data.length) {
               return null;
            }
            if (!current) {
               return data[0];
            }
            return data.find((item: Scenario) => item.id === current.id) ?? data[0];
         });
      } catch (error) {
         console.error('Failed to load scenarios:', error);
      }
   }, []);

   useEffect(() => {
      loadScenarios();
   }, [loadScenarios]);

   useLiveRefresh(loadScenarios);

   const runSimulation = async () => {
      if (!selected) {
         return;
      }

    setSimulating(true);

      const simulatedScenario: Scenario = {
         id: `run-${Date.now()}`,
         name: `${selected.name} result`,
         description: `${selected.description} Simulated run saved at ${new Date().toLocaleString()}.`,
         probability: Math.min(0.99, Math.max(0.01, selected.probability + 0.03)),
         impact_score: Math.min(1, Math.max(0, selected.impact_score + 0.04)),
         ripple_effects: [...selected.ripple_effects, 'Result saved to live scenario history'],
      };

      try {
         const saved = await createScenario(simulatedScenario);
         setScenarios((current) => [saved, ...current]);
         setSelected(saved);
         loadScenarios();
      } catch (error) {
         console.error('Failed to save simulation result:', error);
      } finally {
         setTimeout(() => setSimulating(false), 1200);
      }
  };

   const impactValue = selected ? Math.round(selected.impact_score * 100) : 0;
   const probabilityValue = selected ? selected.probability : 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-primary/5 p-8 rounded-3xl border border-primary/20">
         <div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter">FUTURE RISK SIMULATOR</h2>
            <p className="text-white/40 max-w-xl mt-2 font-medium">
               Run what-if scenarios to predict delays, losses, and chain impact before they happen.
            </p>
         </div>
         <button 
           onClick={runSimulation}
           disabled={simulating}
                className="px-10 py-5 bg-primary text-white rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all disabled:opacity-50 glow-shadow-primary tracking-[0.08em] text-sm"
         >
                {simulating ? 'Simulating...' : <><Play fill="white" size={20} /> Run scenario</>}
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Scenario Selection */}
         <div className="space-y-4">
            <h3 className="text-sm font-bold text-white tracking-[0.08em] mb-4 opacity-40">Scenarios</h3>
                  {scenarios.map(s => (
              <div 
                key={s.id}
                onClick={() => setSelected(s)}
                className={cn(
                  "p-6 rounded-2xl border cursor-pointer transition-all flex justify-between items-center group",
                           selected?.id === s.id ? "bg-white/10 border-white/20" : "glass-morphism border-white/5 hover:bg-white/5"
                )}
              >
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-white/20 group-hover:text-white transition-colors">
                                 {s.id.slice(0, 4)}
                    </div>
                    <div>
                       <h4 className="text-white font-bold">{s.name}</h4>
                                  <p className="text-[10px] text-white/30 tracking-[0.08em]">{s.description}</p>
                    </div>
                 </div>
                         <div className={cn("text-xl font-black", selected?.id === s.id ? "text-primary" : "text-white/20")}>
                            {(s.impact_score * 100).toFixed(0)}%
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
                      <p className="text-primary font-mono tracking-tighter text-lg animate-pulse">CALCULATING FUTURE RISKS...</p>
                   </div>
                </div>
             ) : null}

             <div className="flex justify-between items-start mb-10">
                <div>
                   <h3 className="text-2xl font-bold text-white mb-2">{selected?.name || 'Loading scenario...'}</h3>
                   <div className="flex gap-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                         <DollarSign size={14} className="text-accent" />
                         <span className="text-[10px] font-bold text-white tracking-[0.08em]">{impactValue > 0 ? '$' : '-$'}{Math.abs(impactValue * 4200).toLocaleString()} estimated impact</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                         <Globe size={14} className="text-primary" />
                         <span className="text-[10px] font-bold text-white tracking-[0.08em]">Live scenario from backend</span>
                      </div>
                   </div>
                </div>
                <div className="px-6 py-2 glass-morphism border border-white/10 rounded-xl text-white/60 text-xs font-bold italic">
                   PROBABILITY: {probabilityValue.toFixed(2)}
                </div>
             </div>

             <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <h4 className="text-xs font-bold text-white/40 tracking-[0.08em]">Ripple effect intensity</h4>
                   <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={(selected?.ripple_effects?.length ? selected.ripple_effects : rippleData.map((item) => `${item.node} may be delayed`)).map((entry: any, index: number) => ({
                            node: typeof entry === 'string' ? entry : entry.node,
                            delay: typeof entry === 'string' ? (index + 1) * 8 : entry.delay,
                         }))}>
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
                   <h4 className="text-xs font-bold text-white/40 tracking-[0.08em]">Likely chain reactions</h4>
                            <div className="space-y-4">
                                 {(selected?.ripple_effects?.length ? selected.ripple_effects : [
                                    'Low inventory risk',
                                    'Late-delivery penalty',
                                    'Partner confidence drop',
                                 ]).map((effect, index) => (
                                    <ReactionItem
                                       key={`${effect}-${index}`}
                                       title={typeof effect === 'string' && effect.includes('risk') ? effect : `Effect ${index + 1}`}
                                       desc={typeof effect === 'string' ? effect : 'Persisted scenario result'}
                                       severity={index === 0 ? 'Critical' : index === 1 ? 'High' : 'Medium'}
                                    />
                                 ))}
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
