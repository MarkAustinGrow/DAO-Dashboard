'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow, format } from 'date-fns';
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ActivityLog {
  id: string;
  agent_name: string;
  agent_avatar: string;
  action: string;
  details: string;
  category: string;
  timestamp: string;
}

// Map agent names directly to their no-background PNG avatars
const AGENT_AVATARS: { [key: string]: string } = {
  "Yona": "/Yona_Avatar-nobg.png",
  "Angus": "/Angus_Avatar-nobg.png",
  "Mr Kim": "/Mr_Kim_Avatar-nobg.png",
  "Nanny Noo": "/Nanny_Noo_Avatar-nobg.png",
  "System": "/system-Avatar-nobg.png"
};

const CATEGORIES = {
  "task": "Task Activity",
  "content": "Content Updates",
  "governance": "Governance Actions",
  "system": "System Events"
};

export default function LogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchLogs() {
      try {
        let query = supabase
          .from('activity_logs')
          .select('*')
          .order('timestamp', { ascending: false });

        if (selectedCategory !== "all") {
          query = query.eq('category', selectedCategory);
        }

        if (selectedDate !== "all") {
          const today = new Date();
          let startDate = new Date();
          
          switch (selectedDate) {
            case "today":
              startDate.setHours(0, 0, 0, 0);
              break;
            case "week":
              startDate.setDate(today.getDate() - 7);
              break;
            case "month":
              startDate.setMonth(today.getMonth() - 1);
              break;
          }
          
          query = query.gte('timestamp', startDate.toISOString());
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }


        setLogs(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching logs:', error);
        setLoading(false);
      }
    }

    fetchLogs();

    // Set up real-time subscription
    const channel = supabase
      .channel('activity_logs_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_logs'
        },
        () => {
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, selectedCategory, selectedDate]);

  const groupLogsByDate = (logs: ActivityLog[]) => {
    const groups: { [key: string]: ActivityLog[] } = {};
    
    logs.forEach(log => {
      const date = new Date(log.timestamp);
      const dateKey = format(date, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(log);
    });

    return groups;
  };

  const content = (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Card className="border-purple-500/30 bg-purple-900/20 text-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-green-400">System Logs</CardTitle>
              <CardDescription className="text-purple-300">Detailed activity logs and system events</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px] border-purple-500/30 bg-purple-950/50 text-purple-300">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="border-purple-500/30 bg-purple-950/50">
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(CATEGORIES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-[180px] border-purple-500/30 bg-purple-950/50 text-purple-300">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent className="border-purple-500/30 bg-purple-950/50">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-6">
              {loading ? (
                <div className="text-purple-300">Loading logs...</div>
              ) : logs.length === 0 ? (
                <div className="text-purple-300">No logs found</div>
              ) : (
                Object.entries(groupLogsByDate(logs)).map(([date, dateLogs]) => (
                  <div key={date} className="space-y-3">
                    <h3 className="text-sm font-medium text-purple-300 sticky top-0 bg-purple-900/90 py-2">
                      {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <div className="space-y-2">
                      {dateLogs.map((log) => (
                        <Card 
                          key={log.id}
                          className="border-purple-500/30 bg-purple-950/50"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={AGENT_AVATARS[log.agent_name] || ''} alt={log.agent_name} />
                                <AvatarFallback className="bg-purple-700">
                                  {log.agent_name.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-white">{log.agent_name}</p>
                                  <Badge
                                    variant="outline"
                                    className={`
                                      ${log.category === "task" ? "border-orange-500 bg-orange-500/20 text-orange-300" : ""}
                                      ${log.category === "content" ? "border-blue-500 bg-blue-500/20 text-blue-300" : ""}
                                      ${log.category === "governance" ? "border-purple-500 bg-purple-500/20 text-purple-300" : ""}
                                      ${log.category === "system" ? "border-green-500 bg-green-500/20 text-green-300" : ""}
                                    `}
                                  >
                                    {CATEGORIES[log.category as keyof typeof CATEGORIES] || log.category}
                                  </Badge>
                                  <span className="text-xs text-purple-400">
                                    {format(new Date(log.timestamp), 'HH:mm')}
                                  </span>
                                </div>
                                <p className="text-sm text-purple-200">{log.action}</p>
                                <p className="text-sm text-purple-300">{log.details}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
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
