"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { formatCurrency, formatDate, formatDateTime, getInitials } from "@/lib/utils";

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
  sourceCampaign: string | null;
  sourceAd: string | null;
  sourceKeyword: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  tags: string;
  lifecycleStage: string;
  leadScore: number;
  acquisitionCost: number | null;
  createdAt: string;
  updatedAt: string;
  deals: Deal[];
  activities: Activity[];
  leadScores: LeadScoreEntry[];
}

interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate: string | null;
  actualCloseDate: string | null;
  lostReason: string | null;
  createdAt: string;
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
}

interface LeadScoreEntry {
  id: string;
  fitScore: number;
  intentScore: number;
  engagementScore: number;
  totalScore: number;
  grade: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function lifecycleBadgeClass(stage: string) {
  switch (stage) {
    case "SUBSCRIBER": return "bg-gray-100 text-gray-700 border-gray-200";
    case "LEAD": return "bg-blue-100 text-blue-700 border-blue-200";
    case "MQL": return "bg-violet-100 text-violet-700 border-violet-200";
    case "SQL": return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "OPPORTUNITY": return "bg-amber-100 text-amber-700 border-amber-200";
    case "CUSTOMER": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "EVANGELIST": return "bg-pink-100 text-pink-700 border-pink-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function stageBadgeClass(stage: string) {
  switch (stage) {
    case "LEAD": return "bg-slate-100 text-slate-800 border-slate-200";
    case "QUALIFIED": return "bg-blue-100 text-blue-800 border-blue-200";
    case "MEETING_BOOKED": return "bg-cyan-100 text-cyan-800 border-cyan-200";
    case "PROPOSAL_SENT": return "bg-amber-100 text-amber-800 border-amber-200";
    case "NEGOTIATION": return "bg-orange-100 text-orange-800 border-orange-200";
    case "WON": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "LOST": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

function activityTypeColor(type: string) {
  switch (type) {
    case "EMAIL": return "bg-blue-100 text-blue-600";
    case "CALL": return "bg-green-100 text-green-600";
    case "MEETING": return "bg-purple-100 text-purple-600";
    case "NOTE": return "bg-gray-100 text-gray-600";
    case "TASK": return "bg-amber-100 text-amber-600";
    case "AD_CLICK": return "bg-red-100 text-red-600";
    case "PAGE_VIEW": return "bg-cyan-100 text-cyan-600";
    case "FORM_SUBMIT": return "bg-pink-100 text-pink-600";
    default: return "bg-gray-100 text-gray-600";
  }
}

function activityTypeIcon(type: string) {
  switch (type) {
    case "EMAIL": return "E";
    case "CALL": return "C";
    case "MEETING": return "M";
    case "NOTE": return "N";
    case "TASK": return "T";
    case "AD_CLICK": return "A";
    case "PAGE_VIEW": return "P";
    case "FORM_SUBMIT": return "F";
    default: return "?";
  }
}

function parseTags(tags: string): string[] {
  try {
    return JSON.parse(tags);
  } catch {
    return [];
  }
}

function daysBetween(d1: string, d2: Date) {
  const date1 = new Date(d1);
  return Math.floor((d2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    lifecycleStage: "LEAD",
    leadScore: 0,
  });

  // Activity form
  const [activityForm, setActivityForm] = useState({
    type: "NOTE",
    subject: "",
    body: "",
    outcome: "",
  });

  const fetchContact = useCallback(async () => {
    try {
      const res = await fetch(`/api/contacts/${contactId}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Contact not found");
          return;
        }
        throw new Error("Failed to fetch");
      }
      const data = await res.json();
      setContact(data);
      setEditForm({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || "",
        company: data.company || "",
        jobTitle: data.jobTitle || "",
        lifecycleStage: data.lifecycleStage,
        leadScore: data.leadScore,
      });
    } catch {
      setError("Failed to load contact");
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  async function handleSaveEdit() {
    setSaving(true);
    try {
      const res = await fetch(`/api/contacts/${contactId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditOpen(false);
        fetchContact();
      }
    } catch { /* ignore */ }
    setSaving(false);
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/contacts/${contactId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/contacts");
      }
    } catch { /* ignore */ }
  }

  async function handleLogActivity() {
    if (!activityForm.subject.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId,
          type: activityForm.type,
          subject: activityForm.subject,
          body: activityForm.body || undefined,
          outcome: activityForm.outcome || undefined,
        }),
      });
      if (res.ok) {
        setActivityOpen(false);
        setActivityForm({ type: "NOTE", subject: "", body: "", outcome: "" });
        fetchContact();
      }
    } catch { /* ignore */ }
    setSaving(false);
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Error state
  if (error || !contact) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-muted-foreground">{error || "Contact not found"}</p>
        <Link href="/contacts">
          <Button className="mt-4">Back to Contacts</Button>
        </Link>
      </div>
    );
  }

  const fullName = `${contact.firstName} ${contact.lastName}`;
  const tags = parseTags(contact.tags);
  const totalDealsValue = contact.deals.reduce((sum, d) => sum + d.value, 0);
  const wonDeals = contact.deals.filter((d) => d.stage === "WON");
  const openDeals = contact.deals.filter((d) => d.stage !== "WON" && d.stage !== "LOST");
  const lastActivity = contact.activities[0];
  const daysSinceLast = lastActivity ? daysBetween(lastActivity.createdAt, new Date()) : null;

  const hasUtm = contact.utmSource || contact.utmMedium || contact.utmCampaign || contact.utmContent || contact.utmTerm;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/contacts">
            <Button variant="ghost" size="icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
              </svg>
            </Button>
          </Link>
          <Avatar className="h-12 w-12">
            <AvatarFallback className="text-lg">{getInitials(fullName)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{fullName}</h1>
              <Badge className={lifecycleBadgeClass(contact.lifecycleStage)}>
                {contact.lifecycleStage}
              </Badge>
              <Badge variant="outline" className="font-mono text-xs">
                Score: {contact.leadScore}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {contact.jobTitle ? `${contact.jobTitle}${contact.company ? ` at ${contact.company}` : ""}` : contact.company || contact.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setActivityOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" /><path d="M5 12h14" />
            </svg>
            Log Activity
          </Button>
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
            </svg>
            Edit
          </Button>
          <Button variant="destructive" size="icon" onClick={() => setDeleteConfirm(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Contact Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoField label="Email" value={contact.email} />
            <InfoField label="Phone" value={contact.phone || "—"} />
            <InfoField label="Company" value={contact.company || "—"} />
            <InfoField label="Job Title" value={contact.jobTitle || "—"} />
            <InfoField label="Source" value={contact.source} />
            <InfoField label="Lead Score" value={`${contact.leadScore} / 100`} />
            <InfoField label="Acquisition Cost" value={contact.acquisitionCost ? formatCurrency(contact.acquisitionCost) : "—"} />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Tags</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {tags.length > 0 ? tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                )) : <span className="text-sm text-muted-foreground">No tags</span>}
              </div>
            </div>
            <InfoField label="Created" value={formatDate(contact.createdAt)} />
          </div>

          {/* UTM Parameters */}
          {hasUtm && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium">UTM Parameters</p>
              <div className="grid gap-2 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-5">
                <UtmField label="Source" value={contact.utmSource} />
                <UtmField label="Medium" value={contact.utmMedium} />
                <UtmField label="Campaign" value={contact.utmCampaign} />
                <UtmField label="Term" value={contact.utmTerm} />
                <UtmField label="Content" value={contact.utmContent} />
              </div>
            </div>
          )}

          {/* Source Campaign Info */}
          {(contact.sourceCampaign || contact.sourceAd || contact.sourceKeyword) && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">Source Details</p>
              <div className="grid gap-2 rounded-lg border bg-muted/30 p-4 sm:grid-cols-3">
                {contact.sourceCampaign && <InfoField label="Campaign" value={contact.sourceCampaign} />}
                {contact.sourceAd && <InfoField label="Ad" value={contact.sourceAd} />}
                {contact.sourceKeyword && <InfoField label="Keyword" value={contact.sourceKeyword} />}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline ({contact.activities.length})</TabsTrigger>
          <TabsTrigger value="deals">Deals ({contact.deals.length})</TabsTrigger>
          <TabsTrigger value="scoring">Lead Scoring</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pipeline Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(totalDealsValue)}</p>
                <p className="text-xs text-muted-foreground">{contact.deals.length} total deals</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Won Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(wonDeals.reduce((s, d) => s + d.value, 0))}
                </p>
                <p className="text-xs text-muted-foreground">{wonDeals.length} won deals</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{contact.activities.length}</p>
                <p className="text-xs text-muted-foreground">Total recorded</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Last Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{daysSinceLast !== null ? `${daysSinceLast}d` : "—"}</p>
                <p className="text-xs text-muted-foreground">
                  {lastActivity ? formatDate(lastActivity.createdAt) : "No activities"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {contact.activities.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No activities yet</p>
              ) : (
                <div className="space-y-0">
                  {contact.activities.slice(0, 8).map((item, i) => (
                    <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
                      {i < Math.min(contact.activities.length, 8) - 1 && (
                        <div className="absolute left-[17px] top-9 h-full w-px bg-border" />
                      )}
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${activityTypeColor(item.type)}`}>
                        {activityTypeIcon(item.type)}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{item.subject}</p>
                          <span className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</span>
                        </div>
                        {item.body && (
                          <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{item.body}</p>
                        )}
                        {item.outcome && (
                          <Badge variant="outline" className="mt-1 text-xs">{item.outcome}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Open Deals Summary */}
          {openDeals.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Open Deals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {openDeals.map((deal) => (
                  <Link key={deal.id} href={`/deals/${deal.id}`} className="block">
                    <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors">
                      <div>
                        <p className="font-medium">{deal.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={stageBadgeClass(deal.stage)}>{deal.stage.replace("_", " ")}</Badge>
                          {deal.expectedCloseDate && (
                            <span className="text-xs text-muted-foreground">Close: {formatDate(deal.expectedCloseDate)}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatCurrency(deal.value)}</p>
                        <p className="text-xs text-muted-foreground">{deal.probability}%</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Activity Timeline</CardTitle>
              <Button size="sm" onClick={() => setActivityOpen(true)}>Log Activity</Button>
            </CardHeader>
            <CardContent>
              {contact.activities.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No activities recorded yet</p>
              ) : (
                <div className="space-y-0">
                  {contact.activities.map((item, i) => (
                    <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
                      {i < contact.activities.length - 1 && (
                        <div className="absolute left-[17px] top-9 h-full w-px bg-border" />
                      )}
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${activityTypeColor(item.type)}`}>
                        {activityTypeIcon(item.type)}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{item.subject}</p>
                            <Badge variant="outline" className="text-xs">{item.type}</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</span>
                        </div>
                        {item.body && <p className="mt-0.5 text-sm text-muted-foreground">{item.body}</p>}
                        {item.outcome && <p className="mt-1 text-xs text-muted-foreground">Outcome: {item.outcome}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deals Tab */}
        <TabsContent value="deals">
          <Card>
            <CardContent className="p-0">
              {contact.deals.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No deals associated</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deal</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">Probability</TableHead>
                      <TableHead className="text-right">Close Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contact.deals.map((deal) => (
                      <TableRow key={deal.id} className="cursor-pointer" onClick={() => router.push(`/deals/${deal.id}`)}>
                        <TableCell className="font-medium">{deal.title}</TableCell>
                        <TableCell>
                          <Badge className={stageBadgeClass(deal.stage)}>{deal.stage.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(deal.value)}</TableCell>
                        <TableCell className="text-right">{deal.probability}%</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {deal.actualCloseDate
                            ? formatDate(deal.actualCloseDate)
                            : deal.expectedCloseDate
                              ? formatDate(deal.expectedCloseDate)
                              : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Deal Summary */}
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalDealsValue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Won</p>
                <p className="text-2xl font-bold text-emerald-600">{wonDeals.length} deals</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Open Pipeline</p>
                <p className="text-2xl font-bold">{formatCurrency(openDeals.reduce((s, d) => s + d.value, 0))}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lead Scoring Tab */}
        <TabsContent value="scoring">
          <div className="grid gap-4 sm:grid-cols-4 mb-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className="text-3xl font-bold">{contact.leadScore}</p>
              </CardContent>
            </Card>
            {contact.leadScores.length > 0 && (
              <>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-muted-foreground">Fit Score</p>
                    <p className="text-3xl font-bold text-blue-600">{contact.leadScores[0].fitScore}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-muted-foreground">Intent Score</p>
                    <p className="text-3xl font-bold text-purple-600">{contact.leadScores[0].intentScore}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-muted-foreground">Engagement</p>
                    <p className="text-3xl font-bold text-amber-600">{contact.leadScores[0].engagementScore}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {contact.leadScores.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Score History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead className="text-right">Fit</TableHead>
                      <TableHead className="text-right">Intent</TableHead>
                      <TableHead className="text-right">Engagement</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contact.leadScores.map((score) => (
                      <TableRow key={score.id}>
                        <TableCell className="text-muted-foreground">{formatDate(score.createdAt)}</TableCell>
                        <TableCell>
                          <Badge variant={score.grade === "A" ? "default" : "secondary"}>
                            {score.grade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{score.fitScore}</TableCell>
                        <TableCell className="text-right">{score.intentScore}</TableCell>
                        <TableCell className="text-right">{score.engagementScore}</TableCell>
                        <TableCell className="text-right font-bold">{score.totalScore}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Company</Label>
                <Input value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} />
              </div>
              <div>
                <Label>Job Title</Label>
                <Input value={editForm.jobTitle} onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Lifecycle Stage</Label>
                <Select
                  value={editForm.lifecycleStage}
                  onChange={(v) => setEditForm({ ...editForm, lifecycleStage: v })}
                  options={[
                    { value: "SUBSCRIBER", label: "Subscriber" },
                    { value: "LEAD", label: "Lead" },
                    { value: "MQL", label: "MQL" },
                    { value: "SQL", label: "SQL" },
                    { value: "OPPORTUNITY", label: "Opportunity" },
                    { value: "CUSTOMER", label: "Customer" },
                    { value: "EVANGELIST", label: "Evangelist" },
                  ]}
                />
              </div>
              <div>
                <Label>Lead Score</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={editForm.leadScore}
                  onChange={(e) => setEditForm({ ...editForm, leadScore: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Activity Dialog */}
      <Dialog open={activityOpen} onOpenChange={setActivityOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Type</Label>
              <Select
                value={activityForm.type}
                onChange={(v) => setActivityForm({ ...activityForm, type: v })}
                options={[
                  { value: "NOTE", label: "Note" },
                  { value: "CALL", label: "Call" },
                  { value: "EMAIL", label: "Email" },
                  { value: "MEETING", label: "Meeting" },
                  { value: "TASK", label: "Task" },
                ]}
              />
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                value={activityForm.subject}
                onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })}
                placeholder="Activity subject..."
              />
            </div>
            <div>
              <Label>Details</Label>
              <Textarea
                value={activityForm.body}
                onChange={(e) => setActivityForm({ ...activityForm, body: e.target.value })}
                placeholder="Additional details..."
                rows={3}
              />
            </div>
            <div>
              <Label>Outcome</Label>
              <Input
                value={activityForm.outcome}
                onChange={(e) => setActivityForm({ ...activityForm, outcome: e.target.value })}
                placeholder="e.g., Connected, Voicemail, Sent..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActivityOpen(false)}>Cancel</Button>
              <Button onClick={handleLogActivity} disabled={saving || !activityForm.subject.trim()}>
                {saving ? "Saving..." : "Log Activity"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-4">
            Are you sure you want to delete <strong>{fullName}</strong>? This will also remove all associated deals and activities. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Contact</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm">{value}</p>
    </div>
  );
}

function UtmField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">utm_{label.toLowerCase()}</p>
      <p className="text-sm font-mono">{value || "—"}</p>
    </div>
  );
}
