'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { User, Bell, Shield, Database, Save, PlayCircle, CheckCircle2, Loader, Globe, Zap, Lock, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDashboardSetting, upsertDashboardSetting, getOverview } from '@/lib/api';

type TabKey = 'profile' | 'alerts' | 'sharing' | 'data';

export default function SettingsPage() {
   const searchParams = useSearchParams();
   const [saveMessage, setSaveMessage] = useState('');
   const [saving, setSaving] = useState(false);
   const [activeTab, setActiveTab] = useState<TabKey>('profile');

   // Settings state
   const [orgName, setOrgName] = useState('Real Weave Operations');
   const [orgRegion, setOrgRegion] = useState('Global');
   const [alertThreshold, setAlertThreshold] = useState(85);
   const [rootCauseDepth, setRootCauseDepth] = useState(4);
   const [privacyLevel, setPrivacyLevel] = useState('high');
   const [autoShare, setAutoShare] = useState(true);
   const [dataRetention, setDataRetention] = useState('90');
   const [liveUpdates, setLiveUpdates] = useState(true);
   const [selectedStrategy, setSelectedStrategy] = useState('');
   const [networkStats, setNetworkStats] = useState<any>(null);

   useEffect(() => {
      const loadSettings = async () => {
         try {
            const saved = await getDashboardSetting('platform-settings');
            const val = saved.value;
            if (val.orgName) setOrgName(val.orgName);
            if (val.orgRegion) setOrgRegion(val.orgRegion);
            if (val.alertThreshold) setAlertThreshold(val.alertThreshold);
            if (val.rootCauseDepth) setRootCauseDepth(val.rootCauseDepth);
            if (val.privacyLevel) setPrivacyLevel(val.privacyLevel);
            if (val.autoShare !== undefined) setAutoShare(val.autoShare);
            if (val.dataRetention) setDataRetention(val.dataRetention);
            if (val.liveUpdates !== undefined) setLiveUpdates(val.liveUpdates);
            setSelectedStrategy(val.selectedStrategy || searchParams.get('strategy') || '');
            setSaveMessage(val.savedAt ? `Last saved at ${val.savedAt}` : '');
         } catch {
            setSelectedStrategy(searchParams.get('strategy') || '');
         }
      };

      const loadStats = async () => {
         try {
            const overview = await getOverview();
            setNetworkStats(overview);
         } catch { /* ignore */ }
      };

      loadSettings();
      loadStats();
   }, [searchParams]);

   const saveConfiguration = async () => {
      const timestamp = new Date().toLocaleString();
      setSaving(true);
      try {
         await upsertDashboardSetting('platform-settings', {
            savedAt: timestamp,
            selectedStrategy,
            orgName,
            orgRegion,
            alertThreshold,
            rootCauseDepth,
            privacyLevel,
            autoShare,
            dataRetention,
            liveUpdates,
            source: 'settings-page',
         });
         setSaveMessage(`Saved at ${timestamp}`);
      } catch (error) {
         console.error('Failed to save settings:', error);
         setSaveMessage('Save failed');
      } finally {
         setSaving(false);
      }
   };

   const tabs: Array<{ key: TabKey; icon: React.ReactElement; label: string }> = [
      { key: 'profile', icon: <User />, label: 'Organization profile' },
      { key: 'alerts', icon: <Bell />, label: 'Alert thresholds' },
      { key: 'sharing', icon: <Shield />, label: 'Secure sharing' },
      { key: 'data', icon: <Database />, label: 'Data streams' },
   ];

   return (
      <div className="max-w-5xl mx-auto space-y-10">
         <div className="flex justify-between items-end">
            <div>
               <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Platform Settings</h2>
               <p className="text-white/40 font-medium">Manage controls, data sources, and configuration options.</p>
            </div>
            <button
               onClick={saveConfiguration}
               disabled={saving}
               className="px-8 py-3 bg-primary text-white rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all text-xs uppercase tracking-widest glow-shadow-primary disabled:opacity-60"
            >
               {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
               {saving ? 'Saving...' : 'Save Settings'}
            </button>
         </div>

         {saveMessage && (
            <div className="flex items-center gap-2 text-xs text-accent font-bold">
               <CheckCircle2 size={14} /> {saveMessage}
            </div>
         )}

         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar Tabs */}
            <div className="space-y-2">
               {tabs.map(tab => (
                  <button
                     key={tab.key}
                     onClick={() => setActiveTab(tab.key)}
                     className={cn(
                        'w-full flex items-center gap-4 px-6 py-4 rounded-xl font-bold cursor-pointer transition-all text-left',
                        activeTab === tab.key ? 'bg-white text-background glow-shadow-primary' : 'text-white/40 hover:text-white hover:bg-white/5'
                     )}
                  >
                     {React.cloneElement(tab.icon as React.ReactElement<any>, { size: 20 })}
                     <span className="text-xs tracking-[0.08em]">{tab.label}</span>
                  </button>
               ))}

               {/* Network Status */}
               {networkStats && (
                  <div className="mt-6 p-6 glass-morphism rounded-3xl border border-white/5 space-y-4">
                     <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest">Network Status</h4>
                     <div className="space-y-3">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-bold text-white/40 uppercase">Trust Avg</span>
                           <span className="text-sm font-black text-accent">{networkStats.trust_avg}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-bold text-white/40 uppercase">Active Alerts</span>
                           <span className="text-sm font-black text-danger">{networkStats.anomaly_count}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-bold text-white/40 uppercase">Shipments</span>
                           <span className="text-sm font-black text-primary">{networkStats.active_shipments}</span>
                        </div>
                     </div>
                  </div>
               )}
            </div>

            {/* Tab Content */}
            <div className="md:col-span-3 space-y-8">
               {/* Organization Profile Tab */}
               {activeTab === 'profile' && (
                  <section className="glass-morphism p-8 rounded-3xl border border-white/5 space-y-6">
                     <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <Globe className="text-primary" size={24} /> Organization Profile
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block">Organization Name</label>
                           <input value={orgName} onChange={e => setOrgName(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-primary/40 transition-all font-medium" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block">Primary Region</label>
                           <select value={orgRegion} onChange={e => setOrgRegion(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-primary/40 transition-all font-medium">
                              <option value="Global">Global</option>
                              <option value="North America">North America</option>
                              <option value="Europe">Europe</option>
                              <option value="Asia">Asia</option>
                              <option value="South America">South America</option>
                           </select>
                        </div>
                     </div>
                     <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-4">
                        <Zap size={20} className="text-primary" />
                        <p className="text-xs text-white/60 italic">Organization settings affect how partners see your node across the trust network.</p>
                     </div>
                  </section>
               )}

               {/* Alert Thresholds Tab */}
               {activeTab === 'alerts' && (
                  <section className="glass-morphism p-8 rounded-3xl border border-white/5 space-y-6">
                     <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <BarChart3 className="text-warning" size={24} /> Alert Configuration
                     </h3>
                     <div className="space-y-8">
                        <div className="space-y-3">
                           <div className="flex justify-between items-center">
                              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Alert Confidence Threshold</label>
                              <span className="text-sm font-black text-white">{alertThreshold}%</span>
                           </div>
                           <input type="range" min={50} max={100} value={alertThreshold} onChange={e => setAlertThreshold(parseInt(e.target.value))} className="w-full accent-warning" />
                           <p className="text-[10px] text-white/30 italic">Alerts below this confidence level will not trigger notifications.</p>
                        </div>
                        <div className="space-y-3">
                           <div className="flex justify-between items-center">
                              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Root-Cause Analysis Depth</label>
                              <span className="text-sm font-black text-white">Level {rootCauseDepth}</span>
                           </div>
                           <input type="range" min={1} max={8} value={rootCauseDepth} onChange={e => setRootCauseDepth(parseInt(e.target.value))} className="w-full accent-primary" />
                           <p className="text-[10px] text-white/30 italic">Higher depth increases analysis quality but takes longer.</p>
                        </div>
                     </div>
                  </section>
               )}

               {/* Secure Sharing Tab */}
               {activeTab === 'sharing' && (
                  <section className="glass-morphism p-8 rounded-3xl border border-white/5 space-y-6">
                     <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <Lock className="text-secondary" size={24} /> Secure Sharing Policy
                     </h3>
                     <div className="space-y-6">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block">Privacy Level</label>
                           <div className="grid grid-cols-3 gap-4">
                              {(['low', 'medium', 'high'] as const).map(level => (
                                 <button
                                    key={level}
                                    onClick={() => setPrivacyLevel(level)}
                                    className={cn(
                                       "py-3 rounded-xl border text-xs font-black uppercase tracking-widest transition-all",
                                       privacyLevel === level
                                          ? "bg-secondary border-secondary text-white glow-shadow-secondary"
                                          : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                                    )}
                                 >
                                    {level}
                                 </button>
                              ))}
                           </div>
                           <p className="text-[10px] text-white/30 italic">
                              {privacyLevel === 'high' ? 'Maximum anonymization — only aggregate patterns are shared.' :
                               privacyLevel === 'medium' ? 'Partial anonymization — risk types and regions visible.' :
                               'Minimal anonymization — full details shared with trusted partners.'}
                           </p>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                           <div>
                              <span className="text-xs font-bold text-white block">Auto-Share Risk Patterns</span>
                              <span className="text-[10px] text-white/30">Automatically broadcast critical risks to the network</span>
                           </div>
                           <button
                              onClick={() => setAutoShare(!autoShare)}
                              className={cn(
                                 "w-12 h-6 rounded-full transition-all relative",
                                 autoShare ? "bg-secondary" : "bg-white/10"
                              )}
                           >
                              <div className={cn(
                                 "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all",
                                 autoShare ? "left-[26px]" : "left-0.5"
                              )} />
                           </button>
                        </div>
                     </div>
                  </section>
               )}

               {/* Data Streams Tab */}
               {activeTab === 'data' && (
                  <section className="glass-morphism p-8 rounded-3xl border border-white/5 space-y-6">
                     <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <Database className="text-accent" size={24} /> Data Stream Configuration
                     </h3>
                     <div className="space-y-6">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block">Data Retention Period</label>
                           <select value={dataRetention} onChange={e => setDataRetention(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-primary/40 transition-all font-medium">
                              <option value="30">30 Days</option>
                              <option value="60">60 Days</option>
                              <option value="90">90 Days</option>
                              <option value="180">180 Days</option>
                              <option value="365">1 Year</option>
                           </select>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                           <div>
                              <span className="text-xs font-bold text-white block">Live WebSocket Updates</span>
                              <span className="text-[10px] text-white/30">Receive real-time telemetry and intelligence signals</span>
                           </div>
                           <button
                              onClick={() => setLiveUpdates(!liveUpdates)}
                              className={cn(
                                 "w-12 h-6 rounded-full transition-all relative",
                                 liveUpdates ? "bg-accent" : "bg-white/10"
                              )}
                           >
                              <div className={cn(
                                 "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all",
                                 liveUpdates ? "left-[26px]" : "left-0.5"
                              )} />
                           </button>
                        </div>
                     </div>
                  </section>
               )}

               {/* Demo Control Center — always visible below active tab */}
               <section className="glass-morphism p-8 rounded-3xl border border-white/5 space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                     <PlayCircle className="text-accent" /> Demo Control Center
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
            </div>
         </div>
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
