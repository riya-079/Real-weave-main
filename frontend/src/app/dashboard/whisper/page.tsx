'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Share2, Lock, ShieldCheck, Users, Zap, AlertCircle, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const signatures = [
  { id: 'SIG-AX91', type: 'Anomaly Pattern', origin: 'Anonymized Partner A', confidence: 0.91, details: 'Consistent delay pattern observed in North-East sea lanes during low visibility conditions.' },
  { id: 'SIG-BX42', type: 'Trust Signal', origin: 'Ecosystem Shared', confidence: 0.74, details: 'Deceptive volume reporting detected across 3 independent transporters in the Mediterranean.' },
  { id: 'SIG-CC11', type: 'Risk Fingerprint', origin: 'Anonymized Partner B', confidence: 0.88, details: 'Substitution signature identified in high-value electronic components originating from Region 4.' },
];

export default function WhisperNetwork() {
   const [visibleCount, setVisibleCount] = React.useState(2);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row gap-8 items-center bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-10 rounded-3xl border border-white/5 relative overflow-hidden">
         <div className="flex-1 space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30 text-purple-400 text-[10px] font-black tracking-widest uppercase">
               Privacy-Preserving Intelligence
            </div>
            <h2 className="text-4xl font-black text-white italic leading-tight">THE WHISPER NETWORK</h2>
            <p className="text-white/50 max-w-lg leading-relaxed">
               Collaborate without compromise. Share risk signatures and disruption patterns without exposing raw private data. 
               Collective intelligence for a resilient ecosystem.
            </p>
            <div className="flex gap-4 pt-2">
               <Link href="/dashboard/settings" className="px-8 py-3 bg-white text-background rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all text-sm">
                  <Share2 size={18} /> BROADCAST FINGERPRINT
               </Link>
               <Link href="/dashboard/settings" className="px-8 py-3 glass-morphism border border-white/10 text-white rounded-xl font-bold hover:bg-white/5 transition-all text-sm">
                  NETWORK SETTINGS
               </Link>
            </div>
         </div>
         <div className="w-full md:w-1/3 aspect-square relative flex items-center justify-center">
            <div className="absolute inset-0 bg-purple-500/5 rounded-full animate-pulse" />
            <div className="absolute inset-10 border border-purple-500/20 rounded-full animate-spin [animation-duration:40s]" />
            <div className="absolute inset-20 border border-blue-500/20 rounded-full animate-spin [animation-duration:25s] direction-reverse" />
            <Share2 className="w-24 h-24 text-purple-400 glow-shadow-primary opacity-40" />
         </div>
         
         {/* Background Decoration */}
         <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="glass-morphism rounded-3xl border border-white/5 p-8 flex flex-col">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <Users className="text-primary" /> Active Collaborators
               </h3>
               <span className="text-xs text-white/30 font-bold">148 ORGANIZATIONS ACTIVE</span>
            </div>
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
               <PartnerItem name="Omega Transports (Verified)" trust={0.94} contribution="High" />
               <PartnerItem name="SecureLogistics Hub" trust={0.88} contribution="Medium" />
               <PartnerItem name="Alpha Global Supply" trust={0.92} contribution="Extreme" />
               <PartnerItem name="Maritime Intel Collective" trust={0.96} contribution="High" />
            </div>
         </div>

         <div className="glass-morphism rounded-3xl border border-white/5 p-8 flex flex-col">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <Zap className="text-warning" /> Shared Intel Signatures
               </h3>
               <div className="flex items-center gap-2">
                  <Lock size={14} className="text-accent" />
                  <span className="text-[10px] text-accent font-bold uppercase tracking-widest">End-to-End Encrypted</span>
               </div>
            </div>
            <div className="space-y-4">
               {signatures.slice(0, visibleCount).map(sig => (
                 <div key={sig.id} className="p-5 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                          <h4 className="text-sm font-bold text-white">{sig.type}</h4>
                          <p className="text-[10px] text-white/30 font-mono italic">{sig.id} // ORIGIN: {sig.origin}</p>
                       </div>
                       <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded font-black">{(sig.confidence * 100).toFixed(0)}% MATCH</span>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed line-clamp-2">{sig.details}</p>
                 </div>
               ))}
            </div>
                  <button
                     onClick={() => setVisibleCount((count) => Math.min(signatures.length, count + 1))}
                     disabled={visibleCount >= signatures.length}
                     className="mt-8 w-full py-3 border border-white/10 text-white/40 hover:text-white hover:bg-white/5 rounded-xl font-bold transition-all text-xs tracking-[0.2em] uppercase disabled:opacity-40 disabled:cursor-not-allowed"
                  >
               Load More Intelligence
            </button>
         </div>
      </div>
    </div>
  );
}

function PartnerItem({ name, trust, contribution }: any) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-all">
       <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary border border-white/10">
             <EyeOff size={20} />
          </div>
          <div>
             <h4 className="text-sm font-bold text-white">{name}</h4>
             <p className="text-[10px] text-white/30 font-mono tracking-widest">{contribution} CONTRIBUTION</p>
          </div>
       </div>
       <div className="text-right">
          <p className="text-sm font-black text-accent">{trust.toFixed(2)}</p>
          <p className="text-[10px] text-white/20 font-bold uppercase italic">Global Trust</p>
       </div>
    </div>
  );
}
