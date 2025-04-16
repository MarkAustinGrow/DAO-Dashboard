'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { Code } from "lucide-react";

// Map agent names directly to their no-background PNG avatars
const AGENT_AVATARS: { [key: string]: string } = {
  "Yona": "/Yona_Avatar-nobg.png",
  "Angus": "/Angus_Avatar-nobg.png"
};

interface LogEntry {
  id: number;
  timestamp: string;
  level: string;
  source: string;
  message: string;
  details: any;
}

export default function LiveCodePage() {
  const [yonaLogs, setYonaLogs] = useState<LogEntry[]>([]);
  const [angusLogs, setAngusLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState("yona");
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchLogs() {
      try {
        // Fetch Yona logs
        const { data: yonaData, error: yonaError } = await supabase
          .from('yona_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);

        if (yonaError) {
          throw yonaError;
        }

        // Fetch Angus logs
        const { data: angusData, error: angusError } = await supabase
          .from('angus_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);

        if (angusError) {
          throw angusError;
        }

        setYonaLogs(yonaData || []);
        setAngusLogs(angusData || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching logs:', error);
        setLoading(false);
      }
    }

    fetchLogs();

    // Set up real-time subscriptions
    const yonaChannel = supabase
      .channel('yona_logs_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'yona_logs' 
        }, 
        () => {
          // Refresh Yona logs when there's a new entry
          fetchYonaLogs();
        }
      )
      .subscribe();

    const angusChannel = supabase
      .channel('angus_logs_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'angus_logs' 
        }, 
        () => {
          // Refresh Angus logs when there's a new entry
          fetchAngusLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(yonaChannel);
      supabase.removeChannel(angusChannel);
    };
  }, [supabase]);

  async function fetchYonaLogs() {
    try {
      const { data, error } = await supabase
        .from('yona_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      setYonaLogs(data || []);
    } catch (error) {
      console.error('Error fetching Yona logs:', error);
    }
  }

  async function fetchAngusLogs() {
    try {
      const { data, error } = await supabase
        .from('angus_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      setAngusLogs(data || []);
    } catch (error) {
      console.error('Error fetching Angus logs:', error);
    }
  }

  function getLevelBadgeClass(level: string) {
    switch (level?.toLowerCase()) {
      case 'error':
        return 'border-red-500 bg-red-500/20 text-red-300';
      case 'warning':
        return 'border-yellow-500 bg-yellow-500/20 text-yellow-300';
      case 'info':
        return 'border-blue-500 bg-blue-500/20 text-blue-300';
      case 'debug':
        return 'border-purple-500 bg-purple-500/20 text-purple-300';
      default:
        return 'border-green-500 bg-green-500/20 text-green-300';
    }
  }

  function renderLogEntries(logs: LogEntry[]) {
    if (loading) {
      return <div className="text-purple-300">Loading logs...</div>;
    }

    if (logs.length === 0) {
      return <div className="text-purple-300">No logs found</div>;
    }

    return (
      <div className="space-y-1">
        {logs.map((log) => (
          <div
            key={log.id}
            className="border-b border-purple-500/10 py-2 px-1"
          >
            <div className="flex items-start">
              <span className="text-xs text-green-400 font-mono w-20 shrink-0">
                {format(new Date(log.timestamp), 'HH:mm:ss')}
              </span>
              <p className="text-sm text-white font-mono pl-2">{log.message}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const content = (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Card className="border-purple-500/30 bg-purple-900/20 text-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={AGENT_AVATARS[activeTab === "yona" ? "Yona" : "Angus"]} alt={activeTab === "yona" ? "Yona" : "Angus"} />
                <AvatarFallback className="bg-purple-700">
                  {activeTab === "yona" ? "Yo" : "An"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl font-bold text-green-400">Live Code</CardTitle>
                <CardDescription className="text-purple-300">AI agent internal processes</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="yona" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-purple-900/20">
              <TabsTrigger value="yona" className="data-[state=active]:bg-purple-600">
                Yona
              </TabsTrigger>
              <TabsTrigger value="angus" className="data-[state=active]:bg-purple-600">
                Angus
              </TabsTrigger>
            </TabsList>
            <div className="mt-4">
              <TabsContent value="yona" className="mt-0">
                <ScrollArea className="h-[calc(100vh-16rem)] pr-2 bg-purple-950/80 rounded-md font-mono">
                  {renderLogEntries(yonaLogs)}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="angus" className="mt-0">
                <ScrollArea className="h-[calc(100vh-16rem)] pr-2 bg-purple-950/80 rounded-md font-mono">
                  {renderLogEntries(angusLogs)}
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto">
            {content}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
