"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

const platformColors: Record<string, { bg: string; text: string; dot: string }> = {
  GOOGLE: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  META: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  X: { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-800" },
  TIKTOK: { bg: "bg-pink-50", text: "text-pink-700", dot: "bg-pink-500" },
};

const platformData = [
  { platform: "GOOGLE", name: "Google Ads", status: "Connected", spend: 4850, impressions: 245000, clicks: 8900, ctr: 3.63, conversions: 156, cpa: 31.09, roas: 4.2 },
  { platform: "META", name: "Meta Ads", status: "Connected", spend: 3920, impressions: 380000, clicks: 6200, ctr: 1.63, conversions: 112, cpa: 35.0, roas: 3.1 },
  { platform: "X", name: "X Ads", status: "Connected", spend: 1580, impressions: 95000, clicks: 2100, ctr: 2.21, conversions: 38, cpa: 41.58, roas: 2.4 },
  { platform: "TIKTOK", name: "TikTok Ads", status: "Connected", spend: 2100, impressions: 520000, clicks: 4800, ctr: 0.92, conversions: 36, cpa: 58.33, roas: 1.8 },
];

const mockCampaigns = [
  { id: "1", name: "Brand Awareness - Search", platform: "GOOGLE", status: "ACTIVE", objective: "Conversions", budget: 150, spend: 2340, impressions: 125000, clicks: 4500, ctr: 3.6, conversions: 89, cpa: 26.29, roas: 5.1 },
  { id: "2", name: "Retargeting - Website Visitors", platform: "META", status: "ACTIVE", objective: "Conversions", budget: 100, spend: 1850, impressions: 180000, clicks: 3200, ctr: 1.78, conversions: 62, cpa: 29.84, roas: 3.8 },
  { id: "3", name: "Lookalike - Top Customers", platform: "META", status: "ACTIVE", objective: "Lead Gen", budget: 80, spend: 1280, impressions: 120000, clicks: 1800, ctr: 1.5, conversions: 34, cpa: 37.65, roas: 2.9 },
  { id: "4", name: "Performance Max - Q2", platform: "GOOGLE", status: "ACTIVE", objective: "Sales", budget: 120, spend: 1650, impressions: 95000, clicks: 3200, ctr: 3.37, conversions: 52, cpa: 31.73, roas: 4.0 },
  { id: "5", name: "Engagement - Thought Leadership", platform: "X", status: "ACTIVE", objective: "Engagement", budget: 50, spend: 820, impressions: 55000, clicks: 1200, ctr: 2.18, conversions: 18, cpa: 45.56, roas: 2.1 },
  { id: "6", name: "Video Views - Product Demo", platform: "TIKTOK", status: "ACTIVE", objective: "Video Views", budget: 75, spend: 1100, impressions: 320000, clicks: 2800, ctr: 0.88, conversions: 22, cpa: 50.0, roas: 1.9 },
  { id: "7", name: "Competitor Keywords", platform: "GOOGLE", status: "PAUSED", objective: "Traffic", budget: 40, spend: 580, impressions: 15000, clicks: 750, ctr: 5.0, conversions: 12, cpa: 48.33, roas: 1.5 },
  { id: "8", name: "Spring Promo - Carousel", platform: "META", status: "ACTIVE", objective: "Conversions", budget: 60, spend: 790, impressions: 80000, clicks: 1200, ctr: 1.5, conversions: 16, cpa: 49.38, roas: 2.2 },
  { id: "9", name: "App Install - Gen Z", platform: "TIKTOK", status: "PAUSED", objective: "App Install", budget: 50, spend: 620, impressions: 150000, clicks: 1200, ctr: 0.8, conversions: 8, cpa: 77.5, roas: 0.9 },
  { id: "10", name: "Webinar Promotion", platform: "X", status: "COMPLETED", objective: "Conversions", budget: 30, spend: 460, impressions: 28000, clicks: 580, ctr: 2.07, conversions: 14, cpa: 32.86, roas: 3.2 },
  { id: "11", name: "Display - Industry Sites", platform: "GOOGLE", status: "ACTIVE", objective: "Awareness", budget: 35, spend: 280, impressions: 10000, clicks: 450, ctr: 4.5, conversions: 3, cpa: 93.33, roas: 0.8 },
  { id: "12", name: "Lead Magnet - Whitepaper", platform: "META", status: "COMPLETED", objective: "Lead Gen", budget: 25, spend: 0, impressions: 0, clicks: 0, ctr: 0, conversions: 0, cpa: 0, roas: 0 },
];

const mockOptLogs = [
  { id: "1", date: "2026-04-03", campaign: "Brand Awareness - Search", action: "BUDGET_CHANGE", description: "Increased daily budget due to strong ROAS (5.1x)", oldValue: "$120/day", newValue: "$150/day", impact: "+12% conversions" },
  { id: "2", date: "2026-04-02", campaign: "App Install - Gen Z", action: "PAUSE", description: "Paused campaign - CPA exceeded $75 threshold for 3 consecutive days", oldValue: "Active", newValue: "Paused", impact: "Saving $50/day" },
  { id: "3", date: "2026-04-02", campaign: "Retargeting - Website Visitors", action: "AUDIENCE_CHANGE", description: "Excluded converted customers from retargeting audience", oldValue: "All visitors", newValue: "Non-customers only", impact: "-8% spend waste" },
  { id: "4", date: "2026-04-01", campaign: "Lookalike - Top Customers", action: "CREATIVE_CHANGE", description: "Paused underperforming ad creative (CTR 0.3%)", oldValue: "Creative A active", newValue: "Creative A paused", impact: "+0.4% CTR" },
  { id: "5", date: "2026-03-31", campaign: "Competitor Keywords", action: "PAUSE", description: "Paused due to CPA exceeding target by 2x", oldValue: "Active", newValue: "Paused", impact: "Saving $40/day" },
  { id: "6", date: "2026-03-30", campaign: "Video Views - Product Demo", action: "BID_CHANGE", description: "Reduced bid on low-performing placements", oldValue: "$0.15 CPV", newValue: "$0.10 CPV", impact: "-20% cost per view" },
  { id: "7", date: "2026-03-29", campaign: "Performance Max - Q2", action: "BUDGET_CHANGE", description: "Redistributed budget from paused campaigns", oldValue: "$100/day", newValue: "$120/day", impact: "Pending" },
  { id: "8", date: "2026-03-28", campaign: "Spring Promo - Carousel", action: "CREATIVE_CHANGE", description: "Rotated in new creative variant B for A/B testing", oldValue: "Creative A only", newValue: "A/B split test", impact: "Testing" },
];

const statCards = [
  { title: "Total Ad Spend", value: formatCurrency(12450), change: "+8.2%", positive: false },
  { title: "Total Conversions", value: "342", change: "+15.4%", positive: true },
  { title: "Blended ROAS", value: "3.2x", change: "+0.3x", positive: true },
  { title: "Blended CPA", value: formatCurrency(36.4), change: "-4.1%", positive: true },
];

export default function AdsPage() {
  const [dateRange, setDateRange] = useState("30d");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ads Manager</h1>
          <p className="text-muted-foreground">Cross-platform ad performance monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-lg border p-1">
            {["7d", "30d", "90d"].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={cn(
                  "px-3 py-1 text-sm rounded-md transition-colors",
                  dateRange === range ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <Button>Connect Platform</Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className={cn("text-xs font-medium", stat.positive ? "text-green-600" : "text-red-600")}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Platform Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Spend</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="text-right">CPA</TableHead>
                <TableHead className="text-right">ROAS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {platformData.map((p) => {
                const colors = platformColors[p.platform];
                return (
                  <TableRow key={p.platform}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2.5 w-2.5 rounded-full", colors.dot)} />
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">{p.status}</Badge></TableCell>
                    <TableCell className="text-right">{formatCurrency(p.spend)}</TableCell>
                    <TableCell className="text-right">{formatNumber(p.impressions)}</TableCell>
                    <TableCell className="text-right">{formatNumber(p.clicks)}</TableCell>
                    <TableCell className="text-right">{p.ctr}%</TableCell>
                    <TableCell className="text-right">{p.conversions}</TableCell>
                    <TableCell className="text-right">{formatCurrency(p.cpa)}</TableCell>
                    <TableCell className="text-right font-medium">{p.roas}x</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns ({mockCampaigns.length})</TabsTrigger>
          <TabsTrigger value="adsets">Ad Sets</TabsTrigger>
          <TabsTrigger value="ads">Ads</TabsTrigger>
          <TabsTrigger value="optimization">Optimization Log</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Objective</TableHead>
                    <TableHead className="text-right">Budget/day</TableHead>
                    <TableHead className="text-right">Spend</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead className="text-right">Conv.</TableHead>
                    <TableHead className="text-right">CPA</TableHead>
                    <TableHead className="text-right">ROAS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCampaigns.map((c) => {
                    const colors = platformColors[c.platform];
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">{c.name}</TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs", colors.bg, colors.text)} variant="outline">{c.platform}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={c.status === "ACTIVE" ? "default" : c.status === "PAUSED" ? "secondary" : "outline"} className="text-xs">
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{c.objective}</TableCell>
                        <TableCell className="text-right">{formatCurrency(c.budget)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(c.spend)}</TableCell>
                        <TableCell className="text-right">{formatNumber(c.clicks)}</TableCell>
                        <TableCell className="text-right">{c.ctr}%</TableCell>
                        <TableCell className="text-right">{c.conversions}</TableCell>
                        <TableCell className="text-right">{c.cpa > 0 ? formatCurrency(c.cpa) : "-"}</TableCell>
                        <TableCell className="text-right font-medium">{c.roas > 0 ? `${c.roas}x` : "-"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adsets">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>Ad Sets view - drill down into campaign ad sets with targeting details</p>
              <p className="text-sm mt-2">Select a campaign to view its ad sets</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>Individual Ads view - creative performance, A/B test results</p>
              <p className="text-sm mt-2">Select a campaign to view its ads</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization">
          <Card>
            <CardContent className="p-0">
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
                  {mockOptLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-sm">{log.date}</TableCell>
                      <TableCell className="font-medium text-sm max-w-[150px] truncate">{log.campaign}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {log.action.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm max-w-[250px]">{log.description}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.oldValue}</TableCell>
                      <TableCell className="text-sm font-medium">{log.newValue}</TableCell>
                      <TableCell className="text-sm">{log.impact}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
