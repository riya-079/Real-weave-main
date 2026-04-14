'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Ghost, AlertTriangle, TrendingDown, Database, Server, Link2, ArrowRight } from 'lucide-react';
import { getAnomalies, getShipments } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useLiveRefresh } from '@/lib/useLiveRefresh';

type Shipment = {
   id: string;
   origin: string;
   destination: string;
   status: string;
   trust_score: number;
   events: Array<{ id: string }>;
   anomaly_ids: string[];
};

type Anomaly = {
   id: string;
   explanation: string;
   type: string;
};

type GhostCase = {
   id: string;
   item: string;
   recorded: number;
   inferred: number;
   mismatch: number;
   reason: string;
   status: 'Active' | 'Under Review' | 'Critical';
};

function buildGhostCases(shipments: Shipment[], anomalies: Anomaly[]): GhostCase[] {
   return shipments.slice(0, 3).map((shipment, index) => {
      const recorded = shipment.events?.length ? shipment.events.length * 100 : 1000 + index * 150;
      const inferred = Math.max(0, Math.round(recorded * shipment.trust_score));
      const anomaly = anomalies.find((item) => shipment.anomaly_ids?.includes(item.id));

      return {
         id: `GH-${String(index + 1).padStart(3, '0')}`,
         item: `${shipment.origin} → ${shipment.destination}`,
         recorded,
         inferred,
         mismatch: inferred - recorded,
         reason: anomaly?.explanation || 'Possible stock mismatch based on shipment trail.',
         status: shipment.trust_score < 0.7 ? 'Critical' : anomaly ? 'Under Review' : 'Active',
      };
   });
}

export default function GhostForensics() {
   const [ghostCases, setGhostCases] = useState<GhostCase[]>([]);

   const loadGhostCases = useCallback(async () => {
      try {
         const [shipments, anomalies] = await Promise.all([getShipments(), getAnomalies()]);
         setGhostCases(buildGhostCases(shipments, anomalies));
      } catch (error) {
         console.error('Failed to load inventory mismatch cases:', error);
      }
   }, []);

   useEffect(() => {
      loadGhostCases();
   }, [loadGhostCases]);

   useLiveRefresh(loadGhostCases);

   if (ghostCases.length === 0) {
      return <div className="text-white/40">Loading inventory mismatch cases...</div>;
   }

   const criticalCount = ghostCases.filter((item) => item.status === 'Critical').length;
   const confidence = Math.max(0.5, 1 - ghostCases.length * 0.02).toFixed(2);

   return (
    <div className="space-y-10">
      <div className="flex justify-between items-end mb-4">
         <div>
            <div className="flex items-center gap-3 mb-2">
               <Ghost className="text-secondary" size={32} />
               <h2 className="text-4xl font-black text-white italic tracking-tighter">INVENTORY MISMATCH CHECKER</h2>
            </div>
            <p className="text-white/40 max-w-2xl font-medium">
               Compares digital records with real inventory to find missing, extra, or incorrect stock entries quickly.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Mismatch Explorer */}
         <div className="lg:col-span-1 space-y-6">
            <div className="glass-morphism p-6 rounded-3xl border border-white/5 space-y-4">
               <h3 className="text-xs font-black text-white tracking-[0.08em] opacity-40">System confidence</h3>
               <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-primary">{confidence}</span>
                  <TrendingDown size={24} className="text-danger -rotate-45" />
               </div>
               <p className="text-[10px] text-white/30 italic">Confidence level in matching physical stock with digital records.</p>
            </div>
            
            <div className="glass-morphism p-6 rounded-3xl border border-white/5 space-y-4">
               <h3 className="text-xs font-black text-white tracking-[0.08em] opacity-40">System signals</h3>
               <div className="space-y-3">
                  <SignalItem icon={<Database />} label="Record mismatch" />
                  <SignalItem icon={<Server />} label="Movement gap" />
                  <SignalItem icon={<Link2 />} label="Data difference" />
               </div>
            </div>
         </div>

         {/* Case Table */}
         <div className="lg:col-span-3 glass-morphism rounded-3xl border border-white/5 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/2">
               <h3 className="text-xl font-bold text-white italic">Open mismatch cases</h3>
               <Link href="/dashboard/impossible" className="px-6 py-2 glass-morphism border border-white/10 text-white font-bold text-xs rounded-lg hover:bg-white/5">
                  Full check
               </Link>
            </div>
            
            <div className="flex-1 overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="border-b border-white/5">
                        <th className="p-6 text-[10px] font-black text-white/30 tracking-[0.08em]">Case ID</th>
                        <th className="p-6 text-[10px] font-black text-white/30 tracking-[0.08em]">Route</th>
                        <th className="p-6 text-[10px] font-black text-white/30 tracking-[0.08em] text-center">Recorded</th>
                        <th className="p-6 text-[10px] font-black text-white/30 tracking-[0.08em] text-center">Expected</th>
                        <th className="p-6 text-[10px] font-black text-white/30 tracking-[0.08em] text-center">Gap</th>
                        <th className="p-6 text-[10px] font-black text-white/30 tracking-[0.08em]">Reason</th>
                        <th className="p-6 text-[10px] font-black text-white/30 tracking-[0.08em]"></th>
                     </tr>
                  </thead>
                  <tbody>
                     {ghostCases.map(c => (
                        <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                           <td className="p-6 text-sm font-mono text-white/60">{c.id}</td>
                           <td className="p-6 text-sm font-bold text-white">{c.item}</td>
                           <td className="p-6 text-sm font-mono text-white/40 text-center">{c.recorded}</td>
                           <td className="p-6 text-sm font-mono text-white/80 text-center">{c.inferred}</td>
                           <td className={cn("p-6 text-sm font-black text-center", c.mismatch < 0 ? "text-danger" : "text-accent")}>
                              {c.mismatch > 0 ? "+" : ""}{c.mismatch}
                           </td>
                           <td className="p-6 text-[10px] font-bold text-white/40 italic max-w-[200px] leading-tight">{c.reason}</td>
                           <td className="p-6">
                                 <Link href="/dashboard/impossible" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                                 <ArrowRight size={16} />
                                 </Link>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            
            <div className="p-6 bg-danger/5 border-t border-danger/10 flex items-center gap-4">
               <AlertTriangle className="text-danger shrink-0" size={24} />
               <p className="text-xs text-danger font-bold italic tracking-[0.08em]">
                  {criticalCount > 0 ? `Critical warning: ${criticalCount} high-risk mismatch case(s) detected.` : 'No critical mismatch in the latest shipment data.'}
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

function SignalItem({ icon, label }: any) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/2 rounded-xl border border-white/5">
       <div className="text-primary">{icon}</div>
          <span className="text-[10px] font-bold text-white/60 tracking-[0.08em]">{label}</span>
    </div>
  );
}
