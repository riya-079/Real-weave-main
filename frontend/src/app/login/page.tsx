'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail, Network } from 'lucide-react';
import { loginUser, isAuthenticated } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@realweave.local');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [nextPath, setNextPath] = useState('/dashboard');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextPath(params.get('next') || '/dashboard');

    if (isAuthenticated()) {
      router.replace(params.get('next') || '/dashboard');
    }
  }, [router]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      loginUser(email, password);
      router.replace(nextPath);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Unable to sign in.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background neo-grid flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-secondary/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-md glass-morphism rounded-3xl border border-white/10 p-8 md:p-10 relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center glow-shadow-primary">
            <Network className="text-white" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40 font-bold">Real Weave</p>
            <h1 className="text-2xl font-black text-white">Sign in</h1>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-widest text-white/40 font-bold">Email</span>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
              <Mail size={18} className="text-white/30" />
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                className="w-full bg-transparent outline-none text-white placeholder:text-white/20"
                placeholder="you@example.com"
                required
              />
            </div>
          </label>

          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-widest text-white/40 font-bold">Password</span>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
              <Lock size={18} className="text-white/30" />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                className="w-full bg-transparent outline-none text-white placeholder:text-white/20"
                placeholder="Password"
                required
              />
            </div>
          </label>

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary/80 disabled:opacity-60 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            {loading ? 'Signing in...' : 'Enter Platform'}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="mt-6 text-sm text-white/40 text-center">
          No account yet? <Link href="/register" className="text-primary font-bold">Create one</Link>
        </p>

        <p className="mt-4 text-[10px] text-white/25 text-center uppercase tracking-[0.2em]">
          Demo access: demo@realweave.local / demo1234
        </p>
      </div>
    </div>
  );
}
