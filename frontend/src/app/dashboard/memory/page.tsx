'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Box, Thermometer, Zap, MapPin, Ruler, Layers, ArrowUpRight, ShieldCheck, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getShipments, getEvents } from '@/lib/api';
import { useLiveRefresh } from '@/lib/useLiveRefresh';

type ShipmentSummary = {
   id: string;
   origin: string;
   destination: string;
   status: string;
   trust_score: number;
   created_at: string;
};

type ShipmentEvent = {
   id: string;
   timestamp: string;
   type: string;
   location: string;
   org_id: string;
   value?: number | null;
   metadata?: Record<string, string>;
};

export default function MemoryCapsule() {
   const [shipments, setShipments] = useState<ShipmentSummary[]>([]);
   const [eventsByShipment, setEventsByShipment] = useState<Record<string, ShipmentEvent[]>>({});
   const [selected, setSelected] = useState<ShipmentSummary | null>(null);

   const loadData = useCallback(async () => {
      try {
         const shipmentData = await getShipments();
         setShipments(shipmentData);
         setSelected((current) => {
            if (!shipmentData.length) {
               return null;
            }
            if (!current) {
               return shipmentData[0];
            }
            return shipmentData.find((item: ShipmentSummary) => item.id === current.id) ?? shipmentData[0];
         });

         const eventMap: Record<string, ShipmentEvent[]> = {};
         await Promise.all(shipmentData.map(async (shipment: ShipmentSummary) => {
            eventMap[shipment.id] = await getEvents(shipment.id);
         }));
         setEventsByShipment(eventMap);
      } catch (error) {
         console.error('Failed to load product journey data:', error);
      }
   }, []);

   useEffect(() => {
      loadData();
   }, [loadData]);

   useLiveRefresh(loadData);

   const currentEvents = selected ? eventsByShipment[selected.id] ?? [] : [];

   const exportSelectedShipment = () => {
      if (!selected) {
         return;
      }

      const payload = {
         shipment: selected,
         events: currentEvents,
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${selected.id}-product-journey.json`;
      anchor.click();
      URL.revokeObjectURL(url);
   };

   if (!selected) {
      return <div className="text-white/40">Loading product journeys...</div>;
   }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-3xl font-black text-white">Product Journey</h2>
            <p className="text-white/40">Complete history of each product from source to delivery.</p>
         </div>
         <div className="flex gap-4">
                        <button onClick={exportSelectedShipment} className="px-6 py-2 glass-morphism border border-white/5 text-white/60 text-sm font-bold rounded-lg hover:text-white">Export history</button>
            <Link href="/dashboard/impossible" className="px-6 py-2 bg-accent text-white text-sm font-bold rounded-lg glow-shadow-accent">
                           Run reality check
            </Link>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Capsule Grid */}
         <div className="lg:col-span-1 space-y-4 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                     {shipments.map(c => (
              <div 
                key={c.id} 
                onClick={() => setSelected(c)}
                className={cn(
                  "p-5 rounded-2xl border cursor-pointer transition-all",
                  selected.id === c.id ? "bg-primary/10 border-primary/40" : "glass-morphism border-white/5 hover:bg-white/5"
                )}
              >
                 <div className="flex justify-between items-start mb-3">
                    <Box size={24} className={selected.id === c.id ? "text-primary" : "text-white/20"} />
                              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", c.trust_score > 0.8 ? "text-accent bg-accent/10" : "text-warning bg-warning/10")}>
                                 {(c.trust_score * 100).toFixed(0)}% TRUST
                    </span>
                 </div>
                 <h4 className="text-white font-bold text-sm mb-1">{c.id}</h4>
                 <p className="text-[10px] text-white/30 font-mono italic">{c.id} • {c.origin} → {c.destination}</p>
              </div>
            ))}
         </div>

         {/* Capsule Story */}
         <div className="lg:col-span-3 glass-morphism rounded-3xl border border-white/5 p-10 relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full">
               <div className="flex justify-between items-start mb-12">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/10 glow-shadow-primary">
                       <Box size={40} className="text-primary" />
                    </div>
                    <div>
                       <h3 className="text-4xl font-black text-white italic tracking-tight">{selected.id}</h3>
                                  <p className="text-white/40 font-mono tracking-[0.08em] text-xs flex items-center gap-2 mt-1">
                         <ShieldCheck size={14} className="text-accent" /> Verified history // {selected.id}
                       </p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] text-white/30 font-bold tracking-[0.08em] mb-1">Total stress</p>
                     <p className="text-4xl font-black text-white">{(1 - selected.trust_score).toFixed(2)} <span className="text-sm text-white/40">risk score</span></p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <MetricCard icon={<Thermometer />} label="Route" value={`${selected.origin} → ${selected.destination}`} sub="CURRENT SHIPMENT PATH" color="text-blue-400" />
                  <MetricCard icon={<Zap />} label="Status" value={selected.status} sub="LIVE SHIPMENT STATE" color="text-yellow-400" />
                  <MetricCard icon={<Layers />} label="Events" value={`${currentEvents.length} logs`} sub="TRACKED UPDATES" color="text-purple-400" />
               </div>

               <div className="flex-1 border-t border-white/5 pt-8">
                           <h4 className="text-sm font-bold text-white mb-6 tracking-[0.08em] flex items-center gap-2">
                    <History size={16} /> Product timeline
                  </h4>
                  <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                     {currentEvents.length > 0 ? currentEvents.map((event, index) => (
                       <TimelineItem
                         key={event.id}
                         title={event.type}
                         time={new Date(event.timestamp).toLocaleString()}
                         status={event.location}
                         detail={event.metadata?.status ? `Status: ${event.metadata.status}` : `Recorded by ${event.org_id}`}
                         active={index === 0}
                       />
                     )) : (
                       <p className="text-white/40 text-sm">No events recorded for this shipment yet.</p>
                     )}
                  </div>
               </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute top-[-50px] right-[-50px] w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
         </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
      <div className={cn("mb-2", color)}>{React.cloneElement(icon, { size: 24 })}</div>
      <p className="text-[10px] text-white/40 font-bold tracking-[0.08em]">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-[10px] text-white/20 font-mono">{sub}</p>
    </div>
  );
}

function TimelineItem({ title, time, status, detail, active = false }: { title: string; time: string; status: string; detail: string; active?: boolean }) {
  return (
    <div className="flex items-start gap-8 pl-1">
       <div className={cn(
         "w-9 h-9 rounded-xl flex items-center justify-center z-10 border transition-all",
         active ? "bg-primary border-primary glow-shadow-primary scale-110" : "bg-card-bg border-white/10"
       )}>
          <Box size={16} className={active ? "text-white" : "text-white/20"} />
       </div>
       <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
             <h5 className={cn("font-bold text-sm", active ? "text-white" : "text-white/60")}>{title}</h5>
             <span className="text-[10px] text-white/30 font-mono">{time}</span>
          </div>
          <p className="text-xs text-white/40 leading-relaxed font-medium">{detail}</p>
       </div>
    </div>
  );
}
