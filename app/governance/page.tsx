"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, Check, X, MinusCircle, Calendar } from "lucide-react"
import { format, addDays } from "date-fns"

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

interface NewProposal {
  title: string
  description: string
  category: string
  start_date: string
  end_date: string
}

// These categories must match the ones defined in the database constraint
const PROPOSAL_CATEGORIES = [
  "funding",
  "governance",
  "technical",
  "community"
]

function NewProposalForm({ onSubmit, onClose }: { onSubmit: (proposal: NewProposal) => void, onClose: () => void }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [error, setError] = useState("")
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title || !description || !category) {
      setError("Please fill in all required fields")
      return
    }

    const start_date = new Date().toISOString()
    const end_date = addDays(new Date(), 7).toISOString() // 7-day voting period

    onSubmit({
      title,
      description,
      category,
      start_date,
      end_date
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter proposal title"
          className="border-purple-500/30 bg-purple-950/50 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="border-purple-500/30 bg-purple-950/50 text-white">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {PROPOSAL_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {/* Convert snake_case to Title Case for display */}
                {cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter proposal description"
          className="min-h-[100px] border-purple-500/30 bg-purple-950/50 text-white"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-green-500 text-black hover:bg-green-400">
          Create Proposal
        </Button>
      </div>
    </form>
  )
}

function ProposalCard({ proposal }: { proposal: Proposal }) {
  const totalVotes = proposal.total_votes || 0
  const forPercentage = totalVotes > 0 ? (proposal.votes_for / totalVotes) * 100 : 0
  const againstPercentage = totalVotes > 0 ? (proposal.votes_against / totalVotes) * 100 : 0
  const abstainPercentage = totalVotes > 0 ? (proposal.votes_abstain / totalVotes) * 100 : 0

  const isActive = new Date(proposal.end_date) > new Date()

  return (
    <Card className="border-purple-500/30 bg-purple-950/50 text-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">{proposal.title}</CardTitle>
            <Badge variant="outline" className="mt-1">
              {/* Convert snake_case to Title Case for display */}
              {proposal.category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Badge>
          </div>
          <Badge
            className={`
              ${isActive && proposal.status === "active" ? "bg-blue-500" : ""}
              ${proposal.status === "passed" ? "bg-green-500" : ""}
              ${proposal.status === "rejected" ? "bg-red-500" : ""}
              ${proposal.status === "pending" ? "bg-yellow-500" : ""}
            `}
          >
            {proposal.status}
          </Badge>
        </div>
        <CardDescription className="text-purple-300">
          Proposed by: {proposal.proposer} • Start: {format(new Date(proposal.start_date), "MMM d, yyyy")} • 
          End: {format(new Date(proposal.end_date), "MMM d, yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm">{proposal.description}</p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>For ({forPercentage.toFixed(1)}%)</span>
            <span>{proposal.votes_for.toLocaleString()} votes</span>
          </div>
          <Progress value={forPercentage} className="h-2 bg-purple-800" indicatorClassName="bg-green-500" />

          <div className="flex items-center justify-between text-sm">
            <span>Against ({againstPercentage.toFixed(1)}%)</span>
            <span>{proposal.votes_against.toLocaleString()} votes</span>
          </div>
          <Progress value={againstPercentage} className="h-2 bg-purple-800" indicatorClassName="bg-red-500" />

          <div className="flex items-center justify-between text-sm">
            <span>Abstain ({abstainPercentage.toFixed(1)}%)</span>
            <span>{proposal.votes_abstain.toLocaleString()} votes</span>
          </div>
          <Progress value={abstainPercentage} className="h-2 bg-purple-800" indicatorClassName="bg-yellow-500" />
        </div>

        {isActive && proposal.status === "active" && (
          <div className="mt-4 flex gap-2">
            <Button size="sm" className="flex-1 bg-green-500 text-black hover:bg-green-400">
              <Check className="mr-1 h-4 w-4" /> Vote For
            </Button>
            <Button size="sm" variant="outline" className="flex-1 border-red-500 text-red-300 hover:bg-red-500/20">
              <X className="mr-1 h-4 w-4" /> Vote Against
            </Button>
            <Button size="sm" variant="outline" className="flex-1 border-yellow-500 text-yellow-300 hover:bg-yellow-500/20">
              <MinusCircle className="mr-1 h-4 w-4" /> Abstain
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function Page() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [activeTab, setActiveTab] = useState("active")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)
  const [isNewProposalOpen, setIsNewProposalOpen] = useState(false)

  useEffect(() => {
    fetchProposals()
  }, [])

  async function fetchProposals() {
    try {
      // Attempt to reconnect to Supabase if needed
      const { data, error } = await supabase
        .from("proposals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching proposals:", error);
        throw error;
      } else {
        setProposals(data || []);
      }
    } catch (error: any) {
      console.error("Error fetching proposals:", error);
      // Don't show an alert here as it would appear on page load
    } finally {
      setLoading(false);
    }
  }

  async function handleNewProposal(proposal: NewProposal) {
    try {
      // Try to insert the proposal
      const { error } = await supabase
        .from("proposals")
        .insert([
          {
            ...proposal,
            proposer: "Current User", // TODO: Replace with actual user
            status: "active",
            votes_for: 0,
            votes_against: 0,
            votes_abstain: 0,
            total_votes: 0
          }
        ]);

      if (error) {
        console.error("Error inserting proposal:", error);
        
        // Check if it's a connection error
        if (error.message.includes("connection") || error.code === "PGRST499") {
          alert("Database connection error. Please try again.");
        } 
        // Check if it's a constraint violation
        else if (error.message.includes("violates check constraint") && error.message.includes("proposals_category_check")) {
          alert("Error: The selected category is not valid. Please select a different category.");
        }
        else {
          alert(`Error creating proposal: ${error.message}`);
        }
        throw error;
      }

      setIsNewProposalOpen(false);
      fetchProposals(); // Refresh the proposals list
    } catch (error: any) {
      console.error("Error creating proposal:", error);
    }
  }

  const categories = Array.from(new Set(proposals.map(p => p.category)))

  const filteredProposals = proposals.filter((proposal) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && new Date(proposal.end_date) > new Date() && proposal.status === "active") ||
      (activeTab === "passed" && proposal.status === "passed") ||
      (activeTab === "rejected" && proposal.status === "rejected") ||
      (activeTab === "pending" && proposal.status === "pending")

    const matchesCategory = selectedCategory === "all" || proposal.category === selectedCategory

    return matchesTab && matchesCategory
  })

  return (
    <div className="container mx-auto p-6">
      <Card className="border-purple-500/30 bg-purple-900/20 text-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-green-400">DAO Governance</CardTitle>
              <CardDescription className="text-purple-300">View and vote on governance proposals</CardDescription>
            </div>
            <Dialog open={isNewProposalOpen} onOpenChange={setIsNewProposalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-500 text-black hover:bg-green-400">
                  <Plus className="mr-2 h-4 w-4" /> New Proposal
                </Button>
              </DialogTrigger>
              <DialogContent className="border-purple-500/30 bg-purple-900/90 text-white">
                <DialogHeader>
                  <DialogTitle className="text-green-400">Create New Proposal</DialogTitle>
                  <DialogDescription className="text-purple-300">
                    Submit a new proposal for the DAO to vote on. The voting period will last for 7 days.
                  </DialogDescription>
                </DialogHeader>
                <NewProposalForm 
                  onSubmit={handleNewProposal}
                  onClose={() => setIsNewProposalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="grid w-full grid-cols-5 bg-purple-900/20">
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
            </Tabs>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px] border-purple-500/30 bg-purple-950/50">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {/* Convert snake_case to Title Case for display */}
                    {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[600px] pr-4">
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="text-purple-300">Loading proposals...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProposals.map((proposal) => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))}

                {filteredProposals.length === 0 && (
                  <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-purple-500/30 p-4 text-center">
                    <p className="text-purple-300">No proposals found in this category</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
