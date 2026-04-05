"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  Plus,
  LayoutGrid,
  List,
  DollarSign,
  TrendingUp,
  Hash,
  BarChart3,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { cn, formatCurrency, formatDate, getInitials } from "@/lib/utils";

// -- Types --

interface ApiDeal {
  id: string;
  title: string;
  value: number;
  currency: string;
  stage: string;
  probability: number;
  expectedCloseDate: string | null;
  actualCloseDate: string | null;
  lostReason: string | null;
  sourcePlatform: string | null;
  sourceCampaign: string | null;
  pipelineId: string;
  contactId: string;
  createdAt: string;
  updatedAt: string;
  contact: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company: string | null;
  };
  pipeline: {
    id: string;
    name: string;
  };
}

interface ApiPipeline {
  id: string;
  name: string;
  stages: { name: string; probability: number }[];
  isDefault: boolean;
  totalDeals: number;
  dealCountByStage: Record<string, { count: number; totalValue: number }>;
}

interface ApiContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string | null;
}

type Stage =
  | "LEAD"
  | "QUALIFIED"
  | "MEETING_BOOKED"
  | "PROPOSAL_SENT"
  | "NEGOTIATION"
  | "WON"
  | "LOST";

// -- Stage config --

const STAGES: { id: Stage; label: string; color: string; dotColor: string; badgeBg: string }[] = [
  { id: "LEAD", label: "Lead", color: "bg-gray-100 text-gray-700", dotColor: "bg-gray-500", badgeBg: "bg-gray-500" },
  { id: "QUALIFIED", label: "Qualified", color: "bg-blue-100 text-blue-700", dotColor: "bg-blue-500", badgeBg: "bg-blue-500" },
  { id: "MEETING_BOOKED", label: "Meeting Booked", color: "bg-indigo-100 text-indigo-700", dotColor: "bg-indigo-500", badgeBg: "bg-indigo-500" },
  { id: "PROPOSAL_SENT", label: "Proposal Sent", color: "bg-purple-100 text-purple-700", dotColor: "bg-purple-500", badgeBg: "bg-purple-500" },
  { id: "NEGOTIATION", label: "Negotiation", color: "bg-orange-100 text-orange-700", dotColor: "bg-orange-500", badgeBg: "bg-orange-500" },
  { id: "WON", label: "Won", color: "bg-green-100 text-green-700", dotColor: "bg-green-500", badgeBg: "bg-green-500" },
  { id: "LOST", label: "Lost", color: "bg-red-100 text-red-700", dotColor: "bg-red-500", badgeBg: "bg-red-500" },
];

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

function getPriorityFromProbability(probability: number): string {
  if (probability >= 60) return "high";
  if (probability >= 30) return "medium";
  return "low";
}

function stageLabel(stage: string) {
  return STAGES.find((s) => s.id === stage)?.label ?? stage;
}

function stageColor(stage: string) {
  return STAGES.find((s) => s.id === stage)?.color ?? "";
}

// -- Sort helpers --
type SortField = "title" | "contact" | "stage" | "value" | "probability" | "expectedClose" | "createdAt";
type SortDir = "asc" | "desc";

function contactName(deal: ApiDeal) {
  return `${deal.contact.firstName} ${deal.contact.lastName}`;
}

// -- Component --

export default function DealsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Data state
  const [deals, setDeals] = useState<ApiDeal[]>([]);
  const [pipelines, setPipelines] = useState<ApiPipeline[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");
  const [view, setView] = useState<"board" | "list">("board");
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<Stage[]>([]);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [lostDialogOpen, setLostDialogOpen] = useState(false);
  const [lostReason, setLostReason] = useState("");
  const [pendingLostDealId, setPendingLostDealId] = useState<string | null>(null);

  // New deal form
  const [newDeal, setNewDeal] = useState({
    title: "",
    contactId: "",
    value: "",
    currency: "USD",
    pipelineId: "",
    stage: "LEAD" as Stage,
    probability: "10",
    expectedCloseDate: "",
  });

  // Contact search for add dialog
  const [contactSearch, setContactSearch] = useState("");
  const [contactResults, setContactResults] = useState<ApiContact[]>([]);
  const [contactLoading, setContactLoading] = useState(false);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [selectedContactLabel, setSelectedContactLabel] = useState("");
  const contactSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // -- Data fetching --

  const fetchPipelines = useCallback(async () => {
    try {
      const res = await fetch("/api/pipelines");
      if (!res.ok) throw new Error("Failed to fetch pipelines");
      const data: ApiPipeline[] = await res.json();
      setPipelines(data);
      if (data.length > 0 && !selectedPipelineId) {
        const defaultPipeline = data.find((p) => p.isDefault) || data[0];
        setSelectedPipelineId(defaultPipeline.id);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load pipelines", variant: "destructive" });
    }
  }, [selectedPipelineId, toast]);

  const fetchDeals = useCallback(async () => {
    if (!selectedPipelineId) return;
    try {
      const res = await fetch(`/api/deals?pipelineId=${selectedPipelineId}&limit=100`);
      if (!res.ok) throw new Error("Failed to fetch deals");
      const data = await res.json();
      setDeals(data.deals || []);
    } catch {
      toast({ title: "Error", description: "Failed to load deals", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [selectedPipelineId, toast]);

  useEffect(() => {
    fetchPipelines();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedPipelineId) {
      setLoading(true);
      fetchDeals();
    }
  }, [selectedPipelineId, fetchDeals]);

  // Contact search debounce
  useEffect(() => {
    if (contactSearchTimeout.current) clearTimeout(contactSearchTimeout.current);
    if (!contactSearch.trim()) {
      setContactResults([]);
      return;
    }
    setContactLoading(true);
    contactSearchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/contacts?q=${encodeURIComponent(contactSearch)}&limit=10`);
        if (res.ok) {
          const data = await res.json();
          setContactResults(data.contacts || []);
        }
      } catch {
        // ignore
      } finally {
        setContactLoading(false);
      }
    }, 300);
  }, [contactSearch]);

  // -- Filtering & sorting --

  const filteredDeals = deals.filter((d) => {
    if (stageFilter.length > 0 && !stageFilter.includes(d.stage as Stage)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = contactName(d).toLowerCase();
      if (!d.title.toLowerCase().includes(q) && !name.includes(q)) return false;
    }
    return true;
  });

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case "title":
        cmp = a.title.localeCompare(b.title);
        break;
      case "contact":
        cmp = contactName(a).localeCompare(contactName(b));
        break;
      case "stage": {
        const ai = STAGES.findIndex((s) => s.id === a.stage);
        const bi = STAGES.findIndex((s) => s.id === b.stage);
        cmp = ai - bi;
        break;
      }
      case "value":
        cmp = a.value - b.value;
        break;
      case "probability":
        cmp = a.probability - b.probability;
        break;
      case "expectedClose":
        cmp = (a.expectedCloseDate || "").localeCompare(b.expectedCloseDate || "");
        break;
      case "createdAt":
        cmp = a.createdAt.localeCompare(b.createdAt);
        break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  // -- Summary calculations --

  const totalValue = filteredDeals.reduce((sum, d) => sum + d.value, 0);
  const weightedValue = filteredDeals.reduce((sum, d) => sum + d.value * (d.probability / 100), 0);
  const avgDealSize = filteredDeals.length > 0 ? totalValue / filteredDeals.length : 0;

  // Group deals by stage for board view
  const dealsByStage = STAGES.reduce((acc, stage) => {
    acc[stage.id] = filteredDeals.filter((d) => d.stage === stage.id);
    return acc;
  }, {} as Record<Stage, ApiDeal[]>);

  // -- Drag and drop --

  async function onDragEnd(result: DropResult) {
    const { destination, draggableId } = result;
    if (!destination) return;

    const newStage = destination.droppableId as Stage;
    const deal = deals.find((d) => d.id === draggableId);
    if (!deal || deal.stage === newStage) return;

    // Moving to Lost: prompt for reason
    if (newStage === "LOST") {
      setPendingLostDealId(draggableId);
      setLostReason("");
      setLostDialogOpen(true);
      return;
    }

    // Optimistic update
    setDeals((prev) =>
      prev.map((d) =>
        d.id === draggableId
          ? { ...d, stage: newStage, probability: newStage === "WON" ? 100 : d.probability }
          : d
      )
    );

    try {
      const body: Record<string, unknown> = { stage: newStage };
      if (newStage === "WON") body.probability = 100;

      const res = await fetch(`/api/deals/${draggableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to update deal");
      toast({ title: "Deal updated", description: `Moved to ${stageLabel(newStage)}` });
      fetchDeals();
    } catch {
      toast({ title: "Error", description: "Failed to move deal", variant: "destructive" });
      fetchDeals(); // revert
    }
  }

  async function handleConfirmLost() {
    if (!pendingLostDealId) return;

    setDeals((prev) =>
      prev.map((d) =>
        d.id === pendingLostDealId ? { ...d, stage: "LOST", probability: 0 } : d
      )
    );

    try {
      const res = await fetch(`/api/deals/${pendingLostDealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: "LOST", probability: 0, lostReason }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Deal marked as Lost" });
      fetchDeals();
    } catch {
      toast({ title: "Error", description: "Failed to update deal", variant: "destructive" });
      fetchDeals();
    } finally {
      setLostDialogOpen(false);
      setPendingLostDealId(null);
      setLostReason("");
    }
  }

  // -- Add deal --

  async function handleAddDeal() {
    if (!newDeal.title || !newDeal.contactId || !newDeal.pipelineId) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newDeal.title,
          contactId: newDeal.contactId,
          value: parseFloat(newDeal.value) || 0,
          currency: newDeal.currency,
          pipelineId: newDeal.pipelineId,
          stage: newDeal.stage,
          probability: parseInt(newDeal.probability) || 10,
          expectedCloseDate: newDeal.expectedCloseDate || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create deal");
      }

      toast({ title: "Deal created", description: `"${newDeal.title}" has been added` });
      setAddDialogOpen(false);
      resetNewDeal();
      fetchDeals();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create deal",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function resetNewDeal() {
    setNewDeal({
      title: "",
      contactId: "",
      value: "",
      currency: "USD",
      pipelineId: selectedPipelineId,
      stage: "LEAD",
      probability: "10",
      expectedCloseDate: "",
    });
    setContactSearch("");
    setSelectedContactLabel("");
    setContactResults([]);
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />;
  }

  function toggleStageFilter(stage: Stage) {
    setStageFilter((prev) =>
      prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]
    );
  }

  if (loading && deals.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentPipeline = pipelines.find((p) => p.id === selectedPipelineId);

  return (
    <div className="space-y-6">
      {/* -- Header -- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Deal Pipeline</h1>
          <Select
            value={selectedPipelineId}
            onChange={(val) => setSelectedPipelineId(val)}
            options={pipelines.map((p) => ({ label: p.name, value: p.id }))}
            className="w-[180px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[200px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex rounded-md border">
            <Button
              variant={view === "board" ? "default" : "ghost"}
              size="icon"
              className="rounded-r-none"
              onClick={() => setView("board")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="icon"
              className="rounded-l-none"
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => { resetNewDeal(); setAddDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Deal
          </Button>
        </div>
      </div>

      {/* -- Stage filter chips -- */}
      <div className="flex flex-wrap gap-2">
        {STAGES.map((stage) => {
          const isActive = stageFilter.includes(stage.id);
          return (
            <button
              key={stage.id}
              onClick={() => toggleStageFilter(stage.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                isActive
                  ? stage.color + " border-transparent"
                  : "border-border text-muted-foreground hover:bg-accent"
              )}
            >
              <div className={cn("h-2 w-2 rounded-full", stage.dotColor)} />
              {stage.label}
              {isActive && <X className="h-3 w-3" />}
            </button>
          );
        })}
        {stageFilter.length > 0 && (
          <button
            onClick={() => setStageFilter([])}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* -- Summary cards -- */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-blue-100 p-2.5">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Pipeline</p>
              <p className="text-lg font-bold">{formatCurrency(totalValue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-green-100 p-2.5">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Weighted Value</p>
              <p className="text-lg font-bold">{formatCurrency(weightedValue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-purple-100 p-2.5">
              <Hash className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Deals Count</p>
              <p className="text-lg font-bold">{filteredDeals.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-orange-100 p-2.5">
              <BarChart3 className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Avg Deal Size</p>
              <p className="text-lg font-bold">{formatCurrency(avgDealSize)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* -- Board view -- */}
      {view === "board" && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STAGES.map((stage) => {
              const stageDeals = dealsByStage[stage.id] || [];
              const stageTotal = stageDeals.reduce((s, d) => s + d.value, 0);

              return (
                <div
                  key={stage.id}
                  className="flex w-[280px] min-w-[280px] flex-col rounded-lg border bg-muted/30"
                >
                  {/* Column header */}
                  <div className="p-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2.5 w-2.5 rounded-full", stage.dotColor)} />
                      <span className="text-sm font-semibold">{stage.label}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {stageDeals.length}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatCurrency(stageTotal)}
                    </p>
                  </div>

                  {/* Droppable column */}
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "flex flex-1 flex-col gap-2 p-2 pt-0 min-h-[80px] transition-colors",
                          snapshot.isDraggingOver && "bg-accent/40 rounded-b-lg"
                        )}
                      >
                        {stageDeals.map((deal, index) => {
                          const priority = getPriorityFromProbability(deal.probability);
                          return (
                            <Draggable key={deal.id} draggableId={deal.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={cn(
                                    "rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md",
                                    snapshot.isDragging && "shadow-lg ring-2 ring-primary/20"
                                  )}
                                >
                                  <Link
                                    href={`/deals/${deal.id}`}
                                    className="block"
                                    onClick={(e) => {
                                      if (snapshot.isDragging) e.preventDefault();
                                    }}
                                  >
                                    <div className="flex items-start gap-2">
                                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                        {getInitials(contactName(deal))}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                          <p className="truncate text-sm font-medium">{deal.title}</p>
                                          <div className={cn("h-2 w-2 shrink-0 rounded-full", PRIORITY_COLORS[priority])} title={`${priority} priority`} />
                                        </div>
                                        <p className="truncate text-xs text-muted-foreground">
                                          {contactName(deal)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-xs">
                                      <span className="font-semibold">{formatCurrency(deal.value, deal.currency)}</span>
                                      <span className="text-muted-foreground">{deal.probability}%</span>
                                    </div>
                                    {deal.expectedCloseDate && (
                                      <p className="mt-1 text-[11px] text-muted-foreground">
                                        Close: {formatDate(deal.expectedCloseDate)}
                                      </p>
                                    )}
                                  </Link>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* -- List view -- */}
      {view === "list" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-medium">
                    <button className="inline-flex items-center" onClick={() => handleSort("title")}>
                      Deal Title <SortIcon field="title" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <button className="inline-flex items-center" onClick={() => handleSort("contact")}>
                      Contact <SortIcon field="contact" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <button className="inline-flex items-center" onClick={() => handleSort("stage")}>
                      Stage <SortIcon field="stage" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium text-right">
                    <button className="inline-flex items-center ml-auto" onClick={() => handleSort("value")}>
                      Value <SortIcon field="value" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium text-right">
                    <button className="inline-flex items-center ml-auto" onClick={() => handleSort("probability")}>
                      Probability <SortIcon field="probability" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <button className="inline-flex items-center" onClick={() => handleSort("expectedClose")}>
                      Expected Close <SortIcon field="expectedClose" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <button className="inline-flex items-center" onClick={() => handleSort("createdAt")}>
                      Created <SortIcon field="createdAt" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedDeals.map((deal) => (
                  <tr
                    key={deal.id}
                    className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                    onClick={() => router.push(`/deals/${deal.id}`)}
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium">{deal.title}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {contactName(deal)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={stageColor(deal.stage)}>
                        {stageLabel(deal.stage)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(deal.value, deal.currency)}
                    </td>
                    <td className="px-4 py-3 text-right">{deal.probability}%</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : "---"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(deal.createdAt)}
                    </td>
                  </tr>
                ))}
                {sortedDeals.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      No deals found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* -- Lost Reason Dialog -- */}
      <Dialog open={lostDialogOpen} onOpenChange={setLostDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Deal as Lost</DialogTitle>
            <DialogDescription>
              Please provide a reason for losing this deal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="lost-reason">Lost Reason</Label>
              <Input
                id="lost-reason"
                placeholder="e.g., Went with competitor, Budget constraints..."
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setLostDialogOpen(false); setPendingLostDealId(null); }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmLost}>
              Mark as Lost
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* -- Add Deal Dialog -- */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Deal</DialogTitle>
            <DialogDescription>
              Create a new deal and add it to your pipeline.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="deal-title">Title *</Label>
              <Input
                id="deal-title"
                placeholder="Deal title"
                value={newDeal.title}
                onChange={(e) => setNewDeal((p) => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Contact *</Label>
              <div className="relative">
                <Input
                  placeholder="Search contacts..."
                  value={selectedContactLabel || contactSearch}
                  onChange={(e) => {
                    setContactSearch(e.target.value);
                    setSelectedContactLabel("");
                    setNewDeal((p) => ({ ...p, contactId: "" }));
                    setShowContactDropdown(true);
                  }}
                  onFocus={() => {
                    if (contactSearch || contactResults.length > 0) setShowContactDropdown(true);
                  }}
                />
                {contactLoading && (
                  <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
                {showContactDropdown && contactResults.length > 0 && !selectedContactLabel && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-48 overflow-y-auto">
                    {contactResults.map((c) => (
                      <button
                        key={c.id}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                        onClick={() => {
                          const label = `${c.firstName} ${c.lastName}${c.company ? ` (${c.company})` : ""}`;
                          setNewDeal((p) => ({ ...p, contactId: c.id }));
                          setSelectedContactLabel(label);
                          setContactSearch("");
                          setShowContactDropdown(false);
                        }}
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {getInitials(`${c.firstName} ${c.lastName}`)}
                        </div>
                        <div>
                          <p className="font-medium">{c.firstName} {c.lastName}</p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="deal-value">Value</Label>
                <Input
                  id="deal-value"
                  type="number"
                  placeholder="0"
                  value={newDeal.value}
                  onChange={(e) => setNewDeal((p) => ({ ...p, value: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Currency</Label>
                <Select
                  value={newDeal.currency}
                  onChange={(val) => setNewDeal((p) => ({ ...p, currency: val }))}
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
                <Label>Pipeline</Label>
                <Select
                  value={newDeal.pipelineId || selectedPipelineId}
                  onChange={(val) => setNewDeal((p) => ({ ...p, pipelineId: val }))}
                  options={pipelines.map((p) => ({ label: p.name, value: p.id }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Stage</Label>
                <Select
                  value={newDeal.stage}
                  onChange={(val) => setNewDeal((p) => ({ ...p, stage: val as Stage }))}
                  options={STAGES.map((s) => ({ label: s.label, value: s.id }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="deal-probability">Probability (%)</Label>
                <Input
                  id="deal-probability"
                  type="number"
                  min="0"
                  max="100"
                  value={newDeal.probability}
                  onChange={(e) => setNewDeal((p) => ({ ...p, probability: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deal-close">Expected Close</Label>
                <Input
                  id="deal-close"
                  type="date"
                  value={newDeal.expectedCloseDate}
                  onChange={(e) => setNewDeal((p) => ({ ...p, expectedCloseDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddDeal}
              disabled={!newDeal.title || !newDeal.contactId || submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Deal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
