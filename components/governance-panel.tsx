"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Check, X, ExternalLink, Clock, AlertCircle } from "lucide-react"
import { format, isAfter, differenceInDays } from "date-fns"

// Initialize Supabase client
const supabase = createClientComponentClient();

interface Proposal {
  id: string
  title: string
  description: string
  proposer: string
  status: string
  votes_for: number
  votes_against: number
  votes_abstain: number
  total_votes: number
  start_date: string
  end_date: string
  category: string
  created_at: string
}

// These categories must match the ones defined in the database constraint
const PROPOSAL_CATEGORIES = [
  "funding",
  "governance",
  "technical",
  "community"
]

function QuickStats({ proposals }: { proposals: Proposal[] }) {
  // Count active proposals
  const activeProposals = proposals.filter(p => p.status === "active").length;
  
  // Count proposals ending soon (within 48 hours)
  const endingSoon = proposals.filter(p => {
    const endDate = new Date(p.end_date);
    const now = new Date();
    return p.status === "active" && differenceInDays(endDate, now) <= 2;
  }).length;
  
  // Count proposals you haven't voted on yet (simplified - would need user auth)
  const needsVote = activeProposals; // Simplified - in reality would check user's votes
  
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <Card className="border-purple-500/30 bg-purple-950/50 text-white p-4">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-green-400">{activeProposals}</span>
          <span className="text-sm text-purple-300">Active Proposals</span>
        </div>
      </Card>
      
      <Card className="border-purple-500/30 bg-purple-950/50 text-white p-4">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-yellow-400">{endingSoon}</span>
          <span className="text-sm text-purple-300">Ending Soon</span>
        </div>
      </Card>
      
      <Card className="border-purple-500/30 bg-purple-950/50 text-white p-4">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-blue-400">{needsVote}</span>
          <span className="text-sm text-purple-300">Need Your Vote</span>
        </div>
      </Card>
    </div>
  )
}

function ProposalCard({ proposal }: { proposal: Proposal }) {
  const totalVotes = proposal.total_votes || 0;
  const forPercentage = totalVotes > 0 ? (proposal.votes_for / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (proposal.votes_against / totalVotes) * 100 : 0;
  
  // Check if proposal is still active based on end date
  const isActive = isAfter(new Date(proposal.end_date), new Date());
  
  // Calculate days remaining
  const daysRemaining = differenceInDays(new Date(proposal.end_date), new Date());
  const isEndingSoon = daysRemaining <= 2 && daysRemaining >= 0;

  return (
    <Card className="border-purple-500/30 bg-purple-950/50 text-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold">{proposal.title}</CardTitle>
            {isEndingSoon && (
              <Badge variant="outline" className="border-yellow-500 bg-yellow-500/20 text-yellow-300">
                <Clock className="h-3 w-3 mr-1" /> {daysRemaining === 0 ? "Ends today" : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`}
              </Badge>
            )}
          </div>
          <Badge
            className={`
              ${proposal.status === "active" ? "bg-blue-500" : ""}
              ${proposal.status === "passed" ? "bg-green-500" : ""}
              ${proposal.status === "rejected" ? "bg-red-500" : ""}
              ${proposal.status === "pending" ? "bg-yellow-500" : ""}
            `}
          >
            {proposal.status}
          </Badge>
        </div>
        <CardDescription className="text-purple-300">
          Proposed by: {proposal.proposer} • Category: {proposal.category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} • 
          Ends: {format(new Date(proposal.end_date), "MMM d, yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm">{proposal.description}</p>

        <div className="mb-2 flex items-center justify-between text-sm">
          <span>Votes: {totalVotes.toLocaleString()}</span>
          <span>{forPercentage.toFixed(1)}% in favor</span>
        </div>

        <Progress value={forPercentage} className="h-2 bg-purple-800" indicatorClassName="bg-green-500" />

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-green-500 bg-green-500/20 text-green-300">
              For: {proposal.votes_for.toLocaleString()}
            </Badge>
            <Badge variant="outline" className="border-red-500 bg-red-500/20 text-red-300">
              Against: {proposal.votes_against.toLocaleString()}
            </Badge>
          </div>

          {isActive && proposal.status === "active" && (
            <div className="flex gap-2">
              <Button size="sm" className="bg-green-500 text-black hover:bg-green-400">
                <Check className="mr-1 h-4 w-4" /> Vote For
              </Button>
              <Button size="sm" variant="outline" className="border-red-500 text-red-300 hover:bg-red-500/20">
                <X className="mr-1 h-4 w-4" /> Vote Against
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function GovernancePanel({ limit = 3 }: { limit?: number }) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProposals() {
      try {
        const { data, error } = await supabase
          .from("proposals")
          .select("*")
          .order("end_date", { ascending: true });

        if (error) {
          console.error("Error fetching proposals:", error);
          throw error;
        }

        setProposals(data || []);
      } catch (error) {
        console.error("Error fetching proposals:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProposals();
  }, []);

  const filteredProposals = proposals.filter((proposal) => {
    if (activeTab === "active") return proposal.status === "active";
    if (activeTab === "passed") return proposal.status === "passed";
    if (activeTab === "rejected") return proposal.status === "rejected";
    if (activeTab === "pending") return proposal.status === "pending";
    return true;
  });

  // For dashboard, limit the number of proposals shown
  const displayedProposals = limit ? filteredProposals.slice(0, limit) : filteredProposals;

  return (
    <Card className="border-purple-500/30 bg-purple-900/20 text-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-green-400">DAO Governance</CardTitle>
            <CardDescription className="text-purple-300">View and vote on governance proposals</CardDescription>
          </div>
          <div className="flex gap-2">
            <Link href="/governance">
              <Button variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-500/20">
                <ExternalLink className="mr-1 h-4 w-4" /> View All
              </Button>
            </Link>
            <Link href="/governance">
              <Button className="bg-green-500 text-black hover:bg-green-400">
                <Plus className="mr-2 h-4 w-4" /> New Proposal
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Quick Stats Section */}
        <QuickStats proposals={proposals} />

        <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-5 bg-purple-900/20">
            <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">
              All
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-purple-600">
              Active
            </TabsTrigger>
            <TabsTrigger value="passed" className="data-[state=active]:bg-purple-600">
              Passed
            </TabsTrigger>
            <TabsTrigger value="rejected" className="data-[state=active]:bg-purple-600">
              Rejected
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-purple-600">
              Pending
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-purple-300">Loading proposals...</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {displayedProposals.map((proposal) => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))}

                {displayedProposals.length === 0 && (
                  <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-purple-500/30 p-4 text-center">
                    <p className="text-purple-300">No proposals found in this category</p>
                  </div>
                )}

                {limit && filteredProposals.length > limit && (
                  <div className="flex justify-center mt-4">
                    <Link href="/governance">
                      <Button variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-500/20">
                        View All {filteredProposals.length} Proposals <ExternalLink className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}
