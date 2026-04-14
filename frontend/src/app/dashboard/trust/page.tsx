
'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, TrendingUp, AlertTriangle, CheckCircle2, Globe, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { getAnomalies, getOrganizations, getShipments } from '@/lib/api';
import { useLiveRefresh } from '@/lib/useLiveRefresh';

type Organization = {
   id: string;
   name: string;
   type: string;
   region: string;
   trust_score: number;
};

function buildRadarData(trustScore: number) {
   const base = Math.round(trustScore * 100);
   return [
      { subject: 'On time', A: Math.min(100, base + 4) },
      { subject: 'Quality', A: Math.min(100, base + 2) },
      { subject: 'Open updates', A: Math.max(0, base - 2) },
      { subject: 'Problem response', A: Math.min(100, base - 1) },
      { subject: 'Consistency', A: Math.min(100, base + 3) },
   ];
}

export default function SupplierTrust() {
   const [suppliers, setSuppliers] = useState<Organization[]>([]);
   const [selected, setSelected] = useState<Organization | null>(null);
   const [activeShipments, setActiveShipments] = useState(0);
   const [alertRate, setAlertRate] = useState('0.00%');

   const loadOrganizations = React.useCallback(async () => {
      try {
         const [organizations, shipments, anomalies] = await Promise.all([
           getOrganizations(),
           getShipments(),
           getAnomalies(),
         ]);
         setSuppliers(organizations);
         setSelected((current) => {
           if (!organizations.length) {
             return null;
           }
           if (!current) {
             return organizations[0];
           }
           return organizations.find((item: Organization) => item.id === current.id) ?? organizations[0];
         });
         const liveCount = shipments.filter((shipment: any) => shipment.status === 'In Transit').length;
         setActiveShipments(liveCount);
         const ratio = shipments.length > 0 ? (anomalies.length / shipments.length) * 100 : 0;
         setAlertRate(`${ratio.toFixed(2)}%`);
      } catch (error) {
         console.error('Failed to load organizations:', error);
      }
   }, []);

   useEffect(() => {
      loadOrganizations();
   }, [loadOrganizations]);

   useLiveRefresh(loadOrganizations);

   if (!selected) {
      return <div className="text-white/40">Loading partner scorecard...</div>;
   }

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter whitespace-pre-wrap">Partner Scorecard</h2>
            <p className="text-white/40 max-w-xl mt-2 font-medium">
               View each supplier and logistics partner with simple trust metrics based on performance and reliability.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Supplier Sidebar */}
         <div className="space-y-4">
            <h3 className="text-xs font-black text-white tracking-[0.08em] mb-4 opacity-40">Partners</h3>
            {suppliers.map(s => (
              <div 
                key={s.id} 
                onClick={() => setSelected(s)}
                className={cn(
                  "p-6 rounded-2xl border cursor-pointer transition-all flex justify-between items-center group",
                  selected.id === s.id ? "bg-white/10 border-white/20" : "glass-morphism border-white/5 hover:bg-white/5"
                )}
              >
                 <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border transition-colors", selected.id === s.id ? "border-primary bg-primary/20 text-primary" : "border-white/10 bg-white/5 text-white/30")}>
                       <Globe size={20} />
                    </div>
                    <div>
                       <h4 className="text-white font-bold text-sm">{s.name}</h4>
                       <p className="text-[10px] text-white/30 tracking-[0.08em]">{s.type}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className={cn("text-xl font-black", s.trust_score > 0.9 ? "text-accent" : s.trust_score > 0.8 ? "text-primary" : "text-warning")}>
                       {s.trust_score.toFixed(2)}
                    </div>
                 </div>
              </div>
            ))}
         </div>

         {/* DNA Profile View */}
         <div className="lg:col-span-2 glass-morphism rounded-3xl border border-white/5 p-10 flex flex-col items-center">
             <div className="w-full flex justify-between items-start mb-10">
                <div className="flex gap-6 items-center">
                   <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary glow-shadow-primary">
                      <ShieldCheck size={32} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-white">{selected.name}</h3>
                      <p className="text-xs text-white/40 tracking-[0.08em] font-bold">Partner ID: {selected.id} // verified profile</p>
                   </div>
                </div>
                <div className="px-6 py-2 bg-accent/10 border border-accent/20 rounded-xl">
                   <span className="text-accent text-xs font-black tracking-[0.08em] flex items-center gap-2">
                      <CheckCircle2 size={14} /> High reliability
                   </span>
                </div>
             </div>

             <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="h-[350px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={buildRadarData(selected.trust_score)}>
                         <PolarGrid stroke="#fff1" />
                         <PolarAngleAxis dataKey="subject" tick={{ fill: '#fff4', fontSize: 10 }} />
                         <Radar
                            name={selected.name}
                            dataKey="A"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.6}
                         />
                      </RadarChart>
                   </ResponsiveContainer>
                </div>

                <div className="space-y-6">
                   <h4 className="text-sm font-bold text-white tracking-[0.08em] opacity-40">Key highlights</h4>
                   <div className="space-y-4">
                      <TraitItem label="Crisis honesty" value="Excellent" desc="98% data consistency during major disruption events." />
                      <TraitItem label="Reporting speed" value="Strong" desc="Issues are reported almost immediately after detection." />
                      <TraitItem label="Replacement risk" value="Low" desc="No unverified product replacement found in 24 months." />
                   </div>
                </div>
             </div>
             
             <div className="w-full mt-12 grid grid-cols-3 gap-6 pt-10 border-t border-white/5">
                      <MiniStats label="Active shipments" value={String(activeShipments)} icon={<Database />} />
                      <MiniStats label="Alert association" value={alertRate} icon={<AlertTriangle />} />
                      <MiniStats label="Consistency trend" value={`${Math.round(selected.trust_score * 100)}%`} icon={<TrendingUp />} />
             </div>
         </div>
      </div>
    </div>
  );
}

function TraitItem({ label, value, desc }: any) {
  return (
    <div className="space-y-1">
       <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-white/40 tracking-[0.08em]">{label}</span>
          <span className="text-primary italic">{value}</span>
       </div>
       <p className="text-[10px] text-white/20 italic">{desc}</p>
    </div>
  );
}

function MiniStats({ label, value, icon }: any) {
  return (
    <div className="flex items-center gap-4">
       <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-white/40">
          {React.cloneElement(icon, { size: 20 })}
       </div>
       <div>
          <p className="text-[10px] text-white/30 font-black tracking-[0.08em]">{label}</p>
          <p className="text-xl font-black text-white">{value}</p>
       </div>
    </div>
  );
}
