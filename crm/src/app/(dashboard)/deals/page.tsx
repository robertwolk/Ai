"use client";

import { useState } from "react";
import Link from "next/link";
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
  ChevronDown,
  DollarSign,
  TrendingUp,
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn, formatCurrency, formatDate, getInitials } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────

type Stage =
  | "lead"
  | "qualified"
  | "meeting_booked"
  | "proposal_sent"
  | "negotiation"
  | "won"
  | "lost";

type Pipeline = "sales" | "partnerships";

interface Deal {
  id: string;
  title: string;
  contactName: string;
  value: number;
  stage: Stage;
  pipeline: Pipeline;
  probability: number;
  expectedClose: string;
  createdAt: string;
}

// ── Stage config ───────────────────────────────────────────────────────

const STAGES: { id: Stage; label: string; color: string; headerBg: string }[] =
  [
    {
      id: "lead",
      label: "Lead",
      color: "bg-gray-100 text-gray-700",
      headerBg: "bg-gray-500",
    },
    {
      id: "qualified",
      label: "Qualified",
      color: "bg-blue-100 text-blue-700",
      headerBg: "bg-blue-500",
    },
    {
      id: "meeting_booked",
      label: "Meeting Booked",
      color: "bg-indigo-100 text-indigo-700",
      headerBg: "bg-indigo-500",
    },
    {
      id: "proposal_sent",
      label: "Proposal Sent",
      color: "bg-purple-100 text-purple-700",
      headerBg: "bg-purple-500",
    },
    {
      id: "negotiation",
      label: "Negotiation",
      color: "bg-orange-100 text-orange-700",
      headerBg: "bg-orange-500",
    },
    {
      id: "won",
      label: "Won",
      color: "bg-green-100 text-green-700",
      headerBg: "bg-green-500",
    },
    {
      id: "lost",
      label: "Lost",
      color: "bg-red-100 text-red-700",
      headerBg: "bg-red-500",
    },
  ];

// ── Mock data ──────────────────────────────────────────────────────────

const INITIAL_DEALS: Deal[] = [
  {
    id: "d1",
    title: "Enterprise License",
    contactName: "Sarah Chen",
    value: 120000,
    stage: "negotiation",
    pipeline: "sales",
    probability: 70,
    expectedClose: "2026-04-28",
    createdAt: "2026-02-10",
  },
  {
    id: "d2",
    title: "Annual SaaS Contract",
    contactName: "Michael Torres",
    value: 85000,
    stage: "proposal_sent",
    pipeline: "sales",
    probability: 50,
    expectedClose: "2026-05-15",
    createdAt: "2026-01-22",
  },
  {
    id: "d3",
    title: "Consulting Engagement",
    contactName: "Jessica Park",
    value: 45000,
    stage: "qualified",
    pipeline: "sales",
    probability: 30,
    expectedClose: "2026-06-01",
    createdAt: "2026-03-05",
  },
  {
    id: "d4",
    title: "Platform Migration",
    contactName: "David Nakamura",
    value: 150000,
    stage: "meeting_booked",
    pipeline: "sales",
    probability: 40,
    expectedClose: "2026-05-20",
    createdAt: "2026-02-28",
  },
  {
    id: "d5",
    title: "API Integration Package",
    contactName: "Emily Rodriguez",
    value: 32000,
    stage: "lead",
    pipeline: "sales",
    probability: 10,
    expectedClose: "2026-07-10",
    createdAt: "2026-03-18",
  },
  {
    id: "d6",
    title: "Cloud Infrastructure Deal",
    contactName: "James Wilson",
    value: 98000,
    stage: "won",
    pipeline: "sales",
    probability: 100,
    expectedClose: "2026-03-15",
    createdAt: "2025-12-01",
  },
  {
    id: "d7",
    title: "Data Analytics Suite",
    contactName: "Aisha Patel",
    value: 67000,
    stage: "proposal_sent",
    pipeline: "sales",
    probability: 55,
    expectedClose: "2026-04-30",
    createdAt: "2026-02-14",
  },
  {
    id: "d8",
    title: "Security Audit Contract",
    contactName: "Robert Kim",
    value: 28000,
    stage: "lead",
    pipeline: "sales",
    probability: 15,
    expectedClose: "2026-08-01",
    createdAt: "2026-03-25",
  },
  {
    id: "d9",
    title: "CRM Implementation",
    contactName: "Lisa Chang",
    value: 75000,
    stage: "negotiation",
    pipeline: "sales",
    probability: 65,
    expectedClose: "2026-04-20",
    createdAt: "2026-01-15",
  },
  {
    id: "d10",
    title: "Marketing Automation",
    contactName: "Carlos Mendez",
    value: 54000,
    stage: "qualified",
    pipeline: "sales",
    probability: 25,
    expectedClose: "2026-06-15",
    createdAt: "2026-03-10",
  },
  {
    id: "d11",
    title: "Support Tier Upgrade",
    contactName: "Nina Kowalski",
    value: 18000,
    stage: "meeting_booked",
    pipeline: "sales",
    probability: 35,
    expectedClose: "2026-05-05",
    createdAt: "2026-03-01",
  },
  {
    id: "d12",
    title: "White-Label Partnership",
    contactName: "Thomas Grant",
    value: 140000,
    stage: "proposal_sent",
    pipeline: "partnerships",
    probability: 45,
    expectedClose: "2026-05-30",
    createdAt: "2026-02-20",
  },
  {
    id: "d13",
    title: "Reseller Agreement",
    contactName: "Olivia Martin",
    value: 95000,
    stage: "negotiation",
    pipeline: "partnerships",
    probability: 60,
    expectedClose: "2026-04-25",
    createdAt: "2026-01-30",
  },
  {
    id: "d14",
    title: "Co-Marketing Initiative",
    contactName: "Daniel Okafor",
    value: 35000,
    stage: "qualified",
    pipeline: "partnerships",
    probability: 20,
    expectedClose: "2026-07-01",
    createdAt: "2026-03-12",
  },
  {
    id: "d15",
    title: "Training Program License",
    contactName: "Rachel Adams",
    value: 22000,
    stage: "won",
    pipeline: "sales",
    probability: 100,
    expectedClose: "2026-03-01",
    createdAt: "2025-11-15",
  },
  {
    id: "d16",
    title: "Mobile App Development",
    contactName: "Kevin Liu",
    value: 110000,
    stage: "meeting_booked",
    pipeline: "sales",
    probability: 40,
    expectedClose: "2026-06-10",
    createdAt: "2026-03-08",
  },
  {
    id: "d17",
    title: "Infrastructure Monitoring",
    contactName: "Sophie Williams",
    value: 42000,
    stage: "lead",
    pipeline: "sales",
    probability: 10,
    expectedClose: "2026-08-15",
    createdAt: "2026-03-28",
  },
  {
    id: "d18",
    title: "E-commerce Integration",
    contactName: "Marcus Johnson",
    value: 58000,
    stage: "lost",
    pipeline: "sales",
    probability: 0,
    expectedClose: "2026-03-20",
    createdAt: "2026-01-05",
  },
  {
    id: "d19",
    title: "Tech Alliance Program",
    contactName: "Amanda Foster",
    value: 80000,
    stage: "lead",
    pipeline: "partnerships",
    probability: 15,
    expectedClose: "2026-09-01",
    createdAt: "2026-03-22",
  },
  {
    id: "d20",
    title: "DevOps Toolchain Bundle",
    contactName: "Ryan Zhao",
    value: 63000,
    stage: "qualified",
    pipeline: "sales",
    probability: 30,
    expectedClose: "2026-06-20",
    createdAt: "2026-03-15",
  },
];

// ── Component ──────────────────────────────────────────────────────────

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [selectedPipeline, setSelectedPipeline] =
    useState<Pipeline>("sales");
  const [view, setView] = useState<"board" | "list">("board");
  const [dialogOpen, setDialogOpen] = useState(false);

  // New deal form state
  const [newDeal, setNewDeal] = useState({
    title: "",
    contactName: "",
    value: "",
    stage: "lead" as Stage,
    pipeline: "sales" as Pipeline,
    probability: "10",
    expectedClose: "",
  });

  const filteredDeals = deals.filter(
    (d) => d.pipeline === selectedPipeline
  );

  const totalValue = filteredDeals.reduce((sum, d) => sum + d.value, 0);
  const weightedValue = filteredDeals.reduce(
    (sum, d) => sum + d.value * (d.probability / 100),
    0
  );

  // Group deals by stage
  const dealsByStage = STAGES.reduce(
    (acc, stage) => {
      acc[stage.id] = filteredDeals.filter((d) => d.stage === stage.id);
      return acc;
    },
    {} as Record<Stage, Deal[]>
  );

  function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const newStage = destination.droppableId as Stage;
    const stageMeta = STAGES.find((s) => s.id === newStage);

    setDeals((prev) =>
      prev.map((d) => {
        if (d.id === draggableId) {
          return {
            ...d,
            stage: newStage,
            probability:
              newStage === "won"
                ? 100
                : newStage === "lost"
                  ? 0
                  : d.probability,
          };
        }
        return d;
      })
    );
  }

  function handleAddDeal() {
    const deal: Deal = {
      id: `d${Date.now()}`,
      title: newDeal.title,
      contactName: newDeal.contactName,
      value: parseFloat(newDeal.value) || 0,
      stage: newDeal.stage,
      pipeline: newDeal.pipeline,
      probability: parseInt(newDeal.probability) || 10,
      expectedClose: newDeal.expectedClose,
      createdAt: new Date().toISOString().split("T")[0],
    };
    console.log("New deal added:", deal);
    setDeals((prev) => [...prev, deal]);
    setDialogOpen(false);
    setNewDeal({
      title: "",
      contactName: "",
      value: "",
      stage: "lead",
      pipeline: selectedPipeline,
      probability: "10",
      expectedClose: "",
    });
  }

  function stageLabel(stage: Stage) {
    return STAGES.find((s) => s.id === stage)?.label ?? stage;
  }

  function stageColor(stage: Stage) {
    return STAGES.find((s) => s.id === stage)?.color ?? "";
  }

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Deal Pipeline</h1>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent">
              {selectedPipeline === "sales" ? "Sales" : "Partnerships"}
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedPipeline("sales")}>
                Sales
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedPipeline("partnerships")}
              >
                Partnerships
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
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
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Deal
          </Button>
        </div>
      </div>

      {/* ── Pipeline value summary ─────────────────────────────── */}
      <div className="flex flex-wrap gap-4">
        <Card className="flex-1 min-w-[200px]">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-blue-100 p-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pipeline Value</p>
              <p className="text-xl font-bold">{formatCurrency(totalValue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-[200px]">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-green-100 p-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Weighted Value</p>
              <p className="text-xl font-bold">
                {formatCurrency(weightedValue)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Board view ─────────────────────────────────────────── */}
      {view === "board" && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STAGES.map((stage) => {
              const stageDeals = dealsByStage[stage.id] || [];
              const stageTotal = stageDeals.reduce(
                (s, d) => s + d.value,
                0
              );

              return (
                <div
                  key={stage.id}
                  className="flex w-[280px] min-w-[280px] flex-col rounded-lg border bg-muted/30"
                >
                  {/* Column header */}
                  <div className="p-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          stage.headerBg
                        )}
                      />
                      <span className="text-sm font-semibold">
                        {stage.label}
                      </span>
                      <Badge
                        variant="secondary"
                        className="ml-auto text-xs"
                      >
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
                        {stageDeals.map((deal, index) => (
                          <Draggable
                            key={deal.id}
                            draggableId={deal.id}
                            index={index}
                          >
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
                                    <div
                                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary"
                                    >
                                      {getInitials(deal.contactName)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-sm font-medium">
                                        {deal.title}
                                      </p>
                                      <p className="truncate text-xs text-muted-foreground">
                                        {deal.contactName}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="mt-2 flex items-center justify-between text-xs">
                                    <span className="font-semibold">
                                      {formatCurrency(deal.value)}
                                    </span>
                                    <span className="text-muted-foreground">
                                      {deal.probability}%
                                    </span>
                                  </div>
                                  <p className="mt-1 text-[11px] text-muted-foreground">
                                    Close: {formatDate(deal.expectedClose)}
                                  </p>
                                </Link>
                              </div>
                            )}
                          </Draggable>
                        ))}
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

      {/* ── List view ──────────────────────────────────────────── */}
      {view === "list" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-medium">Deal Title</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Stage</th>
                  <th className="px-4 py-3 font-medium text-right">Value</th>
                  <th className="px-4 py-3 font-medium text-right">
                    Probability
                  </th>
                  <th className="px-4 py-3 font-medium">Expected Close</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map((deal) => (
                  <tr
                    key={deal.id}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/deals/${deal.id}`}
                        className="font-medium hover:underline"
                      >
                        {deal.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {deal.contactName}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={stageColor(deal.stage)}>
                        {stageLabel(deal.stage)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(deal.value)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {deal.probability}%
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(deal.expectedClose)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(deal.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Add Deal dialog ────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Deal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="deal-title">Title</Label>
              <Input
                id="deal-title"
                placeholder="Deal title"
                value={newDeal.title}
                onChange={(e) =>
                  setNewDeal((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deal-contact">Contact Name</Label>
              <Input
                id="deal-contact"
                placeholder="Contact name"
                value={newDeal.contactName}
                onChange={(e) =>
                  setNewDeal((p) => ({ ...p, contactName: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="deal-value">Value ($)</Label>
                <Input
                  id="deal-value"
                  type="number"
                  placeholder="0"
                  value={newDeal.value}
                  onChange={(e) =>
                    setNewDeal((p) => ({ ...p, value: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deal-probability">Probability (%)</Label>
                <Input
                  id="deal-probability"
                  type="number"
                  min="0"
                  max="100"
                  value={newDeal.probability}
                  onChange={(e) =>
                    setNewDeal((p) => ({ ...p, probability: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Stage</Label>
                <Select
                  value={newDeal.stage}
                  onChange={(val) =>
                    setNewDeal((p) => ({ ...p, stage: val as Stage }))
                  }
                  options={STAGES.map((s) => ({
                    label: s.label,
                    value: s.id,
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Pipeline</Label>
                <Select
                  value={newDeal.pipeline}
                  onChange={(val) =>
                    setNewDeal((p) => ({
                      ...p,
                      pipeline: val as Pipeline,
                    }))
                  }
                  options={[
                    { label: "Sales", value: "sales" },
                    { label: "Partnerships", value: "partnerships" },
                  ]}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deal-close">Expected Close Date</Label>
              <Input
                id="deal-close"
                type="date"
                value={newDeal.expectedClose}
                onChange={(e) =>
                  setNewDeal((p) => ({
                    ...p,
                    expectedClose: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDeal} disabled={!newDeal.title}>
              Add Deal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
