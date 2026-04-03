"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatNumber } from "@/lib/utils";

const quickReports = [
  { title: "Revenue Report", description: "Track revenue trends, MRR growth, and deal values over time.", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-green-600 bg-green-50" },
  { title: "Pipeline Report", description: "Visualize deal flow, stage conversion rates, and pipeline velocity.", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", color: "text-blue-600 bg-blue-50" },
  { title: "Activity Report", description: "Team productivity metrics: calls, emails, meetings, and tasks.", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "text-purple-600 bg-purple-50" },
  { title: "Lead Source Report", description: "Compare lead quality and ROI across acquisition channels.", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: "text-orange-600 bg-orange-50" },
  { title: "Ad Performance Report", description: "Cross-platform ad metrics, ROAS, CPA, and budget efficiency.", icon: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z", color: "text-pink-600 bg-pink-50" },
  { title: "Social Media Report", description: "Content performance, engagement trends, and audience growth.", icon: "M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4", color: "text-cyan-600 bg-cyan-50" },
];

const revenueBySource = [
  { source: "Google Ads", leads: 245, dealsWon: 42, revenue: 184500, roi: 4.2 },
  { source: "Meta Ads", leads: 198, dealsWon: 28, revenue: 98400, roi: 3.1 },
  { source: "Organic", leads: 156, dealsWon: 31, revenue: 142000, roi: null },
  { source: "Referral", leads: 67, dealsWon: 18, revenue: 95200, roi: null },
  { source: "Cold Email", leads: 89, dealsWon: 8, revenue: 34800, roi: 2.8 },
  { source: "X Ads", leads: 54, dealsWon: 6, revenue: 22500, roi: 2.4 },
  { source: "TikTok Ads", leads: 72, dealsWon: 4, revenue: 15200, roi: 1.8 },
];

const topCampaigns = [
  { name: "Brand Awareness - Search", platform: "Google", leads: 89, revenue: 82500, roas: 5.1 },
  { name: "Retargeting - Website Visitors", platform: "Meta", leads: 62, revenue: 54200, roas: 3.8 },
  { name: "Performance Max - Q2", platform: "Google", leads: 52, revenue: 48300, roas: 4.0 },
  { name: "Lookalike - Top Customers", platform: "Meta", leads: 34, revenue: 28700, roas: 2.9 },
  { name: "Webinar Promotion", platform: "X", leads: 14, revenue: 18500, roas: 3.2 },
];

const monthlyComparison = [
  { metric: "Revenue", current: "$284,500", previous: "$241,200", change: "+17.9%", positive: true },
  { metric: "New Deals", current: "42", previous: "35", change: "+20%", positive: true },
  { metric: "New Contacts", current: "128", previous: "104", change: "+23.1%", positive: true },
  { metric: "Activities Logged", current: "347", previous: "289", change: "+20.1%", positive: true },
  { metric: "Conversion Rate", current: "24.5%", previous: "22.1%", change: "+2.4pp", positive: true },
  { metric: "Avg Deal Size", current: "$6,774", previous: "$6,891", change: "-1.7%", positive: false },
  { metric: "Ad Spend", current: "$12,450", previous: "$11,200", change: "+11.2%", positive: false },
  { metric: "Blended ROAS", current: "3.2x", previous: "2.8x", change: "+14.3%", positive: true },
];

export default function ReportsPage() {
  const [showExport, setShowExport] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Analytics and insights across your CRM</p>
        </div>
        <div className="flex gap-2 relative">
          <Button variant="outline" onClick={() => console.log("Create report")}>
            Create Report
          </Button>
          <div className="relative">
            <Button variant="outline" onClick={() => setShowExport(!showExport)}>
              Export
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
            {showExport && (
              <div className="absolute right-0 top-full mt-1 w-32 rounded-md border bg-popover p-1 shadow-md z-10">
                <button className="w-full rounded px-3 py-1.5 text-sm text-left hover:bg-muted" onClick={() => { console.log("Export CSV"); setShowExport(false); }}>CSV</button>
                <button className="w-full rounded px-3 py-1.5 text-sm text-left hover:bg-muted" onClick={() => { console.log("Export PDF"); setShowExport(false); }}>PDF</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Reports Grid */}
      <div className="grid grid-cols-3 gap-4">
        {quickReports.map((report) => (
          <Card key={report.title} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${report.color.split(" ")[1]}`}>
                  <svg className={`h-5 w-5 ${report.color.split(" ")[0]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={report.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-sm">{report.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="ads">Ads</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="leadgen">Lead Gen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Month over Month */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">This Month vs Last Month</CardTitle>
                <CardDescription>Key metrics comparison for April vs March 2026</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {monthlyComparison.map((item) => (
                    <div key={item.metric} className="rounded-lg border p-4">
                      <p className="text-xs text-muted-foreground">{item.metric}</p>
                      <p className="text-lg font-bold mt-1">{item.current}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">vs {item.previous}</span>
                        <span className={`text-xs font-medium ${item.positive ? "text-green-600" : "text-red-600"}`}>
                          {item.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Source */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Leads</TableHead>
                      <TableHead className="text-right">Deals Won</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">ROI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueBySource.map((row) => (
                      <TableRow key={row.source}>
                        <TableCell className="font-medium">{row.source}</TableCell>
                        <TableCell className="text-right">{row.leads}</TableCell>
                        <TableCell className="text-right">{row.dealsWon}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.revenue)}</TableCell>
                        <TableCell className="text-right">{row.roi ? `${row.roi}x` : "-"}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">{revenueBySource.reduce((s, r) => s + r.leads, 0)}</TableCell>
                      <TableCell className="text-right">{revenueBySource.reduce((s, r) => s + r.dealsWon, 0)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(revenueBySource.reduce((s, r) => s + r.revenue, 0))}</TableCell>
                      <TableCell className="text-right">-</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Top Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Performing Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead className="text-right">Leads</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">ROAS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCampaigns.map((c) => (
                      <TableRow key={c.name}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell><Badge variant="outline">{c.platform}</Badge></TableCell>
                        <TableCell className="text-right">{c.leads}</TableCell>
                        <TableCell className="text-right">{formatCurrency(c.revenue)}</TableCell>
                        <TableCell className="text-right font-medium">{c.roas}x</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Revenue Analytics</h3>
                <p className="text-sm text-muted-foreground mt-2">MRR tracking, revenue trends, forecasting, and deal value analysis</p>
                <p className="text-xs text-muted-foreground mt-4">Integrate Recharts for interactive revenue charts</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline">
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Pipeline Analytics</h3>
                <p className="text-sm text-muted-foreground mt-2">Stage conversion rates, pipeline velocity, win/loss analysis</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads">
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Ad Performance Analytics</h3>
                <p className="text-sm text-muted-foreground mt-2">Cross-platform comparison, ROAS trends, budget efficiency</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Social Media Analytics</h3>
                <p className="text-sm text-muted-foreground mt-2">Engagement trends, content performance, audience growth</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leadgen">
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Lead Gen Analytics</h3>
                <p className="text-sm text-muted-foreground mt-2">Scraping ROI, source quality, ICP accuracy, conversion funnels</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
