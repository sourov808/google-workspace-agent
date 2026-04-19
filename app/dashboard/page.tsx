import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Bot, Menu } from 'lucide-react'
import AgentInterface from '@/components/agent-interface'
import DashboardSidebar from '@/components/dashboard-sidebar'
import SidebarTrigger from '@/components/sidebar-trigger'

interface Conversation {
  id: string
  title: string | null
  created_at: string
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id: conversationId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Fetch Conversations
  const { data: conversations } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Grouping logic for history
  const groupedConversations: Record<string, Conversation[]> = {
    'Today': [],
    'Yesterday': [],
    'Earlier': []
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const typedConversations = (conversations || []) as Conversation[]

  typedConversations.forEach(conv => {
    const convDate = new Date(conv.created_at)
    if (convDate >= today) {
      groupedConversations['Today'].push(conv)
    } else if (convDate >= yesterday) {
      groupedConversations['Yesterday'].push(conv)
    } else {
      groupedConversations['Earlier'].push(conv)
    }
  })

  return (
    <div className="min-h-screen bg-[#050505] text-white flex h-screen overflow-hidden">
      {/* Sidebar Component */}
      <DashboardSidebar 
        conversations={typedConversations} 
        conversationId={conversationId}
        userEmail={user.email}
        groupedConversations={groupedConversations}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 shrink-0 border-b border-zinc-900/50 flex items-center justify-between px-4 sm:px-8 bg-zinc-950/20 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
             <SidebarTrigger />
             <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-bold text-blue-400 uppercase tracking-widest hidden xs:block">
               v2.0 Beta
             </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-[10px] sm:text-xs font-medium text-zinc-600">Secure connection via <span className="text-zinc-400">Google Auth</span></div>
          </div>
        </header>

        <div className="flex-1 min-h-0 bg-[radial-gradient(circle_at_50%_0%,#1a1a2e_0%,#050505_100%)] overflow-hidden">
          <div className="h-full">
            {conversationId ? (
              <AgentInterface conversationId={conversationId} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-sm mx-auto">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-linear-to-tr from-blue-600/20 to-purple-600/20 rounded-3xl flex items-center justify-center mb-6 lg:mb-8 border border-white/5 shadow-2xl overflow-visible">
                  <Bot size={32} className="text-blue-500 lg:size-[40px]" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-black mb-3 lg:mb-4 tracking-tighter text-white">AGENT_ME</h1>
                <p className="text-zinc-500 mb-6 lg:mb-8 leading-relaxed text-sm font-medium">
                  Your personal workspace assistant is ready. Select a past conversation or start a new one to begin.
                </p>
                <div className="w-full text-center">
                    <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">
                        Start a chat from the sidebar
                    </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
