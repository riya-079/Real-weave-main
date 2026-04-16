'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Shield, Zap, TrendingUp, AlertTriangle, Users, Box, Globe, Search } from 'lucide-react';
import Link from 'next/link';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { cn } from '@/lib/utils';
import { getOverview, getShipments, getAnomalies } from '@/lib/api';
import { useLiveRefresh } from '@/lib/useLiveRefresh';

const data = [
  { name: 'Mon', trust: 85, anomalies: 2 },
  { name: 'Tue', trust: 82, anomalies: 5 },
  { name: 'Wed', trust: 88, anomalies: 1 },
  { name: 'Thu', trust: 80, anomalies: 8 },
  { name: 'Fri', trust: 92, anomalies: 2 },
  { name: 'Sat', trust: 95, anomalies: 0 },
  { name: 'Sun', trust: 93, anomalies: 1 },
];

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [shipments, setShipments] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);

  const [mounted, setMounted] = useState(false);
  const [liveSignals, setLiveSignals] = useState<any[]>([
    { label: "Reality Check alert", time: "Just now", status: "Critical" },
    { label: "Partner Scorecard update", time: "14m ago", status: "Warning" },
    { label: "Secure Risk Sharing note", time: "1h ago", status: "Healthy" },
    { label: "Future Risk Simulator done", time: "3h ago", status: "Healthy" },
  ]);

  const normalizeStatus = (status: any): 'Critical' | 'Warning' | 'Healthy' => {
    if (!status) return 'Healthy';
    const s = String(status).toLowerCase();
    if (s.includes('critical') || s.includes('danger') || s.includes('error')) return 'Critical';
    if (s.includes('warning') || s.includes('alert')) return 'Warning';
    return 'Healthy';
  };

  useLiveRefresh(
    () => {}, // Overview re-fetch could be added here if needed
    (signals) => {
      const newItems = signals.map(s => ({
        label: `${s.metric} Pulse: ${s.id}`,
        time: "Real-time",
        status: normalizeStatus(s.status),
        value: s.value
      }));
      setLiveSignals(prev => [...newItems, ...prev].slice(0, 4));
    },
    (event) => {
      const newItem = {
        label: event.title,
        time: "Intelligence",
        status: normalizeStatus(event.severity),
        value: event.source
      };
      setLiveSignals(prev => [newItem, ...prev].slice(0, 4));
    }
  );

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        const [overviewData, shipmentsData, anomaliesData] = await Promise.all([
          getOverview(),
          getShipments(),
          getAnomalies()
        ]);
        
        setOverview(overviewData);
        setShipments(shipmentsData);
        setAnomalies(anomaliesData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-primary font-mono animate-pulse">Loading live supply chain data...</p>
        </div>
      </div>
    );
  }

  const moodColor = overview?.mood?.label === 'tense' ? 'text-warning' : 
                    overview?.mood?.label === 'calm' ? 'text-accent' : 'text-danger';

  return (
    <div className="space-y-10">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Network Health" value={overview?.mood?.label || 'Unknown'} sub={`${overview?.mood?.score || 0}% stress level`} color={moodColor} icon={<Activity />} />
        <StatCard title="Average Trust" value={overview?.trust_avg?.toFixed(2) || '0.00'} sub="+0.04 vs Last Week" color="text-accent" icon={<Shield />} />
        <StatCard title="Active Alerts" value={overview?.anomaly_count?.toString() || '0'} sub="Needs review by operations team" color="text-danger" icon={<AlertTriangle />} />
        <StatCard title="Predicted Risk" value="$1.2M" sub="Potential loss exposure" color="text-secondary" icon={<Zap />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 glass-morphism p-8 rounded-3xl border border-white/5 h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-white">Live Dashboard</h3>
              <p className="text-sm text-white/40">Track trust and alerts in real time</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs text-white/60">Trust Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-danger" />
                <span className="text-xs text-white/60">Alerts</span>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full relative min-h-[300px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorTrust" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff20" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff20" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="trust" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTrust)" />
                  <Area type="monotone" dataKey="anomalies" stroke="#ef4444" strokeWidth={2} fillOpacity={0.1} fill="#ef4444" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Side Info Cards */}
        <div className="space-y-6">
           <div className="glass-morphism p-6 rounded-2xl border border-white/5 space-y-4">
             <h4 className="text-sm font-bold text-white tracking-[0.08em] opacity-40">Recent signals</h4>
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {liveSignals.map((signal, idx) => (
                    <motion.div
                      key={`${signal.label}-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="transition-all"
                    >
                      <SignalItem 
                        label={signal.label} 
                        time={signal.time} 
                        status={signal.status} 
                        value={signal.value}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
           </div>

           <div className="relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-80 rounded-2xl" />
              <div className="relative p-6 space-y-4">
                 <Globe className="text-white w-10 h-10 mb-2 group-hover:rotate-12 transition-transform" />
                 <h4 className="text-lg font-bold text-white italic">Future Risk Simulator</h4>
                 <p className="text-white/80 text-xs">Run quick what-if checks to see likely delays and impact.</p>
                 <Link href="/dashboard/dreaming" className="block w-full py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold text-xs backdrop-blur-md transition-all text-center">
                   Open risk simulator
                 </Link>
              </div>
           </div>
        </div>
      </div>

      {/* Modules Quick Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <Link href="/dashboard/ghost" className="block">
           <ModuleLink label="Inventory Mismatch Checker" icon={<TrendingUp />} count="4 open cases" color="bg-orange-500/10 text-orange-500" />
         </Link>
         <Link href="/dashboard/whisper" className="block">
           <ModuleLink label="Secure Risk Sharing" icon={<Users />} count="128 shared patterns" color="bg-blue-500/10 text-blue-500" />
         </Link>
         <Link href="/dashboard/memory" className="block">
           <ModuleLink label="Product Journey" icon={<Box />} count="2,491 products tracked" color="bg-purple-500/10 text-purple-500" />
         </Link>
         <Link href="/dashboard/causality" className="block">
           <ModuleLink label="Root Cause Finder" icon={<Search />} count="ready" color="bg-green-500/10 text-green-500" />
         </Link>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, color, icon }: { title: string, value: string, sub: string, color: string, icon: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-morphism p-6 rounded-2xl border border-white/5 flex flex-col gap-2 relative group overflow-hidden"
    >
      <div className={cn("absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform", color)}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 60 })}
      </div>
      <p className="text-sm font-medium text-white/40">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className={cn("text-3xl font-black", color)}>{value}</h3>
      </div>
      <p className="text-xs text-white/30 font-medium">{sub}</p>
    </motion.div>
  );
}

function SignalItem({ label, time, status, value }: { label: string, time: string, status: 'Critical' | 'Warning' | 'Healthy', value?: string }) {
  const statusColors = {
    Critical: 'bg-danger text-danger',
    Warning: 'bg-warning text-warning',
    Healthy: 'bg-accent text-accent'
  };
  
  const colors = statusColors[status] || statusColors.Healthy;
  const parts = colors.split(' ');
  
  return (
    <div className="flex items-center justify-between group/signal">
      <div className="flex items-center gap-3">
        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", parts[0])} />
        <div>
          <p className="text-sm font-bold text-white/80 group-hover/signal:text-primary transition-colors">{label}</p>
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-white/30">{time}</p>
            {value && <p className="text-[10px] text-white/50 font-mono bg-white/5 px-1.5 rounded truncate max-w-[100px]">{value}</p>}
          </div>
        </div>
      </div>
      <span className={cn("text-[10px] font-black tracking-[0.06em]", parts[1])}>
        {status}
      </span>
    </div>
  );
}

function ModuleLink({ label, icon, count, color }: { label: string, icon: React.ReactNode, count: string, color: string }) {
  return (
    <div className="glass-morphism h-24 p-4 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-white/5 transition-all cursor-pointer group">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", color)}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
      </div>
      <div>
        <h4 className="text-sm font-bold text-white">{label}</h4>
        <p className="text-xs text-white/40">{count}</p>
      </div>
    </div>
  );
}
