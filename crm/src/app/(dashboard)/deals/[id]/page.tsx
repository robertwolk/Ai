"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  FileText,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn, formatCurrency, formatDate, formatDateTime, getInitials } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────

type Stage =
  | "lead"
  | "qualified"
  | "meeting_booked"
  | "proposal_sent"
  | "negotiation"
  | "won"
  | "lost";

interface DealDetail {
  id: string;
  title: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactCompany: string;
  value: number;
  stage: Stage;
  pipeline: string;
  probability: number;
  expectedClose: string;
  actualClose: string | null;
  source: string;
  sourceCampaign: string;
  createdAt: string;
  description: string;
}

interface Activity {
  id: string;
  type: "email" | "call" | "meeting" | "note" | "stage_change";
  title: string;
  description: string;
  date: string;
  user: string;
}

interface Note {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

// ── Stage config ───────────────────────────────────────────────────────

const STAGES_ORDERED: { id: Stage; label: string }[] = [
  { id: "lead", label: "Lead" },
  { id: "qualified", label: "Qualified" },
  { id: "meeting_booked", label: "Meeting Booked" },
  { id: "proposal_sent", label: "Proposal Sent" },
  { id: "negotiation", label: "Negotiation" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
];

const STAGE_COLORS: Record<Stage, string> = {
  lead: "bg-gray-100 text-gray-700",
  qualified: "bg-blue-100 text-blue-700",
  meeting_booked: "bg-indigo-100 text-indigo-700",
  proposal_sent: "bg-purple-100 text-purple-700",
  negotiation: "bg-orange-100 text-orange-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

// ── Mock data ──────────────────────────────────────────────────────────

const MOCK_DEALS: Record<string, DealDetail> = {
  d1: {
    id: "d1",
    title: "Enterprise License",
    contactName: "Sarah Chen",
    contactEmail: "sarah.chen@acmecorp.com",
    contactPhone: "+1 (415) 555-0142",
    contactCompany: "Acme Corporation",
    value: 120000,
    stage: "negotiation",
    pipeline: "Sales",
    probability: 70,
    expectedClose: "2026-04-28",
    actualClose: null,
    source: "LinkedIn",
    sourceCampaign: "Q1 Enterprise Outreach",
    createdAt: "2026-02-10",
    description:
      "Enterprise-wide license agreement for 500+ seats. Includes premium support and custom integrations. Decision maker is VP of Engineering. Competitor evaluation in parallel with Salesforce.",
  },
  d2: {
    id: "d2",
    title: "Annual SaaS Contract",
    contactName: "Michael Torres",
    contactEmail: "m.torres@globexinc.com",
    contactPhone: "+1 (212) 555-0198",
    contactCompany: "Globex Inc.",
    value: 85000,
    stage: "proposal_sent",
    pipeline: "Sales",
    probability: 50,
    expectedClose: "2026-05-15",
    actualClose: null,
    source: "Website",
    sourceCampaign: "Inbound Demo Request",
    createdAt: "2026-01-22",
    description:
      "Annual SaaS subscription with advanced analytics module. Client currently using a legacy on-premise solution and looking to modernize.",
  },
};

// Fallback for any deal id
function getDeal(id: string): DealDetail {
  if (MOCK_DEALS[id]) return MOCK_DEALS[id];
  return {
    id,
    title: "Enterprise License",
    contactName: "Sarah Chen",
    contactEmail: "sarah.chen@acmecorp.com",
    contactPhone: "+1 (415) 555-0142",
    contactCompany: "Acme Corporation",
    value: 120000,
    stage: "negotiation",
    pipeline: "Sales",
    probability: 70,
    expectedClose: "2026-04-28",
    actualClose: null,
    source: "LinkedIn",
    sourceCampaign: "Q1 Enterprise Outreach",
    createdAt: "2026-02-10",
    description:
      "Enterprise-wide license agreement for 500+ seats. Includes premium support and custom integrations. Decision maker is VP of Engineering.",
  };
}

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "a1",
    type: "stage_change",
    title: "Stage changed to Negotiation",
    description: "Moved from Proposal Sent to Negotiation",
    date: "2026-03-28T14:30:00",
    user: "Alex Morgan",
  },
  {
    id: "a2",
    type: "email",
    title: "Proposal follow-up sent",
    description:
      "Sent follow-up email regarding the enterprise proposal with updated pricing tiers.",
    date: "2026-03-25T10:15:00",
    user: "Alex Morgan",
  },
  {
    id: "a3",
    type: "meeting",
    title: "Discovery call completed",
    description:
      "45-minute call with Sarah and the engineering team to discuss integration requirements and timeline.",
    date: "2026-03-18T15:00:00",
    user: "Alex Morgan",
  },
  {
    id: "a4",
    type: "call",
    title: "Initial outreach call",
    description:
      "Connected with Sarah Chen via LinkedIn. She expressed interest in enterprise features.",
    date: "2026-03-10T09:45:00",
    user: "Alex Morgan",
  },
  {
    id: "a5",
    type: "stage_change",
    title: "Stage changed to Proposal Sent",
    description: "Moved from Meeting Booked to Proposal Sent",
    date: "2026-03-20T11:00:00",
    user: "Alex Morgan",
  },
  {
    id: "a6",
    type: "note",
    title: "Added meeting notes",
    description: "Documented key requirements from the discovery call.",
    date: "2026-03-18T16:30:00",
    user: "Alex Morgan",
  },
];

const INITIAL_NOTES: Note[] = [
  {
    id: "n1",
    content:
      "Client is evaluating us against Salesforce and HubSpot. Key differentiator is our API flexibility and custom integration support. Budget approved by CFO.",
    author: "Alex Morgan",
    createdAt: "2026-03-28T14:00:00",
  },
  {
    id: "n2",
    content:
      "Discovery call went well. Engineering team likes the developer experience. Main concern is migration complexity from their legacy system. Offered POC environment.",
    author: "Alex Morgan",
    createdAt: "2026-03-18T16:30:00",
  },
  {
    id: "n3",
    content:
      "Sarah mentioned they need to go live before Q3. Timeline is tight but doable if we start onboarding in May.",
    author: "Jordan Lee",
    createdAt: "2026-03-12T10:00:00",
  },
];

// ── Activity type config ───────────────────────────────────────────────

const ACTIVITY_ICONS: Record<Activity["type"], typeof Mail> = {
  email: Mail,
  call: Phone,
  meeting: Calendar,
  note: FileText,
  stage_change: MessageSquare,
};

const ACTIVITY_COLORS: Record<Activity["type"], string> = {
  email: "bg-blue-100 text-blue-600",
  call: "bg-green-100 text-green-600",
  meeting: "bg-purple-100 text-purple-600",
  note: "bg-yellow-100 text-yellow-600",
  stage_change: "bg-gray-100 text-gray-600",
};

// ── Component ──────────────────────────────────────────────────────────

export default function DealDetailPage() {
  const params = useParams();
  const dealId = params.id as string;
  const deal = getDeal(dealId);

  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [newNote, setNewNote] = useState("");

  // Calculate stage progress
  const stageIndex = STAGES_ORDERED.findIndex((s) => s.id === deal.stage);
  // For "lost", show progress up to negotiation visually
  const progressStages = STAGES_ORDERED.filter(
    (s) => s.id !== "lost"
  );
  const progressIndex =
    deal.stage === "lost"
      ? -1
      : progressStages.findIndex((s) => s.id === deal.stage);
  const progressPercent =
    deal.stage === "lost"
      ? 0
      : deal.stage === "won"
        ? 100
        : ((progressIndex + 1) / progressStages.length) * 100;

  function stageLabel(stage: Stage) {
    return STAGES_ORDERED.find((s) => s.id === stage)?.label ?? stage;
  }

  function handleAddNote() {
    if (!newNote.trim()) return;
    const note: Note = {
      id: `n${Date.now()}`,
      content: newNote.trim(),
      author: "You",
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [note, ...prev]);
    setNewNote("");
  }

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/deals">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {deal.title}
              </h1>
              <Badge className={STAGE_COLORS[deal.stage]}>
                {stageLabel(deal.stage)}
              </Badge>
            </div>
            <p className="text-lg font-semibold text-muted-foreground">
              {formatCurrency(deal.value)}
            </p>
          </div>
        </div>
        <Button variant="outline">
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      {/* ── Deal summary card ──────────────────────────────────── */}
      <Card>
        <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Value</span>
              <span className="text-sm font-medium">
                {formatCurrency(deal.value)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Stage</span>
              <Badge className={STAGE_COLORS[deal.stage]}>
                {stageLabel(deal.stage)}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Probability</span>
              <span className="text-sm font-medium">{deal.probability}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pipeline</span>
              <span className="text-sm font-medium">{deal.pipeline}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Expected Close
              </span>
              <span className="text-sm font-medium">
                {formatDate(deal.expectedClose)}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Actual Close
              </span>
              <span className="text-sm font-medium">
                {deal.actualClose ? formatDate(deal.actualClose) : "---"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Contact</span>
              <span className="text-sm font-medium">{deal.contactName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Source Platform
              </span>
              <span className="text-sm font-medium">{deal.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Source Campaign
              </span>
              <span className="text-sm font-medium">
                {deal.sourceCampaign}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm font-medium">
                {formatDate(deal.createdAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Progress bar ───────────────────────────────────────── */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-medium">Deal Progress</span>
            <span className="text-muted-foreground">
              {stageLabel(deal.stage)}
            </span>
          </div>
          <Progress value={progressPercent} />
          <div className="mt-2 flex justify-between">
            {progressStages.map((s, i) => {
              const isActive = i <= progressIndex;
              return (
                <span
                  key={s.id}
                  className={cn(
                    "text-[10px]",
                    isActive
                      ? "font-medium text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Details tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium">Description</span>
                <p className="mt-1 text-sm text-muted-foreground">
                  {deal.description}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Weighted Value
                  </span>
                  <p className="text-sm font-medium">
                    {formatCurrency(deal.value * (deal.probability / 100))}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Days in Pipeline
                  </span>
                  <p className="text-sm font-medium">
                    {Math.floor(
                      (new Date().getTime() -
                        new Date(deal.createdAt).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  {getInitials(deal.contactName)}
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="font-medium">{deal.contactName}</p>
                    <p className="text-sm text-muted-foreground">
                      {deal.contactCompany}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    {deal.contactEmail}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {deal.contactPhone}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities tab */}
        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                Recent activities related to this deal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-6">
                {/* Timeline line */}
                <div className="absolute left-[17px] top-2 bottom-2 w-px bg-border" />

                {MOCK_ACTIVITIES.sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                ).map((activity) => {
                  const Icon = ACTIVITY_ICONS[activity.type];
                  const colorClass = ACTIVITY_COLORS[activity.type];
                  return (
                    <div
                      key={activity.id}
                      className="relative flex gap-4 pl-0"
                    >
                      <div
                        className={cn(
                          "z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                          colorClass
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 pt-0.5">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {activity.title}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(activity.date)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          by {activity.user}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes tab */}
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Note</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Write a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                >
                  <Send className="mr-2 h-3.5 w-3.5" />
                  Add Note
                </Button>
              </div>
            </CardContent>
          </Card>

          {notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {getInitials(note.author)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {note.author}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(note.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {note.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
