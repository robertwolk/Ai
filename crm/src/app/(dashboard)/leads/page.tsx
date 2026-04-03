"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

// --- Types ---
type CampaignStatus = "Active" | "Completed" | "Draft";
type LeadStatus = "New" | "Contacted" | "Qualified" | "Converted";
type LeadGrade = "A" | "B" | "C" | "D";

interface Campaign {
  id: number;
  name: string;
  status: CampaignStatus;
  targetProfile: string;
  leadsFound: number;
  leadsTarget: number;
  qualified: number;
  converted: number;
  sources: string[];
  cost: number;
  roi: number;
}

interface Lead {
  id: number;
  name: string;
  company: string;
  title: string;
  email: string;
  score: number;
  grade: LeadGrade;
  status: LeadStatus;
  source: string;
}

interface TargetProfile {
  id: number;
  name: string;
  industry: string;
  companySize: string;
  geography: string;
  techStack: string[];
  jobTitles: string[];
}

// --- Mock Data ---
const campaigns: Campaign[] = [
  {
    id: 1,
    name: "SaaS Decision Makers - US",
    status: "Active",
    targetProfile: "SaaS companies, 20-100 employees, US",
    leadsFound: 847,
    leadsTarget: 1000,
    qualified: 312,
    converted: 47,
    sources: ["Apollo", "Hunter.io", "LinkedIn"],
    cost: 1840,
    roi: 340,
  },
  {
    id: 2,
    name: "E-commerce Founders",
    status: "Active",
    targetProfile: "E-commerce, 10-50 employees, North America",
    leadsFound: 534,
    leadsTarget: 750,
    qualified: 198,
    converted: 31,
    sources: ["Apollo", "Crunchbase", "BuiltWith"],
    cost: 1250,
    roi: 280,
  },
  {
    id: 3,
    name: "Healthcare Tech Leaders",
    status: "Completed",
    targetProfile: "HealthTech, 50-500 employees, US & Canada",
    leadsFound: 620,
    leadsTarget: 600,
    qualified: 287,
    converted: 52,
    sources: ["Hunter.io", "LinkedIn", "Google Maps"],
    cost: 2100,
    roi: 410,
  },
  {
    id: 4,
    name: "FinTech Startups - EU",
    status: "Active",
    targetProfile: "FinTech, 5-50 employees, Europe",
    leadsFound: 421,
    leadsTarget: 800,
    qualified: 156,
    converted: 18,
    sources: ["Apollo", "Crunchbase"],
    cost: 980,
    roi: 190,
  },
  {
    id: 5,
    name: "Agency Owners Outreach",
    status: "Draft",
    targetProfile: "Marketing agencies, 5-30 employees, US",
    leadsFound: 0,
    leadsTarget: 500,
    qualified: 0,
    converted: 0,
    sources: ["Apollo", "Google Maps", "LinkedIn"],
    cost: 0,
    roi: 0,
  },
];

const leads: Lead[] = [
  { id: 1, name: "Sarah Chen", company: "CloudScale Inc", title: "VP of Engineering", email: "s.chen@cloudscale.io", score: 92, grade: "A", status: "Qualified", source: "Apollo" },
  { id: 2, name: "Marcus Johnson", company: "DataFlow Labs", title: "CTO", email: "marcus@dataflow.com", score: 88, grade: "A", status: "Contacted", source: "LinkedIn" },
  { id: 3, name: "Emily Rodriguez", company: "ShopWave", title: "Head of Growth", email: "emily.r@shopwave.co", score: 85, grade: "A", status: "Converted", source: "Hunter.io" },
  { id: 4, name: "James Wright", company: "FinEdge", title: "CEO", email: "jwright@finedge.com", score: 79, grade: "B", status: "Qualified", source: "Crunchbase" },
  { id: 5, name: "Aisha Patel", company: "MedConnect", title: "Director of Operations", email: "a.patel@medconnect.io", score: 76, grade: "B", status: "Contacted", source: "Apollo" },
  { id: 6, name: "Thomas Mueller", company: "AutomatePro", title: "VP Sales", email: "tmueller@automatepro.de", score: 73, grade: "B", status: "New", source: "Apollo" },
  { id: 7, name: "Lisa Wang", company: "GreenTech Solutions", title: "Product Manager", email: "lwang@greentech.co", score: 68, grade: "B", status: "Contacted", source: "BuiltWith" },
  { id: 8, name: "David Kim", company: "NexaPay", title: "Founder", email: "david@nexapay.io", score: 64, grade: "C", status: "New", source: "Crunchbase" },
  { id: 9, name: "Rachel Green", company: "ContentAI", title: "Marketing Director", email: "rachel@contentai.com", score: 61, grade: "C", status: "New", source: "LinkedIn" },
  { id: 10, name: "Omar Hassan", company: "LogiChain", title: "CIO", email: "ohassan@logichain.com", score: 57, grade: "C", status: "Contacted", source: "Hunter.io" },
  { id: 11, name: "Nina Sato", company: "PixelForge", title: "Creative Director", email: "nina@pixelforge.co", score: 53, grade: "C", status: "New", source: "Google Maps" },
  { id: 12, name: "Brian Murphy", company: "SecureVault", title: "CISO", email: "bmurphy@securevault.io", score: 48, grade: "C", status: "New", source: "Apollo" },
  { id: 13, name: "Sophie Laurent", company: "EduLearn", title: "COO", email: "slaurent@edulearn.fr", score: 35, grade: "D", status: "New", source: "LinkedIn" },
  { id: 14, name: "Carlos Mendez", company: "FreshBites", title: "Owner", email: "carlos@freshbites.mx", score: 28, grade: "D", status: "New", source: "Google Maps" },
  { id: 15, name: "Priya Sharma", company: "TalentHub", title: "HR Manager", email: "psharma@talenthub.in", score: 22, grade: "D", status: "New", source: "Apollo" },
];

const targetProfiles: TargetProfile[] = [
  {
    id: 1,
    name: "SaaS Mid-Market US",
    industry: "SaaS / Software",
    companySize: "20-100 employees",
    geography: "United States",
    techStack: ["React", "AWS", "Stripe", "HubSpot"],
    jobTitles: ["CTO", "VP Engineering", "Head of Product"],
  },
  {
    id: 2,
    name: "E-commerce SMB North America",
    industry: "E-commerce / Retail",
    companySize: "10-50 employees",
    geography: "US & Canada",
    techStack: ["Shopify", "Klaviyo", "Google Analytics"],
    jobTitles: ["Founder", "Head of Growth", "Marketing Director"],
  },
  {
    id: 3,
    name: "HealthTech Enterprises",
    industry: "Healthcare Technology",
    companySize: "50-500 employees",
    geography: "US & Canada",
    techStack: ["FHIR", "AWS", "Salesforce"],
    jobTitles: ["CIO", "Director of Operations", "VP of Product"],
  },
  {
    id: 4,
    name: "FinTech Startups EU",
    industry: "Financial Technology",
    companySize: "5-50 employees",
    geography: "Europe",
    techStack: ["Node.js", "PostgreSQL", "Plaid"],
    jobTitles: ["CEO", "CTO", "Head of Engineering"],
  },
];

const scoringCriteria = [
  { category: "Fit Score (0-50)", criteria: "Company size matches ICP", points: 15 },
  { category: "Fit Score (0-50)", criteria: "Industry match", points: 15 },
  { category: "Fit Score (0-50)", criteria: "Geography match", points: 10 },
  { category: "Fit Score (0-50)", criteria: "Tech stack overlap", points: 10 },
  { category: "Intent Score (0-30)", criteria: "Website visits (last 30 days)", points: 10 },
  { category: "Intent Score (0-30)", criteria: "Content downloads", points: 10 },
  { category: "Intent Score (0-30)", criteria: "Email engagement", points: 10 },
  { category: "Engagement Score (0-20)", criteria: "Responded to outreach", points: 10 },
  { category: "Engagement Score (0-20)", criteria: "Attended webinar / demo", points: 10 },
];

const gradeDistribution = [
  { grade: "A" as LeadGrade, percentage: 15, color: "bg-green-500" },
  { grade: "B" as LeadGrade, percentage: 30, color: "bg-blue-500" },
  { grade: "C" as LeadGrade, percentage: 35, color: "bg-yellow-500" },
  { grade: "D" as LeadGrade, percentage: 20, color: "bg-red-500" },
];

const gradeColors: Record<LeadGrade, string> = {
  A: "bg-green-100 text-green-800",
  B: "bg-blue-100 text-blue-800",
  C: "bg-yellow-100 text-yellow-800",
  D: "bg-red-100 text-red-800",
};

const statusColors: Record<LeadStatus, string> = {
  New: "bg-secondary text-secondary-foreground",
  Contacted: "bg-blue-100 text-blue-800",
  Qualified: "bg-purple-100 text-purple-800",
  Converted: "bg-green-100 text-green-800",
};

const campaignStatusColors: Record<CampaignStatus, string> = {
  Active: "bg-green-100 text-green-800",
  Completed: "bg-blue-100 text-blue-800",
  Draft: "bg-secondary text-secondary-foreground",
};

const allSources = ["Apollo", "Hunter.io", "Crunchbase", "BuiltWith", "Google Maps", "LinkedIn"];

// --- Page ---
export default function LeadsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [targetProfile, setTargetProfile] = useState("");
  const [targetLeadCount, setTargetLeadCount] = useState("");
  const [budget, setBudget] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  function toggleSource(source: string) {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  }

  function scoreBarColor(score: number) {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lead Generation</h1>
          <p className="text-sm text-muted-foreground">Find, score, and qualify leads at scale.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            <PlusIcon className="mr-1 h-4 w-4" />
            New Campaign
          </Button>
          <Button>
            <SearchIcon className="mr-1 h-4 w-4" />
            Find Leads
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Total Leads Scraped</p>
          <p className="mt-1 text-2xl font-bold">{formatNumber(2847)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Qualified Leads</p>
          <p className="mt-1 text-2xl font-bold">{formatNumber(1204)}</p>
          <p className="text-xs text-green-600 font-medium">42.3% of total</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Conversion Rate</p>
          <p className="mt-1 text-2xl font-bold">8.3%</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Cost Per Lead</p>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(2.4)}</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="scoring">Scoring</TabsTrigger>
          <TabsTrigger value="profiles">Target Profiles</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c) => (
              <Card key={c.id} className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{c.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.targetProfile}</p>
                  </div>
                  <Badge className={campaignStatusColors[c.status]}>{c.status}</Badge>
                </div>

                {/* Progress */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatNumber(c.leadsFound)} leads found</span>
                    <span>Target: {formatNumber(c.leadsTarget)}</span>
                  </div>
                  <Progress value={c.leadsFound} max={c.leadsTarget} />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold">{formatNumber(c.leadsFound)}</p>
                    <p className="text-[10px] text-muted-foreground">Found</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{formatNumber(c.qualified)}</p>
                    <p className="text-[10px] text-muted-foreground">Qualified</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{formatNumber(c.converted)}</p>
                    <p className="text-[10px] text-muted-foreground">Converted</p>
                  </div>
                </div>

                {/* Sources */}
                <div className="flex flex-wrap gap-1">
                  {c.sources.map((s) => (
                    <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                  ))}
                </div>

                {/* Cost / ROI */}
                <div className="flex items-center justify-between border-t pt-3 text-sm">
                  <span className="text-muted-foreground">Cost: {formatCurrency(c.cost)}</span>
                  <span className="font-medium text-green-600">ROI: {c.roi}%</span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.company}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{lead.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{lead.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn("h-full rounded-full", scoreBarColor(lead.score))}
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{lead.score}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={gradeColors[lead.grade]}>{lead.grade}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[lead.status]}>{lead.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{lead.source}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Scoring Tab */}
        <TabsContent value="scoring">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Score Breakdown */}
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold text-lg">Scoring Model Breakdown</h3>
              <div className="space-y-4">
                {[
                  { label: "Fit Score", max: 50, color: "bg-blue-500", value: 50 },
                  { label: "Intent Score", max: 30, color: "bg-purple-500", value: 30 },
                  { label: "Engagement Score", max: 20, color: "bg-orange-500", value: 20 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-muted-foreground">0 - {item.max} pts</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", item.color)}
                        style={{ width: `${(item.value / 100) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Criteria Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Criteria</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scoringCriteria.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs text-muted-foreground">{row.category}</TableCell>
                      <TableCell className="text-sm">{row.criteria}</TableCell>
                      <TableCell className="text-right font-medium">{row.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Grade Distribution */}
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold text-lg">Grade Distribution</h3>
              <div className="space-y-3">
                {gradeDistribution.map((item) => (
                  <div key={item.grade} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge className={gradeColors[item.grade]}>{item.grade}</Badge>
                        <span className="text-muted-foreground">
                          {item.grade === "A" && "Hot leads - ready to close"}
                          {item.grade === "B" && "Warm leads - nurture ready"}
                          {item.grade === "C" && "Cool leads - needs warming"}
                          {item.grade === "D" && "Cold leads - low priority"}
                        </span>
                      </div>
                      <span className="font-semibold">{item.percentage}%</span>
                    </div>
                    <div className="h-6 w-full overflow-hidden rounded bg-muted">
                      <div
                        className={cn("h-full rounded transition-all", item.color)}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-lg border bg-muted/50 p-4">
                <h4 className="mb-2 text-sm font-semibold">Grade Thresholds</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium text-green-700">A:</span> Score 80-100</div>
                  <div><span className="font-medium text-blue-700">B:</span> Score 60-79</div>
                  <div><span className="font-medium text-yellow-700">C:</span> Score 40-59</div>
                  <div><span className="font-medium text-red-700">D:</span> Score 0-39</div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Target Profiles Tab */}
        <TabsContent value="profiles">
          <div className="grid gap-4 md:grid-cols-2">
            {targetProfiles.map((tp) => (
              <Card key={tp.id} className="p-5 space-y-3">
                <h3 className="font-semibold text-lg">{tp.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Industry</span>
                    <span className="font-medium">{tp.industry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Company Size</span>
                    <span className="font-medium">{tp.companySize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Geography</span>
                    <span className="font-medium">{tp.geography}</span>
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Tech Stack</p>
                  <div className="flex flex-wrap gap-1">
                    {tp.techStack.map((t) => (
                      <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Target Job Titles</p>
                  <div className="flex flex-wrap gap-1">
                    {tp.jobTitles.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Campaign Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Lead Generation Campaign</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Campaign Name</label>
              <Input
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g. SaaS Decision Makers Q2"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Target Profile</label>
              <Select
                value={targetProfile}
                onChange={(v) => setTargetProfile(v)}
                placeholder="Select a target profile"
                options={[
                  ...targetProfiles.map((tp) => ({ label: tp.name, value: String(tp.id) })),
                  { label: "+ Create New Profile", value: "new" },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Target Lead Count</label>
                <Input
                  type="number"
                  value={targetLeadCount}
                  onChange={(e) => setTargetLeadCount(e.target.value)}
                  placeholder="e.g. 1000"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Budget</label>
                <Input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 2000"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Data Sources</label>
              <div className="grid grid-cols-2 gap-2">
                {allSources.map((source) => (
                  <label key={source} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedSources.includes(source)}
                      onChange={() => toggleSource(source)}
                      className="h-4 w-4 rounded border-input"
                    />
                    {source}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => { console.log("Creating campaign..."); setDialogOpen(false); }}>
              Create Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Inline Icons ---
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}
