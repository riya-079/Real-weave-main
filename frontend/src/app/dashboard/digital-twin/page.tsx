'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import ReactFlow, { Background, Controls, Handle, MarkerType, Position, type Edge, type Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { Shield, ShieldAlert, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOrganizations } from '@/lib/api';
import { useLiveRefresh } from '@/lib/useLiveRefresh';

type Organization = {
  id: string;
  name: string;
  type: string;
  region: string;
  trust_score: number;
};

type TrustNodeData = {
  label: string;
  status: 'strong' | 'fragile' | 'weakening';
  trust: number;
};

const nodeTypes = {
  trustNode: TrustNode,
};

function buildNodes(organizations: Organization[]): Node<TrustNodeData>[] {
  const radius = 220;

  return organizations.map((organization, index) => {
    const angle = (index / Math.max(organizations.length, 1)) * Math.PI * 2;
    const trust = organization.trust_score;
    const status: TrustNodeData['status'] = trust >= 0.85 ? 'strong' : trust >= 0.7 ? 'weakening' : 'fragile';

    return {
      id: organization.id,
      type: 'trustNode',
      position: {
        x: 300 + Math.cos(angle) * radius,
        y: 180 + Math.sin(angle) * radius,
      },
      data: {
        label: organization.name,
        status,
        trust,
      },
    };
  });
}

function buildEdges(organizations: Organization[]): Edge[] {
  return organizations.slice(1).map((organization, index) => {
    const source = organizations[index];
    const trust = organization.trust_score;
    const label = trust >= 0.85 ? 'Verified link' : trust >= 0.7 ? 'Support link' : 'Weak link';
    const stroke = trust >= 0.85 ? '#10b981' : trust >= 0.7 ? '#3b82f6' : '#ef4444';

    return {
      id: `${source.id}-${organization.id}`,
      source: source.id,
      target: organization.id,
      label,
      animated: true,
      style: {
        stroke,
        strokeWidth: trust >= 0.85 ? 3 : 2,
        strokeDasharray: trust < 0.7 ? '5,5' : undefined,
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
    <div
      className={cn(
        'px-6 py-4 rounded-2xl border-2 flex flex-col gap-2 min-w-[180px] bg-card-bg/90 backdrop-blur-xl transition-all',
        data.status === 'strong'
          ? 'border-accent/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
          : data.status === 'fragile'
            ? 'border-danger/60 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
            : 'border-primary/40 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-white/20" />
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-[10px] font-black tracking-[0.08em]',
            data.status === 'strong'
              ? 'text-accent'
              : data.status === 'fragile'
                ? 'text-danger animate-pulse'
                : 'text-primary'
          )}
        >
          {data.status}
        </span>
        {data.status === 'strong' ? (
          <ShieldCheck size={14} className="text-accent" />
        ) : data.status === 'fragile' ? (
          <ShieldAlert size={14} className="text-danger" />
        ) : (
          <Shield size={14} className="text-primary" />
        )}
      </div>
      <div className="font-bold text-white text-sm">{data.label}</div>
      <div className="flex items-end justify-between mt-1">
        <span className="text-[10px] text-white/30 font-mono">trust score</span>
        <span className="text-lg font-black text-white">{(data.trust * 100).toFixed(0)}%</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-white/20" />
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-1.5 glass-morphism rounded-lg border border-white/5">
      <div className={cn('w-2 h-2 rounded-full', color)} />
      <span className="text-[10px] font-bold text-white/60 tracking-[0.08em]">{label}</span>
    </div>
  );
}

export default function DigitalTwin() {
  const [nodes, setNodes] = useState<Node<TrustNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrganizations = useCallback(async () => {
    try {
      const data = await getOrganizations();
      setNodes(buildNodes(data));
      setEdges(buildEdges(data));
    } catch (error) {
      console.error('Failed to load trust map data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  useLiveRefresh(loadOrganizations);

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
    anchor.download = 'real-weave-trust-map.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }, [edges, nodes]);

  if (loading) {
    return <div className="text-white/40">Loading partner trust map...</div>;
  }

  if (nodes.length === 0) {
    return <div className="text-white/40">No partner data found.</div>;
  }

  return (
    <div className="h-[calc(100vh-200px)] relative overflow-hidden rounded-3xl border border-white/5 bg-background">
      <div className="absolute top-8 left-8 z-10 space-y-4">
        <div className="glass-morphism p-6 rounded-2xl border border-white/10 max-w-xs">
          <h3 className="text-xl font-black text-white italic mb-2">PARTNER TRUST MAP</h3>
          <p className="text-xs text-white/40 leading-relaxed">
            View trust levels across suppliers and logistics nodes. Spot weak links before they create bigger problems.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <LegendItem color="bg-accent" label="High trust" />
          <LegendItem color="bg-primary" label="Medium trust" />
          <LegendItem color="bg-danger" label="Low trust" />
        </div>
      </div>

      <div className="absolute top-8 right-8 z-10 flex gap-4">
        <Link href="/dashboard/trust" className="px-6 py-3 bg-white text-background rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all text-xs">
          <Zap size={16} /> REFRESH TRUST SCORE
        </Link>
        <button onClick={exportTopology} className="px-6 py-3 glass-morphism border border-white/10 text-white rounded-xl font-bold hover:bg-white/5 transition-all text-xs">
          EXPORT MAP
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        className="trust-graph"
      >
        <Background color="rgba(255, 255, 255, 0.02)" gap={20} />
        <Controls className="!bg-card-bg !border-none !shadow-none [&_button]:!invert" />
      </ReactFlow>

      <div className="absolute bottom-8 right-8 z-10 glass-morphism p-6 rounded-2xl border border-white/10 w-80">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center text-danger">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-[0.08em]">Weak link detected</h4>
            <p className="text-[10px] text-white/30 font-mono">Trust review</p>
          </div>
        </div>
        <p className="text-xs text-white/50 leading-relaxed italic mb-4">
          One partner is showing a lower trust score. Review the link before a delay spreads.
        </p>
        <Link href="/dashboard/negotiation" className="block w-full py-3 border border-white/10 text-white hover:bg-white/5 rounded-xl text-[10px] font-black tracking-[0.08em] transition-all text-center">
          Open action planner
        </Link>
      </div>
    </div>
  );
}
