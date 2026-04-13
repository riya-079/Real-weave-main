'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogOut, Mail, ShieldCheck, User } from 'lucide-react';
import { getCurrentUser, isAuthenticated, signOutUser, type UserSession } from '@/lib/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login?next=/dashboard/profile');
      return;
    }

    setUser(getCurrentUser());
  }, [router]);

  const handleSignOut = () => {
    signOutUser();
    router.replace('/login');
  };

  if (!user) {
    return <div className="text-white/40">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      <div className="glass-morphism rounded-3xl border border-white/10 p-8 md:p-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary glow-shadow-primary">
              <User size={36} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40 font-bold">Profile</p>
              <h1 className="text-4xl font-black text-white">{user.name}</h1>
              <p className="text-white/40 mt-1 flex items-center gap-2">
                <Mail size={14} /> {user.email}
              </p>
            </div>
          </div>

          <button onClick={handleSignOut} className="px-5 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 font-bold flex items-center gap-2 transition-all">
            <LogOut size={18} /> Sign out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ProfileStat label="Access Level" value="Executive" />
          <ProfileStat label="Status" value="Active" />
          <ProfileStat label="Verified" value="Yes" />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-accent" /> Account Controls
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/settings" className="px-5 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm">
              Open settings
            </Link>
            <Link href="/dashboard" className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm">
              Return to intelligence hub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">{label}</p>
      <p className="text-2xl font-black text-white mt-2">{value}</p>
    </div>
  );
}
