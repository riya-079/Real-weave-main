'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Play, AlertCircle, TrendingDown, DollarSign, Globe, Layers, ArrowRight, Plus, X, BarChart3, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
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

export default function FutureDreaming() {
   const [scenarios, setScenarios] = useState<Scenario[]>([]);
   const [selected, setSelected] = useState<Scenario | null>(null);
   const [simulating, setSimulating] = useState(false);
   const [showForm, setShowForm] = useState(false);
   const [mounted, setMounted] = useState(false);
   
   useEffect(() => {
      setMounted(true);
   }, []);
   
   // Form State
   const [newName, setNewName] = useState('');
   const [newDesc, setNewDesc] = useState('');
   const [newProb, setNewProb] = useState(0.5);
   const [newImpact, setNewImpact] = useState(0.5);
   const [newRipples, setNewRipples] = useState<string[]>([]);
   const [rippleInput, setRippleInput] = useState('');

   const loadScenarios = React.useCallback(async () => {
      try {
         const data = await getScenarios();
         setScenarios(data);
         if (!selected && data.length > 0) setSelected(data[0]);
      } catch (error) {
         console.error('Failed to load scenarios:', error);
      }
   }, [selected]);

   useEffect(() => {
      loadScenarios();
   }, [loadScenarios]);

   useLiveRefresh(loadScenarios);

   const runSimulation = async () => {
      if (!selected) return;
      setSimulating(true);
      await new Promise(r => setTimeout(r, 2000));
      setSimulating(false);
   };

   const handleCreateScenario = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
         const scenario = {
            id: `fs-${Date.now()}`,
            name: newName,
            description: newDesc,
            probability: newProb,
            impact_score: newImpact,
            ripple_effects: newRipples
         };
         const saved = await createScenario(scenario);
         setScenarios([saved, ...scenarios]);
         setSelected(saved);
         setShowForm(false);
         // Reset form
         setNewName(''); setNewDesc(''); setNewProb(0.5); setNewImpact(0.5); setNewRipples([]);
      } catch (error) {
         console.error('Failed to create scenario:', error);
      }
   };

   const addRipple = () => {
      if (rippleInput && !newRipples.includes(rippleInput)) {
         setNewRipples([...newRipples, rippleInput]);
         setRippleInput('');
      }
   };

   const chartData = useMemo(() => {
      if (!selected) return [];
      return selected.ripple_effects.map((effect, i) => ({
         name: effect.split(' ').slice(0, 2).join(' '),
         impact: Math.round(selected.impact_score * (100 - i * 15)),
         probability: Math.round(selected.probability * (100 - i * 10))
      }));
   }, [selected]);

   return (
    <div className="space-y-8">
      {/* Header with Title and Create Button */}
      <div className="flex justify-between items-center">
         <div className="space-y-1">
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-[1.15] py-1">Future Dreaming Lab</h2>
            <p className="text-white/40 font-medium">Predictive ripple-effect simulation and contingency modeling</p>
         </div>
         <button 
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all"
         >
            <Plus size={16} /> Seed New Scenario
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Sidebar: Scenario list */}
         <div className="lg:col-span-1 space-y-4">
            <div className="glass-morphism p-6 rounded-3xl border border-white/5">
               <h3 className="text-[10px] font-black text-white/30 tracking-widest uppercase mb-4">Active Blueprints</h3>
               <div className="space-y-2">
                  {scenarios.map(s => (
                     <button
                        key={s.id}
                        onClick={() => setSelected(s)}
                        className={cn(
                           "w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-1",
                           selected?.id === s.id ? "bg-primary/20 border-primary/40" : "bg-white/5 border-white/5 hover:bg-white/10"
                        )}
                     >
                        <span className="text-xs font-black text-white uppercase tracking-tighter">{s.name}</span>
                        <div className="flex justify-between items-center">
                           <span className="text-[9px] text-white/40 font-bold uppercase">{Math.round(s.probability * 100)}% Prob.</span>
                           <span className={cn(
                              "text-[8px] font-black px-1.5 py-0.5 rounded",
                              s.impact_score > 0.7 ? "bg-danger/20 text-danger" : "bg-warning/20 text-warning"
                           )}>Impact: {s.impact_score > 0.7 ? 'CRITICAL' : 'HIGH'}</span>
                        </div>
                     </button>
                  ))}
               </div>
            </div>
         </div>

         {/* Main Simulation View */}
         <div className="lg:col-span-3 space-y-6">
            <AnimatePresence mode="wait">
               {selected ? (
                  <motion.div
                     key={selected.id}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     className="glass-morphism rounded-[40px] border border-white/5 overflow-hidden flex flex-col bg-white/1 p-10"
                  >
                     <div className="flex justify-between items-start mb-10">
                        <div className="space-y-2">
                           <div className="flex items-center gap-3 text-primary">
                              <Zap size={24} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Simulation Model #{selected.id}</span>
                           </div>
                           <h3 className="text-5xl font-black text-white italic tracking-tighter uppercase">{selected.name}</h3>
                           <p className="text-white/40 font-medium max-w-2xl">{selected.description}</p>
                        </div>
                        <button 
                           onClick={runSimulation}
                           disabled={simulating}
                           className={cn(
                              "px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all",
                              simulating ? "bg-white/5 text-white/20 cursor-not-allowed" : "bg-primary text-white glow-shadow-primary hover:scale-105"
                           )}
                        >
                           {simulating ? <Activity className="animate-spin" size={18} /> : <Play size={18} />}
                           {simulating ? 'Processing Ripple...' : 'Run Simulation'}
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Ripple Effect Chart */}
                        <div className="glass-morphism p-8 rounded-3xl border border-white/5">
                           <h4 className="text-xs font-black text-white/30 uppercase tracking-widest mb-6 flex items-center gap-2">
                              <Layers size={14} /> Chain Reaction Analysis
                           </h4>
                           <div className="h-64 w-full relative">
                              {mounted && (
                                 <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                       <defs>
                                          <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                          </linearGradient>
                                       </defs>
                                       <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                                       <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} />
                                       <YAxis stroke="#ffffff20" fontSize={10} />
                                       <Tooltip 
                                          contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                          itemStyle={{ color: '#fff', fontSize: '10px' }}
                                       />
                                       <Area type="monotone" dataKey="impact" stroke="#3b82f6" fillOpacity={1} fill="url(#colorImpact)" />
                                    </AreaChart>
                                 </ResponsiveContainer>
                              )}
                           </div>
                        </div>

                        {/* Insights/Alerts */}
                        <div className="space-y-4">
                           <h4 className="text-xs font-black text-white/30 uppercase tracking-widest mb-2 flex items-center gap-2">
                              <AlertCircle size={14} /> Critical Nodes
                           </h4>
                           {selected.ripple_effects.map((effect, i) => (
                              <InsightCard 
                                 key={i}
                                 title={effect} 
                                 desc="Automatic contingency route identified for this node." 
                                 severity={i === 0 ? 'Critical' : i < 2 ? 'High' : 'Medium'} 
                              />
                           ))}
                        </div>
                     </div>
                  </motion.div>
               ) : (
                  <div className="h-[60vh] flex flex-col items-center justify-center text-white/10 gap-4">
                     <Zap size={64} className="opacity-10" />
                     <p className="font-black italic uppercase tracking-widest">Select a seed to dream of the future</p>
                  </div>
               )}
            </AnimatePresence>
         </div>
      </div>

       {/* New Scenario Modal */}
       <AnimatePresence>
         {showForm && (
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
               onClick={() => setShowForm(false)}
            >
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  onClick={e => e.stopPropagation()}
                  className="w-full max-w-xl glass-morphism rounded-[40px] border border-white/10 p-10 space-y-8"
               >
                  <div className="flex justify-between items-center">
                     <div>
                        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Seed Scenario</h3>
                        <p className="text-white/40 text-xs font-medium">Define a new what-if disruption model</p>
                     </div>
                     <button onClick={() => setShowForm(false)} className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all">
                        <X size={20} />
                     </button>
                  </div>
                  <form onSubmit={handleCreateScenario} className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block">Scenario Name</label>
                        <input value={newName} onChange={e => setNewName(e.target.value)} required placeholder="e.g. Port Closure – Shanghai" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-primary/40 transition-all font-medium" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block">Description</label>
                        <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} required rows={3} placeholder="Describe the disruption scenario in detail..." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-primary/40 transition-all font-medium resize-none" />
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block">Probability ({Math.round(newProb * 100)}%)</label>
                           <input type="range" min={0} max={1} step={0.01} value={newProb} onChange={e => setNewProb(parseFloat(e.target.value))} className="w-full accent-primary" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block">Impact ({Math.round(newImpact * 100)}%)</label>
                           <input type="range" min={0} max={1} step={0.01} value={newImpact} onChange={e => setNewImpact(parseFloat(e.target.value))} className="w-full accent-danger" />
                        </div>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block">Ripple Effects</label>
                        <div className="flex gap-2">
                           <input value={rippleInput} onChange={e => setRippleInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addRipple(); }}} placeholder="Add a ripple effect..." className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-primary/40 font-medium" />
                           <button type="button" onClick={addRipple} className="px-4 py-2 bg-primary/20 text-primary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/30 transition-all"><Plus size={16} /></button>
                        </div>
                        {newRipples.length > 0 && (
                           <div className="flex flex-wrap gap-2">
                              {newRipples.map((r, i) => (
                                 <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60 font-medium flex items-center gap-2">
                                    {r}
                                    <button type="button" onClick={() => setNewRipples(newRipples.filter((_, j) => j !== i))} className="text-white/20 hover:text-danger transition-colors"><X size={12} /></button>
                                 </span>
                              ))}
                           </div>
                        )}
                     </div>
                     <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest glow-shadow-primary hover:scale-[1.02] transition-all">
                        Deploy Scenario
                     </button>
                  </form>
               </motion.div>
            </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
}

function InsightCard({ title, desc, severity }: any) {
  const colors: any = { Critical: 'text-danger', High: 'text-warning', Medium: 'text-primary' };
  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex gap-4 hover:bg-white/10 transition-colors">
       <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0 bg-current", colors[severity])} />
       <div>
          <h5 className="text-sm font-bold text-white leading-none mb-1">{title}</h5>
          <p className="text-[10px] text-white/40 italic leading-tight">{desc}</p>
       </div>
    </div>
  );
}

