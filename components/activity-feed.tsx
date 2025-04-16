'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { formatDistanceToNow } from 'date-fns'

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

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchActivities() {
      try {
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(20);

        if (error) {
          throw error;
        }

        setActivities(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setLoading(false);
      }
    }

    fetchActivities();

    // Set up real-time subscription
    const channel = supabase
      .channel('activity_logs_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'activity_logs' 
        }, 
        (payload) => {
          // Refresh the activities when there's a change
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (loading) {
    return (
      <Card className="border-purple-500/30 bg-purple-900/20 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-green-400">Activity Feed</CardTitle>
          <CardDescription className="text-purple-300">Loading activities...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-purple-500/30 bg-purple-900/20 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-green-400">Activity Feed</CardTitle>
        <CardDescription className="text-purple-300">Recent activities and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-lg border border-purple-500/30 bg-purple-950/50 p-3"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={AGENT_AVATARS[activity.agent_name] || ''} alt={activity.agent_name} />
                  <AvatarFallback className="bg-purple-700">
                    {activity.agent_name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm">
                      <span className="font-medium">{activity.agent_name}</span>
                      <span className="text-purple-300"> {activity.action}</span>
                    </p>
                    <Badge
                      variant="outline"
                      className={`
                        ${activity.category === "task" ? "border-orange-500 bg-orange-500/20 text-orange-300" : ""}
                        ${activity.category === "content" ? "border-blue-500 bg-blue-500/20 text-blue-300" : ""}
                        ${activity.category === "governance" ? "border-purple-500 bg-purple-500/20 text-purple-300" : ""}
                      `}
                    >
                      {activity.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-purple-300 mt-1">{activity.details}</p>
                  <p className="text-xs text-purple-400 mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
