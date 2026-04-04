"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
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
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { getInitials, formatDate } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  source: string;
  lifecycleStage: string;
  leadScore: number;
  tags: string;
  createdAt: string;
  updatedAt: string;
  dealCount?: number;
  totalDealValue?: number;
}

interface ContactsResponse {
  contacts: Contact[];
  total: number;
  page: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

const lifecycleOptions = [
  { label: "All Stages", value: "" },
  { label: "Subscriber", value: "SUBSCRIBER" },
  { label: "Lead", value: "LEAD" },
  { label: "MQL", value: "MQL" },
  { label: "SQL", value: "SQL" },
  { label: "Opportunity", value: "OPPORTUNITY" },
  { label: "Customer", value: "CUSTOMER" },
  { label: "Evangelist", value: "EVANGELIST" },
];

const sourceOptions = [
  { label: "All Sources", value: "" },
  { label: "Google Ads", value: "GOOGLE_ADS" },
  { label: "Meta Ads", value: "META_ADS" },
  { label: "X Ads", value: "X_ADS" },
  { label: "TikTok Ads", value: "TIKTOK_ADS" },
  { label: "Organic", value: "ORGANIC" },
  { label: "Referral", value: "REFERRAL" },
  { label: "Cold Email", value: "COLD_EMAIL" },
  { label: "Manual", value: "MANUAL" },
];

const sourceFormOptions = sourceOptions.filter((o) => o.value !== "");
const lifecycleFormOptions = lifecycleOptions.filter((o) => o.value !== "");

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

const sourceDisplayName: Record<string, string> = {
  GOOGLE_ADS: "Google Ads",
  META_ADS: "Meta Ads",
  X_ADS: "X Ads",
  TIKTOK_ADS: "TikTok Ads",
  ORGANIC: "Organic",
  REFERRAL: "Referral",
  COLD_EMAIL: "Cold Email",
  MANUAL: "Manual",
};

const lifecycleDisplayName: Record<string, string> = {
  SUBSCRIBER: "Subscriber",
  LEAD: "Lead",
  MQL: "MQL",
  SQL: "SQL",
  OPPORTUNITY: "Opportunity",
  CUSTOMER: "Customer",
  EVANGELIST: "Evangelist",
};

function lifecycleBadgeClass(stage: string) {
  switch (stage) {
    case "SUBSCRIBER":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "LEAD":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "MQL":
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "SQL":
      return "bg-violet-100 text-violet-700 border-violet-200";
    case "OPPORTUNITY":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "CUSTOMER":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "EVANGELIST":
      return "bg-pink-100 text-pink-700 border-pink-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function sourceBadgeClass(source: string) {
  switch (source) {
    case "GOOGLE_ADS":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "META_ADS":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "X_ADS":
      return "bg-gray-50 text-gray-700 border-gray-200";
    case "TIKTOK_ADS":
      return "bg-pink-50 text-pink-700 border-pink-200";
    case "ORGANIC":
      return "bg-green-50 text-green-700 border-green-200";
    case "REFERRAL":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "COLD_EMAIL":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "MANUAL":
      return "bg-slate-50 text-slate-700 border-slate-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

function scoreColor(score: number) {
  if (score > 60) return "bg-emerald-500";
  if (score >= 30) return "bg-amber-500";
  return "bg-red-400";
}

// ---------------------------------------------------------------------------
// Empty form
// ---------------------------------------------------------------------------

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  jobTitle: "",
  source: "MANUAL",
  lifecycleStage: "LEAD",
  tags: "",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ContactsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Data state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [lifecycleFilter, setLifecycleFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState(emptyForm);

  // Debounce search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [lifecycleFilter, sourceFilter]);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (lifecycleFilter) params.set("lifecycleStage", lifecycleFilter);
      if (sourceFilter) params.set("source", sourceFilter);

      const res = await fetch(`/api/contacts?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: ContactsResponse = await res.json();
      setContacts(data.contacts);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast({ title: "Error", description: "Failed to fetch contacts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, lifecycleFilter, sourceFilter, toast]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Open add dialog
  function openAddDialog() {
    setEditingContact(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  // Open edit dialog
  function openEditDialog(contact: Contact) {
    setEditingContact(contact);
    let tagsStr = "";
    const parsed = typeof contact.tags === "object" ? contact.tags : (() => { try { return JSON.parse(contact.tags || "[]"); } catch { return []; } })();
    tagsStr = Array.isArray(parsed) ? parsed.join(", ") : "";
    setForm({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone || "",
      company: contact.company || "",
      jobTitle: contact.jobTitle || "",
      source: contact.source,
      lifecycleStage: contact.lifecycleStage,
      tags: tagsStr,
    });
    setDialogOpen(true);
  }

  // Submit form (create or update)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone || undefined,
      company: form.company || undefined,
      jobTitle: form.jobTitle || undefined,
      source: form.source,
      lifecycleStage: form.lifecycleStage,
      tags,
    };

    try {
      if (editingContact) {
        const res = await fetch(`/api/contacts/${editingContact.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to update");
        }
        toast({ title: "Contact updated", description: `${form.firstName} ${form.lastName} has been updated.` });
      } else {
        const res = await fetch("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to create");
        }
        toast({ title: "Contact created", description: `${form.firstName} ${form.lastName} has been added.` });
      }
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingContact(null);
      fetchContacts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  // Delete contact
  async function handleDelete() {
    if (!deletingContact) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/contacts/${deletingContact.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast({
        title: "Contact deleted",
        description: `${deletingContact.firstName} ${deletingContact.lastName} has been removed.`,
      });
      setDeleteDialogOpen(false);
      setDeletingContact(null);
      fetchContacts();
    } catch {
      toast({ title: "Error", description: "Failed to delete contact", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  // Pagination helpers
  const startItem = total === 0 ? 0 : (page - 1) * 20 + 1;
  const endItem = Math.min(page * 20, total);

  function pageNumbers() {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your contacts and track their journey through the pipeline.
          </p>
        </div>
        <Button onClick={openAddDialog}>
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
        </Button>
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
        {(debouncedSearch || lifecycleFilter || sourceFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setDebouncedSearch("");
              setLifecycleFilter("");
              setSourceFilter("");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Contacts Table */}
      <div className="rounded-xl border bg-card shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Lifecycle Stage</TableHead>
              <TableHead>Lead Score</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                        <div className="space-y-1.5">
                          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                          <div className="h-3 w-44 rounded bg-muted animate-pulse" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><div className="h-4 w-24 rounded bg-muted animate-pulse" /></TableCell>
                    <TableCell><div className="h-5 w-20 rounded bg-muted animate-pulse" /></TableCell>
                    <TableCell><div className="h-5 w-16 rounded bg-muted animate-pulse" /></TableCell>
                    <TableCell><div className="h-2 w-16 rounded bg-muted animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-20 rounded bg-muted animate-pulse" /></TableCell>
                    <TableCell><div className="h-8 w-8 rounded bg-muted animate-pulse" /></TableCell>
                  </TableRow>
                ))}
              </>
            )}
            {!loading && contacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-muted-foreground/50"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <p className="text-sm text-muted-foreground">No contacts found.</p>
                    <Button variant="outline" size="sm" onClick={openAddDialog}>
                      Add your first contact
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              contacts.map((contact) => {
                const fullName = `${contact.firstName} ${contact.lastName}`;
                return (
                  <TableRow key={contact.id} className="group">
                    {/* Name */}
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <button
                            className="font-medium hover:underline text-left"
                            onClick={() => router.push(`/contacts/${contact.id}`)}
                          >
                            {fullName}
                          </button>
                          <div className="text-xs text-muted-foreground">
                            {contact.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    {/* Company */}
                    <TableCell className="text-muted-foreground">
                      {contact.company || "--"}
                    </TableCell>
                    {/* Source */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={sourceBadgeClass(contact.source)}
                      >
                        {sourceDisplayName[contact.source] || contact.source}
                      </Badge>
                    </TableCell>
                    {/* Lifecycle Stage */}
                    <TableCell>
                      <Badge className={lifecycleBadgeClass(contact.lifecycleStage)}>
                        {lifecycleDisplayName[contact.lifecycleStage] || contact.lifecycleStage}
                      </Badge>
                    </TableCell>
                    {/* Lead Score */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-muted">
                          <div
                            className={`h-2 rounded-full transition-all ${scoreColor(contact.leadScore)}`}
                            style={{ width: `${contact.leadScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {contact.leadScore}
                        </span>
                      </div>
                    </TableCell>
                    {/* Created */}
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(contact.createdAt)}
                    </TableCell>
                    {/* Actions */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-accent transition-opacity">
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
                            onClick={() => router.push(`/contacts/${contact.id}`)}
                          >
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(contact)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setDeletingContact(contact);
                              setDeleteDialogOpen(true);
                            }}
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

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing {startItem}-{endItem} of {total}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              {pageNumbers().map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  className="w-8 px-0"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Contact Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingContact ? "Edit Contact" : "Add New Contact"}
            </DialogTitle>
            <DialogDescription>
              {editingContact
                ? "Update the contact details below."
                : "Fill in the details below to create a new contact."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  required
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  placeholder="John"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  required
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+1 555-000-0000"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  placeholder="Acme Inc"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={form.jobTitle}
                  onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))}
                  placeholder="VP of Sales"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Source</Label>
                <Select
                  options={sourceFormOptions}
                  value={form.source}
                  onChange={(v) => setForm((f) => ({ ...f, source: v }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Lifecycle Stage</Label>
                <Select
                  options={lifecycleFormOptions}
                  value={form.lifecycleStage}
                  onChange={(v) => setForm((f) => ({ ...f, lifecycleStage: v }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="Enterprise, High Value, Tech (comma-separated)"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "Saving..."
                  : editingContact
                    ? "Save Changes"
                    : "Create Contact"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>
                {deletingContact?.firstName} {deletingContact?.lastName}
              </strong>
              ? This action cannot be undone. All associated activities and data will be
              permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingContact(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? "Deleting..." : "Delete Contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
