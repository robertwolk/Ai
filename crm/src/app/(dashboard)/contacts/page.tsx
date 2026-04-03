"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getInitials } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  source: string;
  lifecycleStage: string;
  leadScore: number;
  lastActivity: string;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const contacts: Contact[] = [
  { id: "1", firstName: "Sarah", lastName: "Chen", email: "sarah.chen@techcorp.io", phone: "+1 415-555-0101", company: "TechCorp", jobTitle: "VP of Engineering", source: "Google Ads", lifecycleStage: "SQL", leadScore: 87, lastActivity: "2026-04-03T10:30:00" },
  { id: "2", firstName: "Marcus", lastName: "Johnson", email: "m.johnson@acme.com", phone: "+1 212-555-0102", company: "Acme Inc", jobTitle: "CTO", source: "Referral", lifecycleStage: "Opportunity", leadScore: 92, lastActivity: "2026-04-03T09:15:00" },
  { id: "3", firstName: "Emily", lastName: "Rodriguez", email: "emily.r@cloudbase.co", phone: "+1 303-555-0103", company: "CloudBase", jobTitle: "Head of Product", source: "Meta Ads", lifecycleStage: "MQL", leadScore: 64, lastActivity: "2026-04-02T16:45:00" },
  { id: "4", firstName: "James", lastName: "Liu", email: "jliu@innovate.dev", phone: "+1 650-555-0104", company: "Innovate Dev", jobTitle: "CEO", source: "Organic", lifecycleStage: "Customer", leadScore: 95, lastActivity: "2026-04-02T14:20:00" },
  { id: "5", firstName: "Aisha", lastName: "Patel", email: "aisha@startuplab.io", phone: "+1 408-555-0105", company: "StartupLab", jobTitle: "Founder", source: "Cold Email", lifecycleStage: "Lead", leadScore: 45, lastActivity: "2026-04-02T11:00:00" },
  { id: "6", firstName: "David", lastName: "Kim", email: "david.kim@megasys.com", phone: "+1 310-555-0106", company: "MegaSys", jobTitle: "IT Director", source: "Google Ads", lifecycleStage: "SQL", leadScore: 78, lastActivity: "2026-04-01T17:30:00" },
  { id: "7", firstName: "Rachel", lastName: "Adams", email: "radams@freshworks.co", phone: "+1 617-555-0107", company: "FreshWorks", jobTitle: "COO", source: "X Ads", lifecycleStage: "Opportunity", leadScore: 88, lastActivity: "2026-04-01T15:10:00" },
  { id: "8", firstName: "Tom", lastName: "Bradley", email: "tom.b@nextstep.io", phone: "+1 206-555-0108", company: "NextStep", jobTitle: "VP Sales", source: "TikTok Ads", lifecycleStage: "MQL", leadScore: 56, lastActivity: "2026-04-01T10:00:00" },
  { id: "9", firstName: "Nina", lastName: "Okoro", email: "nina.okoro@dataprime.co", phone: "+1 312-555-0109", company: "DataPrime", jobTitle: "Head of Data", source: "Organic", lifecycleStage: "Subscriber", leadScore: 32, lastActivity: "2026-03-31T13:45:00" },
  { id: "10", firstName: "Carlos", lastName: "Mendez", email: "carlos@brightpath.com", phone: "+1 305-555-0110", company: "BrightPath", jobTitle: "Marketing Director", source: "Meta Ads", lifecycleStage: "Lead", leadScore: 51, lastActivity: "2026-03-31T09:20:00" },
  { id: "11", firstName: "Priya", lastName: "Sharma", email: "priya.s@infinityx.io", phone: "+1 512-555-0111", company: "InfinityX", jobTitle: "Product Manager", source: "Referral", lifecycleStage: "MQL", leadScore: 69, lastActivity: "2026-03-30T14:20:00" },
  { id: "12", firstName: "Alex", lastName: "Turner", email: "alex@logicore.dev", phone: "+1 720-555-0112", company: "LogiCore", jobTitle: "Engineering Lead", source: "Cold Email", lifecycleStage: "Lead", leadScore: 41, lastActivity: "2026-03-30T09:00:00" },
  { id: "13", firstName: "Megan", lastName: "Foster", email: "megan.f@syncwave.com", phone: "+1 503-555-0113", company: "SyncWave", jobTitle: "CRO", source: "Google Ads", lifecycleStage: "SQL", leadScore: 83, lastActivity: "2026-03-29T16:30:00" },
  { id: "14", firstName: "Omar", lastName: "Hassan", email: "omar@pixelcraft.io", phone: "+1 404-555-0114", company: "PixelCraft", jobTitle: "Design Lead", source: "Manual", lifecycleStage: "Subscriber", leadScore: 28, lastActivity: "2026-03-29T11:15:00" },
  { id: "15", firstName: "Jessica", lastName: "Wong", email: "jwong@scaleup.co", phone: "+1 214-555-0115", company: "ScaleUp", jobTitle: "VP Operations", source: "TikTok Ads", lifecycleStage: "Customer", leadScore: 91, lastActivity: "2026-03-28T10:00:00" },
];

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

const lifecycleOptions = [
  { label: "All Stages", value: "" },
  { label: "Subscriber", value: "Subscriber" },
  { label: "Lead", value: "Lead" },
  { label: "MQL", value: "MQL" },
  { label: "SQL", value: "SQL" },
  { label: "Opportunity", value: "Opportunity" },
  { label: "Customer", value: "Customer" },
];

const sourceOptions = [
  { label: "All Sources", value: "" },
  { label: "Google Ads", value: "Google Ads" },
  { label: "Meta Ads", value: "Meta Ads" },
  { label: "X Ads", value: "X Ads" },
  { label: "TikTok Ads", value: "TikTok Ads" },
  { label: "Organic", value: "Organic" },
  { label: "Referral", value: "Referral" },
  { label: "Cold Email", value: "Cold Email" },
  { label: "Manual", value: "Manual" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function lifecycleBadgeClass(stage: string) {
  switch (stage) {
    case "Subscriber":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "Lead":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "MQL":
      return "bg-violet-100 text-violet-700 border-violet-200";
    case "SQL":
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "Opportunity":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "Customer":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function sourceBadgeClass(source: string) {
  switch (source) {
    case "Google Ads":
      return "bg-red-50 text-red-700 border-red-200";
    case "Meta Ads":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "X Ads":
      return "bg-slate-50 text-slate-700 border-slate-200";
    case "TikTok Ads":
      return "bg-pink-50 text-pink-700 border-pink-200";
    case "Organic":
      return "bg-green-50 text-green-700 border-green-200";
    case "Referral":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "Cold Email":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "Manual":
      return "bg-orange-50 text-orange-700 border-orange-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

function relativeTime(dateStr: string) {
  const now = new Date("2026-04-03T12:00:00");
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

function scoreColor(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  if (score >= 40) return "bg-orange-400";
  return "bg-red-400";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [lifecycleFilter, setLifecycleFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    source: "",
    lifecycleStage: "",
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return contacts.filter((c) => {
      const matchesSearch =
        !q ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q);
      const matchesLifecycle =
        !lifecycleFilter || c.lifecycleStage === lifecycleFilter;
      const matchesSource = !sourceFilter || c.source === sourceFilter;
      return matchesSearch && matchesLifecycle && matchesSource;
    });
  }, [search, lifecycleFilter, sourceFilter]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("New contact:", form);
    setDialogOpen(false);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      jobTitle: "",
      source: "",
      lifecycleStage: "",
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Add Contact
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new contact.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, firstName: e.target.value }))
                    }
                    placeholder="John"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lastName: e.target.value }))
                    }
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="+1 555-000-0000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={form.company}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, company: e.target.value }))
                    }
                    placeholder="Acme Inc"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={form.jobTitle}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, jobTitle: e.target.value }))
                    }
                    placeholder="VP of Sales"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Source</Label>
                  <Select
                    options={sourceOptions.filter((o) => o.value !== "")}
                    placeholder="Select source"
                    value={form.source}
                    onChange={(v) => setForm((f) => ({ ...f, source: v }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Lifecycle Stage</Label>
                  <Select
                    options={lifecycleOptions.filter((o) => o.value !== "")}
                    placeholder="Select stage"
                    value={form.lifecycleStage}
                    onChange={(v) =>
                      setForm((f) => ({ ...f, lifecycleStage: v }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Contact</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <Input
            className="pl-8"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          className="w-[180px]"
          options={lifecycleOptions}
          value={lifecycleFilter}
          onChange={setLifecycleFilter}
        />
        <Select
          className="w-[180px]"
          options={sourceOptions}
          value={sourceFilter}
          onChange={setSourceFilter}
        />
      </div>

      {/* Contacts Table */}
      <div className="rounded-xl border bg-card shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Lifecycle Stage</TableHead>
              <TableHead>Lead Score</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No contacts found.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((contact) => {
              const fullName = `${contact.firstName} ${contact.lastName}`;
              return (
                <TableRow key={contact.id}>
                  {/* Name */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{fullName}</div>
                        <div className="text-xs text-muted-foreground">
                          {contact.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  {/* Company */}
                  <TableCell>{contact.company}</TableCell>
                  {/* Source */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={sourceBadgeClass(contact.source)}
                    >
                      {contact.source}
                    </Badge>
                  </TableCell>
                  {/* Lifecycle Stage */}
                  <TableCell>
                    <Badge className={lifecycleBadgeClass(contact.lifecycleStage)}>
                      {contact.lifecycleStage}
                    </Badge>
                  </TableCell>
                  {/* Lead Score */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-muted">
                        <div
                          className={`h-2 rounded-full ${scoreColor(contact.leadScore)}`}
                          style={{ width: `${contact.leadScore}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {contact.leadScore}
                      </span>
                    </div>
                  </TableCell>
                  {/* Last Activity */}
                  <TableCell className="text-muted-foreground">
                    {relativeTime(contact.lastActivity)}
                  </TableCell>
                  {/* Actions */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() =>
                            console.log("View", contact.id)
                          }
                        >
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            console.log("Edit", contact.id)
                          }
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() =>
                            console.log("Delete", contact.id)
                          }
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
