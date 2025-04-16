'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Task {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  assigned_to_uid: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  metadata: {
    progress?: number;
  } | null;
}

interface AgentStatus {
  name: string;
  role: string;
  currentTask?: Task;
  status: string;
  progress: number;
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
  // Fallbacks for other agents if needed
  "Luna": "",
  "Max": ""
};

export default function AgentStatusPanel() {
  const [agentStatuses, setAgentStatuses] = useState<{ [key: string]: AgentStatus }>({});
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

        // Process tasks to get agent statuses
        const statusMap: { [key: string]: AgentStatus } = {};
        
        tasks?.forEach((task: Task) => {
          // Skip if no assigned agent
          if (!task.assigned_to) return;

          // If we haven't seen this agent yet, or if this task is more recent
          if (!statusMap[task.assigned_to] || 
              new Date(task.updated_at) > new Date(statusMap[task.assigned_to].currentTask?.updated_at || '')) {
            
            // Calculate progress based on status or metadata
            let progress = 0;
            if (task.status === 'completed') {
              progress = 100;
            } else if (task.status === 'active') {
              progress = task.metadata?.progress || 65;
            } else if (task.status === 'pending') {
              progress = 0;
            }

            statusMap[task.assigned_to] = {
              name: task.assigned_to,
              role: AGENT_ROLES[task.assigned_to] || 'Team Member',
              currentTask: task,
              status: task.status,
              progress
            };
          }
        });

        setAgentStatuses(statusMap);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setLoading(false);
      }
    }

    fetchTasks();
  }, [supabase]);

  if (loading) {
    return (
      <Card className="border-purple-500/30 bg-purple-900/20 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-green-400">Agent Status</CardTitle>
          <CardDescription className="text-purple-300">Loading agent statuses...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-purple-500/30 bg-purple-900/20 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-green-400">Agent Status</CardTitle>
        <CardDescription className="text-purple-300">Current status and tasks of all agents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.values(agentStatuses).map((agent) => (
            <div
              key={agent.name}
              className="flex items-center justify-between rounded-lg border border-purple-500/30 bg-purple-950/50 p-3"
            >
              <div className="flex items-center gap-3">
              <Avatar className="size-12">
                  <AvatarImage src={AGENT_AVATARS[agent.name]} alt={agent.name} />
                  <AvatarFallback className="bg-purple-700">{agent.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{agent.name}</h3>
                    <Badge
                      variant="outline"
                      className={`
                        ${agent.status === "active" ? "border-green-500 bg-green-500/20 text-green-300" : ""}
                        ${agent.status === "pending" ? "border-yellow-500 bg-yellow-500/20 text-yellow-300" : ""}
                        ${agent.status === "completed" ? "border-purple-500 bg-purple-500/20 text-purple-300" : ""}
                      `}
                    >
                      {agent.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-purple-300">{agent.role}</p>
                </div>
              </div>
              <div className="w-1/2">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs">{agent.currentTask?.title || 'No active task'}</span>
                  <span className="text-xs font-medium">{agent.progress}%</span>
                </div>
                <Progress
                  value={agent.progress}
                  className="h-2 bg-purple-800"
                  indicatorClassName={`
                    ${agent.status === "active" ? "bg-green-500" : ""}
                    ${agent.status === "pending" ? "bg-yellow-500" : ""}
                    ${agent.status === "completed" ? "bg-purple-500" : ""}
                  `}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
