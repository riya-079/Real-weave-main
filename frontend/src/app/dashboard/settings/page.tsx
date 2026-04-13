'use client';

import React from 'react';
import Link from 'next/link';
import { User, Bell, Shield, Database, Save, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
   const [saveMessage, setSaveMessage] = React.useState('');

   const saveConfiguration = () => {
      const timestamp = new Date().toLocaleString();
      window.localStorage.setItem('real-weave-settings-saved-at', timestamp);
      setSaveMessage(`Saved at ${timestamp}`);
   };

   return (
      <div className="max-w-4xl mx-auto space-y-10">
         <div className="flex justify-between items-end">
            <div>
               <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Platform Settings</h2>
               <p className="text-white/40">Configure controls, data sources, and demo environments.</p>
            </div>
            <button
               onClick={saveConfiguration}
               className="px-8 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all text-sm"
            >
               <Save size={18} /> SAVE CONFIGURATION
            </button>
         </div>

         {saveMessage ? <p className="text-xs text-accent font-bold">{saveMessage}</p> : null}

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
               <SettingsTab icon={<User />} label="Organization Profile" active />
               <SettingsTab icon={<Bell />} label="Alert Thresholds" />
               <SettingsTab icon={<Shield />} label="Collaboration / Whisper" />
               <SettingsTab icon={<Database />} label="Data Streams" />
            </div>

            <div className="md:col-span-2 space-y-8">
               <section className="glass-morphism p-8 rounded-3xl border border-white/5 space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                     <PlayCircle className="text-accent" /> Demo Control Center
                  </h3>
                  <p className="text-xs text-white/40 leading-relaxed italic border-l-2 border-accent/20 pl-4">
                     Inject synthetic anomalies and scenarios to validate system resilience and team response velocity.
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                     <DemoAction href="/dashboard/impossible" label="Trigger Impossible Scan Event" color="text-danger" />
                     <DemoAction href="/dashboard/dreaming" label="Simulate Regional Port Closure" color="text-warning" />
                     <DemoAction href="/dashboard/trust" label="Degrade Supplier Trust (Synthetic)" color="text-primary" />
                     <DemoAction href="/dashboard" label="Reset Ecosystem to Genesis" color="text-white/20" />
                  </div>
               </section>

               <section className="glass-morphism p-8 rounded-3xl border border-white/5 space-y-6 opacity-60">
                  <h3 className="text-xl font-bold text-white">Advanced Intelligence Config</h3>
                  <div className="space-y-4">
                     <RangeField label="Anomaly Confidence Threshold" value="85%" />
                     <RangeField label="Causality Reasoner Depth" value="Level 4" />
                     <RangeField label="Whisper Network Anonymity Level" value="Extreme" />
                  </div>
               </section>
            </div>
         </div>
      </div>
   );
}

function SettingsTab({ icon, label, active = false }: any) {
   return (
      <div
         className={cn(
            'flex items-center gap-4 px-6 py-4 rounded-xl font-bold cursor-pointer transition-all',
            active ? 'bg-white text-background glow-shadow-primary' : 'text-white/40 hover:text-white hover:bg-white/5'
         )}
      >
         {React.cloneElement(icon, { size: 20 })}
         <span className="text-xs uppercase tracking-widest">{label}</span>
      </div>
   );
}

function DemoAction({ href, label, color }: any) {
   return (
      <Link href={href} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 cursor-pointer transition-all group">
         <span className={cn('text-xs font-bold uppercase tracking-widest transition-colors', color)}>{label}</span>
         <PlayCircle size={18} className="text-white/20 group-hover:text-white transition-colors" />
      </Link>
   );
}

function RangeField({ label, value }: any) {
   return (
      <div className="flex items-center justify-between">
         <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{label}</span>
         <span className="text-xs font-black text-white">{value}</span>
      </div>
   );
}
