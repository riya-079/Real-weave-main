'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import ReactFlow, { 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState, 
  MarkerType,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, Zap, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const initialNodes = [
  { 
    id: 'node-1', 
    type: 'trustNode', 
    position: { x: 250, y: 50 }, 
    data: { label: 'North Alpha Hub', status: 'strong', trust: 0.98 } 
  },
  { 
    id: 'node-2', 
    type: 'trustNode', 
    position: { x: 100, y: 200 }, 
    data: { label: 'Singapore Port', status: 'fragile', trust: 0.42 } 
  },
  { 
    id: 'node-3', 
    type: 'trustNode', 
    position: { x: 400, y: 200 }, 
    data: { label: 'Rotterdam Port', status: 'strong', trust: 0.94 } 
  },
  { 
    id: 'node-4', 
    type: 'trustNode', 
    position: { x: 250, y: 350 }, 
    data: { label: 'Regional Fulfillment', status: 'weakening', trust: 0.65 } 
  },
];

const initialEdges = [
  { 
    id: 'e1-2', source: 'node-1', target: 'node-2', label: 'Borrowed Trust', 
    animated: true, 
    style: { stroke: '#3b82f6', strokeWidth: 2, opacity: 0.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
  },
  { 
    id: 'e1-3', source: 'node-1', target: 'node-3', label: 'Verified Integrity', 
    animated: true, 
    style: { stroke: '#10b981', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' }
  },
  { 
    id: 'e2-4', source: 'node-2', target: 'node-4', label: 'Fragile Link', 
    animated: true, 
    style: { stroke: '#ef4444', strokeDasharray: '5,5', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' }
  },
  { 
    id: 'e3-4', source: 'node-3', target: 'node-4', label: 'Stable Link', 
    animated: true, 
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
  },
];

const TrustNode = ({ data }: any) => {
  const isFragile = data.status === 'fragile' || data.status === 'weakening';
  
  return (
    <div className={cn(
      "px-6 py-4 rounded-2xl border-2 flex flex-col gap-2 min-w-[180px] bg-card-bg/90 backdrop-blur-xl transition-all",
      data.status === 'strong' ? "border-accent/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]" :
      data.status === 'fragile' ? "border-danger/60 shadow-[0_0_20px_rgba(239,68,68,0.3)]" :
      "border-primary/40 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
    )}>
      <Handle type="target" position={Position.Top} className="!bg-white/20" />
      <div className="flex items-center justify-between">
        <span className={cn("text-[10px] uppercase font-black tracking-widest", 
          data.status === 'strong' ? "text-accent" : 
          data.status === 'fragile' ? "text-danger animate-pulse" : "text-primary")}>
          {data.status}
        </span>
        {data.status === 'strong' ? <ShieldCheck size={14} className="text-accent" /> : 
         data.status === 'fragile' ? <ShieldAlert size={14} className="text-danger" /> : 
         <Shield size={14} className="text-primary" />}
      </div>
      <div className="font-bold text-white text-sm">{data.label}</div>
      <div className="flex items-end justify-between mt-1">
         <span className="text-[10px] text-white/30 font-mono">TRUST_DNA</span>
         <span className="text-lg font-black text-white">{(data.trust * 100).toFixed(0)}%</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-white/20" />
    </div>
  );
};

const nodeTypes = {
  trustNode: TrustNode,
};

export default function DigitalTwin() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const exportTopology = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      nodes,
      edges,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'real-weave-topology.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }, [edges, nodes]);

  return (
    <div className="h-[calc(100vh-200px)] relative overflow-hidden rounded-3xl border border-white/5 bg-background">
      <div className="absolute top-8 left-8 z-10 space-y-4">
         <div className="glass-morphism p-6 rounded-2xl border border-white/10 max-w-xs">
            <h3 className="text-xl font-black text-white italic mb-2">INTELLIGENCE OVERLAY</h3>
            <p className="text-xs text-white/40 leading-relaxed">
               Modeling the connective tissue of trust across your supply network. Use the graph to identify systemic vulnerabilities before they collapse.
            </p>
         </div>
         <div className="flex flex-col gap-2">
            <LegendItem color="bg-accent" label="Strong Integrity" />
            <LegendItem color="bg-primary" label="Stable / Borrowed" />
            <LegendItem color="bg-danger" label="Fragile / Weakening" />
         </div>
      </div>

      <div className="absolute top-8 right-8 z-10 flex gap-4">
        <Link href="/dashboard/trust" className="px-6 py-3 bg-white text-background rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all text-xs">
            <Zap size={16} /> RECALCULATE TRUST
        </Link>
        <button onClick={exportTopology} className="px-6 py-3 glass-morphism border border-white/10 text-white rounded-xl font-bold hover:bg-white/5 transition-all text-xs">
            EXPORT TOPOLOGY
         </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        className="trust-graph"
      >
        <Background color="rgba(255, 255, 255, 0.02)" gap={20} />
        <Controls className="!bg-card-bg !border-none !shadow-none [&_button]:!invert" />
      </ReactFlow>

      {/* Detail Overlay */}
      <div className="absolute bottom-8 right-8 z-10 glass-morphism p-6 rounded-2xl border border-white/10 w-80">
         <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center text-danger">
               <ShieldAlert size={20} />
            </div>
            <div>
               <h4 className="text-sm font-bold text-white uppercase tracking-widest">Fragile Link Detected</h4>
               <p className="text-[10px] text-white/30 font-mono">NODE_ETH_0X223</p>
            </div>
         </div>
         <p className="text-xs text-white/50 leading-relaxed italic mb-4">
            "Trust is currently 'borrowed' from North Alpha Hub to stabilize Singapore Port. High risk of chain reaction if volatility increases."
         </p>
        <Link href="/dashboard/negotiation" className="block w-full py-3 border border-white/10 text-white hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center">
            Initiate Mitigation Logic
        </Link>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-1.5 glass-morphism rounded-lg border border-white/5">
       <div className={cn("w-2 h-2 rounded-full", color)} />
       <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{label}</span>
    </div>
  );
}
