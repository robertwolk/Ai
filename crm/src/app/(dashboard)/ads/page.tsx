'use client'

import {
  BarChart3, TrendingUp, TrendingDown, DollarSign,
  Target, Zap, RefreshCw, Calendar, AlertCircle, CheckCircle
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const platforms = [
  {
    name: 'Google Ads', color: '#4285f4', icon: 'G',
    spend: 12400, impressions: 284000, clicks: 8240, ctr: 2.9,
    conversions: 84, cpa: 147.6, roas: 4.2, change: +0.4
  },
  {
    name: 'Meta Ads', color: '#1877f2', icon: 'M',
    spend: 8900, impressions: 312000, clicks: 7480, ctr: 2.4,
    conversions: 62, cpa: 143.5, roas: 3.8, change: +0.2
  },
  {
    name: 'TikTok Ads', color: '#ff0050', icon: 'T',
    spend: 5200, impressions: 198000, clicks: 5940, ctr: 3.0,
    conversions: 41, cpa: 126.8, roas: 3.1, change: -0.3
  },
  {
    name: 'LinkedIn Ads', color: '#0a66c2', icon: 'L',
    spend: 3800, impressions: 94000, clicks: 1880, ctr: 2.0,
    conversions: 28, cpa: 135.7, roas: 2.9, change: +0.1
  },
]

const trendData = [
  { date: 'Mar 28', google: 410, meta: 320, tiktok: 180, linkedin: 130 },
  { date: 'Mar 29', google: 380, meta: 290, tiktok: 210, linkedin: 120 },
  { date: 'Mar 30', google: 450, meta: 340, tiktok: 195, linkedin: 145 },
  { date: 'Mar 31', google: 420, meta: 310, tiktok: 175, linkedin: 125 },
  { date: 'Apr 1', google: 490, meta: 370, tiktok: 220, linkedin: 155 },
  { date: 'Apr 2', google: 465, meta: 355, tiktok: 205, linkedin: 140 },
  { date: 'Apr 3', google: 510, meta: 385, tiktok: 230, linkedin: 160 },
]

const topCampaigns = [
  { name: 'Brand Awareness Q2', platform: 'Google', spend: 4200, roas: 5.1, status: 'Active', conversions: 32 },
  { name: 'Retargeting - Website Visitors', platform: 'Meta', spend: 2800, roas: 6.3, status: 'Active', conversions: 24 },
  { name: 'Cold Audience - SaaS', platform: 'Meta', spend: 3100, roas: 2.9, status: 'Active', conversions: 18 },
  { name: 'Search - High Intent KWs', platform: 'Google', spend: 3600, roas: 4.8, status: 'Active', conversions: 28 },
  { name: 'Creator Content Boost', platform: 'TikTok', spend: 2400, roas: 3.4, status: 'Active', conversions: 19 },
  { name: 'Decision Maker Targeting', platform: 'LinkedIn', spend: 1900, roas: 3.0, status: 'Paused', conversions: 14 },
]

const alerts = [
  { type: 'warning', message: 'TikTok CPA increased 18% — "Creator Content Boost" may need optimization', time: '2h ago' },
  { type: 'success', message: 'Google "Retargeting" ROAS hit 6.3x — Budget increase recommended', time: '4h ago' },
  { type: 'warning', message: 'Meta frequency > 4.2 on "Cold Audience" — Creative fatigue detected', time: '6h ago' },
]

const platformColors: Record<string, string> = {
  Google: '#4285f4',
  Meta: '#1877f2',
  TikTok: '#ff0050',
  LinkedIn: '#0a66c2',
}

export default function AdsDashboardPage() {
  const totalSpend = platforms.reduce((s, p) => s + p.spend, 0)
  const totalConversions = platforms.reduce((s, p) => s + p.conversions, 0)
  const blendedROAS = platforms.reduce((s, p) => s + p.roas, 0) / platforms.length
  const blendedCPA = totalSpend / totalConversions

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ad Platform Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Unified view across all ad platforms · Last synced 8 min ago</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" /> Last 7 days
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" /> Sync
          </Button>
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
            <Zap className="w-4 h-4 mr-2" /> Auto-Optimize
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Spend', value: `$${(totalSpend / 1000).toFixed(1)}K`, change: '-3.1%', up: false, icon: DollarSign },
          { label: 'Total Conversions', value: totalConversions.toString(), change: '+12.4%', up: true, icon: Target },
          { label: 'Blended ROAS', value: `${blendedROAS.toFixed(1)}x`, change: '+0.4x', up: true, icon: TrendingUp },
          { label: 'Blended CPA', value: `$${blendedCPA.toFixed(0)}`, change: '-8.2%', up: true, icon: BarChart3 },
        ].map(kpi => (
          <Card key={kpi.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-0.5">{kpi.value}</p>
                  <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}>
                    {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {kpi.change}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-violet-100">
                  <kpi.icon className="w-4 h-4 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {platforms.map(p => (
          <Card key={p.name} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: p.color }}
                >
                  {p.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{p.name}</p>
                </div>
                <div className={`text-xs font-medium ${p.change > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {p.change > 0 ? '+' : ''}{p.change}x
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Spend</p>
                  <p className="font-semibold">${(p.spend / 1000).toFixed(1)}K</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ROAS</p>
                  <p className="font-semibold text-emerald-600">{p.roas}x</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">CPA</p>
                  <p className="font-semibold">${p.cpa.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Conv.</p>
                  <p className="font-semibold">{p.conversions}</p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>CTR</span>
                  <span>{p.ctr}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${(p.ctr / 3.5) * 100}%`, background: p.color }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Spend Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Daily Spend by Platform</CardTitle>
            <CardDescription>Last 7 days performance trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={(v: number, name: string) => [`$${v}`, name]} />
                <Line type="monotone" dataKey="google" stroke="#4285f4" strokeWidth={2} dot={false} name="Google" />
                <Line type="monotone" dataKey="meta" stroke="#1877f2" strokeWidth={2} dot={false} name="Meta" />
                <Line type="monotone" dataKey="tiktok" stroke="#ff0050" strokeWidth={2} dot={false} name="TikTok" />
                <Line type="monotone" dataKey="linkedin" stroke="#0a66c2" strokeWidth={2} dot={false} name="LinkedIn" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">AI Alerts</CardTitle>
              <Badge variant="secondary" className="text-orange-700 bg-orange-50">{alerts.filter(a => a.type === 'warning').length} warnings</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <div key={i} className="flex gap-2.5">
                  {alert.type === 'warning' ? (
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-xs text-foreground">{alert.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button size="sm" className="w-full mt-4 bg-violet-600 hover:bg-violet-700 text-xs">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Apply AI Recommendations
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Campaigns Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Active Campaigns</CardTitle>
              <CardDescription>All campaigns across platforms ranked by ROAS</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-violet-600 text-xs">
              View all campaigns
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Campaign</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Platform</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">Spend</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">Conversions</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">ROAS</th>
                  <th className="text-center py-3 px-4 text-muted-foreground font-medium">Status</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {topCampaigns.map((c, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{c.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: platformColors[c.platform] }} />
                        <span className="text-muted-foreground">{c.platform}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">${c.spend.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{c.conversions}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-semibold ${c.roas >= 4 ? 'text-emerald-600' : c.roas >= 3 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                        {c.roas}x
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${c.status === 'Active' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 bg-slate-100'}`}
                      >
                        {c.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" className="text-xs h-7">Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
