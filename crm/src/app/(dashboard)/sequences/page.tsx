"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

/* ---------- types ---------- */
interface Step {
  delay: number;
  delayUnit: "hours" | "days" | "weeks";
  subject: string;
  body: string;
}

interface Sequence {
  id: string;
  name: string;
  type: string;
  steps: string;
  isActive: boolean;
  _count?: { enrollments: number };
  createdAt: string;
}

interface Enrollment {
  id: string;
  currentStep: number;
  status: string;
  enrolledAt: string;
  contact: { id: string; firstName: string; lastName: string; email: string };
  sequence: { id: string; name: string; steps: string };
}

/* ---------- templates ---------- */
const EMAIL_TEMPLATES = [
  { category: "Cold Outreach", subject: "Quick question about {{company}}", body: "Hi {{firstName}},\n\nI noticed {{company}} is growing fast in the {{industry}} space. I work with similar companies and help them solve [specific pain point].\n\nWould you be open to a 15-minute chat this week to see if we might be a good fit?\n\nBest,\n[Your Name]" },
  { category: "Case Study", subject: "How [Similar Company] achieved [Result]", body: "Hi {{firstName}},\n\nI wanted to share a quick success story. We recently helped [Company Name] — a {{industry}} company similar to {{company}} — achieve [specific result].\n\nHere's what they did differently: [brief insight].\n\nWould you like to see the full case study?\n\nBest,\n[Your Name]" },
  { category: "Quick Question", subject: "{{firstName}}, quick question", body: "Hi {{firstName}},\n\nI'm curious — how is {{company}} currently handling [specific challenge]?\n\nI ask because we've been seeing a lot of {{industry}} companies struggle with this, and I had an idea that might help.\n\nNo pitch — just genuinely curious.\n\nBest,\n[Your Name]" },
  { category: "Value Add", subject: "Free resource for {{company}}", body: "Hi {{firstName}},\n\nI put together a [guide/template/tool] specifically for {{industry}} companies that helps with [specific problem].\n\nNo strings attached — just thought it might be useful for your team at {{company}}.\n\n[Link to resource]\n\nLet me know if you find it helpful!\n\nBest,\n[Your Name]" },
  { category: "Breakup", subject: "Should I close your file?", body: "Hi {{firstName}},\n\nI've reached out a few times and haven't heard back — totally understand, you're busy.\n\nI don't want to be a pest, so I'll assume the timing isn't right. If things change down the road, my door is always open.\n\nWishing you and {{company}} all the best!\n\n[Your Name]" },
  { category: "Meeting Request", subject: "15 min this week?", body: "Hi {{firstName}},\n\nBased on what I've seen with {{company}}, I think there's a real opportunity to [specific benefit].\n\nWould you have 15 minutes this week for a quick call? I promise to be respectful of your time.\n\nHere's my calendar link: [link]\n\nBest,\n[Your Name]" },
  { category: "Demo Offer", subject: "See how {{company}} could [benefit]", body: "Hi {{firstName}},\n\nI'd love to show you exactly how [Your Product] could help {{company}} [achieve specific outcome].\n\nThe demo takes about 20 minutes and I'll customize it to your {{industry}} use case.\n\nWould [day/time] work for you?\n\nBest,\n[Your Name]" },
  { category: "Social Proof", subject: "[X companies] in {{industry}} use this", body: "Hi {{firstName}},\n\nDid you know that [X] companies in the {{industry}} space are already using [Your Product] to [specific outcome]?\n\nHere's what some of them are saying:\n• \"[Testimonial 1]\" — [Name, Company]\n• \"[Testimonial 2]\" — [Name, Company]\n\nWould you like to see how they did it?\n\nBest,\n[Your Name]" },
  { category: "Urgency", subject: "Ending Friday: special for {{company}}", body: "Hi {{firstName}},\n\nWe're offering [specific offer] for {{industry}} companies this week only.\n\nGiven what I know about {{company}}, this could help you [specific benefit] and save [amount/time].\n\nThe offer expires Friday at midnight. Want me to send over the details?\n\nBest,\n[Your Name]" },
  { category: "Re-engagement", subject: "We miss you, {{firstName}}", body: "Hi {{firstName}},\n\nIt's been a while since we last connected. A lot has changed on our end — we've added [new features/improvements] that I think {{company}} would really benefit from.\n\nWould you be open to a quick catch-up call?\n\nBest,\n[Your Name]" },
];

const typeColors: Record<string, string> = {
  COLD: "bg-blue-100 text-blue-800",
  WARM: "bg-amber-100 text-amber-800",
  NURTURE: "bg-green-100 text-green-800",
  ONBOARDING: "bg-purple-100 text-purple-800",
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  PAUSED: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  BOUNCED: "bg-red-100 text-red-800",
  UNSUBSCRIBED: "bg-gray-100 text-gray-800",
};

/* ---------- main component ---------- */
export default function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEnroll, setShowEnroll] = useState(false);
  const [enrollSeqId, setEnrollSeqId] = useState("");
  const [enrollEmails, setEnrollEmails] = useState("");

  // builder state
  const [seqName, setSeqName] = useState("");
  const [seqType, setSeqType] = useState("COLD");
  const [steps, setSteps] = useState<Step[]>([
    { delay: 0, delayUnit: "days", subject: "", body: "" },
  ]);
  const [editStepIdx, setEditStepIdx] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/email-sequences");
      if (res.ok) {
        const data = await res.json();
        setSequences(data.sequences || []);
        setEnrollments(data.enrollments || []);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleCreateSequence() {
    const res = await fetch("/api/email-sequences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: seqName, type: seqType, steps: JSON.stringify(steps) }),
    });
    if (res.ok) {
      setShowCreate(false);
      setSeqName("");
      setSteps([{ delay: 0, delayUnit: "days", subject: "", body: "" }]);
      fetchData();
    }
  }

  async function handleEnroll() {
    if (!enrollSeqId) return;
    const res = await fetch(`/api/email-sequences/${enrollSeqId}/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails: enrollEmails.split(",").map((e) => e.trim()) }),
    });
    if (res.ok) {
      setShowEnroll(false);
      setEnrollEmails("");
      fetchData();
    }
  }

  function addStep() {
    setSteps([...steps, { delay: 2, delayUnit: "days", subject: "", body: "" }]);
  }

  function removeStep(idx: number) {
    setSteps(steps.filter((_, i) => i !== idx));
  }

  function updateStep(idx: number, field: keyof Step, value: string | number) {
    setSteps(steps.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  }

  function loadTemplate(tpl: (typeof EMAIL_TEMPLATES)[0]) {
    if (editStepIdx !== null) {
      updateStep(editStepIdx, "subject", tpl.subject);
      updateStep(editStepIdx, "body", tpl.body);
    } else if (steps.length > 0) {
      updateStep(steps.length - 1, "subject", tpl.subject);
      updateStep(steps.length - 1, "body", tpl.body);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Email Sequences</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEnroll(true)}>Enroll Contacts</Button>
          <Button onClick={() => setShowCreate(true)}>Create Sequence</Button>
        </div>
      </div>

      <Tabs defaultValue="sequences">
        <TabsList>
          <TabsTrigger value="sequences">Sequences</TabsTrigger>
          <TabsTrigger value="builder">Sequence Builder</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* ===== SEQUENCES LIST ===== */}
        <TabsContent value="sequences">
          {sequences.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No sequences yet. Create your first email sequence.</CardContent></Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sequences.map((seq) => {
                const parsedSteps = (() => { try { return JSON.parse(seq.steps); } catch { return []; } })();
                return (
                  <Card key={seq.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{seq.name}</CardTitle>
                        <Badge className={typeColors[seq.type] || "bg-gray-100 text-gray-800"}>{seq.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{parsedSteps.length} steps</span>
                        <span className="text-muted-foreground">{seq._count?.enrollments || 0} enrolled</span>
                      </div>
                      <Progress value={seq.isActive ? 100 : 0} className="h-2" />
                      <div className="flex items-center justify-between">
                        <Badge className={seq.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {seq.isActive ? "Active" : "Paused"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(seq.createdAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ===== SEQUENCE BUILDER ===== */}
        <TabsContent value="builder">
          <Card>
            <CardHeader>
              <CardTitle>Build a Sequence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Sequence Name</label>
                  <Input value={seqName} onChange={(e) => setSeqName(e.target.value)} placeholder="e.g. Cold Outreach - SaaS CEOs" />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={seqType} onChange={(v) => setSeqType(v)} options={[
                    { label: "Cold Outreach", value: "COLD" },
                    { label: "Warm Nurture", value: "WARM" },
                    { label: "Nurture", value: "NURTURE" },
                    { label: "Onboarding", value: "ONBOARDING" },
                  ]} />
                </div>
              </div>

              {/* Step timeline */}
              <div className="relative space-y-0">
                {steps.map((step, idx) => (
                  <div key={idx} className="relative flex gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">{idx + 1}</div>
                      {idx < steps.length - 1 && <div className="w-0.5 flex-1 bg-border min-h-[24px]" />}
                    </div>
                    {/* Step card */}
                    <div className="flex-1 mb-4 rounded-lg border bg-card p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Step {idx + 1}</span>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditStepIdx(editStepIdx === idx ? null : idx)}>
                            {editStepIdx === idx ? "Collapse" : "Edit"}
                          </Button>
                          {steps.length > 1 && (
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeStep(idx)}>Remove</Button>
                          )}
                        </div>
                      </div>
                      {idx > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Wait</span>
                          <Input type="number" className="w-20" value={step.delay} onChange={(e) => updateStep(idx, "delay", parseInt(e.target.value) || 0)} />
                          <Select value={step.delayUnit} onChange={(v) => updateStep(idx, "delayUnit", v)} options={[
                            { label: "Hours", value: "hours" },
                            { label: "Days", value: "days" },
                            { label: "Weeks", value: "weeks" },
                          ]} />
                        </div>
                      )}
                      <div>
                        <label className="text-xs text-muted-foreground">Subject</label>
                        <Input value={step.subject} onChange={(e) => updateStep(idx, "subject", e.target.value)} placeholder="Email subject line..." />
                      </div>
                      {editStepIdx === idx && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs text-muted-foreground">Body</label>
                            <div className="flex gap-1">
                              {["{{firstName}}", "{{lastName}}", "{{company}}", "{{jobTitle}}"].map((v) => (
                                <Button key={v} variant="outline" size="sm" className="text-xs h-6 px-2"
                                  onClick={() => updateStep(idx, "body", step.body + v)}>{v.replace(/\{\{|\}\}/g, "")}</Button>
                              ))}
                            </div>
                          </div>
                          <Textarea rows={6} value={step.body} onChange={(e) => updateStep(idx, "body", e.target.value)} placeholder="Email body..." />
                        </div>
                      )}
                      {!editStepIdx && step.body && (
                        <p className="text-sm text-muted-foreground truncate">{step.body.slice(0, 80)}...</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={addStep}>+ Add Step</Button>
                <Button onClick={handleCreateSequence} disabled={!seqName || steps.some((s) => !s.subject)}>Save Sequence</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== ENROLLMENTS ===== */}
        <TabsContent value="enrollments">
          <Card>
            <CardContent className="pt-6">
              {enrollments.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No active enrollments. Enroll contacts in a sequence to get started.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Sequence</TableHead>
                      <TableHead>Current Step</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Enrolled</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((e) => {
                      const totalSteps = (() => { try { return JSON.parse(e.sequence.steps).length; } catch { return 0; } })();
                      return (
                        <TableRow key={e.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{e.contact.firstName} {e.contact.lastName}</div>
                              <div className="text-sm text-muted-foreground">{e.contact.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{e.sequence.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{e.currentStep + 1}/{totalSteps}</span>
                              <Progress value={totalSteps ? ((e.currentStep + 1) / totalSteps) * 100 : 0} className="h-2 w-20" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[e.status] || "bg-gray-100 text-gray-800"}>{e.status}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(e.enrolledAt)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TEMPLATES ===== */}
        <TabsContent value="templates">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EMAIL_TEMPLATES.map((tpl, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{tpl.category}</CardTitle>
                    <Badge variant="outline">{tpl.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm font-medium">{tpl.subject}</p>
                  <p className="text-xs text-muted-foreground line-clamp-3">{tpl.body}</p>
                  <Button size="sm" variant="outline" onClick={() => loadTemplate(tpl)}>
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* ===== CREATE SEQUENCE DIALOG ===== */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Quick Create Sequence</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={seqName} onChange={(e) => setSeqName(e.target.value)} placeholder="Sequence name" />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={seqType} onChange={(v) => setSeqType(v)} options={[
                { label: "Cold Outreach", value: "COLD" },
                { label: "Warm Nurture", value: "WARM" },
                { label: "Nurture", value: "NURTURE" },
                { label: "Onboarding", value: "ONBOARDING" },
              ]} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreateSequence} disabled={!seqName}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== ENROLL DIALOG ===== */}
      <Dialog open={showEnroll} onOpenChange={setShowEnroll}>
        <DialogContent>
          <DialogHeader><DialogTitle>Enroll Contacts</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Sequence</label>
              <Select value={enrollSeqId} onChange={(v) => setEnrollSeqId(v)}
                placeholder="Select sequence"
                options={sequences.map((s) => ({ label: s.name, value: s.id }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Contact Emails (comma-separated)</label>
              <Textarea rows={3} value={enrollEmails} onChange={(e) => setEnrollEmails(e.target.value)} placeholder="email1@example.com, email2@example.com" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnroll(false)}>Cancel</Button>
            <Button onClick={handleEnroll} disabled={!enrollSeqId || !enrollEmails}>Enroll</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
