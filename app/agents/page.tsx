'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from 'date-fns';
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";

interface Task {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  metadata: {
    progress?: number;
  } | null;
}

interface Agent {
  name: string;
  role: string;
  avatar: string;
  tasks: Task[];
  activeTask?: Task;
}

const AGENT_ROLES: { [key: string]: string } = {
  "Yona": "Music Composer",
  "Angus": "Sound Engineer",
  "Luna": "Visual Artist",
  "Max": "Content Manager",
  "Mr Kim": "Social Media Manager",
  "Nanny Noo": "Visual Artist"
};

const AGENT_AVATARS: { [key: string]: string } = {
  "Yona": "/Yona_Avatar-nobg.png",
  "Angus": "/Angus_Avatar-nobg.png",
  "Mr Kim": "/Mr_Kim_Avatar-nobg.png",
  "Nanny Noo": "/Nanny_Noo_Avatar-nobg.png",
  "System": "/system-Avatar-nobg.png"
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<{ [key: string]: Agent }>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchTasks() {
      try {
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Process tasks to group by agent
        const agentMap: { [key: string]: Agent } = {};
        
        tasks?.forEach((task: Task) => {
          if (!task.assigned_to) return;

          if (!agentMap[task.assigned_to]) {
            agentMap[task.assigned_to] = {
              name: task.assigned_to,
              role: AGENT_ROLES[task.assigned_to] || 'Team Member',
              avatar: AGENT_AVATARS[task.assigned_to] || '/placeholder.svg',
              tasks: [],
              activeTask: undefined
            };
          }

          // Add task to agent's task list
          agentMap[task.assigned_to].tasks.push(task);

          // Update active task if this is the most recent active task
          if (task.status === 'active' && (!agentMap[task.assigned_to].activeTask || 
              new Date(task.updated_at) > new Date(agentMap[task.assigned_to].activeTask!.updated_at))) {
            agentMap[task.assigned_to].activeTask = task;
          }
        });

        setAgents(agentMap);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setLoading(false);
      }
    }

    fetchTasks();

    // Set up real-time subscription
    const channel = supabase
      .channel('tasks_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const content = (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Card className="border-purple-500/30 bg-purple-900/20 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-green-400">Agents</CardTitle>
          <CardDescription className="text-purple-300">View and manage agent tasks and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="grid grid-cols-1 gap-6">
              {loading ? (
                <div className="text-purple-300">Loading agents...</div>
              ) : Object.values(agents).length === 0 ? (
                <div className="text-purple-300">No agents found</div>
              ) : (
                Object.values(agents).map((agent) => (
                  <Card 
                    key={agent.name}
                    className="border-purple-500/30 bg-purple-950/50"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6">
                        {/* Agent Profile */}
                        <div className="flex items-center gap-4">
                          <Avatar className="h-24 w-24">
                            <AvatarImage src={agent.avatar} alt={agent.name} />
                            <AvatarFallback className="bg-purple-700 text-lg">
                              {agent.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                            <p className="text-sm text-purple-300">{agent.role}</p>
                          </div>
                        </div>

                        {/* Tasks Section */}
                        <div className="flex-1 space-y-4">
                          {/* Current Task */}
                          {agent.activeTask && (
                            <div className="rounded-lg border border-purple-500/30 bg-purple-900/20 p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-white">Current Task</h4>
                                  <Badge
                                    variant="outline"
                                    className="border-green-500 bg-green-500/20 text-green-300"
                                  >
                                    Active
                                  </Badge>
                                </div>
                                <span className="text-xs text-purple-400">
                                  {formatDistanceToNow(new Date(agent.activeTask.updated_at), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm text-purple-200 mb-2">{agent.activeTask.title}</p>
                              <p className="text-sm text-purple-300 mb-3">{agent.activeTask.description}</p>
                              <Progress
                                value={agent.activeTask.metadata?.progress || 0}
                                className="h-2 bg-purple-800"
                                indicatorClassName="bg-green-500"
                              />
                            </div>
                          )}

                          {/* Recent Tasks */}
                          <div>
                            <h4 className="font-medium text-white mb-3">Recent Tasks</h4>
                            <div className="space-y-2">
                              {agent.tasks
                                .filter(task => task.id !== agent.activeTask?.id)
                                .slice(0, 3)
                                .map(task => (
                                  <div
                                    key={task.id}
                                    className="flex items-center justify-between rounded-lg border border-purple-500/30 bg-purple-900/20 p-3"
                                  >
                                    <div>
                                      <p className="text-sm text-purple-200">{task.title}</p>
                                      <p className="text-xs text-purple-300">{task.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant="outline"
                                        className={`
                                          ${task.status === "completed" ? "border-purple-500 bg-purple-500/20 text-purple-300" : ""}
                                          ${task.status === "pending" ? "border-yellow-500 bg-yellow-500/20 text-yellow-300" : ""}
                                          ${task.priority === "high" ? "border-red-500 bg-red-500/20 text-red-300" : ""}
                                        `}
                                      >
                                        {task.status}
                                      </Badge>
                                      <span className="text-xs text-purple-400">
                                        {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}
                                      </span>
                                    </div>
                                  </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
