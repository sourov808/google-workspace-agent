'use client'

import { useState, useEffect } from 'react'
import { Bot, LogOut, MessageSquare, PlusCircle, Trash2, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface Conversation {
  id: string
  title: string | null
  created_at: string
}

interface DashboardSidebarProps {
  conversations: Conversation[]
  conversationId?: string
  userEmail?: string
  groupedConversations: Record<string, Conversation[]>
}

export default function DashboardSidebar({ 
  conversations, 
  conversationId, 
  userEmail,
  groupedConversations 
}: DashboardSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Listen for custom event to open/close sidebar from header
  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev)
    window.addEventListener('toggle-sidebar', handleToggle)
    return () => window.removeEventListener('toggle-sidebar', handleToggle)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    const { error } = await supabase.from('conversations').delete().eq('id', id)
    if (!error) {
      if (conversationId === id) router.push('/dashboard')
      else router.refresh()
    }
  }

  const handleNewChat = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('conversations').insert({ user_id: user.id }).select().single()
      if (data) {
        setIsOpen(false)
        router.push(`/dashboard?id=${data.id}`)
      }
    }
  }

  return (
    <>
      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 lg:hidden animate-in fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-70 w-80 max-w-[85vw] bg-[#050505] border-r border-zinc-900 flex flex-col p-6 gap-6 transition-transform duration-300 ease-in-out
        lg:sticky lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 px-2 text-white hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-linear-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Bot size={18} className="text-white" />
            </div>
            <span className="font-bold tracking-tight text-white">AGENT_ME</span>
          </Link>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-zinc-500 hover:text-white p-2">
            <X size={20} />
          </button>
        </div>

        <div className="px-2">
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-sm font-medium transition-all group active:scale-95"
          >
            <PlusCircle size={16} className="text-blue-500" />
            New Chat
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-6 overflow-y-auto px-1 custom-scrollbar">
          {Object.entries(groupedConversations).map(([group, convs]) => (
            convs.length > 0 && (
              <div key={group} className="flex flex-col gap-1">
                <div className="px-3 text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-2">{group}</div>
                {convs.map((conv) => (
                  <div key={conv.id} className="group relative">
                    <Link 
                      href={`/dashboard?id=${conv.id}`}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all pr-10 ${
                        conversationId === conv.id 
                          ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm' 
                          : 'text-zinc-500 hover:bg-zinc-900 hover:text-white border border-transparent'
                      }`}
                    >
                      <MessageSquare size={16} className={conversationId === conv.id ? 'text-blue-500' : 'text-zinc-600'} />
                      <span className="truncate">{conv.title || 'Untitled Chat'}</span>
                    </Link>
                    
                    <button 
                      onClick={(e) => handleDelete(e, conv.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 lg:opacity-0 group-hover:opacity-100 p-1.5 text-zinc-600 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )
          ))}
          
          {(!conversations || conversations.length === 0) && (
            <div className="px-3 py-10 text-center">
              <p className="text-xs text-zinc-600 italic">No conversations found.</p>
            </div>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-900/50">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-xs font-bold uppercase border border-zinc-800 text-zinc-300">
              {userEmail?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-zinc-200">{userEmail}</p>
              <p className="text-[10px] text-blue-500 font-bold tracking-widest uppercase">Member</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm group"
          >
            <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
