"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Music, Users, BarChart3, Vote, Layers, Youtube, Twitter, Instagram, Disc3, History, Code, UserCircle, Wand2 } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar"

export default function DashboardSidebar() {
  const pathname = usePathname()

  const menuItems = [
    { href: '/', icon: <Layers />, label: 'Dashboard' },
    { href: '/logs', icon: <History />, label: 'Logs' },
    { href: '/music', icon: <Music />, label: 'Music Content' },
    { href: '/remix', icon: <Wand2 />, label: 'Remix Studio' },
    { href: '/agents', icon: <Users />, label: 'Agents' },
    { href: '/characters', icon: <UserCircle />, label: 'Characters' },
    { href: '/analytics', icon: <BarChart3 />, label: 'Analytics' },
    { href: '/governance', icon: <Vote />, label: 'Governance' },
    { href: '/live-code', icon: <Code />, label: 'Live Code' },
  ]

  return (
    <Sidebar className="border-r border-purple-500/30 bg-purple-950">
      <SidebarHeader className="flex items-center justify-center py-6">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <Disc3 className="h-8 w-8 text-green-400" />
            <span className="text-2xl font-bold text-green-400">MARVIN</span>
          </div>
          <span className="text-xs text-purple-300">The Push Collective</span>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} className="w-full">
                <SidebarMenuButton 
                  className="text-white hover:bg-purple-800 w-full"
                  isActive={pathname === item.href}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-4">
        <div className="flex justify-center space-x-4">
          <a href="#" className="text-purple-300 hover:text-green-400">
            <Youtube className="h-5 w-5" />
          </a>
          <a href="#" className="text-purple-300 hover:text-green-400">
            <Twitter className="h-5 w-5" />
          </a>
          <a href="#" className="text-purple-300 hover:text-green-400">
            <Instagram className="h-5 w-5" />
          </a>
        </div>
        <div className="mt-4 text-center text-xs text-purple-300">Marvin Crew Orchestrator v1.0</div>
      </SidebarFooter>
    </Sidebar>
  )
}
