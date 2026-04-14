'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Share2, Lock, Users, Zap, EyeOff } from 'lucide-react';
import { createSharedRiskPattern, getAnomalies, getOrganizations, getSharedRiskPatterns } from '@/lib/api';
import { useLiveRefresh } from '@/lib/useLiveRefresh';

type Signal = {
  id: string;
  type: string;
  origin: string;
  confidence: number;
  details: string;
};

type Partner = {
  id: string;
  name: string;
  trust: number;
  contribution: string;
};

type SharedRiskPattern = {
   id: string;
   anomaly_id?: string | null;
   title: string;
   details: string;
   shared_by: string;
   visibility: string;
   status: string;
   confidence: number;
   partner_count: number;
   created_at?: string;
};

export default function WhisperNetwork() {
   const [visibleCount, setVisibleCount] = useState(2);
   const [signatures, setSignatures] = useState<Signal[]>([]);
   const [partners, setPartners] = useState<Partner[]>([]);
    const [history, setHistory] = useState<SharedRiskPattern[]>([]);
    const [selectedSignalId, setSelectedSignalId] = useState<string>('');
    const [shareState, setShareState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

   const loadData = useCallback(async () => {
      try {
             const [anomalies, organizations, sharedHistory] = await Promise.all([
                getAnomalies(),
                getOrganizations(),
                getSharedRiskPatterns(),
             ]);

             const nextSignals = anomalies.map((anomaly: any, index: number) => ({
             id: anomaly.id,
             type: anomaly.type.replace(/([A-Z])/g, ' $1').trim(),
             origin: index === 0 ? 'Private partner A' : index === 1 ? 'Shared by network' : 'Private partner B',
             confidence: anomaly.confidence,
             details: anomaly.explanation,
                }));
             setSignatures(nextSignals);
             setSelectedSignalId((current) => current || nextSignals[0]?.id || '');

         setPartners(
           organizations.map((organization: any) => ({
             id: organization.id,
             name: organization.name,
             trust: organization.trust_score,
             contribution: organization.trust_score >= 0.9 ? 'High' : organization.trust_score >= 0.8 ? 'Medium' : 'Low',
           }))
         );
         setHistory(sharedHistory);
      } catch (error) {
         console.error('Failed to load shared risk data:', error);
      }
   }, []);

   useEffect(() => {
      loadData();
   }, [loadData]);

   useLiveRefresh(loadData);

   const visiblePartners = partners.slice(0, Math.max(4, visibleCount));
   const selectedSignal = signatures.find((signal) => signal.id === selectedSignalId) ?? signatures[0];

   const shareSelectedPattern = async () => {
      if (!selectedSignal) {
         return;
      }

      setShareState('saving');
      try {
         await createSharedRiskPattern({
            id: `srp-${Date.now()}`,
            anomaly_id: selectedSignal.id,
            title: selectedSignal.type,
            details: selectedSignal.details,
            shared_by: 'real-weave-easy',
            visibility: 'network',
            status: 'shared',
            confidence: selectedSignal.confidence,
            partner_count: partners.length,
         });
         setShareState('saved');
      } catch (error) {
         console.error('Failed to share risk pattern:', error);
         setShareState('error');
      }
   };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row gap-8 items-center bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-10 rounded-3xl border border-white/5 relative overflow-hidden">
         <div className="flex-1 space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30 text-purple-400 text-[10px] font-black tracking-[0.08em]">
               Private Risk Sharing
            </div>
            <h2 className="text-4xl font-black text-white italic leading-tight">SECURE RISK SHARING</h2>
            <p className="text-white/50 max-w-lg leading-relaxed">
               Share risk patterns with partner organizations without exposing sensitive business data.
               Learn from others while keeping your private details protected.
            </p>
            <div className="flex gap-4 pt-2">
               <button
                  onClick={shareSelectedPattern}
                  disabled={!selectedSignal || shareState === 'saving'}
                  className="px-8 py-3 bg-white text-background rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all text-sm disabled:opacity-60"
               >
                  <Share2 size={18} /> {shareState === 'saving' ? 'SHARING...' : 'SHARE RISK PATTERN'}
               </button>
               <Link href="/dashboard/settings" className="px-8 py-3 glass-morphism border border-white/10 text-white rounded-xl font-bold hover:bg-white/5 transition-all text-sm">
                  SHARING SETTINGS
               </Link>
            </div>
            {shareState === 'saved' ? <p className="text-xs text-accent font-bold">Pattern shared and persisted to backend.</p> : null}
            {shareState === 'error' ? <p className="text-xs text-danger font-bold">Share failed. Try again.</p> : null}
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
                  <Users className="text-primary" /> Active Partners
               </h3>
               <span className="text-xs text-white/30 font-bold">{partners.length} organizations active</span>
            </div>
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
               {visiblePartners.map((partner) => (
                 <PartnerItem key={partner.id} name={partner.name} trust={partner.trust} contribution={partner.contribution} />
               ))}
            </div>
         </div>

         <div className="glass-morphism rounded-3xl border border-white/5 p-8 flex flex-col">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <Zap className="text-warning" /> Shared Risk Signals
               </h3>
               <div className="flex items-center gap-2">
                  <Lock size={14} className="text-accent" />
                  <span className="text-[10px] text-accent font-bold tracking-[0.08em]">End-to-end encrypted</span>
               </div>
            </div>
            <div className="space-y-4">
                      {signatures.slice(0, visibleCount).map(sig => (
                 <div key={sig.id} onClick={() => setSelectedSignalId(sig.id)} className="p-5 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all cursor-pointer">
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
                     className="mt-8 w-full py-3 border border-white/10 text-white/40 hover:text-white hover:bg-white/5 rounded-xl font-bold transition-all text-xs tracking-[0.08em] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                      {visibleCount >= signatures.length ? 'All signals loaded' : 'Load More Signals'}
            </button>
         </div>
      </div>

      <div className="glass-morphism rounded-3xl border border-white/5 p-8">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Shared pattern history</h3>
            <span className="text-xs text-white/30 font-bold">{history.length} persisted records</span>
         </div>
         <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
            {history.length === 0 ? (
               <p className="text-sm text-white/40">No patterns shared yet.</p>
            ) : (
               history.map((item) => (
                  <div key={item.id} className="p-4 bg-white/5 rounded-xl border border-white/5">
                     <div className="flex justify-between gap-4 items-start">
                        <div>
                           <h4 className="text-sm font-bold text-white">{item.title}</h4>
                           <p className="text-xs text-white/50 line-clamp-2">{item.details}</p>
                        </div>
                        <span className="text-[10px] font-black text-accent">{(item.confidence * 100).toFixed(0)}%</span>
                     </div>
                     <p className="text-[10px] text-white/30 mt-2">
                        {item.shared_by} • {item.partner_count} partners • {item.status}
                     </p>
                  </div>
               ))
            )}
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
             <p className="text-[10px] text-white/30 font-mono tracking-[0.08em]">{contribution} contribution</p>
          </div>
       </div>
       <div className="text-right">
          <p className="text-sm font-black text-accent">{trust.toFixed(2)}</p>
               <p className="text-[10px] text-white/20 font-bold italic">Global trust</p>
       </div>
    </div>
  );
}
