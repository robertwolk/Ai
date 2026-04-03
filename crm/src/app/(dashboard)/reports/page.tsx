"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DashData {
  totalRevenue: number; activeDeals: number; newContacts: number; conversionRate: number;
  pipelineByStage: { stage: string; count: number; value: number }[];
  revenueByMonth: { month: string; revenue: number }[];
  leadsBySource: { source: string; count: number }[];
  dealVelocity: number;
}

interface AdsData {
  platforms: { platform: string; name: string; spend: number; conversions: number; roas: number; cpa: number }[];
  campaigns: { name: string; platform: string; spend: number; conversions: number; cpa: number; roas: number }[];
  totalSpend: number; totalConversions: number; blendedRoas: number;
}

const SOURCE_COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2", "#be185d", "#4f46e5"];
const STAGE_COLORS = ["#94a3b8", "#3b82f6", "#6366f1", "#f59e0b", "#f97316", "#10b981", "#ef4444"];

export default function ReportsPage() {
  const [dashData, setDashData] = useState<DashData | null>(null);
  const [adsData, setAdsData] = useState<AdsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30");
  const [exportType, setExportType] = useState("contacts");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dRes, aRes] = await Promise.all([fetch("/api/dashboard"), fetch("/api/ads")]);
      if (dRes.ok) setDashData(await dRes.json());
      if (aRes.ok) setAdsData(await aRes.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleExport() {
    const res = await fetch(`/api/export?type=${exportType}`);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${exportType}-export.csv`; a.click();
      URL.revokeObjectURL(url);
    }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-[400px]" /></div>;

  const d = dashData;
  const a = adsData;
  const funnelData = (d?.pipelineByStage || []).filter((s) => s.stage !== "LOST");
  const funnelMax = Math.max(1, ...funnelData.map((s) => s.count));
  const forecastValue = (d?.pipelineByStage || []).reduce((sum, s) => {
    const prob = s.stage === "WON" ? 1 : s.stage === "NEGOTIATION" ? 0.8 : s.stage === "PROPOSAL_SENT" ? 0.6 : s.stage === "MEETING_BOOKED" ? 0.4 : s.stage === "QUALIFIED" ? 0.2 : 0.05;
    return sum + s.value * prob;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <div className="flex gap-2">
          {["7", "30", "90", "365"].map((r) => (
            <Button key={r} variant={dateRange === r ? "default" : "outline"} size="sm" onClick={() => setDateRange(r)}>
              {r === "7" ? "7 Days" : r === "30" ? "30 Days" : r === "90" ? "90 Days" : "1 Year"}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(d?.totalRevenue || 0)}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Win Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{(d?.conversionRate || 0).toFixed(1)}%</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Deal Velocity</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{d?.dealVelocity || 0} days</div></CardContent></Card>
              <Card className="bg-primary/5 border-primary/20"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Revenue Forecast</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-primary">{formatCurrency(forecastValue)}</div><p className="text-xs text-muted-foreground">Pipeline × probability</p></CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle>Revenue by Month</CardTitle></CardHeader><CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={d?.revenueByMonth || []}><defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} /><Tooltip formatter={(v) => formatCurrency(Number(v))} /><Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="url(#rev)" strokeWidth={2} /></AreaChart>
              </ResponsiveContainer>
            </CardContent></Card>
            <Card><CardHeader><CardTitle>Pipeline Funnel</CardTitle></CardHeader><CardContent className="space-y-3">
              {funnelData.map((s, i) => (
                <div key={s.stage} className="space-y-1"><div className="flex justify-between text-sm"><span className="font-medium">{s.stage.replace(/_/g, " ")}</span><span className="text-muted-foreground">{s.count} deals · {formatCurrency(s.value)}</span></div>
                  <div className="h-8 rounded flex items-center px-3" style={{ width: `${Math.max((s.count / funnelMax) * 100, 15)}%`, backgroundColor: STAGE_COLORS[i] || "#94a3b8" }}><span className="text-xs text-white font-medium">{s.count}</span></div></div>
              ))}
            </CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="marketing">
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Ad Spend</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(a?.totalSpend || 0)}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Conversions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatNumber(a?.totalConversions || 0)}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Blended ROAS</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{(a?.blendedRoas || 0).toFixed(1)}x</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg CPA</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(a?.totalConversions ? (a.totalSpend / a.totalConversions) : 0)}</div></CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle>CPA by Platform</CardTitle></CardHeader><CardContent>
              <ResponsiveContainer width="100%" height={300}><BarChart data={a?.platforms || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis tickFormatter={(v) => `$${v}`} /><Tooltip formatter={(v) => formatCurrency(Number(v))} /><Bar dataKey="cpa" fill="#6366f1" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
            </CardContent></Card>
            <Card><CardHeader><CardTitle>Top Campaigns by ROAS</CardTitle></CardHeader><CardContent><div className="space-y-2">
              {(a?.campaigns || []).sort((x, y) => y.roas - x.roas).slice(0, 8).map((c, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0"><div><p className="text-sm font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.platform}</p></div>
                  <div className="flex gap-4 text-sm"><span className="text-muted-foreground">{formatCurrency(c.spend)}</span><span className={cn("font-bold", c.roas >= 3 ? "text-green-600" : c.roas >= 1.5 ? "text-amber-600" : "text-red-600")}>{c.roas.toFixed(1)}x</span></div></div>
              ))}</div></CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="contacts">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card><CardHeader><CardTitle>Contacts by Source</CardTitle></CardHeader><CardContent>
                <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={d?.leadsBySource || []} cx="50%" cy="50%" innerRadius={50} outerRadius={100} dataKey="count" nameKey="source" paddingAngle={3}>
                  {(d?.leadsBySource || []).map((_, i) => <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
              </CardContent></Card>
              <Card><CardHeader><CardTitle>Key Metrics</CardTitle></CardHeader><CardContent><div className="grid grid-cols-1 gap-4">
                <div className="text-center p-6 rounded-lg bg-muted/50"><p className="text-4xl font-bold">{formatNumber(d?.newContacts || 0)}</p><p className="text-sm text-muted-foreground mt-1">New Contacts (30d)</p></div>
                <div className="text-center p-6 rounded-lg bg-muted/50"><p className="text-4xl font-bold">{(d?.conversionRate || 0).toFixed(1)}%</p><p className="text-sm text-muted-foreground mt-1">Lead → Customer Rate</p></div>
              </div></CardContent></Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card><CardHeader><CardTitle>Activity Summary</CardTitle></CardHeader><CardContent>
            <div className="grid grid-cols-5 gap-4">
              {[{ type: "Calls", color: "bg-green-100 text-green-800" }, { type: "Emails", color: "bg-blue-100 text-blue-800" }, { type: "Meetings", color: "bg-indigo-100 text-indigo-800" }, { type: "Notes", color: "bg-amber-100 text-amber-800" }, { type: "Tasks", color: "bg-slate-100 text-slate-800" }].map((a) => (
                <div key={a.type} className="text-center p-4 rounded-lg border"><Badge className={cn(a.color, "mb-2")}>{a.type}</Badge><p className="text-2xl font-bold mt-2">—</p><p className="text-xs text-muted-foreground">Last {dateRange} days</p></div>
              ))}
            </div>
            <p className="text-center text-muted-foreground mt-6">Activity analytics populate as more activities are logged.</p>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="export">
          <Card><CardHeader><CardTitle>Export Data</CardTitle></CardHeader><CardContent className="space-y-6">
            <div><label className="text-sm font-medium mb-2 block">Export type</label><div className="flex gap-2">
              {["contacts", "deals", "activities", "campaigns"].map((t) => (
                <button key={t} onClick={() => setExportType(t)} className={cn("px-4 py-2 rounded-lg border text-sm capitalize", exportType === t ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>{t}</button>
              ))}</div></div>
            <p className="text-sm text-muted-foreground">Downloads a CSV file with all {exportType} data.</p>
            <Button onClick={handleExport}>Export as CSV</Button>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
