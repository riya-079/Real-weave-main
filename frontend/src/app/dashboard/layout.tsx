'use client';

import React, { useEffect, useState } from 'react';
import { Network, LayoutDashboard, AlertCircle, Box, Zap, Share2, Ghost, Search, ShieldCheck, Settings as SettingsIcon, LogOut, Target } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getCurrentUser, isAuthenticated, signOutUser } from '@/lib/auth';

const navItems = [
  { icon: LayoutDashboard, label: 'Intelligence', href: '/dashboard' },
  { icon: AlertCircle, label: 'Impossible Events', href: '/dashboard/impossible' },
  { icon: Box, label: 'Memory Capsules', href: '/dashboard/memory' },
  { icon: Zap, label: 'Future Dreaming', href: '/dashboard/dreaming' },
  { icon: Share2, label: 'Whisper Network', href: '/dashboard/whisper' },
  { icon: Ghost, label: 'Ghost Forensics', href: '/dashboard/ghost' },
  { icon: Search, label: 'Causality Explorer', href: '/dashboard/causality' },
  { icon: ShieldCheck, label: 'Trust DNA', href: '/dashboard/trust' },
  { icon: Network, label: 'Digital Twin', href: '/dashboard/digital-twin' },
  { icon: Target, label: 'Negotiation Center', href: '/dashboard/negotiation' },
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
      <div className="min-h-screen bg-background flex items-center justify-center text-white/40">
        Loading secure workspace...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-card-bg border-r border-white/5 flex flex-col glass-morphism z-20">
        <div className="p-8 pb-4">
          <Link href="/" className="flex items-center gap-2 mb-10 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center glow-shadow-primary group-hover:scale-105 transition-transform">
              <Network className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">REAL WEAVE</span>
          </Link>
          
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                  pathname === item.href 
                    ? "bg-primary/10 text-primary border border-primary/20 glow-shadow-primary" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="mt-auto p-8 border-t border-white/5 space-y-1">
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-white rounded-xl transition-all">
            <SettingsIcon size={20} /> Settings
          </Link>
          <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-white rounded-xl transition-all w-full text-left">
            <LogOut size={20} /> Sign out
          </button>
          <div className="p-4 glass-morphism rounded-xl border border-primary/10 mt-4">
             <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-bold text-accent uppercase tracking-widest">System Active</span>
             </div>
             <p className="text-[10px] text-white/30 font-mono">NODE-ETH-0X23...STABLE</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative neo-grid scroll-smooth">
         {/* Top Header */}
         <header className="sticky top-0 z-10 glass-morphism border-b border-white/5 px-10 py-4 flex justify-between items-center backdrop-blur-xl">
           <h2 className="text-lg font-bold text-white/80">
             {navItems.find(n => n.href === pathname)?.label || 'Intelligence Hub'}
           </h2>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 glass-morphism rounded-lg border border-white/5">
                <Search size={16} className="text-white/30" />
                <input type="text" placeholder="Search shipments, signals, causes..." className="bg-transparent border-none outline-none text-sm text-white w-64" />
              </div>
                <Link href="/dashboard/profile" className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent to-primary p-[1px]">
                 <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=transparent&color=fff`} alt="Profile" />
                 </div>
                </Link>
           </div>
         </header>
         
         <div className="p-10">
          {children}
         </div>
      </main>
    </div>
  );
}
