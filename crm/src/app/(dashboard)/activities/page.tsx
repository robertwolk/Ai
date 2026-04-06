"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ActivityContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ActivityDeal {
  id: string;
  title: string;
}

interface Activity {
  id: string;
  type: string;
  subject: string;
  body: string | null;
  outcome: string | null;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  contact: ActivityContact | null;
  deal: ActivityDeal | null;
}

interface ContactSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface DealSearchResult {
  id: string;
  title: string;
}

// ---------------------------------------------------------------------------
// Activity type config (icon SVG path, colors)
// ---------------------------------------------------------------------------

const activityTypeConfig: Record<
  string,
  { icon: string; color: string; bgColor: string; label: string }
> = {
  CALL: {
    icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
    color: "text-green-700",
    bgColor: "bg-green-100",
    label: "Call",
  },
  EMAIL: {
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    label: "Email",
  },
  MEETING: {
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    color: "text-indigo-700",
    bgColor: "bg-indigo-100",
    label: "Meeting",
  },
  NOTE: {
    icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    label: "Note",
  },
  TASK: {
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    color: "text-slate-700",
    bgColor: "bg-slate-100",
    label: "Task",
  },
  AD_CLICK: {
    icon: "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122",
    color: "text-pink-700",
    bgColor: "bg-pink-100",
    label: "Ad Click",
  },
  PAGE_VIEW: {
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    label: "Page View",
  },
  FORM_SUBMIT: {
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
    label: "Form Submit",
  },
};

const ALL_TYPES = Object.keys(activityTypeConfig);

const DATE_RANGE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function groupByDate(activities: Activity[]) {
  const now = new Date();
  const todayStr = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups: { label: string; items: Activity[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "This Week", items: [] },
    { label: "Earlier", items: [] },
  ];

  for (const a of activities) {
    const d = new Date(a.createdAt);
    const ds = d.toDateString();
    if (ds === todayStr) groups[0].items.push(a);
    else if (ds === yesterdayStr) groups[1].items.push(a);
    else if (d >= weekAgo) groups[2].items.push(a);
    else groups[3].items.push(a);
  }

  return groups.filter((g) => g.items.length > 0);
}

function contactName(c: ActivityContact | null) {
  if (!c) return "";
  return `${c.firstName} ${c.lastName}`.trim();
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Activity icon component
// ---------------------------------------------------------------------------

function ActivityIcon({ type, size = "md" }: { type: string; size?: "sm" | "md" }) {
  const config = activityTypeConfig[type] || activityTypeConfig.NOTE;
  const sizeClass = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        sizeClass,
        config.bgColor
      )}
    >
      <svg
        className={cn(iconSize, config.color)}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ActivitiesPage() {
  const { toast } = useToast();

  // Data
  const [activities, setActivities] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState("all");
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const typeFilterRef = useRef<HTMLDivElement>(null);

  // View toggle
  const [view, setView] = useState<"timeline" | "table">("timeline");

  // Sort (table view)
  const [sortCol, setSortCol] = useState<string>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Log Activity dialog
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [logType, setLogType] = useState("CALL");
  const [logSubject, setLogSubject] = useState("");
  const [logBody, setLogBody] = useState("");
  const [logOutcome, setLogOutcome] = useState("");
  const [logDueDate, setLogDueDate] = useState("");
  const [logContactQuery, setLogContactQuery] = useState("");
  const [logContactResults, setLogContactResults] = useState<ContactSearchResult[]>([]);
  const [logSelectedContact, setLogSelectedContact] = useState<ContactSearchResult | null>(null);
  const [logDeals, setLogDeals] = useState<DealSearchResult[]>([]);
  const [logSelectedDeal, setLogSelectedDeal] = useState<string>("");
  const [logSaving, setLogSaving] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    callsToday: 0,
    emailsToday: 0,
    meetingsThisWeek: 0,
    tasksOverdue: 0,
  });

  // Close type filter on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (typeFilterRef.current && !typeFilterRef.current.contains(e.target as Node)) {
        setShowTypeFilter(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch activities
  const fetchActivities = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(p));
        params.set("limit", "20");
        if (selectedTypes.length === 1) {
          params.set("type", selectedTypes[0]);
        }
        const res = await fetch(`/api/activities?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (p === 1) {
          setActivities(data.activities);
        } else {
          setActivities((prev) => [...prev, ...data.activities]);
        }
        setTotal(data.total);
        setPage(data.page);
        setTotalPages(data.totalPages);
      } catch {
        toast({ title: "Error", description: "Failed to load activities", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    },
    [selectedTypes, toast]
  );

  useEffect(() => {
    fetchActivities(1);
  }, [fetchActivities]);

  // Compute stats from loaded activities
  useEffect(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    let callsToday = 0;
    let emailsToday = 0;
    let meetingsThisWeek = 0;
    let tasksOverdue = 0;

    for (const a of activities) {
      const d = new Date(a.createdAt);
      if (a.type === "CALL" && d.toDateString() === todayStr) callsToday++;
      if (a.type === "EMAIL" && d.toDateString() === todayStr) emailsToday++;
      if (a.type === "MEETING" && d >= weekAgo) meetingsThisWeek++;
      if (a.type === "TASK" && a.dueDate && new Date(a.dueDate) < now && !a.completedAt)
        tasksOverdue++;
    }

    setStats({ callsToday, emailsToday, meetingsThisWeek, tasksOverdue });
  }, [activities]);

  // Search contacts for Log Activity dialog
  useEffect(() => {
    if (logContactQuery.length < 2) {
      setLogContactResults([]);
      return;
    }
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`/api/contacts?q=${encodeURIComponent(logContactQuery)}&limit=8`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        setLogContactResults(
          (data.contacts || []).map((c: ContactSearchResult) => ({
            id: c.id,
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email,
          }))
        );
      } catch {
        // ignore abort
      }
    })();
    return () => controller.abort();
  }, [logContactQuery]);

  // Fetch deals for selected contact
  useEffect(() => {
    if (!logSelectedContact) {
      setLogDeals([]);
      setLogSelectedDeal("");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/deals?contactId=${logSelectedContact.id}&limit=50`);
        if (!res.ok) return;
        const data = await res.json();
        setLogDeals(
          (data.deals || []).map((d: DealSearchResult) => ({
            id: d.id,
            title: d.title,
          }))
        );
      } catch {
        // ignore
      }
    })();
  }, [logSelectedContact]);

  // Filter activities client-side for search, date range, multi-type
  const filtered = activities.filter((a) => {
    // Multi-type filter
    if (selectedTypes.length > 0 && !selectedTypes.includes(a.type)) return false;

    // Search
    if (search) {
      const q = search.toLowerCase();
      const matchSubject = a.subject.toLowerCase().includes(q);
      const matchContact = contactName(a.contact).toLowerCase().includes(q);
      if (!matchSubject && !matchContact) return false;
    }

    // Date range
    if (dateRange !== "all") {
      const days = parseInt(dateRange, 10);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      if (new Date(a.createdAt) < cutoff) return false;
    }

    return true;
  });

  // Sorting for table view
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortCol) {
      case "type":
        cmp = a.type.localeCompare(b.type);
        break;
      case "subject":
        cmp = a.subject.localeCompare(b.subject);
        break;
      case "contact":
        cmp = contactName(a.contact).localeCompare(contactName(b.contact));
        break;
      case "deal":
        cmp = (a.deal?.title || "").localeCompare(b.deal?.title || "");
        break;
      case "outcome":
        cmp = (a.outcome || "").localeCompare(b.outcome || "");
        break;
      default:
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  function handleSort(col: string) {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("desc");
    }
  }

  function toggleType(t: string) {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  // Reset log dialog
  function resetLogDialog() {
    setLogType("CALL");
    setLogSubject("");
    setLogBody("");
    setLogOutcome("");
    setLogDueDate("");
    setLogContactQuery("");
    setLogContactResults([]);
    setLogSelectedContact(null);
    setLogDeals([]);
    setLogSelectedDeal("");
  }

  async function handleLogSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!logSelectedContact || !logSubject) return;
    setLogSaving(true);
    try {
      const payload: Record<string, unknown> = {
        contactId: logSelectedContact.id,
        type: logType,
        subject: logSubject,
        body: logBody || undefined,
        outcome: logOutcome || undefined,
      };
      if (logSelectedDeal) payload.dealId = logSelectedDeal;
      if (logDueDate) payload.dueDate = logDueDate;

      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create activity");
      }
      toast({ title: "Activity logged", description: `${logType} activity saved successfully.` });
      setShowLogDialog(false);
      resetLogDialog();
      fetchActivities(1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save activity";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLogSaving(false);
    }
  }

  // Sort indicator
  function SortIndicator({ col }: { col: string }) {
    if (sortCol !== col) return <span className="ml-1 text-muted-foreground/40">&#8597;</span>;
    return <span className="ml-1">{sortDir === "asc" ? "\u2191" : "\u2193"}</span>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activities</h1>
          <p className="text-muted-foreground">
            Track all interactions, tasks, and engagement events
          </p>
        </div>
        <Button onClick={() => setShowLogDialog(true)}>Log Activity</Button>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm font-normal">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
          {stats.callsToday} call{stats.callsToday !== 1 ? "s" : ""} today
        </Badge>
        <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm font-normal">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
          {stats.emailsToday} email{stats.emailsToday !== 1 ? "s" : ""} today
        </Badge>
        <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm font-normal">
          <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
          {stats.meetingsThisWeek} meeting{stats.meetingsThisWeek !== 1 ? "s" : ""} this week
        </Badge>
        {stats.tasksOverdue > 0 && (
          <Badge variant="destructive" className="gap-1.5 px-3 py-1.5 text-sm font-normal">
            {stats.tasksOverdue} task{stats.tasksOverdue !== 1 ? "s" : ""} overdue
          </Badge>
        )}
      </div>

      {/* Filters + View Toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <Input
          placeholder="Search by subject or contact..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />

        {/* Type multi-select dropdown */}
        <div className="relative" ref={typeFilterRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTypeFilter((v) => !v)}
          >
            Type{selectedTypes.length > 0 ? ` (${selectedTypes.length})` : ""}
            <svg className="ml-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
          {showTypeFilter && (
            <div className="absolute top-full left-0 mt-1 w-52 rounded-md border bg-popover p-2 shadow-md z-20">
              {ALL_TYPES.map((t) => (
                <label
                  key={t}
                  className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(t)}
                    onChange={() => toggleType(t)}
                    className="h-3.5 w-3.5 rounded border-gray-300"
                  />
                  <ActivityIcon type={t} size="sm" />
                  {activityTypeConfig[t]?.label || t}
                </label>
              ))}
              {selectedTypes.length > 0 && (
                <button
                  className="mt-1 w-full text-xs text-muted-foreground hover:text-foreground text-center py-1"
                  onClick={() => setSelectedTypes([])}
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>

        {/* Date range */}
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="h-8 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          {DATE_RANGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* View toggle */}
        <div className="ml-auto flex items-center rounded-md border p-0.5">
          <button
            className={cn(
              "rounded px-2.5 py-1 text-xs font-medium transition-colors",
              view === "timeline"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setView("timeline")}
          >
            Timeline
          </button>
          <button
            className={cn(
              "rounded px-2.5 py-1 text-xs font-medium transition-colors",
              view === "table"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setView("table")}
          >
            Table
          </button>
        </div>
      </div>

      {/* Content */}
      {loading && activities.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : view === "timeline" ? (
        <TimelineView
          groups={groupByDate(filtered)}
          hasMore={page < totalPages}
          loading={loading}
          onLoadMore={() => fetchActivities(page + 1)}
        />
      ) : (
        <TableView
          activities={sorted}
          sortCol={sortCol}
          sortDir={sortDir}
          onSort={handleSort}
          SortIndicator={SortIndicator}
          page={page}
          totalPages={totalPages}
          total={total}
          loading={loading}
          onPageChange={(p) => fetchActivities(p)}
        />
      )}

      {/* Log Activity Dialog */}
      <Dialog open={showLogDialog} onOpenChange={(o) => { setShowLogDialog(o); if (!o) resetLogDialog(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleLogSubmit}>
            {/* Type */}
            <div>
              <label className="text-sm font-medium">Type</label>
              <select
                className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                value={logType}
                onChange={(e) => setLogType(e.target.value)}
              >
                {["CALL", "EMAIL", "MEETING", "NOTE", "TASK"].map((t) => (
                  <option key={t} value={t}>
                    {activityTypeConfig[t]?.label || t}
                  </option>
                ))}
              </select>
            </div>

            {/* Contact search */}
            <div>
              <label className="text-sm font-medium">
                Contact <span className="text-destructive">*</span>
              </label>
              {logSelectedContact ? (
                <div className="mt-1 flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                  <span className="font-medium">
                    {logSelectedContact.firstName} {logSelectedContact.lastName}
                  </span>
                  <span className="text-muted-foreground">{logSelectedContact.email}</span>
                  <button
                    type="button"
                    className="ml-auto text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setLogSelectedContact(null);
                      setLogContactQuery("");
                    }}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    placeholder="Search contacts..."
                    className="mt-1"
                    value={logContactQuery}
                    onChange={(e) => setLogContactQuery(e.target.value)}
                  />
                  {logContactResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-md border bg-popover shadow-md z-20">
                      {logContactResults.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                          onClick={() => {
                            setLogSelectedContact(c);
                            setLogContactQuery("");
                            setLogContactResults([]);
                          }}
                        >
                          <span className="font-medium">{c.firstName} {c.lastName}</span>{" "}
                          <span className="text-muted-foreground">{c.email}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Deal (optional) */}
            {logDeals.length > 0 && (
              <div>
                <label className="text-sm font-medium">Deal (optional)</label>
                <select
                  className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                  value={logSelectedDeal}
                  onChange={(e) => setLogSelectedDeal(e.target.value)}
                >
                  <option value="">No deal</option>
                  {logDeals.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Subject */}
            <div>
              <label className="text-sm font-medium">
                Subject <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Activity subject"
                className="mt-1"
                value={logSubject}
                onChange={(e) => setLogSubject(e.target.value)}
                required
              />
            </div>

            {/* Body */}
            <div>
              <label className="text-sm font-medium">Notes</label>
              <textarea
                className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[80px]"
                placeholder="Add details..."
                value={logBody}
                onChange={(e) => setLogBody(e.target.value)}
              />
            </div>

            {/* Outcome + Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Outcome</label>
                <Input
                  placeholder="Result"
                  className="mt-1"
                  value={logOutcome}
                  onChange={(e) => setLogOutcome(e.target.value)}
                />
              </div>
              {logType === "TASK" && (
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    className="mt-1"
                    value={logDueDate}
                    onChange={(e) => setLogDueDate(e.target.value)}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowLogDialog(false);
                  resetLogDialog();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={logSaving || !logSelectedContact || !logSubject}>
                {logSaving ? "Saving..." : "Save Activity"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Timeline View
// ---------------------------------------------------------------------------

function TimelineView({
  groups,
  hasMore,
  loading,
  onLoadMore,
}: {
  groups: { label: string; items: Activity[] }[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}) {
  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No activities found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.label}>
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {group.label}
          </h3>
          <div className="relative ml-4 border-l-2 border-muted pl-6 space-y-0">
            {group.items.map((activity) => {
              const config = activityTypeConfig[activity.type] || activityTypeConfig.NOTE;
              return (
                <div key={activity.id} className="relative pb-6 last:pb-0">
                  {/* Dot on the timeline */}
                  <div
                    className={cn(
                      "absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-background",
                      config.bgColor
                    )}
                  >
                    <svg
                      className={cn("h-3 w-3", config.color)}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="rounded-lg border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{activity.subject}</span>
                          <Badge variant="outline" className="text-xs">
                            {config.label}
                          </Badge>
                        </div>
                        {activity.body && (
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {activity.body}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          {activity.contact && (
                            <Link
                              href={`/contacts/${activity.contact.id}`}
                              className="hover:text-primary hover:underline"
                            >
                              {contactName(activity.contact)}
                            </Link>
                          )}
                          {activity.deal && (
                            <Link
                              href={`/deals/${activity.deal.id}`}
                              className="hover:text-primary hover:underline"
                            >
                              {activity.deal.title}
                            </Link>
                          )}
                          {activity.outcome && (
                            <span className="text-muted-foreground">
                              Outcome: {activity.outcome}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                        {formatShortDate(activity.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={onLoadMore} disabled={loading}>
            {loading ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table View
// ---------------------------------------------------------------------------

function TableView({
  activities,
  sortCol,
  onSort,
  SortIndicator,
  page,
  totalPages,
  total,
  loading,
  onPageChange,
}: {
  activities: Activity[];
  sortCol: string;
  sortDir: "asc" | "desc";
  onSort: (col: string) => void;
  SortIndicator: React.FC<{ col: string }>;
  page: number;
  totalPages: number;
  total: number;
  loading: boolean;
  onPageChange: (p: number) => void;
}) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No activities found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer select-none" onClick={() => onSort("type")}>
                Type <SortIndicator col="type" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => onSort("subject")}>
                Subject <SortIndicator col="subject" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => onSort("contact")}>
                Contact <SortIndicator col="contact" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => onSort("deal")}>
                Deal <SortIndicator col="deal" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => onSort("outcome")}>
                Outcome <SortIndicator col="outcome" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => onSort("date")}>
                Date <SortIndicator col="date" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((a) => {
              const config = activityTypeConfig[a.type] || activityTypeConfig.NOTE;
              return (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ActivityIcon type={a.type} size="sm" />
                      <span className="text-xs">{config.label}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {a.subject}
                  </TableCell>
                  <TableCell>
                    {a.contact ? (
                      <Link
                        href={`/contacts/${a.contact.id}`}
                        className="text-sm hover:text-primary hover:underline"
                      >
                        {contactName(a.contact)}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {a.deal ? (
                      <Link
                        href={`/deals/${a.deal.id}`}
                        className="text-sm hover:text-primary hover:underline"
                      >
                        {a.deal.title}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">
                    {a.outcome || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatShortDate(a.createdAt)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <span className="text-sm text-muted-foreground">
            {total} total activit{total === 1 ? "y" : "ies"}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
