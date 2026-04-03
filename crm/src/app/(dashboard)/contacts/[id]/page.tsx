import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
// Mock Contact
// ---------------------------------------------------------------------------

const contact = {
  id: "1",
  firstName: "Sarah",
  lastName: "Chen",
  email: "sarah.chen@techcorp.io",
  phone: "+1 415-555-0101",
  company: "TechCorp",
  jobTitle: "VP of Engineering",
  source: "Google Ads",
  lifecycleStage: "SQL",
  leadScore: 87,
  acquisitionCost: 42.5,
  tags: ["Enterprise", "High Value", "Tech"],
  utm: {
    source: "google",
    medium: "cpc",
    campaign: "enterprise-q1-2026",
    term: "saas platform",
    content: "ad-variant-b",
  },
  createdAt: "2026-01-15T09:00:00",
};

// ---------------------------------------------------------------------------
// Mock Timeline
// ---------------------------------------------------------------------------

const timeline = [
  { id: "t1", type: "email", title: "Proposal follow-up sent", description: "Sent updated pricing proposal with enterprise tier details", date: "2026-04-03T10:30:00" },
  { id: "t2", type: "meeting", title: "Product demo", description: "60-min demo covering analytics dashboard and API integrations", date: "2026-04-01T14:00:00" },
  { id: "t3", type: "call", title: "Discovery call", description: "Discussed current tech stack pain points and migration timeline", date: "2026-03-28T11:00:00" },
  { id: "t4", type: "page_view", title: "Viewed pricing page", description: "Spent 4m 32s on /pricing - viewed Enterprise plan", date: "2026-03-27T16:15:00" },
  { id: "t5", type: "ad_click", title: "Clicked Google Ad", description: 'Campaign: enterprise-q1-2026, Keyword: "saas platform"', date: "2026-03-25T09:42:00" },
  { id: "t6", type: "email", title: "Welcome email opened", description: "Opened automated welcome sequence email #1", date: "2026-03-20T08:10:00" },
  { id: "t7", type: "page_view", title: "Viewed features page", description: "Spent 2m 15s on /features", date: "2026-03-18T14:22:00" },
  { id: "t8", type: "email", title: "Inbound inquiry", description: "Submitted contact form requesting enterprise demo", date: "2026-01-15T09:00:00" },
];

// ---------------------------------------------------------------------------
// Mock Deals
// ---------------------------------------------------------------------------

const deals = [
  { id: "d1", name: "Enterprise SaaS Migration", stage: "Negotiation", value: 85000, probability: 75, closeDate: "2026-05-15" },
  { id: "d2", name: "API Integration Add-on", stage: "Proposal", value: 12000, probability: 60, closeDate: "2026-04-30" },
  { id: "d3", name: "Annual Support Contract", stage: "Qualified", value: 18000, probability: 40, closeDate: "2026-06-01" },
];

// ---------------------------------------------------------------------------
// Mock Activities
// ---------------------------------------------------------------------------

const activities = [
  { id: "a1", type: "Email", subject: "Proposal follow-up", outcome: "Sent", date: "2026-04-03T10:30:00" },
  { id: "a2", type: "Meeting", subject: "Product demo", outcome: "Completed", date: "2026-04-01T14:00:00" },
  { id: "a3", type: "Call", subject: "Discovery call", outcome: "Connected", date: "2026-03-28T11:00:00" },
  { id: "a4", type: "Email", subject: "Meeting confirmation", outcome: "Sent", date: "2026-03-26T15:00:00" },
  { id: "a5", type: "Call", subject: "Initial outreach", outcome: "Voicemail", date: "2026-03-22T10:00:00" },
  { id: "a6", type: "Email", subject: "Welcome sequence", outcome: "Opened", date: "2026-03-20T08:10:00" },
  { id: "a7", type: "Task", subject: "Research company background", outcome: "Completed", date: "2026-03-16T09:00:00" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function lifecycleBadgeClass(stage: string) {
  switch (stage) {
    case "Subscriber": return "bg-gray-100 text-gray-700 border-gray-200";
    case "Lead": return "bg-blue-100 text-blue-700 border-blue-200";
    case "MQL": return "bg-violet-100 text-violet-700 border-violet-200";
    case "SQL": return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "Opportunity": return "bg-amber-100 text-amber-700 border-amber-200";
    case "Customer": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function stageBadgeClass(stage: string) {
  switch (stage) {
    case "Negotiation": return "bg-orange-100 text-orange-800 border-orange-200";
    case "Proposal": return "bg-amber-100 text-amber-800 border-amber-200";
    case "Qualified": return "bg-blue-100 text-blue-800 border-blue-200";
    case "Won": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    default: return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

function TimelineIcon({ type }: { type: string }) {
  const base = "h-4 w-4";
  switch (type) {
    case "email":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      );
    case "call":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case "meeting":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2v4" /><path d="M16 2v4" />
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M3 10h18" />
        </svg>
      );
    case "ad_click":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 15h.01" /><path d="M11 15h.01" /><path d="M3 7v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
          <path d="M3 7l9-4 9 4" />
          <path d="M12 22V11" />
        </svg>
      );
    case "page_view":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
        </svg>
      );
  }
}

function timelineIconBg(type: string) {
  switch (type) {
    case "email": return "bg-blue-100 text-blue-600";
    case "call": return "bg-green-100 text-green-600";
    case "meeting": return "bg-purple-100 text-purple-600";
    case "ad_click": return "bg-red-100 text-red-600";
    case "page_view": return "bg-amber-100 text-amber-600";
    default: return "bg-gray-100 text-gray-600";
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ContactDetailPage() {
  const fullName = `${contact.firstName} ${contact.lastName}`;
  const totalDealsValue = deals.reduce((sum, d) => sum + d.value, 0);
  const daysSinceLastActivity = 0; // Same day as mock "today"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/contacts">
            <Button variant="ghost" size="icon">
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
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
            </Button>
          </Link>
          <Avatar className="h-12 w-12">
            <AvatarFallback className="text-lg">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{fullName}</h1>
              <Badge className={lifecycleBadgeClass(contact.lifecycleStage)}>
                {contact.lifecycleStage}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {contact.jobTitle} at {contact.company}
            </p>
          </div>
        </div>
        <Button variant="outline">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2 h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
          </svg>
          Edit Contact
        </Button>
      </div>

      {/* Contact Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoField label="Email" value={contact.email} />
            <InfoField label="Phone" value={contact.phone} />
            <InfoField label="Company" value={contact.company} />
            <InfoField label="Job Title" value={contact.jobTitle} />
            <InfoField label="Source" value={contact.source} />
            <InfoField label="Lead Score" value={`${contact.leadScore} / 100`} />
            <InfoField label="Acquisition Cost" value={formatCurrency(contact.acquisitionCost)} />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Tags</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {contact.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <InfoField label="Created" value={formatDate(contact.createdAt)} />
          </div>

          {/* UTM Parameters */}
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium">UTM Parameters</p>
            <div className="grid gap-2 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-5">
              <UtmField label="Source" value={contact.utm.source} />
              <UtmField label="Medium" value={contact.utm.medium} />
              <UtmField label="Campaign" value={contact.utm.campaign} />
              <UtmField label="Term" value={contact.utm.term} />
              <UtmField label="Content" value={contact.utm.content} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Deals Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(totalDealsValue)}</p>
                <p className="text-xs text-muted-foreground">{deals.length} active deals</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Activities Count
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{activities.length}</p>
                <p className="text-xs text-muted-foreground">Total recorded activities</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Days Since Last Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{daysSinceLastActivity}</p>
                <p className="text-xs text-muted-foreground">Last: {formatDate(activities[0].date)}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Contact Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              <p>
                {fullName} is the {contact.jobTitle} at {contact.company}. They were acquired
                through {contact.source} on {formatDate(contact.createdAt)} at a cost of{" "}
                {formatCurrency(contact.acquisitionCost)}. Their current lifecycle stage is{" "}
                <strong className="text-foreground">{contact.lifecycleStage}</strong> with a lead
                score of <strong className="text-foreground">{contact.leadScore}/100</strong>.
              </p>
              <p className="mt-2">
                There are currently {deals.length} active deals associated with this contact
                totaling {formatCurrency(totalDealsValue)} in pipeline value. The largest deal,
                &ldquo;{deals[0].name},&rdquo; is in the {deals[0].stage} stage with a{" "}
                {deals[0].probability}% probability of closing by {formatDate(deals[0].closeDate)}.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-0">
                {timeline.map((item, i) => (
                  <div key={item.id} className="relative flex gap-4 pb-8 last:pb-0">
                    {/* Vertical line */}
                    {i < timeline.length - 1 && (
                      <div className="absolute left-[17px] top-9 h-full w-px bg-border" />
                    )}
                    {/* Icon */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${timelineIconBg(item.type)}`}
                    >
                      <TimelineIcon type={item.type} />
                    </div>
                    {/* Content */}
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{item.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(item.date)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deals Tab */}
        <TabsContent value="deals">
          <div className="space-y-4">
            {deals.map((deal) => (
              <Card key={deal.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <p className="font-medium">{deal.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge className={stageBadgeClass(deal.stage)}>
                        {deal.stage}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Close: {formatDate(deal.closeDate)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {formatCurrency(deal.value)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {deal.probability}% probability
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <Badge variant="outline">{activity.type}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {activity.subject}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {activity.outcome}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDateTime(activity.date)}
                      </TableCell>
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

function UtmField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">utm_{label.toLowerCase()}</p>
      <p className="text-sm font-mono">{value}</p>
    </div>
  );
}
