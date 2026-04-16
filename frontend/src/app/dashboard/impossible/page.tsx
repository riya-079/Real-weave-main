'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ShieldAlert, Search, Filter, Loader, BarChart3, Clock, User, MessageCircle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAnomalies, getAnomalyWorkflows, upsertAnomalyWorkflow } from '@/lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface Anomaly {
  id: string;
  type: string;
  severity: number;
  explanation: string;
  root_causes: string[];
  confidence: number;
  event_ids: string[];
  created_at?: string;
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
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'warning'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      const [anomalyData, workflowData] = await Promise.all([getAnomalies(), getAnomalyWorkflows()]);

      const workflowMap = workflowData.reduce((acc: Record<string, AnomalyWorkflow>, workflow: AnomalyWorkflow) => {
        acc[workflow.anomaly_id] = workflow;
        return acc;
      }, {});

      setWorkflows(workflowMap);
      setAnomalies(anomalyData);
      setSelected(anomalyData.find((a: Anomaly) => !workflowMap[a.id]?.archived) ?? anomalyData[0]);
    } catch (error) {
      console.error('Failed to fetch anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  useEffect(() => {
    if (!selected) return;
    const workflow = workflows[selected.id] ?? defaultWorkflow(selected.id);
    setOwner(workflow.owner);
    setNote(workflow.note);
  }, [selected, workflows]);

  const filteredAnomalies = useMemo(() => {
    return anomalies.filter((anom) => {
      const isArchived = workflows[anom.id]?.archived;
      if (isArchived) return false;

      const matchesQuery = `${anom.id} ${anom.type} ${anom.explanation}`.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = 
        activeFilter === 'all' || 
        (activeFilter === 'critical' && anom.severity > 0.8) ||
        (activeFilter === 'warning' && anom.severity <= 0.8);

      return matchesQuery && matchesFilter;
    });
  }, [anomalies, workflows, query, activeFilter]);

  const chartData = useMemo(() => {
    // Generate distribution data for severity
    const distribution = [
      { range: '0-20%', count: 0 },
      { range: '20-40%', count: 0 },
      { range: '40-60%', count: 0 },
      { range: '60-80%', count: 0 },
      { range: '80-100%', count: 0 },
    ];

    anomalies.forEach(a => {
      if (a.severity < 0.2) distribution[0].count++;
      else if (a.severity < 0.4) distribution[1].count++;
      else if (a.severity < 0.6) distribution[2].count++;
      else if (a.severity < 0.8) distribution[3].count++;
      else distribution[4].count++;
    });

    return distribution;
  }, [anomalies]);

  const saveWorkflow = async (updates: Partial<AnomalyWorkflow>) => {
    if (!selected) return;

    const current = workflows[selected.id] ?? defaultWorkflow(selected.id);
    const next: AnomalyWorkflow = { ...current, ...updates, anomaly_id: selected.id };

    try {
      setSaving(true);
      const saved = await upsertAnomalyWorkflow(selected.id, next);
      setWorkflows((prev) => ({ ...prev, [selected.id]: saved }));

      if (saved.archived) {
        const remaining = filteredAnomalies.filter(a => a.id !== selected.id);
        setSelected(remaining[0] ?? null);
      }
    } catch (error) {
      console.error('Failed to save alert workflow:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader className="text-primary animate-spin" size={48} />
        <p className="text-white/40 font-mono text-sm animate-pulse uppercase tracking-widest">Scanning network for impossibilities...</p>
      </div>
    );
  }

  const selectedWorkflow = selected ? workflows[selected.id] ?? defaultWorkflow(selected.id) : null;

  return (
    <div className="space-y-6">
      {/* Analytics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-morphism p-6 rounded-3xl border border-white/5 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-xs font-black text-white/30 tracking-widest uppercase">Active Anomalies</span>
            <AlertCircle className="text-danger" size={20} />
          </div>
          <div className="flex-1 flex flex-col justify-end gap-3 pb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white">{filteredAnomalies.length}</span>
              <span className={cn("text-xs font-black uppercase tracking-widest", filteredAnomalies.length > 5 ? "text-danger" : "text-accent")}>
                {filteredAnomalies.length > 5 ? "Alert Heavy" : "Stable Flux"}
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 className={cn("h-full", filteredAnomalies.length > 5 ? "bg-danger" : "bg-accent")}
                 initial={{ width: 0 }} 
                 animate={{ width: `${Math.min((filteredAnomalies.length / 10) * 100, 100)}%` }} 
               />
            </div>
          </div>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Cognitive Load Index</p>
        </div>

        <div className="md:col-span-2 glass-morphism p-6 rounded-3xl border border-white/5 h-40 flex items-center">
            <div className="flex-1 h-full">
              <span className="text-xs font-black text-white/30 tracking-widest uppercase mb-4 block">Severity Distribution</span>
              <ResponsiveContainer width="100%" height={90}>
                {mounted ? (
                  <BarChart data={chartData}>
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => {
                        let color = '#10b981'; // accent/green
                        if (index >= 4) color = '#ef4444'; // critical/red
                        else if (index >= 2) color = '#f59e0b'; // warning/yellow
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                ) : <div />}
              </ResponsiveContainer>
            </div>
            <div className="w-px h-24 bg-white/5 mx-6" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-danger" />
                <span className="text-[10px] text-white/60 font-bold uppercase">Critical (80%+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <span className="text-[10px] text-white/60 font-bold uppercase">Warning (40-80%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-[10px] text-white/60 font-bold uppercase">Trace (0-40%)</span>
              </div>
            </div>
        </div>
      </div>

      <div className="flex gap-8 h-[calc(100vh-340px)] min-h-[600px] pb-4">
        {/* Left List */}
        <div className="w-1/3 flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="flex-1 px-4 py-2.5 glass-morphism rounded-xl border border-white/5 flex items-center gap-2">
              <Search size={16} className="text-white/30" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Search alert ID or type..."
                className="bg-transparent border-none outline-none text-xs text-white w-full font-medium"
              />
            </div>
            <select 
              value={activeFilter}
              onChange={(e: any) => setActiveFilter(e.target.value)}
              className="bg-white/5 border border-white/5 rounded-xl px-3 text-[10px] font-bold text-white uppercase outline-none"
            >
              <option value="all">Priority: All</option>
              <option value="critical">Critical Only</option>
              <option value="warning">Warning Only</option>
            </select>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {filteredAnomalies.length > 0 ? (
              filteredAnomalies.map((anom) => (
                <motion.div
                  key={anom.id}
                  onClick={() => setSelected(anom)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={cn(
                    "p-5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden group",
                    selected?.id === anom.id 
                      ? "glass-morphism border-primary/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]" 
                      : "bg-white/5 border-white/5 hover:bg-white/10"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                     <div className="flex gap-2">
                       <span className={cn(
                         "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest",
                         anom.severity > 0.8 ? "bg-danger/20 text-danger" : "bg-warning/20 text-warning"
                       )}>
                         {anom.severity > 0.8 ? "Critical" : "Warning"}
                       </span>
                       <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest bg-white/5 text-white/40">
                         {workflows[anom.id]?.status || 'open'}
                       </span>
                     </div>
                     <span className="text-[10px] text-white/20 font-mono tracking-tighter">{anom.id}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{anom.type}</h3>
                  <p className="text-xs text-white/30 truncate mt-1 italic">"{anom.explanation}"</p>
                  
                  {selected?.id === anom.id && (
                    <motion.div layoutId="active-indicator" className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                </motion.div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl p-8 text-center gap-4 bg-white/1">
                <ShieldCheck className="text-accent/20" size={48} />
                <div className="space-y-1">
                  <p className="text-white/60 font-bold text-xs uppercase tracking-widest">Network Secure</p>
                  <p className="text-[10px] text-white/20 font-medium max-w-[180px]">No impossible events or cognitive conflicts detected in the current flow.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Detail */}
        <div className="flex-1 glass-morphism rounded-3xl border border-white/5 overflow-hidden flex flex-col relative">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div 
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                {/* Header */}
                <div className="p-8 border-b border-white/5">
                   <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                         <div className="flex items-center gap-2 text-danger text-[10px] font-black tracking-[.2em] uppercase">
                            <ShieldAlert size={14} /> Critical Cognitive Conflict
                         </div>
                         <h1 className="text-4xl font-black text-white italic tracking-tighter leading-[1.15] py-1">{selected.type}</h1>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="text-[10px] font-black text-white/30 tracking-widest uppercase mb-1">Impact Score</span>
                         <span className={cn("text-3xl font-black tracking-tighter", selected.severity > 0.8 ? "text-danger" : "text-warning")}>
                            {Math.round(selected.severity * 100)}%
                         </span>
                      </div>
                   </div>

                   <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
                      <StatusTab label="Open" active={selectedWorkflow?.status === 'open'} onClick={() => saveWorkflow({ status: 'open' })} />
                      <StatusTab label="Investigation" active={selectedWorkflow?.status === 'investigating'} onClick={() => saveWorkflow({ status: 'investigating' })} />
                      <StatusTab label="Resolved" active={selectedWorkflow?.status === 'resolved'} onClick={() => saveWorkflow({ status: 'resolved' })} />
                   </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                   {/* Description Card */}
                   <div className="p-6 bg-white/2 rounded-2xl border border-white/5 relative overflow-hidden group">
                      <div className="relative z-10 flex gap-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 border border-primary/20">
                          <MessageCircle className="text-primary" size={24} />
                        </div>
                        <div className="space-y-2">
                           <h4 className="text-xs font-black text-white/40 tracking-widest uppercase">Forensic Summary</h4>
                           <p className="text-lg text-white font-medium italic leading-relaxed">"{selected.explanation}"</p>
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertCircle size={80} />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-8">
                      {/* Root Causes */}
                      <section className="space-y-4">
                         <h3 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-2">
                            <BarChart3 size={14} className="text-primary" /> Suspected Root Causes
                         </h3>
                         <div className="space-y-2">
                            {selected.root_causes.map((cause, i) => (
                              <div key={i} className="px-4 py-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-all">
                                 <span className="text-sm text-white/80 font-medium">{cause}</span>
                                 <span className="text-[10px] font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Verify</span>
                              </div>
                            ))}
                         </div>
                      </section>

                      {/* Work Details */}
                      <section className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-2">
                              <User size={14} className="text-primary" /> Case Assignment
                          </h3>
                          <input
                            value={owner}
                            onChange={(e) => setOwner(e.target.value)}
                            placeholder="Specify forensic analyst..."
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-primary/40 transition-all font-medium"
                          />
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-2">
                              <Clock size={14} className="text-primary" /> Investigation Journal
                          </h3>
                          <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Append findings from logic trace..."
                            rows={3}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-primary/40 transition-all font-medium resize-none"
                          />
                        </div>

                        <button
                          onClick={() => saveWorkflow({ owner, note })}
                          disabled={saving}
                          className="w-full py-3 bg-primary hover:bg-primary/80 disabled:opacity-60 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all glow-shadow-primary"
                        >
                          {saving ? 'Transmitting Data...' : 'Audit & Update Case'}
                        </button>
                      </section>
                   </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-white/5 bg-white/2 flex gap-4">
                    <Link href="/dashboard/negotiation" className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-center">
                      Invoke Strategy Planner
                    </Link>
                    <button onClick={() => saveWorkflow({ archived: true })} className="flex-1 py-4 bg-danger/10 hover:bg-danger/20 border border-danger/20 text-danger rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                      Archive Permanently
                   </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center h-full text-white/10 gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/30 blur-[80px] rounded-full animate-pulse" />
                  <ShieldCheck size={80} className="relative z-10 text-accent/40" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-base font-black tracking-[0.2em] uppercase text-white/40">Zero Discrepancy Protocol</p>
                  <p className="text-xs font-medium text-white/20 italic">"The Weave is in perfect alignment. All sequences verified."</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function StatusTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden',
        active 
          ? 'bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
          : 'text-white/40 hover:text-white hover:bg-white/10'
      )}
    >
      {label}
      {active && (
        <motion.div 
          layoutId="tab-glow"
          className="absolute inset-0 bg-white/10"
          initial={false}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  );
}
