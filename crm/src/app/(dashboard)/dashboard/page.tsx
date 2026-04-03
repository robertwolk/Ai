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
import { formatCurrency, formatDate } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const stats = [
  {
    label: "Total Revenue",
    value: formatCurrency(284500),
    change: 12.5,
    trend: "up" as const,
  },
  {
    label: "Active Deals",
    value: "42",
    change: 8.2,
    trend: "up" as const,
  },
  {
    label: "New Contacts",
    value: "128",
    change: -3.1,
    trend: "down" as const,
  },
  {
    label: "Conversion Rate",
    value: "24.5%",
    change: 4.7,
    trend: "up" as const,
  },
];

const pipelineStages = [
  { name: "Lead", count: 12, color: "bg-slate-400" },
  { name: "Qualified", count: 8, color: "bg-blue-500" },
  { name: "Meeting", count: 5, color: "bg-indigo-500" },
  { name: "Proposal", count: 3, color: "bg-amber-500" },
  { name: "Negotiation", count: 2, color: "bg-orange-500" },
  { name: "Won", count: 4, color: "bg-emerald-500" },
];

const pipelineMax = Math.max(...pipelineStages.map((s) => s.count));

const recentActivities = [
  {
    type: "Email",
    icon: "mail",
    contact: "Sarah Chen",
    description: "Sent proposal follow-up email",
    date: "2026-04-03T10:30:00",
  },
  {
    type: "Call",
    icon: "phone",
    contact: "Marcus Johnson",
    description: "Discovery call completed - qualified as SQL",
    date: "2026-04-03T09:15:00",
  },
  {
    type: "Meeting",
    icon: "calendar",
    contact: "Emily Rodriguez",
    description: "Product demo scheduled for next week",
    date: "2026-04-02T16:45:00",
  },
  {
    type: "Deal",
    icon: "briefcase",
    contact: "James Liu",
    description: "Deal moved to Negotiation stage",
    date: "2026-04-02T14:20:00",
  },
  {
    type: "Note",
    icon: "file-text",
    contact: "Aisha Patel",
    description: "Added internal note about pricing discussion",
    date: "2026-04-02T11:00:00",
  },
  {
    type: "Email",
    icon: "mail",
    contact: "David Kim",
    description: "Received signed contract via email",
    date: "2026-04-01T17:30:00",
  },
  {
    type: "Call",
    icon: "phone",
    contact: "Rachel Adams",
    description: "Left voicemail regarding renewal",
    date: "2026-04-01T15:10:00",
  },
  {
    type: "Meeting",
    icon: "calendar",
    contact: "Tom Bradley",
    description: "Quarterly business review completed",
    date: "2026-04-01T10:00:00",
  },
  {
    type: "Deal",
    icon: "briefcase",
    contact: "Nina Okoro",
    description: "New deal created - Enterprise Plan",
    date: "2026-03-31T13:45:00",
  },
  {
    type: "Email",
    icon: "mail",
    contact: "Carlos Mendez",
    description: "Sent onboarding welcome sequence",
    date: "2026-03-31T09:20:00",
  },
];

const topDeals = [
  {
    name: "Enterprise SaaS Migration",
    contact: "Sarah Chen",
    stage: "Negotiation",
    value: 85000,
  },
  {
    name: "Annual Platform License",
    contact: "James Liu",
    stage: "Proposal",
    value: 64000,
  },
  {
    name: "Custom Integration Package",
    contact: "Emily Rodriguez",
    stage: "Meeting",
    value: 52000,
  },
  {
    name: "Team Expansion Deal",
    contact: "Marcus Johnson",
    stage: "Qualified",
    value: 38500,
  },
  {
    name: "Startup Growth Plan",
    contact: "Aisha Patel",
    stage: "Proposal",
    value: 27000,
  },
];

// ---------------------------------------------------------------------------
// Helper: icon SVGs (inline to avoid external deps)
// ---------------------------------------------------------------------------

function ActivityIcon({ type }: { type: string }) {
  const base = "h-4 w-4";
  switch (type) {
    case "Email":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={base}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      );
    case "Call":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={base}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case "Meeting":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={base}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M3 10h18" />
        </svg>
      );
    case "Deal":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={base}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          <rect width="20" height="14" x="2" y="6" rx="2" />
        </svg>
      );
    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={base}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M10 9H8" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
        </svg>
      );
  }
}

function TrendArrow({ trend, change }: { trend: "up" | "down"; change: number }) {
  const isUp = trend === "up";
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isUp ? "text-emerald-600" : "text-red-600"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-3 w-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isUp ? (
          <path d="m18 15-6-6-6 6" />
        ) : (
          <path d="m6 9 6 6 6-6" />
        )}
      </svg>
      {Math.abs(change)}%
    </span>
  );
}

function stageBadgeClass(stage: string) {
  switch (stage) {
    case "Negotiation":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "Proposal":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Meeting":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "Qualified":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Won":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground">
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
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M3 10h18" />
          </svg>
          Mar 1, 2026 - Apr 3, 2026
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <TrendArrow trend={stat.trend} change={stat.change} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                vs. previous period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two-column: Revenue Overview + Deal Pipeline */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Revenue Overview */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed bg-muted/40 text-sm text-muted-foreground">
              Revenue chart placeholder &mdash; integrate Recharts
            </div>
          </CardContent>
        </Card>

        {/* Deal Pipeline */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Deal Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipelineStages.map((stage) => (
                <div key={stage.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{stage.name}</span>
                    <span className="text-muted-foreground">{stage.count}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-muted">
                    <div
                      className={`h-2.5 rounded-full ${stage.color}`}
                      style={{
                        width: `${(stage.count / pipelineMax) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivities.map((activity, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        <ActivityIcon type={activity.type} />
                      </span>
                      {activity.type}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {activity.contact}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {activity.description}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDate(activity.date)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Deals */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Top Deals</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {topDeals.map((deal) => (
            <Card key={deal.name}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold leading-snug">
                  {deal.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{deal.contact}</p>
                <Badge className={stageBadgeClass(deal.stage)}>
                  {deal.stage}
                </Badge>
                <p className="text-lg font-bold">
                  {formatCurrency(deal.value)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
