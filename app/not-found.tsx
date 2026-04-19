'use client'

import Link from 'next/link'
import { Bot, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1a1a2e_0%,#050505_70%)] -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150 -z-10" />

      <div className="space-y-8 max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Animated Icon */}
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-linear-to-tr from-blue-600/20 to-purple-600/20 rounded-[2rem] flex items-center justify-center border border-white/5 shadow-2xl overflow-visible group">
             <Bot size={48} className="text-blue-500 group-hover:rotate-12 transition-transform duration-500" />
             <div className="absolute -top-2 -right-2 px-3 py-1 bg-red-500 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg shadow-red-500/20 animate-pulse">
                Lost
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl sm:text-7xl font-black tracking-tighter leading-tight">
             4<span className="text-blue-500">0</span>4
          </h1>
          <h2 className="text-2xl font-bold text-zinc-200 tracking-tight">Signal Lost in Workspace</h2>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto font-medium">
             The resource you are looking for has been moved, deleted, or never existed in this sector.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-black text-sm hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 active:scale-95 w-full sm:w-auto"
          >
            <Bot size={18} />
            Back to Agent
          </Link>
          <Link 
            href="/"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all active:scale-95 w-full sm:w-auto"
          >
            <Home size={18} />
            Go Home
          </Link>
        </div>

        <button 
           onClick={() => window.history.back()}
           className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-blue-400 uppercase tracking-widest transition-colors"
        >
           <ArrowLeft size={12} />
           Return to previous sector
        </button>
      </div>

      {/* Decorative Lines */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-linear-to-r from-transparent via-zinc-800 to-transparent opacity-20" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-linear-to-r from-transparent via-zinc-800 to-transparent opacity-20" />
    </div>
  )
}
