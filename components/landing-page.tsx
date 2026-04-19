'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Calendar, FileText, Bot, Shield, Zap, ArrowRight, LayoutDashboard } from 'lucide-react'
import LoginButton from './login-button'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

const features = [
  {
    title: 'Gmail Agent',
    description: 'Autonomous drafting, smart summarizing, and inbox triage that learns your style.',
    icon: <Mail className="w-6 h-6 text-blue-400" />,
  },
  {
    title: 'Calendar Sync',
    description: 'Dynamic scheduling that resolves conflicts and prepares meeting context automatically.',
    icon: <Calendar className="w-6 h-6 text-purple-400" />,
  },
  {
    title: 'Drive Insights',
    description: 'Instant searching and content synthesis across all your documents and files.',
    icon: <FileText className="w-6 h-6 text-emerald-400" />,
  },
]

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [supabase.auth])

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-x-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[60%] h-[60%] rounded-full bg-purple-600/5 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-md border-b border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 transition-transform hover:scale-105 active:scale-95 cursor-pointer">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-tr from-blue-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-2xl shadow-blue-500/40">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-black tracking-tighter">AGENT_ME</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-4 sm:pl-4 sm:border-l border-white/10">
                <Link 
                  href="/dashboard"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium transition-all"
                >
                  <LayoutDashboard size={14} />
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 sm:gap-3 bg-zinc-900/50 p-1 sm:pr-4 rounded-full border border-white/5">
                  {(user.user_metadata?.avatar_url) ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10">
                      <Image 
                        src={user.user_metadata.avatar_url} 
                        alt="Profile" 
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">Active User</p>
                    <p className="text-xs font-semibold text-zinc-200 truncate max-w-[100px]">{user.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 sm:pt-24 pb-20 sm:pb-32">
        <div className="flex flex-col items-center text-center space-y-8 sm:space-y-12 max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] sm:text-xs font-bold text-blue-400 uppercase tracking-widest shadow-2xl shadow-blue-500/5"
          >
            <Zap size={14} className="fill-blue-400" />
            <span>Next-Gen Workspace Intelligence</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl xs:text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[1.1] sm:leading-[0.95] text-white"
          >
            Your Workspace, <br className="hidden xs:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-purple-400 to-indigo-500 animate-gradient-x">Autonomous.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-xl text-zinc-400 leading-relaxed max-w-2xl font-medium px-4"
          >
            Experience the future of productivity. AGENT_ME orchestrates your Gmail, Calendar, and Docs with a powerful, personalized AI logic that works while you sleep.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4 sm:pt-8 w-full sm:w-auto"
          >
            {user ? (
              <Link 
                href="/dashboard"
                className="group flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black bg-white text-black hover:bg-zinc-200 transition-all shadow-2xl shadow-white/10 hover:scale-[1.02] active:scale-95 text-sm sm:text-base"
              >
                Go to Dashboard
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <LoginButton />
            )}
            <button className="flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold border border-white/10 bg-white/5 hover:bg-white/10 transition-all backdrop-blur-sm group text-sm sm:text-base">
              Watch Demo
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center ml-2 border border-blue-500/20 group-hover:bg-blue-500/40 transition-colors">
                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-blue-400 border-b-[5px] border-b-transparent ml-1" />
              </div>
            </button>
          </motion.div>
        </div>

        {/* Feature Teaser Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="mt-20 sm:mt-32 relative group"
        >
          <div className="absolute inset-0 bg-linear-to-b from-blue-600/20 to-transparent blur-[60px] sm:blur-[100px] opacity-20 -z-10 group-hover:opacity-40 transition-opacity duration-1000" />
          <div className="relative rounded-2xl sm:rounded-[2.5rem] overflow-hidden border border-white/10 bg-zinc-900/30 backdrop-blur-2xl p-2 sm:p-4 shadow-[0_0_80px_-20px_rgba(59,130,246,0.2)]">
            <div className="rounded-xl sm:rounded-3xl overflow-hidden relative aspect-video">
              <Image 
                src="/ai_agent_workspace_hero_1776600813643.png" 
                alt="AI Workspace Interface" 
                fill
                className="object-cover shadow-2xl transition-transform duration-1000 group-hover:scale-[1.02]"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#050505]/80 via-transparent to-transparent" />
            </div>
            
            {/* Floating Context Card */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-12 right-12 p-8 rounded-3xl bg-zinc-900/90 border border-white/10 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] hidden lg:block max-w-xs"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <Shield size={28} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg leading-tight">Secure AI</p>
                  <p className="text-zinc-500 text-sm mt-1">Enterprise-grade security for your private data.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Features Integration */}
        <section className="pt-32 sm:pt-60 grid md:grid-cols-3 gap-8 sm:gap-12 text-left">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative p-8 sm:p-10 rounded-2xl sm:rounded-[3rem] bg-zinc-900/20 border border-white/5 hover:border-blue-500/20 transition-all group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -z-10 group-hover:bg-blue-600/10 transition-colors" />
              <div className="mb-6 sm:mb-8 p-4 rounded-xl sm:rounded-2xl bg-zinc-900 w-fit group-hover:rotate-12 transition-transform shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-3 sm:mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-sm sm:text-base text-zinc-500 leading-relaxed font-medium">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </section>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 sm:py-20 mt-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 text-zinc-500 text-left">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-black tracking-tighter text-lg">AGENT_ME</span>
            </div>
            <p className="max-w-xs font-medium text-xs sm:text-sm">Empowering humans with autonomous workspace intelligence. Built for the era of smart work.</p>
            <p className="text-[10px] sm:text-xs">© 2026 AGENT_ME. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-4 md:justify-end text-[10px] sm:text-xs font-bold uppercase tracking-widest items-center">
            <Link href="#" className="hover:text-blue-400 transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-blue-400 transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-blue-400 transition-colors">Discord</Link>
            <Link href="#" className="hover:text-blue-400 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
