"use client"

import { Bell, MessageSquare, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-purple-500/30 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="h-10 w-10 text-green-400 hover:text-green-300 md:h-8 md:w-8 md:text-purple-300 md:hover:text-purple-100" />
        <h1 className="text-2xl font-bold text-green-400 hidden md:block">The Push Collective</h1>
        <div className="hidden lg:flex">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-[200px] bg-purple-900/20 pl-8 text-white placeholder:text-purple-300 focus-visible:ring-purple-500 lg:w-[280px]"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-purple-300 hover:bg-purple-900/50 hover:text-purple-100"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-black">
            3
          </span>
        </Button>

        <Button variant="ghost" size="icon" className="text-purple-300 hover:bg-purple-900/50 hover:text-purple-100">
          <MessageSquare className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full bg-purple-900/50">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback className="bg-purple-700 text-white">MS</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 border-purple-500/30 bg-purple-950 text-white" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Music Stakeholder</p>
                <p className="text-xs leading-none text-purple-300">music@example.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-purple-700/50" />
            <DropdownMenuItem className="hover:bg-purple-800">Profile</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-purple-800">Token Balance</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-purple-800">Settings</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-purple-700/50" />
            <DropdownMenuItem className="hover:bg-purple-800">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
