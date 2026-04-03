"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const activityTypeConfig: Record<string, { icon: string; color: string; bgColor: string }> = {
  CALL: { icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", color: "text-green-700", bgColor: "bg-green-100" },
  EMAIL: { icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", color: "text-blue-700", bgColor: "bg-blue-100" },
  MEETING: { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", color: "text-purple-700", bgColor: "bg-purple-100" },
  NOTE: { icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  TASK: { icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", color: "text-orange-700", bgColor: "bg-orange-100" },
  AD_CLICK: { icon: "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122", color: "text-pink-700", bgColor: "bg-pink-100" },
  PAGE_VIEW: { icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z", color: "text-cyan-700", bgColor: "bg-cyan-100" },
  FORM_SUBMIT: { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "text-indigo-700", bgColor: "bg-indigo-100" },
};

const mockActivities = [
  { id: "1", type: "CALL", subject: "Discovery call with Sarah", body: "Discussed pain points and budget. She's interested in the enterprise plan.", contact: "Sarah Chen", deal: "Acme Corp Enterprise", assignedTo: "You", outcome: "Positive - scheduled follow-up", date: "2026-04-03T14:30:00", completed: true },
  { id: "2", type: "EMAIL", subject: "Proposal follow-up", body: "Sent revised proposal with 15% discount for annual commitment.", contact: "James Wilson", deal: "TechFlow Pro Deal", assignedTo: "You", outcome: "Awaiting response", date: "2026-04-03T11:15:00", completed: true },
  { id: "3", type: "MEETING", subject: "Product demo - Marketing team", body: "Full demo of the analytics dashboard and reporting features.", contact: "Lisa Park", deal: "DataSync Integration", assignedTo: "Mike R.", outcome: "Very interested, requesting trial", date: "2026-04-03T10:00:00", completed: true },
  { id: "4", type: "TASK", subject: "Send case study to prospect", body: "They requested the healthcare industry case study.", contact: "Robert Kim", deal: null, assignedTo: "You", outcome: null, date: "2026-04-04T09:00:00", completed: false, priority: "HIGH" },
  { id: "5", type: "NOTE", subject: "Competitive analysis note", body: "Prospect mentioned they're also evaluating Salesforce and HubSpot. Key differentiator for us is the integrated ad management.", contact: "Emily Davis", deal: "Global Media Buy", assignedTo: "You", outcome: null, date: "2026-04-02T16:45:00", completed: true },
  { id: "6", type: "AD_CLICK", subject: "Clicked Google Search Ad", body: "Keyword: 'crm with ad management'. Campaign: Brand Awareness Q2", contact: "Marcus Johnson", deal: null, assignedTo: null, outcome: null, date: "2026-04-02T13:22:00", completed: true },
  { id: "7", type: "PAGE_VIEW", subject: "Viewed pricing page", body: "Spent 4 minutes on enterprise pricing page. Second visit this week.", contact: "Amy Nguyen", deal: "StartupXYZ Onboarding", assignedTo: null, outcome: null, date: "2026-04-02T11:08:00", completed: true },
  { id: "8", type: "CALL", subject: "Negotiation call", body: "Discussed contract terms. They want a 2-year deal with quarterly payments.", contact: "David Martinez", deal: "Martinez Agency Retainer", assignedTo: "You", outcome: "Moving to legal review", date: "2026-04-01T15:30:00", completed: true },
  { id: "9", type: "FORM_SUBMIT", subject: "Downloaded whitepaper", body: "Downloaded 'The Complete Guide to Cross-Platform Ad Optimization'", contact: "Jessica Brown", deal: null, assignedTo: null, outcome: "Auto-enrolled in nurture sequence", date: "2026-04-01T09:17:00", completed: true },
  { id: "10", type: "EMAIL", subject: "Welcome email sent", body: "Automated welcome email with onboarding resources.", contact: "Tom Henderson", deal: "Henderson Consulting", assignedTo: "System", outcome: "Opened", date: "2026-03-31T08:00:00", completed: true },
  { id: "11", type: "TASK", subject: "Prepare quarterly review deck", body: "Q1 performance review for the marketing team meeting.", contact: null, deal: null, assignedTo: "You", outcome: null, date: "2026-04-05T17:00:00", completed: false, priority: "MEDIUM" },
  { id: "12", type: "MEETING", subject: "Onboarding kickoff", body: "First onboarding session covering account setup and integrations.", contact: "Rachel Green", deal: "Green Media Package", assignedTo: "Mike R.", outcome: "Completed successfully", date: "2026-03-31T14:00:00", completed: true },
  { id: "13", type: "CALL", subject: "Cold call - lead follow up", body: "Following up on website inquiry from last week.", contact: "Kevin Wright", deal: null, assignedTo: "You", outcome: "Voicemail left", date: "2026-03-31T11:30:00", completed: true },
  { id: "14", type: "AD_CLICK", subject: "Clicked Meta carousel ad", body: "Ad set: Retargeting - Website Visitors. Creative: Customer testimonial carousel.", contact: "Patricia Lee", deal: null, assignedTo: null, outcome: null, date: "2026-03-30T19:45:00", completed: true },
  { id: "15", type: "TASK", subject: "Review and approve social posts", body: "15 posts queued for next week need review.", contact: null, deal: null, assignedTo: "You", outcome: null, date: "2026-04-03T12:00:00", completed: false, priority: "LOW" },
  { id: "16", type: "NOTE", subject: "Budget approval received", body: "CFO approved $50K quarterly ad budget increase for Q2.", contact: "Internal", deal: null, assignedTo: "You", outcome: null, date: "2026-03-30T10:00:00", completed: true },
  { id: "17", type: "EMAIL", subject: "Re: Partnership opportunity", body: "Responded to partnership inquiry from complementary SaaS company.", contact: "Alex Torres", deal: "Torres Partnership", assignedTo: "You", outcome: "Meeting scheduled", date: "2026-03-29T16:20:00", completed: true },
  { id: "18", type: "PAGE_VIEW", subject: "Viewed case studies page", body: "Browsed 3 case studies: Healthcare, SaaS, and E-commerce.", contact: "Sam Phillips", deal: null, assignedTo: null, outcome: null, date: "2026-03-29T14:33:00", completed: true },
  { id: "19", type: "MEETING", subject: "Strategy session with team", body: "Weekly team sync on pipeline and upcoming campaigns.", contact: null, deal: null, assignedTo: "Team", outcome: "Action items assigned", date: "2026-03-28T09:00:00", completed: true },
  { id: "20", type: "FORM_SUBMIT", subject: "Free trial signup", body: "Signed up for 14-day free trial. Company: Meridian Analytics.", contact: "Chris Nakamura", deal: null, assignedTo: null, outcome: "Auto-created deal", date: "2026-03-28T07:22:00", completed: true },
];

function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date("2026-04-03T18:00:00");
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ActivitiesPage() {
  const [search, setSearch] = useState("");
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");

  const filteredActivities = mockActivities.filter((a) => {
    const matchesSearch =
      !search ||
      a.subject.toLowerCase().includes(search.toLowerCase()) ||
      (a.contact?.toLowerCase().includes(search.toLowerCase()) ?? false);

    const matchesDate = (() => {
      if (dateFilter === "all") return true;
      const date = new Date(a.date);
      const now = new Date("2026-04-03T18:00:00");
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (dateFilter === "today") return diffDays === 0;
      if (dateFilter === "7d") return diffDays <= 7;
      if (dateFilter === "30d") return diffDays <= 30;
      return true;
    })();

    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activities & Tasks</h1>
          <p className="text-muted-foreground">Track all interactions and manage tasks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowLogDialog(true)}>
            Log Activity
          </Button>
          <Button onClick={() => setShowTaskDialog(true)}>Add Task</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search activities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-1">
          {[
            { value: "all", label: "All Time" },
            { value: "today", label: "Today" },
            { value: "7d", label: "7 Days" },
            { value: "30d", label: "30 Days" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setDateFilter(f.value)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                dateFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({filteredActivities.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({filteredActivities.filter((a) => a.type === "TASK").length})</TabsTrigger>
          <TabsTrigger value="calls">Calls</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ActivityList activities={filteredActivities} />
        </TabsContent>
        <TabsContent value="tasks">
          <TaskList activities={filteredActivities.filter((a) => a.type === "TASK")} />
        </TabsContent>
        <TabsContent value="calls">
          <ActivityList activities={filteredActivities.filter((a) => a.type === "CALL")} />
        </TabsContent>
        <TabsContent value="emails">
          <ActivityList activities={filteredActivities.filter((a) => a.type === "EMAIL")} />
        </TabsContent>
        <TabsContent value="meetings">
          <ActivityList activities={filteredActivities.filter((a) => a.type === "MEETING")} />
        </TabsContent>
        <TabsContent value="notes">
          <ActivityList activities={filteredActivities.filter((a) => a.type === "NOTE")} />
        </TabsContent>
      </Tabs>

      {/* Log Activity Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); console.log("Activity logged"); setShowLogDialog(false); }}>
            <div>
              <label className="text-sm font-medium">Type</label>
              <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>Call</option><option>Email</option><option>Meeting</option><option>Note</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input placeholder="Activity subject" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Details</label>
              <textarea className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="Add details..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Contact</label>
                <Input placeholder="Contact name" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Outcome</label>
                <Input placeholder="Result" className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowLogDialog(false)}>Cancel</Button>
              <Button type="submit">Save Activity</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); console.log("Task added"); setShowTaskDialog(false); }}>
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input placeholder="Task subject" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="Task details..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Input type="date" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Assigned To</label>
              <Input placeholder="Team member" className="mt-1" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowTaskDialog(false)}>Cancel</Button>
              <Button type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ActivityList({ activities }: { activities: typeof mockActivities }) {
  return (
    <div className="space-y-2 mt-4">
      {activities.map((activity) => {
        const config = activityTypeConfig[activity.type] || activityTypeConfig.NOTE;
        return (
          <Card key={activity.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", config.bgColor)}>
                  <svg className={cn("h-5 w-5", config.color)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{activity.subject}</span>
                    <Badge variant="outline" className="text-xs">{activity.type.replace("_", " ")}</Badge>
                  </div>
                  {activity.body && (
                    <p className="text-sm text-muted-foreground line-clamp-1">{activity.body}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {activity.contact && <span>Contact: {activity.contact}</span>}
                    {activity.deal && <span>Deal: {activity.deal}</span>}
                    {activity.assignedTo && <span>Assigned: {activity.assignedTo}</span>}
                    {activity.outcome && <span>Outcome: {activity.outcome}</span>}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatRelativeDate(activity.date)}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function TaskList({ activities }: { activities: typeof mockActivities }) {
  return (
    <div className="space-y-2 mt-4">
      {activities.map((task) => (
        <Card key={task.id}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                defaultChecked={task.completed}
                className="h-5 w-5 rounded border-gray-300"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn("font-medium text-sm", task.completed && "line-through text-muted-foreground")}>
                    {task.subject}
                  </span>
                  {"priority" in task && (
                    <Badge
                      variant={task.priority === "HIGH" ? "destructive" : task.priority === "MEDIUM" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {task.priority}
                    </Badge>
                  )}
                </div>
                {task.body && <p className="text-sm text-muted-foreground mt-1">{task.body}</p>}
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Due: {formatRelativeDate(task.date)}</p>
                {task.assignedTo && <p className="text-xs text-muted-foreground">{task.assignedTo}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
