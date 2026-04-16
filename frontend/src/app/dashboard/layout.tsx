'use client';

import React, { useEffect, useState } from 'react';
import { Network, LayoutDashboard, AlertCircle, Box, Zap, Share2, Ghost, Search, ShieldCheck, Settings as SettingsIcon, LogOut, Target } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getCurrentUser, isAuthenticated, signOutUser } from '@/lib/auth';
import { useLiveRefresh } from '@/lib/useLiveRefresh';
import { motion, AnimatePresence } from 'framer-motion';
import IntelligenceTicker from '@/components/IntelligenceTicker';

const navItems = [
  { icon: LayoutDashboard, label: 'Live Dashboard', href: '/dashboard' },
  { icon: AlertCircle, label: 'Reality Check', href: '/dashboard/impossible' },
  { icon: Box, label: 'Product Journey', href: '/dashboard/memory' },
  { icon: Zap, label: 'Future Risk Simulator', href: '/dashboard/dreaming' },
  { icon: Share2, label: 'Secure Risk Sharing', href: '/dashboard/whisper' },
  { icon: Ghost, label: 'Inventory Mismatch Checker', href: '/dashboard/ghost' },
  { icon: Search, label: 'Root Cause Finder', href: '/dashboard/causality' },
  { icon: ShieldCheck, label: 'Partner Scorecard', href: '/dashboard/trust' },
  { icon: Network, label: 'Partner Trust Map', href: '/dashboard/digital-twin' },
  { icon: Target, label: 'Action Planner', href: '/dashboard/negotiation' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    setUserName(getCurrentUser()?.name || 'User');
    setReady(true);
  }, [pathname, router]);

  const handleSignOut = () => {
    signOutUser();
    router.replace('/login');
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white/40 font-mono tracking-widest uppercase text-xs">
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
            Authenticating Neural Link...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-card-bg border-r border-white/5 flex flex-col glass-morphism z-20">
        <div className="p-8 pb-4">
          <Link href="/" className="flex items-center gap-2 mb-10 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center glow-shadow-primary group-hover:scale-105 transition-transform">
              <Network className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Real Weave</span>
          </Link>
          
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm",
                  pathname === item.href 
                    ? "bg-primary/10 text-primary border border-primary/20 glow-shadow-primary" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="mt-auto p-8 border-t border-white/5 space-y-1">
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-white rounded-xl transition-all text-sm">
            <SettingsIcon size={18} /> Settings
          </Link>
          <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-white rounded-xl transition-all w-full text-left text-sm">
            <LogOut size={18} /> Sign out
          </button>
          
          <div className="p-4 glass-morphism rounded-xl border border-primary/10 mt-4">
             <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-black text-accent uppercase tracking-widest">System Online</span>
             </div>
             <p className="text-[10px] text-white/30 font-mono tracking-tighter">Live Secure Nodes: 1,421</p>
          </div>
        </div>
      </aside>

      {/* Primary Workspace */}
      <main className="flex-1 overflow-y-auto relative neo-grid scroll-smooth">
         {/* Adaptive Top Header */}
         <header className="sticky top-0 z-10 glass-morphism border-b border-white/5 px-10 py-5 flex justify-between items-center backdrop-blur-xl">
           <div className="flex flex-col">
              <h1 className="text-sm font-black text-white/40 uppercase tracking-[0.2em] mb-1">
                {pathname.split('/').pop()?.replace('-', ' ') || 'Overview'}
              </h1>
              <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">
                {navItems.find(n => n.href === pathname)?.label || 'Live Dashboard'}
              </h2>
           </div>
           
           <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 px-5 py-2.5 glass-morphism rounded-2xl border border-white/5 focus-within:border-primary/40 transition-all w-96">
                <Search size={16} className="text-white/30" />
                <input type="text" placeholder="Trace DNA, Shipments, Risks..." className="bg-transparent border-none outline-none text-xs text-white w-full" />
              </div>

              <div className="flex items-center gap-4">
                  <div className="text-right flex flex-col items-end">
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none">Access Level</span>
                      <span className="text-xs font-bold text-primary uppercase">Strategic Admin</span>
                  </div>
                  <Link href="/dashboard/profile" className="w-11 h-11 rounded-3xl bg-gradient-to-tr from-accent to-primary p-[1.5px] hover:scale-105 transition-transform duration-300">
                    <div className="w-full h-full rounded-3xl bg-background flex items-center justify-center overflow-hidden border-2 border-background">
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=transparent&color=fff`} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                  </Link>
              </div>
           </div>
         </header>

         {/* Intelligence Ticker Hook */}
         <IntelligenceTicker />

         {/* Page Viewport */}
         <div className="p-10">
            {children}
         </div>
         
         {/* Global Footer / Status */}
         <footer className="p-10 pt-20 flex justify-between items-center">
            <div className="text-[10px] font-mono text-white/10 uppercase tracking-widest">
                Real-Weave Autonomous Intelligence // v1.0.4-stable
            </div>
            <div className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            </div>
         </footer>
      </main>
    </div>
  );
}
