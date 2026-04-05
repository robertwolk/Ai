"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  FileText,
  Send,
  ChevronLeft,
  ChevronRight,
  Building2,
  Clock,
  Target,
  DollarSign,
  Loader2,
  Plus,
  Video,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { cn, formatCurrency, formatDate, formatDateTime, getInitials } from "@/lib/utils";

// -- Types --

type Stage =
  | "LEAD"
  | "QUALIFIED"
  | "MEETING_BOOKED"
  | "PROPOSAL_SENT"
  | "NEGOTIATION"
  | "WON"
  | "LOST";

interface DealContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
}

interface DealPipeline {
  id: string;
  name: string;
  stages: string;
}

interface DealActivity {
  id: string;
  type: string;
  subject: string;
  body: string | null;
  outcome: string | null;
  createdAt: string;
  completedAt: string | null;
  contact: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

interface DealDetail {
  id: string;
  title: string;
  value: number;
  currency: string;
  stage: Stage;
  probability: number;
  expectedCloseDate: string | null;
  actualCloseDate: string | null;
  lostReason: string | null;
  sourcePlatform: string | null;
  sourceCampaign: string | null;
  pipelineId: string;
  contactId: string;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
  contact: DealContact;
  pipeline: DealPipeline;
  activities: DealActivity[];
}

interface ApiPipeline {
  id: string;
  name: string;
  stages: { name: string; probability: number }[];
  isDefault: boolean;
}

// -- Stage config --

const STAGES_ORDERED: { id: Stage; label: string }[] = [
  { id: "LEAD", label: "Lead" },
  { id: "QUALIFIED", label: "Qualified" },
  { id: "MEETING_BOOKED", label: "Meeting Booked" },
  { id: "PROPOSAL_SENT", label: "Proposal Sent" },
  { id: "NEGOTIATION", label: "Negotiation" },
  { id: "WON", label: "Won" },
  { id: "LOST", label: "Lost" },
];

const STAGE_COLORS: Record<Stage, string> = {
  LEAD: "bg-gray-100 text-gray-700",
  QUALIFIED: "bg-blue-100 text-blue-700",
  MEETING_BOOKED: "bg-indigo-100 text-indigo-700",
  PROPOSAL_SENT: "bg-purple-100 text-purple-700",
  NEGOTIATION: "bg-orange-100 text-orange-700",
  WON: "bg-green-100 text-green-700",
  LOST: "bg-red-100 text-red-700",
};

const STAGE_DOT_COLORS: Record<Stage, string> = {
  LEAD: "bg-gray-500",
  QUALIFIED: "bg-blue-500",
  MEETING_BOOKED: "bg-indigo-500",
  PROPOSAL_SENT: "bg-purple-500",
  NEGOTIATION: "bg-orange-500",
  WON: "bg-green-500",
  LOST: "bg-red-500",
};

const ACTIVITY_ICONS: Record<string, typeof Mail> = {
  EMAIL: Mail,
  CALL: Phone,
  MEETING: Calendar,
  NOTE: FileText,
  TASK: Target,
  AD_CLICK: Target,
  PAGE_VIEW: Target,
  FORM_SUBMIT: Send,
};

const ACTIVITY_COLORS: Record<string, string> = {
  EMAIL: "bg-blue-100 text-blue-600",
  CALL: "bg-green-100 text-green-600",
  MEETING: "bg-purple-100 text-purple-600",
  NOTE: "bg-yellow-100 text-yellow-600",
  TASK: "bg-orange-100 text-orange-600",
  AD_CLICK: "bg-pink-100 text-pink-600",
  PAGE_VIEW: "bg-cyan-100 text-cyan-600",
  FORM_SUBMIT: "bg-teal-100 text-teal-600",
};

function stageLabel(stage: string) {
  return STAGES_ORDERED.find((s) => s.id === stage)?.label ?? stage;
}

// -- Component --

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const dealId = params.id as string;

  // Data state
  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [pipelines, setPipelines] = useState<ApiPipeline[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    value: "",
    currency: "USD",
    stage: "LEAD" as Stage,
    probability: "",
    expectedCloseDate: "",
    pipelineId: "",
    lostReason: "",
    sourcePlatform: "",
    sourceCampaign: "",
  });
  const [saving, setSaving] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    type: "NOTE",
    subject: "",
    body: "",
  });
  const [addingActivity, setAddingActivity] = useState(false);

  // -- Data fetching --

  const fetchDeal = useCallback(async () => {
    try {
      const res = await fetch(`/api/deals/${dealId}`);
      if (!res.ok) {
        if (res.status === 404) {
          toast({ title: "Not found", description: "Deal not found", variant: "destructive" });
          router.push("/deals");
          return;
        }
        throw new Error("Failed to fetch deal");
      }
      const data: DealDetail = await res.json();
      setDeal(data);
    } catch {
      toast({ title: "Error", description: "Failed to load deal", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [dealId, router, toast]);

  const fetchPipelines = useCallback(async () => {
    try {
      const res = await fetch("/api/pipelines");
      if (res.ok) {
        const data = await res.json();
        setPipelines(data);
      }
    } catch {
      // not critical
    }
  }, []);

  useEffect(() => {
    fetchDeal();
    fetchPipelines();
  }, [fetchDeal, fetchPipelines]);

  // -- Stage navigation --

  const progressStages = STAGES_ORDERED.filter((s) => s.id !== "LOST");

  function getStageIndex(stage: Stage) {
    return progressStages.findIndex((s) => s.id === stage);
  }

  const currentStageIndex = deal ? getStageIndex(deal.stage) : -1;
  const progressPercent = !deal
    ? 0
    : deal.stage === "LOST"
      ? 0
      : deal.stage === "WON"
        ? 100
        : ((currentStageIndex + 1) / progressStages.length) * 100;

  const canMoveForward = deal
    ? deal.stage !== "WON" && deal.stage !== "LOST" && currentStageIndex < progressStages.length - 1
    : false;

  const canMoveBackward = deal
    ? deal.stage !== "LOST" && currentStageIndex > 0
    : false;

  async function moveStage(direction: "forward" | "backward") {
    if (!deal) return;
    const idx = getStageIndex(deal.stage);
    const newIdx = direction === "forward" ? idx + 1 : idx - 1;
    if (newIdx < 0 || newIdx >= progressStages.length) return;

    const newStage = progressStages[newIdx].id;

    try {
      const body: Record<string, unknown> = { stage: newStage };
      if (newStage === "WON") body.probability = 100;

      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed");
      toast({ title: "Stage updated", description: `Moved to ${stageLabel(newStage)}` });
      fetchDeal();
    } catch {
      toast({ title: "Error", description: "Failed to update stage", variant: "destructive" });
    }
  }

  // -- Notes --

  async function handleAddNote() {
    if (!newNote.trim() || !deal) return;
    setAddingNote(true);

    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: deal.contactId,
          dealId: deal.id,
          type: "NOTE",
          subject: "Note added",
          body: newNote.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed");
      toast({ title: "Note added" });
      setNewNote("");
      fetchDeal();
    } catch {
      toast({ title: "Error", description: "Failed to add note", variant: "destructive" });
    } finally {
      setAddingNote(false);
    }
  }

  // -- Log Activity --

  async function handleLogActivity() {
    if (!newActivity.subject || !deal) return;
    setAddingActivity(true);

    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: deal.contactId,
          dealId: deal.id,
          type: newActivity.type,
          subject: newActivity.subject,
          body: newActivity.body || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed");
      toast({ title: "Activity logged" });
      setNewActivity({ type: "NOTE", subject: "", body: "" });
      setActivityDialogOpen(false);
      fetchDeal();
    } catch {
      toast({ title: "Error", description: "Failed to log activity", variant: "destructive" });
    } finally {
      setAddingActivity(false);
    }
  }

  // -- Edit deal --

  function openEditSheet() {
    if (!deal) return;
    setEditForm({
      title: deal.title,
      value: String(deal.value),
      currency: deal.currency,
      stage: deal.stage,
      probability: String(deal.probability),
      expectedCloseDate: deal.expectedCloseDate
        ? new Date(deal.expectedCloseDate).toISOString().split("T")[0]
        : "",
      pipelineId: deal.pipelineId,
      lostReason: deal.lostReason || "",
      sourcePlatform: deal.sourcePlatform || "",
      sourceCampaign: deal.sourceCampaign || "",
    });
    setEditSheetOpen(true);
  }

  async function handleSaveEdit() {
    if (!deal) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          value: parseFloat(editForm.value) || 0,
          currency: editForm.currency,
          stage: editForm.stage,
          probability: parseInt(editForm.probability) || 0,
          expectedCloseDate: editForm.expectedCloseDate || null,
          pipelineId: editForm.pipelineId,
          lostReason: editForm.lostReason || null,
          sourcePlatform: editForm.sourcePlatform || null,
          sourceCampaign: editForm.sourceCampaign || null,
        }),
      });

      if (!res.ok) throw new Error("Failed");
      toast({ title: "Deal updated" });
      setEditSheetOpen(false);
      fetchDeal();
    } catch {
      toast({ title: "Error", description: "Failed to update deal", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  // -- Delete deal --

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/deals/${dealId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Deal deleted" });
      router.push("/deals");
    } catch {
      toast({ title: "Error", description: "Failed to delete deal", variant: "destructive" });
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  }

  // -- Computed values --

  const daysSinceCreated = deal
    ? Math.floor((Date.now() - new Date(deal.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const weightedValue = deal ? deal.value * (deal.probability / 100) : 0;

  const noteActivities = deal
    ? deal.activities.filter((a) => a.type === "NOTE")
    : [];

  const allActivities = deal
    ? [...deal.activities].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  // -- Loading --

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Deal not found</p>
        <Link href="/deals">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Deals
          </Button>
        </Link>
      </div>
    );
  }

  const contactFullName = `${deal.contact.firstName} ${deal.contact.lastName}`;

  return (
    <div className="space-y-6">
      {/* -- Header -- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/deals">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{deal.title}</h1>
              <Badge className={STAGE_COLORS[deal.stage]}>
                {stageLabel(deal.stage)}
              </Badge>
            </div>
            <p className="text-lg font-semibold text-muted-foreground">
              {formatCurrency(deal.value, deal.currency)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={openEditSheet}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* -- Main layout: 2/3 + 1/3 -- */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Stage progress */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-medium">Deal Progress</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canMoveBackward}
                    onClick={() => moveStage("backward")}
                  >
                    <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canMoveForward}
                    onClick={() => moveStage("forward")}
                  >
                    Next
                    <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <Progress value={progressPercent} />
              <div className="mt-2 flex justify-between">
                {progressStages.map((s, i) => {
                  const isActive = deal.stage !== "LOST" && i <= currentStageIndex;
                  const isCurrent = s.id === deal.stage;
                  return (
                    <span
                      key={s.id}
                      className={cn(
                        "text-[10px] transition-colors",
                        isCurrent
                          ? "font-bold text-primary"
                          : isActive
                            ? "font-medium text-primary"
                            : "text-muted-foreground"
                      )}
                    >
                      {s.label}
                    </span>
                  );
                })}
              </div>
              {deal.stage === "LOST" && (
                <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  This deal was marked as lost.{" "}
                  {deal.lostReason && (
                    <span className="font-medium">Reason: {deal.lostReason}</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Value</p>
                <p className="mt-1 text-sm font-bold">{formatCurrency(deal.value, deal.currency)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Weighted</p>
                <p className="mt-1 text-sm font-bold">{formatCurrency(weightedValue, deal.currency)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Probability</p>
                <p className="mt-1 text-sm font-bold">{deal.probability}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Days in Pipeline</p>
                <p className="mt-1 text-sm font-bold">{daysSinceCreated}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Expected Close</p>
                <p className="mt-1 text-sm font-bold">
                  {deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : "---"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="activity">
            <TabsList>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            {/* Activity tab */}
            <TabsContent value="activity" className="space-y-4">
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setActivityDialogOpen(true)}>
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Log Activity
                </Button>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>
                    Recent activities related to this deal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {allActivities.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No activities yet. Log your first activity to get started.
                    </p>
                  ) : (
                    <div className="relative space-y-6">
                      <div className="absolute left-[17px] top-2 bottom-2 w-px bg-border" />
                      {allActivities.map((activity) => {
                        const Icon = ACTIVITY_ICONS[activity.type] || MessageSquare;
                        const colorClass = ACTIVITY_COLORS[activity.type] || "bg-gray-100 text-gray-600";
                        return (
                          <div key={activity.id} className="relative flex gap-4 pl-0">
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
                                <p className="text-sm font-medium">{activity.subject}</p>
                                <span className="text-xs text-muted-foreground">
                                  {formatDateTime(activity.createdAt)}
                                </span>
                              </div>
                              {activity.body && (
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                  {activity.body}
                                </p>
                              )}
                              {activity.outcome && (
                                <p className="mt-0.5 text-xs text-muted-foreground italic">
                                  Outcome: {activity.outcome}
                                </p>
                              )}
                              <Badge variant="secondary" className="mt-1 text-[10px]">
                                {activity.type}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
                  <Textarea
                    placeholder="Write a note about this deal..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="mt-2 flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || addingNote}
                    >
                      {addingNote ? (
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-3.5 w-3.5" />
                      )}
                      Add Note
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {noteActivities.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    No notes yet. Add your first note above.
                  </CardContent>
                </Card>
              ) : (
                noteActivities.map((note) => (
                  <Card key={note.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{note.subject}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(note.createdAt)}
                            </span>
                          </div>
                          {note.body && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {note.body}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Details tab */}
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Deal Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Title</span>
                      <span className="text-sm font-medium">{deal.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Value</span>
                      <span className="text-sm font-medium">{formatCurrency(deal.value, deal.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Weighted Value</span>
                      <span className="text-sm font-medium">{formatCurrency(weightedValue, deal.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Stage</span>
                      <Badge className={STAGE_COLORS[deal.stage]}>{stageLabel(deal.stage)}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Probability</span>
                      <span className="text-sm font-medium">{deal.probability}%</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Pipeline</span>
                      <span className="text-sm font-medium">{deal.pipeline.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Expected Close</span>
                      <span className="text-sm font-medium">
                        {deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : "---"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Actual Close</span>
                      <span className="text-sm font-medium">
                        {deal.actualCloseDate ? formatDate(deal.actualCloseDate) : "---"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Created</span>
                      <span className="text-sm font-medium">{formatDate(deal.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Days in Pipeline</span>
                      <span className="text-sm font-medium">{daysSinceCreated} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Source Attribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Source Platform</span>
                    <span className="text-sm font-medium">{deal.sourcePlatform || "---"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Source Campaign</span>
                    <span className="text-sm font-medium">{deal.sourceCampaign || "---"}</span>
                  </div>
                  {deal.lostReason && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Lost Reason</span>
                      <span className="text-sm font-medium text-red-600">{deal.lostReason}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right column (1/3) */}
        <div className="space-y-6">
          {/* Contact card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  {getInitials(contactFullName)}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <Link
                    href={`/contacts/${deal.contact.id}`}
                    className="font-medium hover:underline"
                  >
                    {contactFullName}
                  </Link>
                  {deal.contact.jobTitle && (
                    <p className="text-xs text-muted-foreground">{deal.contact.jobTitle}</p>
                  )}
                  {deal.contact.company && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      {deal.contact.company}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {deal.contact.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <a href={`mailto:${deal.contact.email}`} className="truncate hover:underline">
                      {deal.contact.email}
                    </a>
                  </div>
                )}
                {deal.contact.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <a href={`tel:${deal.contact.phone}`} className="hover:underline">
                      {deal.contact.phone}
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    if (deal.contact.email) window.location.href = `mailto:${deal.contact.email}`;
                  }}
                >
                  <Mail className="mr-1 h-3 w-3" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    if (deal.contact.phone) window.location.href = `tel:${deal.contact.phone}`;
                  }}
                >
                  <Phone className="mr-1 h-3 w-3" />
                  Call
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setNewActivity({ type: "MEETING", subject: "", body: "" });
                    setActivityDialogOpen(true);
                  }}
                >
                  <Video className="mr-1 h-3 w-3" />
                  Meet
                </Button>
              </div>

              <div className="mt-3">
                <Link href={`/contacts/${deal.contact.id}`}>
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    View Full Contact Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick info card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Pipeline</p>
                  <p className="text-sm font-medium">{deal.pipeline.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">{formatDate(deal.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium">{formatDate(deal.updatedAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Activities</p>
                  <p className="text-sm font-medium">{deal.activities.length} total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* -- Delete Confirmation Dialog -- */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deal.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Deal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* -- Edit Sheet -- */}
      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-[450px]">
          <SheetHeader>
            <SheetTitle>Edit Deal</SheetTitle>
          </SheetHeader>
          <div className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-value">Value</Label>
                <Input
                  id="edit-value"
                  type="number"
                  value={editForm.value}
                  onChange={(e) => setEditForm((p) => ({ ...p, value: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Currency</Label>
                <Select
                  value={editForm.currency}
                  onChange={(val) => setEditForm((p) => ({ ...p, currency: val }))}
                  options={[
                    { label: "USD", value: "USD" },
                    { label: "EUR", value: "EUR" },
                    { label: "GBP", value: "GBP" },
                  ]}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Stage</Label>
                <Select
                  value={editForm.stage}
                  onChange={(val) => setEditForm((p) => ({ ...p, stage: val as Stage }))}
                  options={STAGES_ORDERED.map((s) => ({ label: s.label, value: s.id }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-prob">Probability (%)</Label>
                <Input
                  id="edit-prob"
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.probability}
                  onChange={(e) => setEditForm((p) => ({ ...p, probability: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Pipeline</Label>
              <Select
                value={editForm.pipelineId}
                onChange={(val) => setEditForm((p) => ({ ...p, pipelineId: val }))}
                options={pipelines.map((p) => ({ label: p.name, value: p.id }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-close">Expected Close Date</Label>
              <Input
                id="edit-close"
                type="date"
                value={editForm.expectedCloseDate}
                onChange={(e) => setEditForm((p) => ({ ...p, expectedCloseDate: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-source">Source Platform</Label>
              <Input
                id="edit-source"
                value={editForm.sourcePlatform}
                placeholder="e.g., GOOGLE, META"
                onChange={(e) => setEditForm((p) => ({ ...p, sourcePlatform: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-campaign">Source Campaign</Label>
              <Input
                id="edit-campaign"
                value={editForm.sourceCampaign}
                placeholder="Campaign name"
                onChange={(e) => setEditForm((p) => ({ ...p, sourceCampaign: e.target.value }))}
              />
            </div>
            {editForm.stage === "LOST" && (
              <div className="grid gap-2">
                <Label htmlFor="edit-lost">Lost Reason</Label>
                <Input
                  id="edit-lost"
                  value={editForm.lostReason}
                  placeholder="Why was this deal lost?"
                  onChange={(e) => setEditForm((p) => ({ ...p, lostReason: e.target.value }))}
                />
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditSheetOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={saving || !editForm.title}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* -- Log Activity Dialog -- */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
            <DialogDescription>Record an activity for this deal.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={newActivity.type}
                onChange={(val) => setNewActivity((p) => ({ ...p, type: val }))}
                options={[
                  { label: "Note", value: "NOTE" },
                  { label: "Call", value: "CALL" },
                  { label: "Email", value: "EMAIL" },
                  { label: "Meeting", value: "MEETING" },
                  { label: "Task", value: "TASK" },
                ]}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="act-subject">Subject *</Label>
              <Input
                id="act-subject"
                placeholder="Activity subject"
                value={newActivity.subject}
                onChange={(e) => setNewActivity((p) => ({ ...p, subject: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="act-body">Details</Label>
              <Textarea
                id="act-body"
                placeholder="Additional details..."
                value={newActivity.body}
                onChange={(e) => setNewActivity((p) => ({ ...p, body: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivityDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleLogActivity}
              disabled={!newActivity.subject || addingActivity}
            >
              {addingActivity && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Log Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
