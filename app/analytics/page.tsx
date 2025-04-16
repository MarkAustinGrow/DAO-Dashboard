'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface EngagementMetric {
  id: string;
  platform: string;
  metric_type: string;
  value: number;
  timestamp: string;
}

interface FeedbackData {
  id: string;
  type: string;
  content: string;
  rating: number;
  timestamp: string;
}

interface PlatformDistribution {
  id: string;
  platform: string;
  listener_count: number;
  region: string;
}

interface SentimentData {
  id: string;
  content_id: string;
  sentiment_score: number;
  timestamp: string;
}

interface VoteData {
  id: string;
  proposal_id: string;
  vote_type: string;
  timestamp: string;
}

const COLORS = ['#8B5CF6', '#6366F1', '#EC4899', '#10B981', '#F59E0B'];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("engagement");
  const [timeframe, setTimeframe] = useState("week");
  const [engagementData, setEngagementData] = useState<EngagementMetric[]>([]);
  const [feedbackData, setFeedbackData] = useState<FeedbackData[]>([]);
  const [distributionData, setDistributionData] = useState<PlatformDistribution[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [voteData, setVoteData] = useState<VoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch engagement metrics
        const { data: engagementMetrics } = await supabase
          .from('engagement_metrics')
          .select('*')
          .order('timestamp', { ascending: false });
        setEngagementData(engagementMetrics || []);

        // Fetch feedback
        const { data: feedback } = await supabase
          .from('feedback')
          .select('*')
          .order('timestamp', { ascending: false });
        setFeedbackData(feedback || []);

        // Fetch platform distribution
        const { data: distribution } = await supabase
          .from('platform_distribution')
          .select('*');
        setDistributionData(distribution || []);

        // Fetch sentiment data
        const { data: sentiment } = await supabase
          .from('sentiment_data')
          .select('*')
          .order('timestamp', { ascending: false });
        setSentimentData(sentiment || []);

        // Fetch votes
        const { data: votes } = await supabase
          .from('votes')
          .select('*')
          .order('timestamp', { ascending: false });
        setVoteData(votes || []);

      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [supabase, timeframe]);

  const aggregateEngagementData = () => {
    const aggregated = engagementData.reduce((acc: any, curr) => {
      if (!acc[curr.platform]) {
        acc[curr.platform] = { name: curr.platform };
      }
      acc[curr.platform][curr.metric_type] = curr.value;
      return acc;
    }, {});
    return Object.values(aggregated);
  };

  const calculateAverageSentiment = () => {
    if (sentimentData.length === 0) return 0;
    const sum = sentimentData.reduce((acc, curr) => acc + curr.sentiment_score, 0);
    return (sum / sentimentData.length).toFixed(2);
  };

  const aggregatePlatformData = () => {
    return distributionData.map(item => ({
      name: item.platform,
      value: item.listener_count,
    }));
  };

  const content = (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-400">Analytics Dashboard</h1>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px] border-purple-500/30 bg-purple-950/50 text-purple-300">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent className="border-purple-500/30 bg-purple-950/50">
            <SelectItem value="day">Last 24 Hours</SelectItem>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-purple-900/20">
          <TabsTrigger value="engagement" className="data-[state=active]:bg-purple-600">
            Engagement
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="data-[state=active]:bg-purple-600">
            Sentiment
          </TabsTrigger>
          <TabsTrigger value="distribution" className="data-[state=active]:bg-purple-600">
            Distribution
          </TabsTrigger>
          <TabsTrigger value="governance" className="data-[state=active]:bg-purple-600">
            Governance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-4">
          <Card className="border-purple-500/30 bg-purple-900/20">
            <CardHeader>
              <CardTitle className="text-green-400">Platform Engagement</CardTitle>
              <CardDescription className="text-purple-300">
                Engagement metrics across different platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={aggregateEngagementData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937',
                        borderColor: '#374151'
                      }}
                    />
                    <Bar dataKey="likes" fill="#8B5CF6" />
                    <Bar dataKey="shares" fill="#EC4899" />
                    <Bar dataKey="comments" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-purple-500/30 bg-purple-900/20">
              <CardHeader>
                <CardTitle className="text-green-400">Average Sentiment Score</CardTitle>
                <CardDescription className="text-purple-300">
                  Overall sentiment across all content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-purple-300">
                  {calculateAverageSentiment()}
                </div>
              </CardContent>
            </Card>
            <Card className="border-purple-500/30 bg-purple-900/20">
              <CardHeader>
                <CardTitle className="text-green-400">Sentiment Trend</CardTitle>
                <CardDescription className="text-purple-300">
                  Sentiment score over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sentimentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="timestamp" 
                        stroke="#9CA3AF"
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          borderColor: '#374151'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sentiment_score" 
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card className="border-purple-500/30 bg-purple-900/20">
            <CardHeader>
              <CardTitle className="text-green-400">Platform Distribution</CardTitle>
              <CardDescription className="text-purple-300">
                Listener distribution across platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={aggregatePlatformData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {aggregatePlatformData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        borderColor: '#374151'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-purple-500/30 bg-purple-900/20">
              <CardHeader>
                <CardTitle className="text-green-400">Voting Activity</CardTitle>
                <CardDescription className="text-purple-300">
                  Recent proposal votes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={voteData.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="proposal_id" 
                        stroke="#9CA3AF"
                      />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          borderColor: '#374151'
                        }}
                      />
                      <Bar dataKey="vote_type" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="border-purple-500/30 bg-purple-900/20">
              <CardHeader>
                <CardTitle className="text-green-400">Feedback Overview</CardTitle>
                <CardDescription className="text-purple-300">
                  Recent feedback ratings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={feedbackData.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="timestamp" 
                        stroke="#9CA3AF"
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          borderColor: '#374151'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="rating" 
                        stroke="#EC4899" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-purple-300">Loading analytics data...</p>
              </div>
            ) : (
              content
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
