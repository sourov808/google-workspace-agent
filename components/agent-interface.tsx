'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useChat } from 'ai/react'
import { Send, Bot, User, Trash2, RefreshCw, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system' | 'data'
  content: string
}

interface SupabaseMessage {
  id: string
  role: string
  content: string
}

export default function AgentInterface({ conversationId }: { conversationId: string }) {
  const [initialMessages, setInitialMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading, reload } = useChat({
    api: '/api/chat',
    body: { conversationId },
    initialMessages,
    onError: (err) => {
        setError(err.message || "Something went wrong while chatting.")
    }
  })

  // 1. Load History on Mount
  useEffect(() => {
    async function loadHistory() {
      if (!conversationId) return
      setLoading(true)
      setError(null)
      try {
        const { data, error: fetchError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })

        if (fetchError) throw fetchError
        if (data) {
          const formattedMessages: Message[] = data.map((m: SupabaseMessage) => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }))
          setInitialMessages(formattedMessages)
          setMessages(formattedMessages)
        }
      } catch (err: unknown) {
        console.error('Error loading history:', err)
        setError("Failed to load conversation history.")
      } finally {
        setLoading(false)
      }
    }
    loadHistory()
  }, [conversationId, setMessages, supabase])

  // 2. Auto Scroll to Bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const clearMessages = async () => {
    if (!conversationId) return
    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId)
    
    if (!deleteError) {
      setMessages([])
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
            <Bot className="w-12 h-12 text-blue-500 animate-bounce" />
            <p className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase">Deciphering Workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full">
      {/* Error Banner */}
      {error && (
        <div className="mx-4 mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
                <div className="bg-red-500 rounded-full p-1">
                    <X size={12} className="text-white" />
                </div>
                <p className="text-sm text-red-400 font-medium">{error}</p>
            </div>
            <button 
                onClick={() => { setError(null); reload(); }}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs font-bold text-red-400 transition-all"
            >
                <RefreshCw className="w-3 h-3" />
                Retry
            </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-20">
            <Bot size={60} />
            <p className="mt-4 font-bold tracking-widest uppercase text-sm">Secure Terminal Initialized</p>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              m.role === 'user' 
                ? 'bg-zinc-800' 
                : 'bg-linear-to-tr from-blue-600 to-purple-600'
            }`}>
              {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-white" />}
            </div>
            <div className={`max-w-[85%] p-5 rounded-[2rem] text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-zinc-900 border border-zinc-800 rounded-tr-sm' 
                : 'bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-tl-sm'
            }`}>
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length-1]?.role === 'user' && (
           <div className="flex gap-4">
             <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-linear-to-tr from-blue-600 to-purple-600 animate-pulse">
                <Bot className="w-5 h-5 text-white" />
             </div>
             <div className="bg-zinc-900/40 rounded-[2rem] p-5 rounded-tl-sm border border-white/5">
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce delay-200" />
                </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-transparent">
        <form
          onSubmit={(e) => {
              handleSubmit(e)
          }}
          className="relative group transition-all"
        >
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your command..."
            className="w-full bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 focus:border-blue-500/50 rounded-[2.5rem] py-5 px-8 outline-hidden transition-all text-sm placeholder:text-zinc-600 shadow-2xl"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
                type="button"
                onClick={clearMessages}
                className="p-3 text-zinc-600 hover:text-red-500 transition-colors"
                title="Clear Chat"
            >
                <Trash2 className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 bg-blue-600 disabled:bg-zinc-800 text-white rounded-2xl hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-600/20"
            >
              <Send className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </form>
        <p className="text-[10px] text-zinc-600 mt-4 text-center font-bold tracking-widest uppercase opacity-40">
            Powered by GPT-4o-mini & Google Workspace
        </p>
      </div>
    </div>
  )
}
