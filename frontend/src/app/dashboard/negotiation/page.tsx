'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Target, ArrowRight, ShieldCheck, TrendingUp, DollarSign, Clock, Users, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { upsertDashboardSetting } from '@/lib/api';

const strategies = [
  { 
    id: 'OPT-01', 
      name: 'Split and reroute shipments', 
      reason: 'Reduce delay risk at Singapore port', 
      impact: 'Stability +42%', 
    cost: '+$14k', 
    time: '-2 days',
      details: 'Reroute 40% of current batch through Colombo to avoid expected congestion.' 
  },
  { 
    id: 'OPT-02', 
      name: 'Temporary inventory support', 
      reason: 'Low stock risk at location 4', 
      impact: 'Availability +85%', 
    cost: '+$2k', 
    time: '+0 days',
      details: 'Borrow stock from a trusted partner to cover the next 48 hours.' 
  },
  { 
    id: 'OPT-03', 
      name: 'Use alternate material grade', 
      reason: 'Alert detected in region 4', 
      impact: 'Production stability', 
    cost: '-$4k', 
    time: '-1 day',
      details: 'Use local Grade-B stock temporarily while Grade-A shipment is delayed.' 
  },
];

export default function NegotiationCenter() {
   const router = useRouter();

   const saveStrategy = async (strategyId: string) => {
      await upsertDashboardSetting('recommended-strategy', {
         selectedStrategy: strategyId,
         savedAt: new Date().toLocaleString(),
         source: 'action-planner',
      });
      router.push(`/dashboard/settings?strategy=${encodeURIComponent(strategyId)}`);
   };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center bg-accent/5 p-8 rounded-3xl border border-accent/20 relative overflow-hidden">
         <div className="relative z-10">
            <h2 className="text-3xl font-black text-white italic tracking-tighter">Action Planner</h2>
            <p className="text-white/40 max-w-xl mt-2 font-medium">
               Suggested action plans to recover quickly when supply chain risks or delays are detected.
            </p>
         </div>
         <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-white glow-shadow-accent relative z-10">
            <Target size={32} />
         </div>
         <div className="absolute top-[-50px] left-[-30px] w-64 h-64 bg-accent/5 blur-[100px] rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Strategy Feed */}
         <div className="lg:col-span-3 space-y-6">
            <h3 className="text-xs font-black text-white tracking-[0.08em] mb-4 opacity-40">Recommended recovery plans</h3>
            {strategies.map(s => (
              <motion.div 
                whileHover={{ x: 10 }}
                key={s.id} 
                className="glass-morphism p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-8 items-center group cursor-pointer"
              >
                 <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-black text-xs">
                          {s.id}
                       </div>
                       <h4 className="text-xl font-black text-white">{s.name}</h4>
                    </div>
                    <p className="text-xs text-white/40 font-bold tracking-[0.08em] flex items-center gap-2">
                       <Zap size={14} className="text-warning" /> Trigger: {s.reason}
                    </p>
                    <p className="text-sm text-white/60 leading-relaxed italic">"{s.details}"</p>
                 </div>
                 
                 <div className="grid grid-cols-2 md:grid-cols-1 gap-4 w-full md:w-48 border-l border-white/5 pl-8 shrink-0">
                    <ImpactMetric label="Proj. Impact" value={s.impact} color="text-accent" />
                    <ImpactMetric label="Delta Cost" value={s.cost} color="text-danger" />
                    <ImpactMetric label="Speed Delta" value={s.time} color="text-primary" />
                 </div>
                 
                 <div className="shrink-0">
                    <button onClick={() => saveStrategy(s.id)} className="w-12 h-12 rounded-full bg-white text-background flex items-center justify-center hover:scale-110 transition-transform">
                       <ArrowRight size={24} />
                    </button>
                 </div>
              </motion.div>
            ))}
         </div>

         {/* Constraints & Settings */}
         <div className="space-y-6">
            <div className="glass-morphism p-6 rounded-3xl border border-white/5 space-y-6">
               <h3 className="text-xs font-black text-white tracking-[0.08em] opacity-40">Plan settings</h3>
               <div className="space-y-4">
                  <ConstraintToggle label="Auto-run low-risk plans" active />
                  <ConstraintToggle label="Prioritize stability" active />
                  <ConstraintToggle label="Max extra cost: 15%" />
                  <ConstraintToggle label="Allow partner stock support" active />
               </div>
               <Link href="/dashboard/settings" className="block w-full py-4 bg-primary/10 border border-primary/20 text-primary rounded-xl font-black text-xs tracking-[0.08em] hover:bg-primary/20 transition-all text-center">
                  Update Settings
               </Link>
            </div>

            <div className="p-6 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-3xl border border-white/5 space-y-4 relative overflow-hidden group">
               <RefreshCw className="text-white/20 w-12 h-12 absolute bottom-[-10px] right-[-10px] group-hover:rotate-180 transition-transform duration-1000" />
               <h4 className="text-lg font-black text-white italic">Continuous Plan Review</h4>
               <p className="text-[10px] text-white/40 leading-relaxed tracking-[0.08em] font-black">Next update in 14:02s</p>
               <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-secondary" />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function ImpactMetric({ label, value, color }: any) {
  return (
    <div>
      <p className="text-[10px] text-white/20 font-black tracking-[0.08em]">{label}</p>
       <p className={cn("text-lg font-black", color)}>{value}</p>
    </div>
  );
}

function ConstraintToggle({ label, active = false }: { label: string, active?: boolean }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
       <span className={cn("text-[10px] font-bold tracking-[0.08em] transition-colors", active ? "text-white/80" : "text-white/20")}>
          {label}
       </span>
       <div className={cn("w-10 h-5 rounded-full relative transition-all", active ? "bg-accent" : "bg-white/10")}>
          <div className={cn("w-3 h-3 rounded-full bg-white absolute top-1 transition-all", active ? "right-1" : "left-1")} />
       </div>
    </div>
  );
}
