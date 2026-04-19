'use client'

import { Menu } from 'lucide-react'

export default function SidebarTrigger() {
  const toggleSidebar = () => {
    window.dispatchEvent(new CustomEvent('toggle-sidebar'))
  }

  return (
    <button 
      onClick={toggleSidebar}
      className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
      aria-label="Toggle Menu"
    >
      <Menu size={24} />
    </button>
  )
}
