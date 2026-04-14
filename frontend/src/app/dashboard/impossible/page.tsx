'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ShieldAlert, Search, Filter, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAnomalies, getAnomalyWorkflows, upsertAnomalyWorkflow } from '@/lib/api';

interface Anomaly {
  id: string;
  type: string;
  severity: number;
  explanation: string;
  root_causes: string[];
  confidence: number;
  event_ids: string[];
}

type WorkflowStatus = 'open' | 'investigating' | 'resolved';

interface AnomalyWorkflow {
  anomaly_id: string;
  status: WorkflowStatus;
  owner: string;
  note: string;
  archived: boolean;
}

function defaultWorkflow(anomalyId: string): AnomalyWorkflow {
  return {
    anomaly_id: anomalyId,
    status: 'open',
    owner: '',
    note: '',
    archived: false,
  };
}

export default function ImpossibleEvents() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [workflows, setWorkflows] = useState<Record<string, AnomalyWorkflow>>({});
  const [selected, setSelected] = useState<Anomaly | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [owner, setOwner] = useState('');
  const [note, setNote] = useState('');
  const [query, setQuery] = useState('');
  const filterInputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const [anomalyData, workflowData] = await Promise.all([getAnomalies(), getAnomalyWorkflows()]);

        const workflowMap = workflowData.reduce((acc: Record<string, AnomalyWorkflow>, workflow: AnomalyWorkflow) => {
          acc[workflow.anomaly_id] = workflow;
          return acc;
        }, {});

        setWorkflows(workflowMap);

        const activeAnomalies = anomalyData.filter((anomaly: Anomaly) => !workflowMap[anomaly.id]?.archived);
        setAnomalies(activeAnomalies);
        setSelected(activeAnomalies[0] ?? null);
      } catch (error) {
        console.error('Failed to fetch anomalies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnomalies();
  }, []);

  useEffect(() => {
    if (!selected) {
      setOwner('');
      setNote('');
      return;
    }

    const workflow = workflows[selected.id] ?? defaultWorkflow(selected.id);
    setOwner(workflow.owner);
    setNote(workflow.note);
  }, [selected, workflows]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader className="text-primary animate-spin" size={32} />
      </div>
    );
  }

  const filteredAnomalies = anomalies.filter((anom) => {
    const haystack = `${anom.id} ${anom.type} ${anom.explanation}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const saveWorkflow = async (updates: Partial<AnomalyWorkflow>) => {
    if (!selected) {
      return;
    }

    const current = workflows[selected.id] ?? defaultWorkflow(selected.id);
    const next: AnomalyWorkflow = {
      ...current,
      ...updates,
      anomaly_id: selected.id,
    };

    try {
      setSaving(true);
      const saved = await upsertAnomalyWorkflow(selected.id, next);
      setWorkflows((currentWorkflows) => ({ ...currentWorkflows, [selected.id]: saved }));

      if (saved.archived) {
        const remaining = anomalies.filter((anom) => anom.id !== selected.id);
        setAnomalies(remaining);
        setSelected(remaining[0] ?? null);
      }
    } catch (error) {
      console.error('Failed to save alert workflow:', error);
    } finally {
      setSaving(false);
    }
  };

  const selectedWorkflow = selected ? workflows[selected.id] ?? defaultWorkflow(selected.id) : null;

  return (
    <div className="flex gap-8 h-[calc(100vh-180px)]">
      {/* Left List */}
      <div className="w-1/3 flex flex-col gap-4">
        <div className="flex gap-4 mb-2">
           <div className="flex-1 px-4 py-2 glass-morphism rounded-xl border border-white/5 flex items-center gap-2">
              <Search size={16} className="text-white/30" />
              <input
                ref={filterInputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="text"
                placeholder="Search alerts..."
                className="bg-transparent border-none outline-none text-xs text-white w-full"
              />
           </div>
            <button onClick={() => {
             filterInputRef.current?.focus();
            }} className="p-2 glass-morphism rounded-xl border border-white/5 text-white/40 hover:text-white">
              <Filter size={18} />
           </button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {filteredAnomalies.length === 0 ? (
            <div className="text-center text-white/40 py-8">No alerts found</div>
          ) : (
            filteredAnomalies.map((anom) => (
              <motion.div
                layoutId={anom.id}
                key={anom.id}
                onClick={() => setSelected(anom)}
                className={cn(
                  "p-5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden group",
                  selected?.id === anom.id 
                    ? "glass-morphism border-primary/40 glow-shadow-primary" 
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                   <span className={cn(
                     "text-[10px] font-bold px-2 py-0.5 rounded tracking-[0.06em]",
                     anom.severity > 0.8 ? "bg-danger/20 text-danger" : "bg-warning/20 text-warning"
                   )}>
                     {anom.severity > 0.8 ? "Critical" : "Alert"}
                   </span>
                   <span className="text-[10px] text-white/30 font-mono">{anom.id}</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{anom.type}</h3>
                <p className="text-xs text-white/40 line-clamp-1">{anom.explanation}</p>
                
                {selected?.id === anom.id && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary" />
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Right Detail */}
      <div className="flex-1 glass-morphism rounded-3xl border border-white/5 overflow-hidden flex flex-col relative">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div 
              key={selected.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              {/* Header */}
              <div className="p-8 border-b border-white/5 space-y-4">
                 <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                       <span className={cn(
                         "text-[10px] font-bold px-3 py-1 rounded tracking-[0.06em] mb-2 inline-block",
                         selected.severity > 0.8 ? "bg-danger/20 text-danger" : "bg-warning/20 text-warning"
                       )}>
                         {selected.severity > 0.8 ? "Critical" : "Alert"}
                       </span>
                       <h1 className="text-3xl font-black text-white mt-2">{selected.type}</h1>
                    </div>
                    <div className="text-right">
                       <div className="text-xs text-white/30 mb-1">CONFIDENCE</div>
                       <div className="text-2xl font-black text-accent">{(selected.confidence * 100).toFixed(0)}%</div>
                    </div>
                 </div>
                    <div className="flex gap-2">
                     <StatusButton label="Open" active={selectedWorkflow?.status === 'open'} onClick={() => saveWorkflow({ status: 'open' })} />
                     <StatusButton label="Investigating" active={selectedWorkflow?.status === 'investigating'} onClick={() => saveWorkflow({ status: 'investigating' })} />
                     <StatusButton label="Resolved" active={selectedWorkflow?.status === 'resolved'} onClick={() => saveWorkflow({ status: 'resolved' })} />
                    </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                 {/* Explanation */}
                 <section>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                       <AlertCircle className="text-warning" size={20} />
                       What happened
                    </h3>
                    <p className="text-white/60 leading-relaxed">{selected.explanation}</p>
                 </section>

                 {/* Root Causes */}
                 <section>
                    <h3 className="text-lg font-bold text-white mb-4">Possible reasons</h3>
                    <div className="space-y-3">
                       {selected.root_causes.map((cause, i) => (
                         <div key={i} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                            <ShieldAlert className="text-warning mt-1 flex-shrink-0" size={18} />
                            <div>
                              <p className="text-white/80 font-semibold text-sm">{cause}</p>
                              <p className="text-white/40 text-xs mt-1">Possible reason behind this alert</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </section>

                 {/* Severity Breakdown */}
                 <section>
                    <h3 className="text-lg font-bold text-white mb-4">Impact level</h3>
                    <div className="space-y-4">
                       <div>
                         <div className="flex justify-between mb-2">
                            <span className="text-sm text-white/60">Impact Level</span>
                            <span className="text-sm font-bold text-white">{(selected.severity * 100).toFixed(0)}%</span>
                         </div>
                         <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                              className={selected.severity > 0.8 ? "bg-danger" : "bg-warning"}
                              initial={{ width: 0 }}
                              animate={{ width: `${selected.severity * 100}%` }}
                              transition={{ duration: 0.5 }}
                            />
                         </div>
                       </div>
                    </div>
                 </section>

                 <section className="space-y-4">
                    <h3 className="text-lg font-bold text-white">Investigation owner</h3>
                    <input
                      value={owner}
                      onChange={(event) => setOwner(event.target.value)}
                      placeholder="Type owner name..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none"
                    />
                 </section>

                 <section className="space-y-4">
                    <h3 className="text-lg font-bold text-white">Investigation notes</h3>
                    <textarea
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      placeholder="Add latest findings..."
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none resize-none"
                    />
                    <button
                      onClick={() => saveWorkflow({ owner, note })}
                      disabled={saving}
                      className="px-5 py-2 bg-primary hover:bg-primary/80 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all"
                    >
                      {saving ? 'Saving...' : 'Save details'}
                    </button>
                 </section>
              </div>

              {/* Footer Actions */}
              <div className="p-8 border-t border-white/5 flex gap-4">
                  <Link href="/dashboard/negotiation" className="flex-1 py-3 bg-primary hover:bg-primary/80 text-white rounded-xl font-bold transition-all text-center">
                    Open action planner
                  </Link>
                  <button onClick={() => saveWorkflow({ archived: true })} className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-white rounded-xl font-bold transition-all">
                    Archive (persist)
                 </button>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full text-white/40">
              <p>Select an alert to view details</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatusButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1 rounded-lg text-xs font-bold transition-all',
        active ? 'bg-primary text-white' : 'bg-white/5 text-white/60 hover:text-white'
      )}
    >
      {label}
    </button>
  );
}

function EvidenceStep({ loc, time, status, active = false }: { loc: string, time: string, status: string, active?: boolean }) {
  return (
    <div className="flex items-start gap-4 pl-0.5">
      <div className={cn(
        "w-5 h-5 rounded-full flex items-center justify-center z-10",
        active ? "bg-primary border-4 border-background" : "bg-white/10"
      )}>
         {active && <div className="w-1 h-1 rounded-full bg-white" />}
      </div>
      <div>
        <p className={cn("text-xs font-bold", active ? "text-white" : "text-white/30")}>{loc}</p>
        <p className="text-[10px] text-white/30 font-mono italic">{time} — {status}</p>
      </div>
    </div>
  );
}
