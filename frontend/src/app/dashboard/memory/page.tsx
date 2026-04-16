'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Thermometer, Zap, MapPin, Ruler, Layers, ArrowRight, ShieldCheck, History, Download, Filter, Search, Globe, Clock, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getShipments, getEvents } from '@/lib/api';
import { useLiveRefresh } from '@/lib/useLiveRefresh';
import dynamic from 'next/dynamic';

const GeoMap = dynamic(() => import('@/components/GeoMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-48 bg-black/40 animate-pulse flex items-center justify-center text-white/20 font-black uppercase tracking-widest italic rounded-3xl">Synchronizing Vector Link...</div>
});

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
   const [loading, setLoading] = useState(true);
   const [query, setQuery] = useState('');

   const loadData = useCallback(async () => {
      try {
         setLoading(true);
         const shipmentData = await getShipments();
         setShipments(shipmentData);

         // Initially fetch events only for the first shipment to avoid overwhelming the API
         if (shipmentData.length > 0 && !selected) {
            setSelected(shipmentData[0]);
            const initialEvents = await getEvents(shipmentData[0].id);
            setEventsByShipment({ [shipmentData[0].id]: initialEvents });
         }
      } catch (error) {
         console.error('Failed to load supply chain history:', error);
      } finally {
         setLoading(false);
      }
   }, [selected]);

   // Load events when selection changes
   useEffect(() => {
      if (selected && !eventsByShipment[selected.id]) {
         getEvents(selected.id).then(newEvents => {
            setEventsByShipment(prev => ({ ...prev, [selected.id]: newEvents }));
         });
      }
   }, [selected, eventsByShipment]);

   useEffect(() => {
      loadData();
   }, []); // Only on mount

   useLiveRefresh(loadData);

   const filteredShipments = useMemo(() => {
      return shipments.filter(s => 
         s.id.toLowerCase().includes(query.toLowerCase()) ||
         s.origin.toLowerCase().includes(query.toLowerCase()) ||
         s.destination.toLowerCase().includes(query.toLowerCase())
      );
   }, [shipments, query]);

   const currentEvents = selected ? eventsByShipment[selected.id] ?? [] : [];

   const exportHistory = () => {
      if (!selected) return;
      const blob = new Blob([JSON.stringify({ shipment: selected, events: currentEvents }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forensic-dna-${selected.id}.json`;
      a.click();
   };

   if (loading && shipments.length === 0) {
      return (
         <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <History className="text-primary animate-spin" size={48} />
            <p className="text-white/40 font-mono text-xs uppercase tracking-widest animate-pulse">Sequencing Shipment Genomes...</p>
         </div>
      );
   }

   return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
         <div className="space-y-1">
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-[1.15] py-1">Genetic Memory Store</h2>
            <p className="text-white/40 font-medium">Immutable forensic ledger of every product movement across the Weave.</p>
         </div>
         <div className="flex gap-4">
            <div className="px-4 py-2 glass-morphism border border-white/5 rounded-xl flex items-center gap-2">
               <Search size={16} className="text-white/20" />
               <input 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search capsules..."
                  className="bg-transparent border-none outline-none text-xs text-white font-medium w-40"
               />
            </div>
            <button onClick={exportHistory} className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all">
               <Download size={14} /> Export DNA
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-140px)]">
         {/* Capsule Sidebar */}
         <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {filteredShipments.map(s => (
               <motion.div
                  key={s.id}
                  onClick={() => setSelected(s)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                     "p-6 rounded-[2rem] border cursor-pointer transition-all relative flex flex-col gap-3 min-h-[120px] shrink-0",
                     selected?.id === s.id ? "glass-morphism border-primary/40 shadow-[0_0_30px_rgba(59,130,246,0.1)]" : "bg-white/5 border-white/5 hover:bg-white/10"
                  )}
               >
                  <div className="flex justify-between items-center">
                     <div className={cn("p-2 rounded-xl", selected?.id === s.id ? "bg-primary/20 text-primary" : "bg-white/5 text-white/20")}>
                        <Package size={20} />
                     </div>
                     <span className={cn(
                        "text-[9px] font-black uppercase px-2 py-1 rounded-md tracking-widest",
                        s.trust_score > 0.8 ? "bg-accent/20 text-accent border border-accent/20" : "bg-warning/20 text-warning border border-warning/20"
                     )}>{Math.round(s.trust_score * 100)}% Verified</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white italic tracking-tighter uppercase">{s.id}</h4>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5 truncate">{s.origin} → {s.destination}</p>
                  </div>
                  
                  {selected?.id === s.id && (
                     <motion.div layoutId="active-capsule" className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-full" />
                  )}
               </motion.div>
            ))}
         </div>

         {/* Forensic Detail */}
         <div className="lg:col-span-3 glass-morphism rounded-[40px] border border-white/5 overflow-hidden flex flex-col bg-white/1">
            {selected ? (
               <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                  {/* Summary */}
                  <div className="flex justify-between items-start">
                     <div className="flex items-center gap-8">
                        <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/10 glow-shadow-primary relative">
                           <History className="text-primary" size={40} />
                           <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center border-4 border-background">
                              <ShieldCheck size={14} className="text-white" />
                           </div>
                        </div>
                        <div className="space-y-1">
                           <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                              <Globe size={14} /> Global Product ID: {selected.id}
                           </div>
                           <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">{selected.origin} → {selected.destination}</h3>
                           <p className="text-white/40 font-medium italic">Status: {selected.status} // Sequence initiated {new Date(selected.created_at).toLocaleDateString()}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-1">Stability Risk</span>
                        <div className="text-4xl font-black text-white">{(1 - selected.trust_score).toFixed(2)}</div>
                        <div className="text-[10px] font-bold text-danger uppercase tracking-widest">Variance Detected</div>
                     </div>
                  </div>

                   {/* Satellite Visualization */}
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <h3 className="text-xs font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                            <MapPin size={14} className="text-primary" /> Live Vector Tracking
                         </h3>
                         <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Projection: Mercator Grid</span>
                            <span className="text-[9px] font-mono text-accent animate-pulse px-2 py-0.5 border border-accent/20 rounded bg-accent/5">SATELLITE LINK ACTIVE</span>
                         </div>
                      </div>
                      <div className="h-[650px] rounded-[40px] overflow-hidden border border-white/5 relative bg-black/20 group">
                         <GeoMap mode="shipment" shipment={selected} />
                         <div className="absolute top-6 right-6 z-10 glass-morphism p-4 rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Coordinates</p>
                            <p className="text-xs font-mono text-white text-right">37.0902° N, 95.7129° W</p>
                         </div>
                      </div>
                   </div>

                   {/* Telemetry Metrics */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
                      <MemoryMetric icon={<Package size={18} />} label="Payload Type" value="Quantum Component" sub="Ref: B-402-X" />
                      <MemoryMetric icon={<Clock size={18} />} label="Travel Duration" value="122.4 Hours" sub="Efficiency: +14%" />
                      <MemoryMetric icon={<Layers size={18} />} label="Blockchain Verification" value={`${currentEvents.length} Hashes`} sub="Ledger Sync: 100%" />
                   </div>

                  {/* Forensic Timeline */}
                  <div className="space-y-6">
                     <h3 className="text-xs font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                        <ArrowRight size={14} className="text-primary" /> Event sequencing
                     </h3>
                     <div className="space-y-6 relative before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                        {currentEvents.map((e, i) => (
                           <div key={e.id} className="flex gap-8 relative z-10">
                              <div className={cn(
                                 "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all",
                                 i === 0 ? "bg-primary/20 border-primary/40 text-primary shadow-lg" : "bg-white/5 border-white/10 text-white/20"
                              )}>
                                 <MapPin size={24} />
                              </div>
                              <div className="flex-1 space-y-2">
                                 <div className="flex justify-between items-center">
                                    <h4 className={cn("text-lg font-black italic tracking-tighter uppercase", i === 0 ? "text-white" : "text-white/40")}>{e.type}</h4>
                                    <span className="text-[10px] font-mono text-white/20">{new Date(e.timestamp).toLocaleString()}</span>
                                 </div>
                                 <div className="flex gap-4">
                                    <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-[9px] font-black text-white/40 uppercase tracking-widest">{e.location}</div>
                                    <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-[9px] font-black text-white/40 uppercase tracking-widest">Handler: {e.org_id}</div>
                                 </div>
                                 <p className="text-sm text-white/60 leading-relaxed font-medium italic">"{e.metadata?.status || 'Secure handover verified via network consensus.'}"</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-white/20 gap-4">
                  <Box size={48} />
                  <p className="text-xs font-black tracking-widest uppercase italic">Select capsule to trace journey</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}

function MemoryMetric({ icon, label, value, sub }: any) {
   return (
      <div className="p-6 bg-white/2 rounded-3xl border border-white/5 space-y-2 group hover:bg-white/5 transition-all">
         <div className="text-primary opacity-40 group-hover:opacity-100 transition-opacity">{icon}</div>
         <div>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block">{label}</span>
            <div className="text-xl font-black text-white uppercase">{value}</div>
            <div className="text-[9px] font-bold text-white/10 uppercase tracking-widest">{sub}</div>
         </div>
      </div>
   );
}
