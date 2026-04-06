"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardData {
  totalRevenue: number;
  activeDeals: number;
  newContacts: number;
  conversionRate: number;
  pipelineByStage: { stage: string; count: number; totalValue: number }[];
  recentActivities: {
    id: string;
    type: string;
    subject: string;
    contact: { firstName: string; lastName: string; id?: string };
    deal?: { title: string };
    createdAt: string;
  }[];
  topDeals: {
    id: string;
    title: string;
    value: number;
    stage: string;
    contact: { firstName: string; lastName: string; id?: string };
  }[];
  revenueByMonth: { month: string; revenue: number }[];
  leadsBySource: { source: string; count: number }[];
  dealVelocity: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PIPELINE_COLORS: Record<string, string> = {
  Lead: "#94a3b8",
  Qualified: "#3b82f6",
  Meeting: "#6366f1",
  Proposal: "#f59e0b",
  Negotiation: "#f97316",
  Won: "#10b981",
  Lost: "#ef4444",
};

const PIE_COLORS = ["#3b82f6", "#6366f1", "#10b981", "#f59e0b", "#f97316", "#ef4444", "#8b5cf6", "#06b6d4"];

const ACTIVITY_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  email: { label: "Email", color: "bg-blue-100 text-blue-700" },
  call: { label: "Call", color: "bg-emerald-100 text-emerald-700" },
  meeting: { label: "Meeting", color: "bg-indigo-100 text-indigo-700" },
  note: { label: "Note", color: "bg-amber-100 text-amber-700" },
  task: { label: "Task", color: "bg-purple-100 text-purple-700" },
};

// ---------------------------------------------------------------------------
// Inline SVG Icons
// ---------------------------------------------------------------------------

function DollarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

function CheckSquareIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function TrendArrow({ trend, change }: { trend: "up" | "down"; change: number }) {
  const isUp = trend === "up";
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isUp ? "text-emerald-600" : "text-red-600"}`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {isUp ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
      </svg>
      {Math.abs(change).toFixed(1)}%
    </span>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getActivityIcon(type: string) {
  const cls = "h-4 w-4";
  switch (type.toLowerCase()) {
    case "email":
      return <MailIcon className={cls} />;
    case "call":
      return <PhoneIcon className={cls} />;
    case "meeting":
      return <CalendarIcon className={cls} />;
    case "note":
      return <FileTextIcon className={cls} />;
    case "task":
      return <CheckSquareIcon className={cls} />;
    default:
      return <FileTextIcon className={cls} />;
  }
}

function stageBadgeClass(stage: string) {
  switch (stage) {
    case "Lead":
      return "bg-slate-100 text-slate-800 border-slate-200";
    case "Qualified":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Meeting":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "Proposal":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Negotiation":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "Won":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Lost":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

function relativeTime(dateStr: string) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

// ---------------------------------------------------------------------------
// Custom Recharts Tooltip
// ---------------------------------------------------------------------------

function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="mb-1 text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

function PipelineTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="mb-1 text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-sm"><span className="font-bold">{payload[0].value}</span> deals</p>
      {payload[0]?.payload?.value != null && (
        <p className="text-xs text-muted-foreground">{formatCurrency(payload[0].payload.totalValue)} total value</p>
      )}
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="mb-1 text-sm font-medium text-muted-foreground">{payload[0].name}</p>
      <p className="text-sm font-bold">{payload[0].value} leads</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-8 w-52 rounded-md" />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <Skeleton className="h-5 w-28" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>

      {/* Second charts row */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <Skeleton className="h-5 w-28" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardContent className="pt-6">
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>

      {/* Table skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error(`Failed to fetch dashboard data (${res.status})`);
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message ?? "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="mb-2 text-lg font-semibold text-destructive">Failed to load dashboard</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => { setLoading(true); setError(null); location.reload(); }}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  // Safe defaults for arrays
  data.pipelineByStage = data.pipelineByStage || [];
  data.leadsBySource = data.leadsBySource || [];
  data.revenueByMonth = data.revenueByMonth || [];
  data.recentActivities = data.recentActivities || [];
  data.topDeals = data.topDeals || [];

  // Build KPI stats
  const kpiCards = [
    {
      label: "Total Revenue",
      value: formatCurrency(data.totalRevenue),
      icon: <DollarIcon className="h-5 w-5" />,
      trend: "up" as const,
      change: 12.5,
      gradient: "from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20",
      iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
    },
    {
      label: "Active Deals",
      value: formatNumber(data.activeDeals),
      icon: <BriefcaseIcon className="h-5 w-5" />,
      trend: "up" as const,
      change: 8.2,
      gradient: "from-indigo-50 to-indigo-100/50 dark:from-indigo-950/30 dark:to-indigo-900/20",
      iconBg: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400",
    },
    {
      label: "New Contacts",
      value: formatNumber(data.newContacts),
      icon: <UsersIcon className="h-5 w-5" />,
      trend: data.newContacts > 100 ? "up" as const : "down" as const,
      change: 3.1,
      gradient: "from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20",
      iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400",
    },
    {
      label: "Conversion Rate",
      value: `${data.conversionRate}%`,
      icon: <TargetIcon className="h-5 w-5" />,
      trend: "up" as const,
      change: 4.7,
      gradient: "from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20",
      iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400",
    },
  ];

  // Prepare pipeline data with colors
  const pipelineData = (data.pipelineByStage || []).map((item) => ({
    ...item,
    fill: PIPELINE_COLORS[item.stage] ?? "#94a3b8",
  }));

  // Prepare pie data
  const pieData = (data.leadsBySource || []).map((item, idx) => ({
    name: item.source,
    value: item.count,
    fill: PIE_COLORS[idx % PIE_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* ----------------------------------------------------------------- */}
      {/* Header                                                            */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground">
          <CalendarIcon className="h-4 w-4" />
          Last 30 days
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Row 1: KPI Cards                                                  */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className={`bg-gradient-to-br ${kpi.gradient} border`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
              <div className={`rounded-full p-2 ${kpi.iconBg}`}>
                {kpi.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="mt-1 flex items-center gap-1">
                <TrendArrow trend={kpi.trend} change={kpi.change} />
                <span className="text-xs text-muted-foreground">vs. previous period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Row 2: Revenue Overview + Deal Pipeline                           */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Revenue Overview - AreaChart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {data.revenueByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.revenueByMonth} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    className="fill-muted-foreground"
                  />
                  <Tooltip content={<RevenueTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No revenue data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deal Pipeline - BarChart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Deal Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            {pipelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pipelineData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} className="fill-muted-foreground" />
                  <YAxis type="category" dataKey="stage" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={80} className="fill-muted-foreground" />
                  <Tooltip content={<PipelineTooltip />} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
                    {pipelineData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No pipeline data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Row 3: Lead Sources + Deal Velocity / Activity Mini-feed          */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Lead Sources - PieChart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    strokeWidth={0}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => <span className="text-xs text-muted-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No lead source data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deal Velocity + Mini Activity Feed */}
        <div className="lg:col-span-3 space-y-4">
          {/* Deal Velocity */}
          <Card className="bg-gradient-to-br from-indigo-50 to-blue-100/50 dark:from-indigo-950/30 dark:to-blue-900/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Deal Velocity</CardTitle>
              <div className="rounded-full bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                <ZapIcon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.dealVelocity} days</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Average time from lead to close
              </p>
            </CardContent>
          </Card>

          {/* Mini Activity Feed */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentActivities.slice(0, 5).map((activity) => {
                  const config = ACTIVITY_TYPE_CONFIG[activity.type.toLowerCase()] ?? { label: activity.type, color: "bg-slate-100 text-slate-700" };
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-full p-1.5 ${config.color}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{activity.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.contact.firstName} {activity.contact.lastName}
                          {" \u00b7 "}
                          {relativeTime(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {data.recentActivities.length === 0 && (
                  <p className="text-sm text-muted-foreground">No recent activities</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Row 4: Top Deals Table                                            */}
      {/* ----------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Top Deals</CardTitle>
        </CardHeader>
        <CardContent>
          {data.topDeals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data.topDeals || []).map((deal) => (
                  <TableRow key={deal.id} className="cursor-pointer">
                    <TableCell>
                      <Link href={`/deals/${deal.id}`} className="font-medium hover:text-primary hover:underline">
                        {deal.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {deal.contact.firstName} {deal.contact.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge className={stageBadgeClass(deal.stage)}>
                        {deal.stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(deal.value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No deals to display
            </div>
          )}
        </CardContent>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* Row 5: Full Recent Activity Feed                                  */}
      {/* ----------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentActivities.length > 0 ? (
            <div className="space-y-4">
              {data.recentActivities.slice(0, 10).map((activity) => {
                const config = ACTIVITY_TYPE_CONFIG[activity.type.toLowerCase()] ?? { label: activity.type, color: "bg-slate-100 text-slate-700" };
                const contactName = `${activity.contact.firstName} ${activity.contact.lastName}`;
                return (
                  <div key={activity.id} className="flex items-start gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/30">
                    <div className={`mt-0.5 flex-shrink-0 rounded-full p-2 ${config.color}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {config.label}
                        </Badge>
                        {activity.deal && (
                          <span className="truncate text-xs text-muted-foreground">
                            {activity.deal.title}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium">{activity.subject}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        {activity.contact.id ? (
                          <Link href={`/contacts/${activity.contact.id}`} className="font-medium text-primary hover:underline">
                            {contactName}
                          </Link>
                        ) : (
                          <span className="font-medium">{contactName}</span>
                        )}
                        <span>{"\u00b7"}</span>
                        <span>{relativeTime(activity.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No recent activities
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
