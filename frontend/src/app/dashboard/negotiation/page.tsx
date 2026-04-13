'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Target, ArrowRight, ShieldCheck, TrendingUp, DollarSign, Clock, Users, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const strategies = [
  { 
    id: 'OPT-01', 
    name: 'Dynamic Split-Reroute', 
    reason: 'Mitigate Singapore Port Fragility', 
    impact: 'Resilience +42%', 
    cost: '+$14k', 
    time: '-2 days',
    details: 'Redirect 40% of current Batch BH-229 via Colombo Hub to bypass projected congestion.' 
  },
  { 
    id: 'OPT-02', 
    name: 'Inventory Borrowing', 
    reason: 'Inventory Starvation Risk at Node 4', 
    impact: 'Availability +85%', 
    cost: '+$2k', 
    time: '+0 days',
    details: 'Initialize P2P inventory loan from Omega Transports (Whisper Network partner) to bridge 48h gap.' 
  },
  { 
    id: 'OPT-03', 
    name: 'Substitute Grade Allocation', 
    reason: 'Supply Chain Anomaly Detect in Region 4', 
    impact: 'Production Stability', 
    cost: '-$4k', 
    time: '-1 day',
    details: 'Swap currently delayed Grade-A silicon with localized Grade-B stock already at destination.' 
  },
];

export default function NegotiationCenter() {
   const router = useRouter();

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center bg-accent/5 p-8 rounded-3xl border border-accent/20 relative overflow-hidden">
         <div className="relative z-10">
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Adaptive Negotiation Center</h2>
            <p className="text-white/40 max-w-xl mt-2 font-medium">
               AI-driven operational strategies for real-time recovery. The system doesn't just alert you; it actively negotiates the best path forward.
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
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-4 opacity-40">System-Generated Recovery Plans</h3>
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
                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest flex items-center gap-2">
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
                    <button onClick={() => router.push(`/dashboard/settings?strategy=${encodeURIComponent(s.id)}`)} className="w-12 h-12 rounded-full bg-white text-background flex items-center justify-center hover:scale-110 transition-transform">
                       <ArrowRight size={24} />
                    </button>
                 </div>
              </motion.div>
            ))}
         </div>

         {/* Constraints & Settings */}
         <div className="space-y-6">
            <div className="glass-morphism p-6 rounded-3xl border border-white/5 space-y-6">
               <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] opacity-40">System Constraints</h3>
               <div className="space-y-4">
                  <ConstraintToggle label="Auto-Execute Low Risk" active />
                  <ConstraintToggle label="Prioritize Resilience" active />
                  <ConstraintToggle label="Max Cost Buffer: 15%" />
                  <ConstraintToggle label="External Hub Borrowing" active />
               </div>
               <Link href="/dashboard/settings" className="block w-full py-4 bg-primary/10 border border-primary/20 text-primary rounded-xl font-black text-xs tracking-widest uppercase hover:bg-primary/20 transition-all text-center">
                  Update Constraints
               </Link>
            </div>

            <div className="p-6 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-3xl border border-white/5 space-y-4 relative overflow-hidden group">
               <RefreshCw className="text-white/20 w-12 h-12 absolute bottom-[-10px] right-[-10px] group-hover:rotate-180 transition-transform duration-1000" />
               <h4 className="text-lg font-black text-white italic">Continuous Strategy Audit</h4>
               <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest font-black">Next update in 14:02s</p>
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
       <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">{label}</p>
       <p className={cn("text-lg font-black", color)}>{value}</p>
    </div>
  );
}

function ConstraintToggle({ label, active = false }: { label: string, active?: boolean }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
       <span className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", active ? "text-white/80" : "text-white/20")}>
          {label}
       </span>
       <div className={cn("w-10 h-5 rounded-full relative transition-all", active ? "bg-accent" : "bg-white/10")}>
          <div className={cn("w-3 h-3 rounded-full bg-white absolute top-1 transition-all", active ? "right-1" : "left-1")} />
       </div>
    </div>
  );
}
