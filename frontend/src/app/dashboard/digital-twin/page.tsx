'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactFlow, { Background, Controls, Handle, MarkerType, Position, type Edge, type Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { Shield, ShieldAlert, ShieldCheck, Zap, Globe, Activity, Layers, ArrowUpRight, Search, Crosshair } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOrganizations } from '@/lib/api';
import { useLiveRefresh } from '@/lib/useLiveRefresh';
import dynamic from 'next/dynamic';

const GeoMap = dynamic(() => import('@/components/GeoMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-black/40 animate-pulse flex items-center justify-center text-white/20 font-black uppercase tracking-widest italic rounded-[40px]">Initializing Satellite Link...</div>
});

interface Organization {
  id: string;
  name: string;
  type: string;
  region: string;
  trust_score: number;
}

interface TrustNodeData {
  label: string;
  status: 'strong' | 'fragile' | 'weakening';
  trust: number;
  region: string;
  type: string;
}

const nodeTypes = {
  trustNode: TrustNode,
};

function buildNodes(organizations: Organization[]): Node<TrustNodeData>[] {
  const radius = 280;
  return organizations.map((org, i) => {
    const angle = (i / organizations.length) * Math.PI * 2;
    const trust = org.trust_score;
    const status: TrustNodeData['status'] = trust >= 0.85 ? 'strong' : trust >= 0.7 ? 'weakening' : 'fragile';

    return {
      id: org.id,
      type: 'trustNode',
      position: {
        x: 400 + Math.cos(angle) * radius,
        y: 250 + Math.sin(angle) * radius,
      },
      data: {
        label: org.name,
        status,
        trust,
        region: org.region,
        type: org.type,
      },
    };
  });
}

function buildEdges(organizations: Organization[]): Edge[] {
  return organizations.slice(1).map((org, i) => {
    const source = organizations[i];
    const trust = org.trust_score;
    const stroke = trust >= 0.85 ? '#22d3ee' : trust >= 0.7 ? '#6366f1' : '#f43f5e';

    return {
      id: `${source.id}-${org.id}`,
      source: source.id,
      target: org.id,
      animated: true,
      style: {
        stroke,
        strokeWidth: 2,
        opacity: 0.4,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: stroke,
      },
    };
  });
}

function TrustNode({ data }: { data: TrustNodeData }) {
  return (
    <div className={cn(
      "p-5 rounded-3xl border-2 bg-background/80 backdrop-blur-3xl min-w-[220px] transition-all relative overflow-hidden group",
      data.status === 'strong' ? "border-accent/40 shadow-lg shadow-accent/10" :
      data.status === 'fragile' ? "border-danger/40 shadow-lg shadow-danger/10 animate-pulse" :
      "border-primary/40 shadow-lg shadow-primary/10"
    )}>
      <Handle type="target" position={Position.Top} className="!bg-white/10 !border-white/20" />
      
      <div className="flex justify-between items-start mb-3">
         <div className={cn(
            "p-2 rounded-xl bg-white/5",
            data.status === 'strong' ? "text-accent" : "text-white/40"
         )}>
            <Globe size={18} />
         </div>
         <span className={cn(
            "text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest",
            data.status === 'strong' ? "bg-accent/20 text-accent" : "bg-warning/20 text-warning"
         )}>
            {(data.trust * 100).toFixed(0)}% TRUST
         </span>
      </div>

      <div className="space-y-1">
         <h4 className="text-sm font-black text-white italic tracking-tighter uppercase">{data.label}</h4>
         <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">{data.type} // {data.region}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
         <div className="flex items-center gap-2">
            <Activity size={12} className="text-primary" />
            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Active Link</span>
         </div>
         <ArrowUpRight size={14} className="text-white/20 group-hover:text-white transition-colors" />
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-white/10 !border-white/20" />
    </div>
  );
}

export default function DigitalTwin() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [nodes, setNodes] = useState<Node<TrustNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [visionMode, setVisionMode] = useState<'topology' | 'geospatial'>('geospatial');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOrganizations();
      setOrganizations(data);
      setNodes(buildNodes(data));
      setEdges(buildEdges(data));
    } catch (error) {
      console.error('Failed to load control room data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useLiveRefresh(loadData);

  return (
    <div className="h-[calc(100vh-240px)] glass-morphism rounded-[40px] border border-white/5 relative overflow-hidden bg-black/40">
      {/* Overlay: Control Interface */}
      <div className="absolute top-10 left-10 z-10 space-y-6 pointer-events-none">
         <div className="pointer-events-auto">
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">Digital Twin Grid</h2>
            <p className="text-white/40 font-medium max-w-xs">Real-time simulation of supply chain node health and trust interconnects.</p>
         </div>

         <div className="flex flex-col gap-3 pointer-events-auto">
            <LegendRow color="bg-accent" label="High-Fidelity Node" />
            <LegendRow color="bg-primary" label="Stability Pending" />
            <LegendRow color="bg-danger" label="Critical Variance" />
         </div>
      </div>

      {/* Action Bar */}
      <div className="absolute top-10 right-10 z-10 flex gap-4 pointer-events-auto">
         <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
            <button 
               onClick={() => setVisionMode('topology')}
               className={cn(
                  "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                  visionMode === 'topology' ? "bg-primary text-white glow-shadow-primary" : "text-white/40 hover:text-white"
               )}
            >Topology</button>
            <button 
               onClick={() => setVisionMode('geospatial')}
               className={cn(
                  "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                  visionMode === 'geospatial' ? "bg-primary text-white glow-shadow-primary" : "text-white/40 hover:text-white"
               )}
            >Geospatial</button>
         </div>
         <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 backdrop-blur-xl transition-all">
            <Search size={16} /> Scan Network
         </button>
      </div>

      {/* Network Visualization */}
      <div className="w-full h-full">
         <AnimatePresence mode="wait">
            {visionMode === 'topology' ? (
               <motion.div 
                  key="topology"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full"
               >
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    fitView
                    className="trust-graph"
                  >
                    <Background color="#fff" gap={40} size={1} opacity={0.03} />
                    <Controls className="!bg-white/5 !border-none !shadow-none [&_button]:!invert [&_button]:!opacity-40" />
                  </ReactFlow>
               </motion.div>
            ) : (
               <motion.div
                  key="geospatial"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full p-4"
               >
                  <GeoMap organizations={organizations} mode="partners" />
               </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* Footer Stats */}
      <div className="absolute bottom-10 left-10 right-10 z-10 flex justify-between items-end pointer-events-none">
         <div className="glass-morphism p-6 rounded-3xl border border-white/5 pointer-events-auto space-y-4">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                  <Layers size={24} />
               </div>
               <div>
                  <h4 className="text-lg font-black text-white italic uppercase">Network Density</h4>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Topology v2.4a</p>
               </div>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: '84%' }} className="h-full bg-primary" />
            </div>
         </div>
         
         <div className="pointer-events-auto flex items-center gap-8 text-right pr-4">
            <div>
               <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block">Active Signals</span>
               <span className="text-2xl font-black text-white italic">14.2k</span>
            </div>
            <div>
               <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block">Core Entropy</span>
               <span className="text-2xl font-black text-accent italic">0.024</span>
            </div>
         </div>
      </div>
    </div>
  );
}

function LegendRow({ color, label }: any) {
   return (
      <div className="flex items-center gap-3 italic">
         <div className={cn("w-2 h-2 rounded-full", color)} />
         <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{label}</span>
      </div>
   );
}
