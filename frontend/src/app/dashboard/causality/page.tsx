'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Brain, HelpCircle, ArrowLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAnomalies } from '@/lib/api';
import { useLiveRefresh } from '@/lib/useLiveRefresh';

type Anomaly = {
   id: string;
   type: string;
   severity: number;
   explanation: string;
   root_causes: string[];
   confidence: number;
   event_ids: string[];
};

export default function ReverseCausality() {
   const [outcomes, setOutcomes] = useState<Anomaly[]>([]);
   const [selected, setSelected] = useState<Anomaly | null>(null);
   const [analyzing, setAnalyzing] = useState(false);

   const loadOutcomes = useCallback(async () => {
      try {
         const anomalies = await getAnomalies();
         setOutcomes(anomalies.slice(0, 3));
         setSelected((current) => {
            const options = anomalies.slice(0, 3);
            if (!options.length) {
               return null;
            }
            if (!current) {
               return options[0];
            }
            return options.find((item: Anomaly) => item.id === current.id) ?? options[0];
         });
      } catch (error) {
         console.error('Failed to load root cause data:', error);
      }
   }, []);

   useEffect(() => {
      loadOutcomes();
   }, [loadOutcomes]);

   useLiveRefresh(loadOutcomes);

   const startAnalysis = (outcome: Anomaly) => {
      setSelected(outcome);
      setAnalyzing(true);
      window.setTimeout(() => setAnalyzing(false), 1200);
   };

   const stepOne = selected?.explanation || 'A problem was reported.';
   const stepTwo = selected?.root_causes?.[0] || 'No cause identified yet.';
   const stepThree = selected?.root_causes?.[1] || selected?.root_causes?.[0] || 'Review the shipment trail.';

  return (
    <div className="space-y-10">
      <div className="max-w-4xl mx-auto text-center space-y-4">
         <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-morphism border border-primary/20 text-primary text-xs font-black tracking-widest mb-2">
            ROOT CAUSE ANALYSIS
         </div>
         <h2 className="text-5xl font-black text-white italic tracking-tighter whitespace-pre-wrap">Root Cause Finder</h2>
         <p className="text-white/40 text-lg font-medium leading-relaxed">
            Start from a problem and trace backward to find the most likely cause in earlier steps.
         </p>
      </div>

      <div className="max-w-5xl mx-auto">
         {selected ? (
            <div className="space-y-8">
               <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-bold text-sm tracking-[0.08em]">
                  <ArrowLeft size={16} /> Select Another Problem
               </button>
               
               <div className="glass-morphism rounded-3xl border border-white/5 p-10 relative overflow-hidden">
                  {analyzing ? (
                     <div className="flex flex-col items-center justify-center py-20 gap-6">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-primary font-mono animate-pulse tracking-[0.08em]">Analyzing root cause...</p>
                     </div>
                  ) : (
                     <div className="space-y-12">
                        <div className="flex justify-between items-start border-b border-white/5 pb-8">
                           <div>
                              <h3 className="text-2xl font-black text-white italic mb-2">{selected.type}</h3>
                              <p className="text-sm text-white/40 tracking-[0.08em] font-bold">Problem analysis</p>
                           </div>
                           <div className="text-right">
                              <span className="text-[10px] text-white/30 font-bold block mb-1 tracking-[0.08em]">Impact level</span>
                              <span className="text-2xl font-black text-danger tracking-tighter">{Math.round(selected.severity * 100)}%</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                           {/* Step 1: Physical Reality */}
                           <ReasonStep num="01" title="Reported problem" detail={stepOne} weight={0.84} />
                           
                           {/* Step 2: System Behavior */}
                           <ReasonStep num="02" title="Possible cause" detail={stepTwo} weight={0.72} />
                           
                           {/* Step 3: Root Cause */}
                           <ReasonStep num="03" title="Most likely root cause" detail={stepThree} weight={0.96} primary />
                        </div>
                        
                        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20 flex gap-6 items-center">
                           <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
                              <Brain size={24} />
                           </div>
                           <div>
                              <h4 className="text-white font-bold mb-1 italic">Recommended next step</h4>
                              <p className="text-xs text-white/60 leading-relaxed">
                                 Check the related shipment, compare events, and confirm whether the issue matches the recorded trail.
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
                     <h4 className="text-xl font-bold text-white leading-tight px-4">{o.type}</h4>
                     <p className="text-[10px] text-white/40 tracking-[0.08em] font-black">Start analysis</p>
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
          <span className={cn("text-xs font-black italic", primary ? "text-white/60" : "text-primary")}>Step {num}</span>
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
