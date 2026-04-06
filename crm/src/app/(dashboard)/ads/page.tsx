"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const PLATFORM_COLORS: Record<string, { hex: string; bg: string; text: string }> = {
  GOOGLE: { hex: "#4285F4", bg: "bg-blue-50", text: "text-blue-700" },
  META: { hex: "#1877F2", bg: "bg-indigo-50", text: "text-indigo-700" },
  X: { hex: "#14171A", bg: "bg-gray-100", text: "text-gray-800" },
  TIKTOK: { hex: "#FF0050", bg: "bg-pink-50", text: "text-pink-700" },
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  PAUSED: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  DRAFT: "bg-slate-100 text-slate-600",
};

const actionTypeColors: Record<string, string> = {
  BUDGET_CHANGE: "bg-blue-100 text-blue-800",
  PAUSE: "bg-red-100 text-red-800",
  ENABLE: "bg-green-100 text-green-800",
  BID_CHANGE: "bg-amber-100 text-amber-800",
  CREATIVE_CHANGE: "bg-purple-100 text-purple-800",
  AUDIENCE_CHANGE: "bg-teal-100 text-teal-800",
};

interface Platform { platform: string; name: string; spend: number; impressions: number; clicks: number; conversions: number; ctr: number; cpa: number; roas: number }
interface Campaign { id: string; name: string; platform: string; status: string; objective: string; budgetDaily: number; spend: number; impressions: number; clicks: number; ctr: number; conversions: number; cpa: number; roas: number }
interface OptLog { id: string; ruleName: string; actionType: string; description: string; campaign?: { name: string }; oldValue: string; newValue: string; impact: string; createdAt: string }
interface Rule { id: string; name: string; type: string; conditions: string; actions: string; isEnabled: boolean; lastTriggered: string | null }

export default function AdsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [optLogs, setOptLogs] = useState<OptLog[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalConversions, setTotalConversions] = useState(0);
  const [blendedRoas, setBlendedRoas] = useState(0);
  const [blendedCpa, setBlendedCpa] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState({ name: "", type: "BUDGET", conditions: "", actions: "" });
  const [optimizing, setOptimizing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [adsRes, rulesRes] = await Promise.all([fetch("/api/ads"), fetch("/api/optimization/rules")]);
      if (adsRes.ok) {
        const d = await adsRes.json();
        setPlatforms(d.platforms || []);
        setCampaigns(d.campaigns || []);
        setOptLogs(d.recentOptimizations || []);
        setTotalSpend(d.totalSpend || 0);
        setTotalConversions(d.totalConversions || 0);
        setBlendedRoas(d.blendedRoas || 0);
        setBlendedCpa(d.blendedCpa || 0);
      }
      if (rulesRes.ok) {
        const d = await rulesRes.json();
        setRules(d.rules || []);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function runOptimization() {
    setOptimizing(true);
    try {
      await fetch("/api/optimization/run", { method: "POST" });
      await fetchData();
    } catch {}
    setOptimizing(false);
  }

  async function addRule() {
    await fetch("/api/optimization/rules", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newRule.name, type: newRule.type, conditions: newRule.conditions || "[]", actions: newRule.actions || "[]" }),
    });
    setShowAddRule(false);
    setNewRule({ name: "", type: "BUDGET", conditions: "", actions: "" });
    fetchData();
  }

  const filtered = campaigns.filter((c) => {
    if (filterPlatform && c.platform !== filterPlatform) return false;
    if (filterStatus && c.status !== filterStatus) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const spendData = platforms.map((p) => ({ name: p.name, value: p.spend }));
  const roasData = campaigns.filter((c) => c.roas > 0).sort((a, b) => b.roas - a.roas).slice(0, 8).map((c) => ({ name: c.name.length > 25 ? c.name.slice(0, 25) + "..." : c.name, roas: c.roas, platform: c.platform }));

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div><Skeleton className="h-96" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Ads Manager</h1>
        <Button onClick={runOptimization} disabled={optimizing}>{optimizing ? "Running..." : "Run Optimization"}</Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="attribution">Attribution</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview">
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Total Spend", value: formatCurrency(totalSpend), icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                { label: "Conversions", value: formatNumber(totalConversions), icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
                { label: "Blended ROAS", value: `${blendedRoas.toFixed(1)}x`, icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
                { label: "Blended CPA", value: formatCurrency(blendedCpa), icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
              ].map((s) => (
                <Card key={s.label}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={s.icon} /></svg>
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold">{s.value}</div></CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-4">
              {platforms.map((p) => {
                const colors = PLATFORM_COLORS[p.platform] || PLATFORM_COLORS.GOOGLE;
                return (
                  <Card key={p.platform} className={cn("border-l-4")} style={{ borderLeftColor: colors.hex }}>
                    <CardHeader className="pb-2"><CardTitle className="text-base">{p.name}</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Spend</span><span className="font-medium">{formatCurrency(p.spend)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Conversions</span><span className="font-medium">{formatNumber(p.conversions)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">ROAS</span><span className={cn("font-bold", p.roas >= 3 ? "text-green-600" : p.roas >= 1.5 ? "text-amber-600" : "text-red-600")}>{p.roas.toFixed(1)}x</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">CPA</span><span className="font-medium">{formatCurrency(p.cpa)}</span></div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle>Spend Distribution</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={spendData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                        {spendData.map((_, i) => <Cell key={i} fill={Object.values(PLATFORM_COLORS)[i]?.hex || "#8884d8"} />)}
                      </Pie>
                      <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Top Campaigns by ROAS</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={roasData} layout="vertical" margin={{ left: 20 }}>
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => `${Number(v).toFixed(1)}x`} />
                      <Bar dataKey="roas" fill="#2563eb" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* CAMPAIGNS */}
        <TabsContent value="campaigns">
          <div className="space-y-4">
            <div className="flex gap-3">
              <Input placeholder="Search campaigns..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
              <Select value={filterPlatform} onChange={(v) => setFilterPlatform(v)} placeholder="All Platforms" options={[{ label: "All Platforms", value: "" }, { label: "Google", value: "GOOGLE" }, { label: "Meta", value: "META" }, { label: "X", value: "X" }, { label: "TikTok", value: "TIKTOK" }]} />
              <Select value={filterStatus} onChange={(v) => setFilterStatus(v)} placeholder="All Statuses" options={[{ label: "All Statuses", value: "" }, { label: "Active", value: "ACTIVE" }, { label: "Paused", value: "PAUSED" }, { label: "Completed", value: "COMPLETED" }]} />
            </div>
            <Card>
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Objective</TableHead>
                      <TableHead className="text-right">Budget/Day</TableHead>
                      <TableHead className="text-right">Spend</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead className="text-right">CTR</TableHead>
                      <TableHead className="text-right">Conv.</TableHead>
                      <TableHead className="text-right">CPA</TableHead>
                      <TableHead className="text-right">ROAS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((c) => (
                      <TableRow key={c.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell><Badge className={cn(PLATFORM_COLORS[c.platform]?.bg, PLATFORM_COLORS[c.platform]?.text)}>{c.platform}</Badge></TableCell>
                        <TableCell><Badge className={statusColors[c.status] || ""}>{c.status}</Badge></TableCell>
                        <TableCell className="text-muted-foreground">{c.objective || "—"}</TableCell>
                        <TableCell className="text-right">{c.budgetDaily ? formatCurrency(c.budgetDaily) : "—"}</TableCell>
                        <TableCell className="text-right">{formatCurrency(c.spend)}</TableCell>
                        <TableCell className="text-right">{formatNumber(c.clicks)}</TableCell>
                        <TableCell className="text-right">{c.ctr.toFixed(2)}%</TableCell>
                        <TableCell className="text-right">{formatNumber(c.conversions)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(c.cpa)}</TableCell>
                        <TableCell className={cn("text-right font-bold", c.roas >= 3 ? "text-green-600" : c.roas >= 1.5 ? "text-amber-600" : "text-red-600")}>{c.roas.toFixed(1)}x</TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && <TableRow><TableCell colSpan={11} className="text-center py-8 text-muted-foreground">No campaigns found</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* OPTIMIZATION */}
        <TabsContent value="optimization">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Optimization Rules</h2>
              <Button onClick={() => setShowAddRule(true)}>Add Rule</Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rules.map((r) => (
                <Card key={r.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{r.name}</CardTitle>
                      <Badge className={cn(r.type === "BUDGET" ? "bg-blue-100 text-blue-800" : r.type === "CREATIVE" ? "bg-purple-100 text-purple-800" : r.type === "AUDIENCE" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800")}>{r.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge className={r.isEnabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>{r.isEnabled ? "Enabled" : "Disabled"}</Badge>
                    </div>
                    {r.lastTriggered && <p className="text-xs text-muted-foreground">Last triggered: {new Date(r.lastTriggered).toLocaleDateString()}</p>}
                  </CardContent>
                </Card>
              ))}
              {rules.length === 0 && <p className="text-muted-foreground col-span-3">No optimization rules configured yet.</p>}
            </div>

            <h2 className="text-xl font-semibold">Recent Actions</h2>
            <Card>
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Before</TableHead>
                      <TableHead>After</TableHead>
                      <TableHead>Impact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {optLogs.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="text-muted-foreground">{new Date(l.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{l.campaign?.name || "—"}</TableCell>
                        <TableCell><Badge className={actionTypeColors[l.actionType] || ""}>{l.actionType}</Badge></TableCell>
                        <TableCell className="max-w-xs truncate">{l.description}</TableCell>
                        <TableCell className="text-muted-foreground">{l.oldValue || "—"}</TableCell>
                        <TableCell>{l.newValue || "—"}</TableCell>
                        <TableCell className="text-sm">{l.impact || "—"}</TableCell>
                      </TableRow>
                    ))}
                    {optLogs.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No optimization actions yet</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ATTRIBUTION */}
        <TabsContent value="attribution">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Platform Attribution</h2>
            <div className="grid grid-cols-4 gap-4">
              {platforms.map((p) => {
                const colors = PLATFORM_COLORS[p.platform] || PLATFORM_COLORS.GOOGLE;
                return (
                  <Card key={p.platform} style={{ borderTopColor: colors.hex }} className="border-t-4">
                    <CardHeader className="pb-2"><CardTitle className="text-base">{p.name}</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Ad Spend</span><span className="font-medium">{formatCurrency(p.spend)}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Clicks</span><span className="font-medium">{formatNumber(p.clicks)}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Conversions</span><span className="font-bold text-green-600">{formatNumber(p.conversions)}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">CPA</span><span>{formatCurrency(p.cpa)}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">ROAS</span><span className="font-bold">{p.roas.toFixed(1)}x</span></div>
                      </div>
                      {/* Mini funnel */}
                      <div className="space-y-1 pt-2 border-t">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Funnel</div>
                        {[
                          { label: "Impressions", value: p.impressions, pct: 100 },
                          { label: "Clicks", value: p.clicks, pct: (p.clicks / p.impressions) * 100 },
                          { label: "Conversions", value: p.conversions, pct: (p.conversions / p.clicks) * 100 },
                        ].map((f) => (
                          <div key={f.label} className="flex items-center gap-2">
                            <div className="h-2 rounded-full" style={{ width: `${Math.max(f.pct, 5)}%`, backgroundColor: colors.hex, opacity: 0.7 }} />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{f.label}: {formatNumber(f.value)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ADD RULE DIALOG */}
      <Dialog open={showAddRule} onOpenChange={setShowAddRule}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Optimization Rule</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">Rule Name</label><Input value={newRule.name} onChange={(e) => setNewRule({ ...newRule, name: e.target.value })} placeholder="e.g. High CPA Auto-Pause" /></div>
            <div><label className="text-sm font-medium">Type</label><Select value={newRule.type} onChange={(v) => setNewRule({ ...newRule, type: v })} options={[{ label: "Budget", value: "BUDGET" }, { label: "Creative", value: "CREATIVE" }, { label: "Audience", value: "AUDIENCE" }, { label: "Bid", value: "BID" }]} /></div>
            <div><label className="text-sm font-medium">Conditions (JSON)</label><Input value={newRule.conditions} onChange={(e) => setNewRule({ ...newRule, conditions: e.target.value })} placeholder='[{"metric":"cpa","operator":">","value":75}]' /></div>
            <div><label className="text-sm font-medium">Actions (JSON)</label><Input value={newRule.actions} onChange={(e) => setNewRule({ ...newRule, actions: e.target.value })} placeholder='[{"action":"pause"}]' /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRule(false)}>Cancel</Button>
            <Button onClick={addRule} disabled={!newRule.name}>Create Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
