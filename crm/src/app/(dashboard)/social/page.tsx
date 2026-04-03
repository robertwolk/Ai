"use client";

import React, { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  getDay,
  isSameDay,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatNumber, formatDate } from "@/lib/utils";

// --- Types ---
type Platform = "Instagram" | "Facebook" | "X" | "TikTok" | "LinkedIn" | "YouTube";
type PostStatus = "Draft" | "Scheduled" | "Published" | "Failed";

interface SocialPost {
  id: number;
  platform: Platform;
  content: string;
  status: PostStatus;
  scheduledDate: Date;
  likes: number;
  comments: number;
  shares: number;
  hashtags: string;
}

// --- Constants ---
const platformColors: Record<Platform, string> = {
  Instagram: "bg-pink-500",
  Facebook: "bg-blue-600",
  X: "bg-neutral-900",
  TikTok: "bg-neutral-800",
  LinkedIn: "bg-blue-700",
  YouTube: "bg-red-600",
};

const platformTextColors: Record<Platform, string> = {
  Instagram: "text-pink-600",
  Facebook: "text-blue-600",
  X: "text-neutral-900",
  TikTok: "text-neutral-800",
  LinkedIn: "text-blue-700",
  YouTube: "text-red-600",
};

const platformFilterStyles: Record<Platform | "All", string> = {
  All: "bg-primary text-primary-foreground",
  Instagram: "bg-pink-500 text-white",
  Facebook: "bg-blue-600 text-white",
  X: "bg-neutral-900 text-white",
  TikTok: "bg-neutral-800 text-white",
  LinkedIn: "bg-blue-700 text-white",
  YouTube: "bg-red-600 text-white",
};

const statusStyles: Record<PostStatus, string> = {
  Draft: "bg-secondary text-secondary-foreground",
  Scheduled: "bg-blue-100 text-blue-800",
  Published: "bg-green-100 text-green-800",
  Failed: "bg-red-100 text-red-800",
};

const allPlatforms: Platform[] = ["Instagram", "Facebook", "X", "TikTok", "LinkedIn", "YouTube"];

// --- Mock Data ---
function generateMockPosts(): SocialPost[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const contents = [
    "Excited to announce our new product launch! Stay tuned for something amazing.",
    "Behind the scenes at our team retreat. Culture matters!",
    "5 tips to boost your productivity this week. Thread below.",
    "We just hit 10,000 customers! Thank you for your support.",
    "New blog post: How AI is transforming small business marketing.",
    "Happy Monday! What are your goals for this week?",
    "Customer spotlight: See how @AcmeCorp grew 300% using our platform.",
    "Join our live webinar this Thursday at 2pm EST.",
    "Our CEO shares insights on the future of SaaS at #TechSummit2026.",
    "Quick poll: What feature would you like us to build next?",
    "Throwback to our first office. Look how far we have come!",
    "Just shipped a major update: Dark mode is here!",
    "We are hiring! Check out our open positions in engineering and design.",
    "Infographic: The state of social media marketing in 2026.",
    "Limited time offer: Get 30% off your first 3 months.",
    "Meet the team: Sarah, our Head of Customer Success.",
    "Did you know? Our platform processes 1M+ requests daily.",
    "Free template: Download our social media content calendar.",
    "Recap from last night's product demo. Watch the recording.",
    "Celebrating 5 years of innovation. Here's to the next 5!",
    "Pro tip: Use UTM parameters to track your campaign performance.",
    "We partnered with @DesignCo for an exclusive masterclass.",
    "Friday vibes. Wrapping up the week with a team lunch.",
    "Case study: How we helped increase conversions by 45%.",
    "Big announcement coming next week. Can you guess what it is?",
  ];

  const statuses: PostStatus[] = ["Draft", "Scheduled", "Published", "Failed"];

  return contents.map((content, i) => ({
    id: i + 1,
    platform: allPlatforms[i % allPlatforms.length],
    content,
    status: i < 5 ? "Published" : i < 15 ? "Scheduled" : i < 22 ? "Draft" : "Failed",
    scheduledDate: new Date(year, month, (i % 28) + 1, 9 + (i % 12), (i * 15) % 60),
    likes: statuses[i % 4] === "Published" || i < 8 ? Math.floor(Math.random() * 500) + 20 : 0,
    comments: i < 8 ? Math.floor(Math.random() * 80) + 5 : 0,
    shares: i < 8 ? Math.floor(Math.random() * 120) + 2 : 0,
    hashtags: i % 3 === 0 ? "#marketing #growth" : i % 3 === 1 ? "#saas #startup" : "#tech #ai",
  }));
}

const mockPosts = generateMockPosts();

// --- Page ---
export default function SocialStudioPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [platformFilter, setPlatformFilter] = useState<Platform | "All">("All");
  const [dialogOpen, setDialogOpen] = useState(false);

  // New post form state
  const [newPlatforms, setNewPlatforms] = useState<Platform[]>([]);
  const [newContent, setNewContent] = useState("");
  const [newSchedule, setNewSchedule] = useState("");
  const [newStatus, setNewStatus] = useState("Draft");
  const [newCta, setNewCta] = useState("");
  const [newHashtags, setNewHashtags] = useState("");

  const filteredPosts = useMemo(
    () =>
      platformFilter === "All"
        ? mockPosts
        : mockPosts.filter((p) => p.platform === platformFilter),
    [platformFilter]
  );

  // Calendar calculations
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  // Stats
  const thisMonthPosts = mockPosts.length;
  const totalEngagement = mockPosts.reduce((s, p) => s + p.likes + p.comments + p.shares, 0);
  const engagementRate = thisMonthPosts > 0 ? ((totalEngagement / (thisMonthPosts * 1000)) * 100).toFixed(1) : "0";
  const totalReach = totalEngagement * 12;
  const platformCounts = allPlatforms.map((pl) => ({
    platform: pl,
    count: mockPosts.filter((p) => p.platform === pl).reduce((s, p) => s + p.likes + p.comments + p.shares, 0),
  }));
  const bestPlatform = platformCounts.sort((a, b) => b.count - a.count)[0]?.platform ?? "N/A";

  function togglePlatformCheckbox(pl: Platform) {
    setNewPlatforms((prev) =>
      prev.includes(pl) ? prev.filter((p) => p !== pl) : [...prev, pl]
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Social Studio</h1>
          <p className="text-sm text-muted-foreground">Create, schedule, and manage social content across all platforms.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border">
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
            >
              <CalendarIcon className="mr-1 h-4 w-4" />
              Calendar
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <ListIcon className="mr-1 h-4 w-4" />
              List
            </Button>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <PlusIcon className="mr-1 h-4 w-4" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Total Posts (This Month)</p>
          <p className="mt-1 text-2xl font-bold">{thisMonthPosts}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Engagement Rate</p>
          <p className="mt-1 text-2xl font-bold">{engagementRate}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Total Reach</p>
          <p className="mt-1 text-2xl font-bold">{formatNumber(totalReach)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Best Platform</p>
          <p className="mt-1 text-2xl font-bold">{bestPlatform}</p>
        </Card>
      </div>

      {/* Platform filter pills */}
      <div className="flex flex-wrap gap-2">
        {(["All", ...allPlatforms] as const).map((pl) => {
          const isActive = platformFilter === pl;
          return (
            <button
              key={pl}
              onClick={() => setPlatformFilter(pl)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? platformFilterStyles[pl]
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {pl}
            </button>
          );
        })}
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
            <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-2">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 border-t">
            {/* Empty cells for offset */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] border-b border-r p-1" />
            ))}
            {days.map((day) => {
              const dayPosts = filteredPosts.filter((p) => isSameDay(p.scheduledDate, day));
              const today = isToday(day);
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "min-h-[80px] cursor-pointer border-b border-r p-1 transition-colors hover:bg-muted/50",
                    today && "bg-primary/5",
                    !isSameMonth(day, currentMonth) && "text-muted-foreground/40"
                  )}
                  onClick={() => console.log("Selected day:", format(day, "yyyy-MM-dd"), "Posts:", dayPosts.length)}
                >
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                      today && "bg-primary text-primary-foreground font-bold"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="mt-1 flex flex-wrap gap-0.5">
                    {dayPosts.slice(0, 4).map((post) => (
                      <span
                        key={post.id}
                        className={cn("h-2 w-2 rounded-full", platformColors[post.platform])}
                        title={`${post.platform}: ${post.content.slice(0, 40)}...`}
                      />
                    ))}
                    {dayPosts.length > 4 && (
                      <span className="text-[10px] text-muted-foreground">+{dayPosts.length - 4}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead className="w-[300px]">Content</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead className="text-right">Likes</TableHead>
                <TableHead className="text-right">Comments</TableHead>
                <TableHead className="text-right">Shares</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <span className={cn("font-medium", platformTextColors[post.platform])}>
                      {post.platform}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-sm">
                    {post.content}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusStyles[post.status]}>{post.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(post.scheduledDate)}
                  </TableCell>
                  <TableCell className="text-right">{formatNumber(post.likes)}</TableCell>
                  <TableCell className="text-right">{formatNumber(post.comments)}</TableCell>
                  <TableCell className="text-right">{formatNumber(post.shares)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create Post Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Platform checkboxes */}
            <div>
              <label className="mb-2 block text-sm font-medium">Platforms</label>
              <div className="flex flex-wrap gap-3">
                {allPlatforms.map((pl) => (
                  <label key={pl} className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={newPlatforms.includes(pl)}
                      onChange={() => togglePlatformCheckbox(pl)}
                      className="h-4 w-4 rounded border-input"
                    />
                    <span className={platformTextColors[pl]}>{pl}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium">Content</label>
                <Button variant="outline" size="sm">
                  <SparklesIcon className="mr-1 h-3 w-3" />
                  Generate with AI
                </Button>
              </div>
              <Textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Write your post content..."
                rows={4}
              />
            </div>

            {/* Schedule & Status row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Schedule Date & Time</label>
                <Input
                  type="datetime-local"
                  value={newSchedule}
                  onChange={(e) => setNewSchedule(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Status</label>
                <Select
                  value={newStatus}
                  onChange={(v) => setNewStatus(v)}
                  options={[
                    { label: "Draft", value: "Draft" },
                    { label: "Scheduled", value: "Scheduled" },
                  ]}
                />
              </div>
            </div>

            {/* CTA */}
            <div>
              <label className="mb-2 block text-sm font-medium">Call to Action</label>
              <Input
                value={newCta}
                onChange={(e) => setNewCta(e.target.value)}
                placeholder="e.g. Learn more, Sign up today"
              />
            </div>

            {/* Hashtags */}
            <div>
              <label className="mb-2 block text-sm font-medium">Hashtags</label>
              <Input
                value={newHashtags}
                onChange={(e) => setNewHashtags(e.target.value)}
                placeholder="#marketing #growth #saas"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => { console.log("Creating post..."); setDialogOpen(false); }}>
              Create Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Inline Icons ---
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="4" rx="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
  );
}
