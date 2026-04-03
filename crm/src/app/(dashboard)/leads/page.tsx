"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const gradeColors: Record<string, string> = { A: "bg-emerald-100 text-emerald-800", B: "bg-blue-100 text-blue-800", C: "bg-amber-100 text-amber-800", D: "bg-red-100 text-red-800" };
const statusColors: Record<string, string> = { Active: "bg-green-100 text-green-800", Completed: "bg-blue-100 text-blue-800", Draft: "bg-gray-100 text-gray-800", NEW: "bg-slate-100 text-slate-800", ENRICHED: "bg-blue-100 text-blue-800", SCORED: "bg-indigo-100 text-indigo-800", CONTACTED: "bg-amber-100 text-amber-800", QUALIFIED: "bg-emerald-100 text-emerald-800", CONVERTED: "bg-green-100 text-green-800", REJECTED: "bg-red-100 text-red-800" };
const GRADE_CHART_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

interface Campaign { id: string; name: string; status: string; targetLeadCount: number; budget: number; _count?: { scrapedLeads: number }; scrapedLeads?: Lead[] }
interface Lead { id: string; rawData: string; enrichmentData: string; fitScore: number; intentScore: number; engagementScore: number; totalScore: number; grade: string; status: string; contactId: string | null }

export default function LeadsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    whatYouSell: "", problemSolved: "", uniqueValue: "", salesCycle: "1 month", avgDealSize: "", maxCostPerLead: "",
    industries: [] as string[], companySize: [] as string[], revenueRange: "", titles: "", geography: "", techStack: "",
    fundingStage: "", hangouts: [] as string[], triggers: [] as string[], bestCustomers: "",
    competitors: "", triedBefore: "",
  });
  const [wizardAnalyzing, setWizardAnalyzing] = useState(false);
  const [wizardResult, setWizardResult] = useState<{ icpSummary: string; sources: string[]; estimatedLeads: number; budget: number } | null>(null);

  // Filter state
  const [filterGrade, setFilterGrade] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads");
      if (res.ok) {
        const d = await res.json();
        setCampaigns(d.campaigns || []);
        const leads: Lead[] = [];
        (d.campaigns || []).forEach((c: Campaign) => { (c.scrapedLeads || []).forEach((l: Lead) => leads.push(l)); });
        setAllLeads(leads);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Dashboard metrics
  const totalLeads = allLeads.length;
  const qualified = allLeads.filter((l) => l.grade === "A" || l.grade === "B").length;
  const converted = allLeads.filter((l) => l.status === "CONVERTED").length;
  const avgScore = totalLeads ? Math.round(allLeads.reduce((s, l) => s + l.totalScore, 0) / totalLeads) : 0;
  const gradeDistribution = ["A", "B", "C", "D"].map((g) => ({ name: `Grade ${g}`, value: allLeads.filter((l) => l.grade === g).length }));

  // Funnel
  const funnel = [
    { label: "Scraped", count: totalLeads },
    { label: "Enriched", count: allLeads.filter((l) => ["ENRICHED", "SCORED", "CONTACTED", "QUALIFIED", "CONVERTED"].includes(l.status)).length },
    { label: "Scored", count: allLeads.filter((l) => ["SCORED", "CONTACTED", "QUALIFIED", "CONVERTED"].includes(l.status)).length },
    { label: "Contacted", count: allLeads.filter((l) => ["CONTACTED", "QUALIFIED", "CONVERTED"].includes(l.status)).length },
    { label: "Qualified", count: allLeads.filter((l) => ["QUALIFIED", "CONVERTED"].includes(l.status)).length },
    { label: "Converted", count: converted },
  ];
  const funnelMax = Math.max(1, funnel[0].count);

  function toggleArray(arr: string[], val: string) { return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]; }

  async function launchCampaign() {
    const res = await fetch("/api/leads", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `Lead Gen - ${wizardData.industries.join(", ") || "Custom"}`,
        targetProfile: JSON.stringify(wizardData),
        targetLeadCount: wizardResult?.estimatedLeads || 500,
        budget: wizardResult?.budget || parseFloat(wizardData.maxCostPerLead) * 500,
      }),
    });
    if (res.ok) { setActiveTab("campaigns"); setWizardStep(1); setWizardResult(null); fetchData(); }
  }

  async function runAnalysis() {
    setWizardAnalyzing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setWizardResult({
      icpSummary: `${wizardData.industries.join(", ")} companies with ${wizardData.companySize.join(", ")} employees in ${wizardData.geography || "US"}. Decision makers: ${wizardData.titles || "CEO, CMO"}. Tech stack: ${wizardData.techStack || "Any"}.`,
      sources: ["Apollo.io", "Hunter.io", "LinkedIn Sales Navigator", "BuiltWith", "Crunchbase"],
      estimatedLeads: parseInt(wizardData.avgDealSize) > 50000 ? 200 : 800,
      budget: parseFloat(wizardData.maxCostPerLead || "10") * (parseInt(wizardData.avgDealSize) > 50000 ? 200 : 800),
    });
    setWizardAnalyzing(false);
  }

  async function scoreAllLeads() {
    const ids = allLeads.filter((l) => l.contactId).map((l) => l.contactId!);
    if (ids.length === 0) return;
    await fetch("/api/leads/score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contactIds: ids }) });
    fetchData();
  }

  const filteredLeads = allLeads.filter((l) => {
    if (filterGrade && l.grade !== filterGrade) return false;
    if (filterStatus && l.status !== filterStatus) return false;
    if (searchTerm) {
      const raw = JSON.parse(l.rawData || "{}");
      const search = searchTerm.toLowerCase();
      if (!(raw.name || "").toLowerCase().includes(search) && !(raw.company || "").toLowerCase().includes(search) && !(raw.email || "").toLowerCase().includes(search)) return false;
    }
    return true;
  });

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Lead Generation</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={scoreAllLeads}>Score All Leads</Button>
          <Button onClick={() => { setActiveTab("wizard"); setWizardStep(1); }}>New Campaign</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="wizard">Target Discovery</TabsTrigger>
          <TabsTrigger value="scoring">Lead Scoring</TabsTrigger>
          <TabsTrigger value="leads">All Leads</TabsTrigger>
        </TabsList>

        {/* DASHBOARD */}
        <TabsContent value="dashboard">
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              {[{ l: "Total Leads", v: formatNumber(totalLeads) }, { l: "Qualified (A+B)", v: formatNumber(qualified) }, { l: "Converted", v: formatNumber(converted) }, { l: "Avg Score", v: `${avgScore}/100` }].map((s) => (
                <Card key={s.l}><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{s.l}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{s.v}</div></CardContent></Card>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle>Lead Funnel</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {funnel.map((f, i) => (
                    <div key={f.label} className="space-y-1">
                      <div className="flex justify-between text-sm"><span>{f.label}</span><span className="text-muted-foreground">{f.count} {i > 0 ? `(${funnelMax ? Math.round((f.count / funnel[i - 1].count) * 100) || 0 : 0}%)` : ""}</span></div>
                      <div className="h-6 rounded" style={{ width: `${(f.count / funnelMax) * 100}%`, backgroundColor: `hsl(${220 - i * 20}, 70%, ${50 + i * 5}%)`, minWidth: f.count > 0 ? "20px" : "0" }} />
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Grade Distribution</CardTitle></CardHeader>
                <CardContent>
                  {totalLeads > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart><Pie data={gradeDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" paddingAngle={4}>
                        {gradeDistribution.map((_, i) => <Cell key={i} fill={GRADE_CHART_COLORS[i]} />)}
                      </Pie><Tooltip /><Legend /></PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-center py-12 text-muted-foreground">No leads yet</p>}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((c) => (
                <Card key={c.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{c.name}</CardTitle>
                      <Badge className={statusColors[c.status] || ""}>{c.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2"><Progress value={((c._count?.scrapedLeads || 0) / c.targetLeadCount) * 100} className="h-2 flex-1" /><span className="text-xs">{c._count?.scrapedLeads || 0}/{c.targetLeadCount}</span></div>
                    {c.budget && <p className="text-xs text-muted-foreground">Budget: {formatCurrency(c.budget)}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* CAMPAIGNS */}
        <TabsContent value="campaigns">
          <div className="space-y-4">
            {campaigns.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground">No campaigns. Start with Target Discovery.</CardContent></Card> : (
              campaigns.map((c) => (
                <Card key={c.id}>
                  <CardHeader><div className="flex items-center justify-between"><CardTitle>{c.name}</CardTitle><Badge className={statusColors[c.status] || ""}>{c.status}</Badge></div></CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2"><Progress value={((c._count?.scrapedLeads || 0) / c.targetLeadCount) * 100} className="h-2 flex-1" /><span className="text-sm">{c._count?.scrapedLeads || 0} / {c.targetLeadCount} leads</span></div>
                    {c.budget && <p className="text-sm text-muted-foreground">Budget: {formatCurrency(c.budget)}</p>}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* WIZARD */}
        <TabsContent value="wizard">
          <Card>
            <CardHeader>
              <CardTitle>Target Discovery Wizard</CardTitle>
              <div className="flex gap-1 mt-2">{[1, 2, 3, 4, 5].map((s) => (<div key={s} className={cn("h-2 flex-1 rounded-full", s <= wizardStep ? "bg-primary" : "bg-muted")} />))}</div>
              <p className="text-sm text-muted-foreground mt-1">Step {wizardStep} of 5</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Business & Offer</h3>
                  <div><label className="text-sm font-medium">What do you sell?</label><Textarea value={wizardData.whatYouSell} onChange={(e) => setWizardData({ ...wizardData, whatYouSell: e.target.value })} placeholder="Describe your product or service..." /></div>
                  <div><label className="text-sm font-medium">What problem do you solve?</label><Textarea value={wizardData.problemSolved} onChange={(e) => setWizardData({ ...wizardData, problemSolved: e.target.value })} placeholder="The pain point and transformation..." /></div>
                  <div><label className="text-sm font-medium">Unique value proposition</label><Textarea value={wizardData.uniqueValue} onChange={(e) => setWizardData({ ...wizardData, uniqueValue: e.target.value })} placeholder="Why you vs competitors..." /></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><label className="text-sm font-medium">Sales Cycle</label><Select value={wizardData.salesCycle} onChange={(v) => setWizardData({ ...wizardData, salesCycle: v })} options={[{ label: "1 week", value: "1 week" }, { label: "2 weeks", value: "2 weeks" }, { label: "1 month", value: "1 month" }, { label: "3 months", value: "3 months" }, { label: "6+ months", value: "6+ months" }]} /></div>
                    <div><label className="text-sm font-medium">Avg Deal Size ($)</label><Input type="number" value={wizardData.avgDealSize} onChange={(e) => setWizardData({ ...wizardData, avgDealSize: e.target.value })} placeholder="10000" /></div>
                    <div><label className="text-sm font-medium">Max Cost/Lead ($)</label><Input type="number" value={wizardData.maxCostPerLead} onChange={(e) => setWizardData({ ...wizardData, maxCostPerLead: e.target.value })} placeholder="25" /></div>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Ideal Customer Profile</h3>
                  <div><label className="text-sm font-medium">Industry</label>
                    <div className="flex flex-wrap gap-2 mt-1">{["SaaS", "E-commerce", "Healthcare", "Finance", "Real Estate", "Agency", "Education", "Manufacturing", "Retail"].map((ind) => (
                      <button key={ind} onClick={() => setWizardData({ ...wizardData, industries: toggleArray(wizardData.industries, ind) })}
                        className={cn("px-3 py-1 rounded-full text-sm border", wizardData.industries.includes(ind) ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>{ind}</button>
                    ))}</div>
                  </div>
                  <div><label className="text-sm font-medium">Company Size</label>
                    <div className="flex flex-wrap gap-2 mt-1">{["Solo", "1-10", "11-50", "51-200", "201-1000", "1000+"].map((size) => (
                      <button key={size} onClick={() => setWizardData({ ...wizardData, companySize: toggleArray(wizardData.companySize, size) })}
                        className={cn("px-3 py-1 rounded-full text-sm border", wizardData.companySize.includes(size) ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>{size}</button>
                    ))}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium">Decision-Maker Titles</label><Input value={wizardData.titles} onChange={(e) => setWizardData({ ...wizardData, titles: e.target.value })} placeholder="CEO, CMO, VP Marketing..." /></div>
                    <div><label className="text-sm font-medium">Geography</label><Input value={wizardData.geography} onChange={(e) => setWizardData({ ...wizardData, geography: e.target.value })} placeholder="US, UK, Austin TX..." /></div>
                  </div>
                  <div><label className="text-sm font-medium">Tech Stack</label><Input value={wizardData.techStack} onChange={(e) => setWizardData({ ...wizardData, techStack: e.target.value })} placeholder="Shopify, HubSpot, Salesforce..." /></div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Behavior & Signals</h3>
                  <div><label className="text-sm font-medium">Where do they hang out online?</label>
                    <div className="flex flex-wrap gap-2 mt-1">{["LinkedIn", "Facebook Groups", "Reddit", "Slack", "Discord", "Forums", "Twitter/X"].map((h) => (
                      <button key={h} onClick={() => setWizardData({ ...wizardData, hangouts: toggleArray(wizardData.hangouts, h) })}
                        className={cn("px-3 py-1 rounded-full text-sm border", wizardData.hangouts.includes(h) ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>{h}</button>
                    ))}</div>
                  </div>
                  <div><label className="text-sm font-medium">Purchase Triggers</label>
                    <div className="flex flex-wrap gap-2 mt-1">{["New funding", "New hire", "Product launch", "Pain event", "Seasonal"].map((t) => (
                      <button key={t} onClick={() => setWizardData({ ...wizardData, triggers: toggleArray(wizardData.triggers, t) })}
                        className={cn("px-3 py-1 rounded-full text-sm border", wizardData.triggers.includes(t) ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>{t}</button>
                    ))}</div>
                  </div>
                  <div><label className="text-sm font-medium">Best Existing Customers (name 3-5)</label><Textarea value={wizardData.bestCustomers} onChange={(e) => setWizardData({ ...wizardData, bestCustomers: e.target.value })} placeholder="Company A, Company B, Company C..." /></div>
                </div>
              )}

              {wizardStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Competition & Market</h3>
                  <div><label className="text-sm font-medium">Competitors</label><Input value={wizardData.competitors} onChange={(e) => setWizardData({ ...wizardData, competitors: e.target.value })} placeholder="Competitor A, Competitor B..." /></div>
                  <div><label className="text-sm font-medium">What have you tried before?</label><Textarea value={wizardData.triedBefore} onChange={(e) => setWizardData({ ...wizardData, triedBefore: e.target.value })} placeholder="What worked, what didn't..." /></div>
                </div>
              )}

              {wizardStep === 5 && (
                <div className="space-y-4">
                  {wizardAnalyzing ? (
                    <div className="text-center py-12">
                      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                      <p className="text-lg font-medium">Analyzing your target profile...</p>
                      <p className="text-muted-foreground">Building ICP, selecting sources, estimating results</p>
                    </div>
                  ) : wizardResult ? (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">AI Strategy Summary</h3>
                      <Card className="border-primary/20 bg-primary/5">
                        <CardHeader className="pb-2"><CardTitle className="text-base">Ideal Customer Profile</CardTitle></CardHeader>
                        <CardContent><p className="text-sm">{wizardResult.icpSummary}</p></CardContent>
                      </Card>
                      <div className="grid grid-cols-3 gap-4">
                        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Recommended Sources</CardTitle></CardHeader><CardContent><div className="space-y-1">{wizardResult.sources.map((s) => <Badge key={s} variant="outline" className="mr-1">{s}</Badge>)}</div></CardContent></Card>
                        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Estimated Leads</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatNumber(wizardResult.estimatedLeads)}</div></CardContent></Card>
                        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Estimated Budget</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(wizardResult.budget)}</div></CardContent></Card>
                      </div>
                      <Button className="w-full" onClick={launchCampaign}>Launch Campaign</Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Button onClick={runAnalysis}>Generate AI Strategy</Button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setWizardStep(Math.max(1, wizardStep - 1))} disabled={wizardStep === 1}>Back</Button>
                {wizardStep < 5 && <Button onClick={() => setWizardStep(wizardStep + 1)}>Next</Button>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SCORING */}
        <TabsContent value="scoring">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { title: "Fit Score (0-50)", items: ["Industry match: 10pt", "Company size: 10pt", "Revenue match: 5pt", "Geography: 5pt", "Tech stack: 10pt", "Job title: 5pt", "Growth signals: 5pt"] },
                { title: "Intent Score (0-30)", items: ["Hiring signals: 10pt", "Recently funded: 5pt", "Competitor customer: 10pt", "Content engagement: 5pt"] },
                { title: "Engagement Score (0-20)", items: ["Website visit: 5pt", "Email opened: 5pt", "Ad clicked: 5pt", "Social engagement: 5pt"] },
              ].map((cat) => (
                <Card key={cat.title}>
                  <CardHeader className="pb-2"><CardTitle className="text-base">{cat.title}</CardTitle></CardHeader>
                  <CardContent><ul className="space-y-1">{cat.items.map((item) => <li key={item} className="text-sm text-muted-foreground flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" />{item}</li>)}</ul></CardContent>
                </Card>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={scoreAllLeads}>Score All Leads</Button>
              <div className="flex gap-2">{["A", "B", "C", "D"].map((g) => {
                const count = allLeads.filter((l) => l.grade === g).length;
                return <Badge key={g} className={cn(gradeColors[g], "text-base px-3 py-1")}>Grade {g}: {count}</Badge>;
              })}</div>
            </div>
          </div>
        </TabsContent>

        {/* ALL LEADS */}
        <TabsContent value="leads">
          <div className="space-y-4">
            <div className="flex gap-3">
              <Input placeholder="Search name, company, email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-xs" />
              <Select value={filterGrade} onChange={(v) => setFilterGrade(v)} placeholder="All Grades" options={[{ label: "All Grades", value: "" }, { label: "A", value: "A" }, { label: "B", value: "B" }, { label: "C", value: "C" }, { label: "D", value: "D" }]} />
              <Select value={filterStatus} onChange={(v) => setFilterStatus(v)} placeholder="All Statuses" options={[{ label: "All", value: "" }, { label: "New", value: "NEW" }, { label: "Scored", value: "SCORED" }, { label: "Contacted", value: "CONTACTED" }, { label: "Qualified", value: "QUALIFIED" }, { label: "Converted", value: "CONVERTED" }]} />
            </div>
            <Card>
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead><TableHead>Company</TableHead><TableHead>Email</TableHead>
                      <TableHead>Score</TableHead><TableHead>Grade</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((l) => {
                      const raw = JSON.parse(l.rawData || "{}");
                      return (
                        <TableRow key={l.id}>
                          <TableCell className="font-medium">{raw.name || "—"}</TableCell>
                          <TableCell>{raw.company || "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{raw.email || "—"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={l.totalScore} className="h-2 w-16" />
                              <span className="text-xs">{l.totalScore}</span>
                            </div>
                          </TableCell>
                          <TableCell><Badge className={gradeColors[l.grade] || ""}>{l.grade}</Badge></TableCell>
                          <TableCell><Badge className={statusColors[l.status] || "bg-gray-100 text-gray-800"}>{l.status}</Badge></TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">Push to CRM</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredLeads.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No leads found</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
