'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, HelpCircle, ArrowLeft, GitBranch, History, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const outcomes = [
  { id: 'O1', label: 'Customer Trust Score Drop', impact: 'High', area: 'Consumer Sentiment' },
  { id: 'O2', label: 'Batch Spoilage Rate Increase', impact: 'Extreme', area: 'Logistics Quality' },
  { id: 'O3', label: 'Unexplained Regional Stockouts', impact: 'Medium', area: 'Inventory Velocity' },
];

export default function ReverseCausality() {
  const [selected, setSelected] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const startAnalysis = (outcome: any) => {
    setSelected(outcome);
    setAnalyzing(true);
    setTimeout(() => setAnalyzing(false), 2000);
  };

  return (
    <div className="space-y-10">
      <div className="max-w-4xl mx-auto text-center space-y-4">
         <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-morphism border border-primary/20 text-primary text-xs font-black tracking-widest mb-2">
            AI FORENSIC REASONER
         </div>
         <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase whitespace-pre-wrap">Reverse Causality Explorer</h2>
         <p className="text-white/40 text-lg font-medium leading-relaxed">
            Start from an outcome. Let the AI reason backward through the chain of events to identify hidden, upstream causes.
         </p>
      </div>

      <div className="max-w-5xl mx-auto">
         {selected ? (
            <div className="space-y-8">
               <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest">
                  <ArrowLeft size={16} /> Select Different Outcome
               </button>
               
               <div className="glass-morphism rounded-3xl border border-white/5 p-10 relative overflow-hidden">
                  {analyzing ? (
                     <div className="flex flex-col items-center justify-center py-20 gap-6">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-primary font-mono animate-pulse uppercase tracking-[0.3em]">REVERSE INFERENCING INITIALIZED...</p>
                     </div>
                  ) : (
                     <div className="space-y-12">
                        <div className="flex justify-between items-start border-b border-white/5 pb-8">
                           <div>
                              <h3 className="text-2xl font-black text-white italic mb-2">{selected.label}</h3>
                              <p className="text-sm text-white/40 uppercase tracking-widest font-bold">{selected.area} Outcome Analysis</p>
                           </div>
                           <div className="text-right">
                              <span className="text-[10px] text-white/30 font-bold uppercase block mb-1">Impact Severity</span>
                              <span className="text-2xl font-black text-danger uppercase tracking-tighter">{selected.impact}</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                           {/* Step 1: Physical Reality */}
                           <ReasonStep num="01" title="Physical Trigger" detail="Heat exposure at Node 44 (Singapore Hub) during loading docks." weight={0.84} />
                           
                           {/* Step 2: System Behavior */}
                           <ReasonStep num="02" title="System Behavior" detail="Data masking detected in local telemetry stream to hide thermal variance." weight={0.72} />
                           
                           {/* Step 3: Root Cause */}
                           <ReasonStep num="03" title="Probable Root Cause" detail="Unauthorized maintenance bypass at facility level for cost optimization." weight={0.96} primary />
                        </div>
                        
                        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20 flex gap-6 items-center">
                           <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
                              <Brain size={24} />
                           </div>
                           <div>
                              <h4 className="text-white font-bold mb-1 italic">AI Recommendation</h4>
                              <p className="text-xs text-white/60 leading-relaxed">
                                 The correlation suggests a high probability of behavioral manipulation at the supplier level. Initiate "Truth-Verification" audit on Batch BH-229 and similar profiles.
                              </p>
                           </div>
                        </div>
                     </div>
                  )}
                  
                  {/* Background Decoration */}
                  <div className="absolute top-[-50px] left-[-30px] w-64 h-64 bg-primary/5 blur-[100px] rounded-full" />
               </div>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {outcomes.map(o => (
                  <div 
                    key={o.id}
                    onClick={() => startAnalysis(o)}
                    className="glass-morphism p-8 rounded-3xl border border-white/5 hover:border-primary/40 group cursor-pointer transition-all flex flex-col gap-6 h-64 justify-center text-center relative overflow-hidden"
                  >
                     <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                     <HelpCircle size={32} className="mx-auto text-white/20 group-hover:text-primary mb-2 transition-colors" />
                     <h4 className="text-xl font-bold text-white leading-tight px-4">{o.label}</h4>
                     <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">START EXPLORATION</p>
                  </div>
               ))}
            </div>
         )}
      </div>
    </div>
  );
}

function ReasonStep({ num, title, detail, weight, primary = false }: any) {
  return (
    <div className={cn(
      "p-6 rounded-2xl border flex flex-col gap-4 relative",
      primary ? "bg-primary border-primary glow-shadow-primary" : "glass-morphism border-white/5"
    )}>
       <div className="flex justify-between items-start">
          <span className={cn("text-xs font-black italic", primary ? "text-white/60" : "text-primary")}>STEP {num}</span>
          <span className={cn("text-[10px] font-mono", primary ? "text-white/40" : "text-white/20")}>P={(weight * 100).toFixed(0)}%</span>
       </div>
       <div>
          <h5 className={cn("text-sm font-bold mb-2", primary ? "text-white" : "text-white/80")}>{title}</h5>
          <p className={cn("text-xs leading-relaxed italic", primary ? "text-white/80" : "text-white/40")}>"{detail}"</p>
       </div>
       {!primary && <div className="absolute right-[-15px] top-1/2 -translate-y-1/2 hidden md:block">
          <ChevronRight className="text-white/10" size={30} />
       </div>}
    </div>
  );
}
