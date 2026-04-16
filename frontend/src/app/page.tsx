'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Brain, Eye, Cpu, Network, Zap, ArrowRight, Activity, Globe, Lock, Target, Ghost, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden neo-grid">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-morphism border-b border-white/5 py-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center glow-shadow-primary">
            <Network className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Real Weave Easy</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-white/60 font-medium">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#vision" className="hover:text-primary transition-colors">Vision</a>
          <a href="#modules" className="hover:text-primary transition-colors">Modules</a>
          <Link href="/login" className="hover:text-primary transition-colors">Login</Link>
          <Link href="/register" className="hover:text-primary transition-colors">Register</Link>
        </div>
        <button
          onClick={() => router.push(isAuthenticated() ? '/dashboard' : '/login')}
          className="px-6 py-2 bg-primary hover:bg-primary/80 text-white rounded-full font-semibold transition-all glow-shadow-primary flex items-center gap-2"
        >
          Enter Platform <ArrowRight size={18} />
        </button>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-8 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-morphism border border-primary/20 text-primary text-sm font-bold tracking-wider mb-6">
              <Zap size={14} className="animate-pulse" /> SIMPLE SMART SUPPLY CHAIN
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tight text-white leading-[1.2]">
              A Supply Chain <br />
              <span className="inline-block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent italic px-10 py-4 -mx-10">
                That Remembers and Predicts
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-12 font-medium">
              Track goods in real time, detect unusual events, see full product history, and predict future risks. Built to be easy for every user.
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <button
                onClick={() => router.push(isAuthenticated() ? '/dashboard' : '/login')}
                className="px-10 py-4 bg-white text-background rounded-xl font-bold text-lg hover:scale-105 transition-all"
              >
                Open Live Dashboard
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-4 glass-morphism border border-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
              >
                Explore Features
              </button>
            </div>
          </motion.div>

        {/* Floating Intelligence Cards */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <IntelligenceCard 
            icon={<Brain className="text-primary" />}
            title="Reality Check"
            description="Finds impossible shipment activity, like unusual travel speed, and flags it quickly."
          />
          <IntelligenceCard 
            icon={<Shield className="text-accent" />}
            title="Product Journey"
            description="Stores complete product history from source to delivery, including handling and location updates."
          />
          <IntelligenceCard 
            icon={<Cpu className="text-secondary" />}
            title="Future Risk Simulator"
            description="Runs what-if scenarios so you can prepare early for delays and disruptions."
          />
          <IntelligenceCard 
            icon={<Target className="text-warning" />}
            title="Action Planner"
            description="Suggests practical next steps when risks are detected in the supply chain."
          />
        </div>
      </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-20 px-8 relative">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
                Beyond Basic Tracking. <br />
                <span className="text-primary">Clear Insights You Can Act On.</span>
              </h2>
              <p className="text-lg text-white/50 mb-8 leading-relaxed">
                Most systems only show data. Real Weave Easy explains what happened, why it happened, and what may happen next so teams can respond faster.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FeatureItem icon={<Activity />} text="Reality Check" />
                <FeatureItem icon={<Globe />} text="Partner Trust Map" />
                <FeatureItem icon={<Lock />} text="Secure Risk Sharing" />
                <FeatureItem icon={<Eye />} text="Root Cause Finder" />
                <FeatureItem icon={<Ghost />} text="Inventory Mismatch Checker" />
                <FeatureItem icon={<ShieldCheck />} text="Partner Scorecard" />
              </div>
            </div>
            <div className="flex-1 w-full aspect-square relative">
               <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse-slow" />
               <div className="absolute inset-8 border border-primary/20 rounded-full border-dashed animate-spin [animation-duration:30s]" />
               <div className="absolute inset-20 border border-secondary/20 rounded-full border-dashed animate-spin [animation-duration:20s] direction-reverse" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <Network className="w-32 h-32 text-primary glow-shadow-primary opacity-50" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-20 border-t border-white/5 bg-background/50 relative z-10 text-center">
        <h3 className="text-3xl font-bold text-white mb-4">Ready to simplify your supply chain?</h3>
        <p className="text-white/40 mb-10">Start using clear, real-time insights your whole team can understand.</p>
        <div className="flex gap-4 justify-center">
          <span className="text-white/20 text-sm">Real Weave Easy v1.0.0</span>
          <span className="text-white/20 text-sm">© 2026 Deep Intelligence Labs</span>
        </div>
      </footer>
    </div>
  );
}

function IntelligenceCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="glass-morphism p-8 rounded-2xl border border-white/10 flex flex-col items-start gap-4 h-full relative group"
    >
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-white/40 text-sm leading-relaxed">{description}</p>
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-4 text-white/70">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
      </div>
      <span className="font-semibold text-lg">{text}</span>
    </div>
  );
}
