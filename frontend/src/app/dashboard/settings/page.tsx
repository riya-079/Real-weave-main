'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { User, Bell, Shield, Database, Save, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDashboardSetting, upsertDashboardSetting } from '@/lib/api';

export default function SettingsPage() {
   const searchParams = useSearchParams();
   const [saveMessage, setSaveMessage] = React.useState('');
   const [selectedStrategy, setSelectedStrategy] = React.useState('');

   useEffect(() => {
      const loadSettings = async () => {
         try {
            const saved = await getDashboardSetting('platform-settings');
            setSelectedStrategy(saved.value.selectedStrategy || searchParams.get('strategy') || '');
            setSaveMessage(saved.value.savedAt ? `Last saved at ${saved.value.savedAt}` : '');
         } catch {
            setSelectedStrategy(searchParams.get('strategy') || '');
         }
      };

      loadSettings();
   }, [searchParams]);

   const saveConfiguration = async () => {
      const timestamp = new Date().toLocaleString();
      try {
         await upsertDashboardSetting('platform-settings', {
            savedAt: timestamp,
            selectedStrategy,
            source: 'settings-page',
         });
         setSaveMessage(`Saved at ${timestamp}`);
      } catch (error) {
         console.error('Failed to save settings:', error);
         setSaveMessage('Save failed');
      }
   };

   return (
      <div className="max-w-4xl mx-auto space-y-10">
         <div className="flex justify-between items-end">
            <div>
               <h2 className="text-3xl font-black text-white italic tracking-tighter">Platform settings</h2>
               <p className="text-white/40">Manage controls, data sources, and demo options.</p>
            </div>
            <button
               onClick={saveConfiguration}
               className="px-8 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all text-sm"
            >
               <Save size={18} /> Save settings
            </button>
         </div>

         {saveMessage ? <p className="text-xs text-accent font-bold">{saveMessage}</p> : null}

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
               <SettingsTab icon={<User />} label="Organization profile" active />
               <SettingsTab icon={<Bell />} label="Alert thresholds" />
               <SettingsTab icon={<Shield />} label="Secure sharing" />
               <SettingsTab icon={<Database />} label="Data streams" />
            </div>

            <div className="md:col-span-2 space-y-8">
               <section className="glass-morphism p-8 rounded-3xl border border-white/5 space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                     <PlayCircle className="text-accent" /> Demo control center
                  </h3>
                  <p className="text-xs text-white/40 leading-relaxed italic border-l-2 border-accent/20 pl-4">
                     Run live actions to test alerts, team response, and system behavior.
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                     <DemoAction href="/dashboard/impossible" label="Trigger reality check alert" color="text-danger" />
                     <DemoAction href="/dashboard/dreaming" label="Simulate regional port closure" color="text-warning" />
                     <DemoAction href="/dashboard/trust" label="Lower partner trust score (demo)" color="text-primary" />
                     <DemoAction href="/dashboard" label="Reset network to initial state" color="text-white/20" />
                  </div>
               </section>

               <section className="glass-morphism p-8 rounded-3xl border border-white/5 space-y-6 opacity-60">
                  <h3 className="text-xl font-bold text-white">Advanced analysis settings</h3>
                  <div className="space-y-4">
                     <RangeField label="Alert confidence threshold" value="85%" />
                     <RangeField label="Root-cause analysis depth" value="Level 4" />
                     <RangeField label="Secure sharing privacy level" value="High" />
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
         <span className="text-xs tracking-[0.08em]">{label}</span>
      </div>
   );
}

function DemoAction({ href, label, color }: any) {
   return (
      <Link href={href} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 cursor-pointer transition-all group">
         <span className={cn('text-xs font-bold tracking-[0.08em] transition-colors', color)}>{label}</span>
         <PlayCircle size={18} className="text-white/20 group-hover:text-white transition-colors" />
      </Link>
   );
}

function RangeField({ label, value }: any) {
   return (
      <div className="flex items-center justify-between">
         <span className="text-xs font-bold text-white/40 tracking-[0.08em]">{label}</span>
         <span className="text-xs font-black text-white">{value}</span>
      </div>
   );
}
