"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import AgentStatusPanel from "@/components/agent-status-panel"
import ActivityFeed from "@/components/activity-feed"
import GovernancePanel from "@/components/governance-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <h1 className="text-2xl font-bold text-green-400 mb-4 md:hidden">The Push Collective</h1>
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-2 bg-purple-900/20">
                <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="governance" className="data-[state=active]:bg-purple-600">
                  Governance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <AgentStatusPanel />
                  <ActivityFeed />
                </div>
              </TabsContent>

              <TabsContent value="governance" className="space-y-6">
                <GovernancePanel limit={3} />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
