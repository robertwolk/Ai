"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, subMonths, getDay, isSameDay, isToday, isSameMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { cn, formatNumber, formatDate } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeJSON(val: any): Record<string, any> {
  if (typeof val === "object" && val !== null) return val;
  try { return JSON.parse(val || "{}"); } catch { return {}; }
}
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Platform = "INSTAGRAM" | "FACEBOOK" | "X" | "TIKTOK" | "LINKEDIN" | "YOUTUBE";
const PLATFORMS: { value: Platform; label: string; color: string; bg: string }[] = [
  { value: "INSTAGRAM", label: "Instagram", color: "#E1306C", bg: "bg-pink-500" },
  { value: "FACEBOOK", label: "Facebook", color: "#1877F2", bg: "bg-blue-600" },
  { value: "X", label: "X", color: "#000000", bg: "bg-black" },
  { value: "TIKTOK", label: "TikTok", color: "#00F2EA", bg: "bg-teal-500" },
  { value: "LINKEDIN", label: "LinkedIn", color: "#0A66C2", bg: "bg-blue-700" },
  { value: "YOUTUBE", label: "YouTube", color: "#FF0000", bg: "bg-red-600" },
];

const statusColors: Record<string, string> = { DRAFT: "bg-gray-100 text-gray-800", SCHEDULED: "bg-blue-100 text-blue-800", PUBLISHED: "bg-green-100 text-green-800", FAILED: "bg-red-100 text-red-800", REVIEW: "bg-amber-100 text-amber-800", APPROVED: "bg-emerald-100 text-emerald-800" };
const CHAR_LIMITS: Record<string, number> = { INSTAGRAM: 2200, FACEBOOK: 63206, X: 280, TIKTOK: 2200, LINKEDIN: 3000, YOUTUBE: 5000 };

interface Post { id: string; content: string; platform: string; status: string; scheduledAt: string | null; publishedAt: string | null; metrics: string; hashtags: string; createdAt: string }
interface Theme { id: string; name: string; description: string; color: string; contentRatio: number; _count?: { posts: number } }

export default function SocialPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Create form
  const [newPlatforms, setNewPlatforms] = useState<Platform[]>([]);
  const [newContent, setNewContent] = useState("");
  const [newHashtags, setNewHashtags] = useState("");
  const [newGoal, setNewGoal] = useState("engagement");
  const [newScheduleDate, setNewScheduleDate] = useState("");
  const [newScheduleTime, setNewScheduleTime] = useState("10:00");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [postsRes, socialRes] = await Promise.all([fetch("/api/social/posts"), fetch("/api/social")]);
      if (postsRes.ok) { const d = await postsRes.json(); setPosts(d.posts || []); }
      if (socialRes.ok) { const d = await socialRes.json(); setThemes(d.themes || []); setSocialAccounts(d.accounts || []); }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const calendarDays = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    const startPad = getDay(start);
    const padded: (Date | null)[] = Array.from({ length: startPad }, () => null);
    return [...padded, ...days];
  }, [month]);

  function getPostsForDay(day: Date) {
    return posts.filter((p) => {
      const d = p.scheduledAt || p.publishedAt || p.createdAt;
      return d && isSameDay(new Date(d), day);
    });
  }

  function getPlatformDot(platform: string) {
    const p = PLATFORMS.find((pl) => pl.value === platform);
    return p ? p.color : "#888";
  }

  async function createPost() {
    for (const platform of newPlatforms) {
      const account = socialAccounts.find((a) => a.platform === platform) || socialAccounts[0];
      if (!account) continue;
      await fetch("/api/social/posts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          socialAccountId: account.id,
          content: newContent, platform, status: newScheduleDate ? "SCHEDULED" : "DRAFT",
          scheduledAt: newScheduleDate ? new Date(`${newScheduleDate}T${newScheduleTime}`).toISOString() : null,
          hashtags: JSON.stringify(newHashtags.split(" ").filter(Boolean)),
        }),
      });
    }
    setShowCreate(false);
    setNewContent(""); setNewHashtags(""); setNewPlatforms([]);
    fetchData();
  }

  function generateAIContent() {
    const goals: Record<string, string> = {
      awareness: "Did you know? Our platform helps businesses grow 3x faster. Here's how we're changing the game...",
      engagement: "Question for our community: What's the biggest challenge you face in your business? Drop your answer below!",
      traffic: "We just published a comprehensive guide on scaling your business. Link in bio to read the full breakdown.",
      conversion: "Limited time offer: Get 30% off your first month. Use code GROW30 at checkout. Offer ends Friday!",
    };
    setNewContent(goals[newGoal] || goals.engagement);
    setNewHashtags("#business #growth #strategy #tips #entrepreneur");
  }

  const filteredPosts = posts.filter((p) => {
    if (filterPlatform && p.platform !== filterPlatform) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    return true;
  });

  // Analytics data
  const engagementByPlatform = PLATFORMS.map((pl) => {
    const platformPosts = posts.filter((p) => p.platform === pl.value && p.status === "PUBLISHED");
    const totalEng = platformPosts.reduce((sum, p) => {
      const m = safeJSON(p.metrics);
      return sum + (m.likes || 0) + (m.comments || 0) + (m.shares || 0);
    }, 0);
    return { name: pl.label, engagement: totalEng, fill: pl.color };
  }).filter((d) => d.engagement > 0);

  const totalPosts = posts.filter((p) => p.status === "PUBLISHED").length;
  const totalReach = posts.reduce((s, p) => { const m = safeJSON(p.metrics); return s + (m.reach || m.impressions || 0); }, 0);
  const totalEngagement = posts.reduce((s, p) => { const m = safeJSON(p.metrics); return s + (m.likes || 0) + (m.comments || 0) + (m.shares || 0); }, 0);

  // Heatmap: 7 rows × 24 cols
  const heatmapData = useMemo(() => {
    const grid = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
    posts.filter((p) => p.status === "PUBLISHED").forEach((p) => {
      const d = new Date(p.publishedAt || p.createdAt);
      const day = d.getDay();
      const hour = d.getHours();
      const m = safeJSON(p.metrics);
      grid[day][hour] += (m.likes || 0) + (m.comments || 0);
    });
    return grid;
  }, [posts]);
  const heatmapMax = Math.max(1, ...heatmapData.flat());

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-[400px]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Social Studio</h1>
        <Button onClick={() => setShowCreate(true)}>Create Post</Button>
      </div>

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
        </TabsList>

        {/* CALENDAR */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => setMonth(subMonths(month, 1))}>←</Button>
                <CardTitle>{format(month, "MMMM yyyy")}</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setMonth(addMonths(month, 1))}>→</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
                ))}
                {calendarDays.map((day, i) => {
                  if (!day) return <div key={`pad-${i}`} className="bg-background p-2 min-h-[80px]" />;
                  const dayPosts = getPostsForDay(day);
                  const isSelected = selectedDay && isSameDay(day, selectedDay);
                  return (
                    <button key={i} onClick={() => setSelectedDay(day)}
                      className={cn("bg-background p-2 min-h-[80px] text-left hover:bg-muted/50 transition-colors",
                        !isSameMonth(day, month) && "opacity-40",
                        isToday(day) && "ring-2 ring-primary ring-inset",
                        isSelected && "bg-primary/5"
                      )}>
                      <span className={cn("text-sm", isToday(day) && "font-bold text-primary")}>{format(day, "d")}</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {dayPosts.slice(0, 4).map((p, j) => (
                          <div key={j} className="h-2 w-2 rounded-full" style={{ backgroundColor: getPlatformDot(p.platform) }} />
                        ))}
                        {dayPosts.length > 4 && <span className="text-[10px] text-muted-foreground">+{dayPosts.length - 4}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* Platform legend */}
              <div className="flex gap-4 mt-4 justify-center">
                {PLATFORMS.map((p) => (
                  <div key={p.value} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.label}
                  </div>
                ))}
              </div>
              {/* Selected day posts */}
              {selectedDay && (
                <div className="mt-4 space-y-2">
                  <h3 className="font-medium">{format(selectedDay, "EEEE, MMMM d, yyyy")}</h3>
                  {getPostsForDay(selectedDay).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No posts scheduled for this day.</p>
                  ) : (
                    getPostsForDay(selectedDay).map((p) => (
                      <div key={p.id} className="flex items-center gap-3 rounded-lg border p-3">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getPlatformDot(p.platform) }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{p.content}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge className={statusColors[p.status] || ""}>{p.status}</Badge>
                            <span className="text-xs text-muted-foreground">{p.scheduledAt ? format(new Date(p.scheduledAt), "h:mm a") : ""}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* POSTS */}
        <TabsContent value="posts">
          <div className="space-y-4">
            <div className="flex gap-3">
              <Select value={filterPlatform} onChange={(v) => setFilterPlatform(v)} placeholder="All Platforms" options={[{ label: "All Platforms", value: "" }, ...PLATFORMS.map((p) => ({ label: p.label, value: p.value }))]} />
              <Select value={filterStatus} onChange={(v) => setFilterStatus(v)} placeholder="All Statuses" options={[{ label: "All", value: "" }, { label: "Draft", value: "DRAFT" }, { label: "Scheduled", value: "SCHEDULED" }, { label: "Published", value: "PUBLISHED" }, { label: "Failed", value: "FAILED" }]} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((p) => {
                const metrics = safeJSON(p.metrics);
                return (
                  <Card key={p.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge className={cn("text-white text-xs", PLATFORMS.find((pl) => pl.value === p.platform)?.bg || "bg-gray-500")}>{p.platform}</Badge>
                        <Badge className={statusColors[p.status] || ""}>{p.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm line-clamp-3">{p.content}</p>
                      {p.status === "PUBLISHED" && (
                        <div className="flex gap-3 text-xs text-muted-foreground pt-1 border-t">
                          <span>♥ {formatNumber(metrics.likes || 0)}</span>
                          <span>💬 {formatNumber(metrics.comments || 0)}</span>
                          <span>🔄 {formatNumber(metrics.shares || 0)}</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">{p.scheduledAt ? `Scheduled: ${formatDate(p.scheduledAt)}` : formatDate(p.createdAt)}</p>
                    </CardContent>
                  </Card>
                );
              })}
              {filteredPosts.length === 0 && <p className="text-muted-foreground col-span-3 text-center py-8">No posts found</p>}
            </div>
          </div>
        </TabsContent>

        {/* CREATE */}
        <TabsContent value="create">
          <Card>
            <CardHeader><CardTitle>Create Post</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <button key={p.value} onClick={() => setNewPlatforms((prev) => prev.includes(p.value) ? prev.filter((x) => x !== p.value) : [...prev, p.value])}
                      className={cn("px-3 py-1.5 rounded-full text-sm border transition-colors", newPlatforms.includes(p.value) ? `${p.bg} text-white border-transparent` : "border-border hover:bg-muted")}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Content Goal</label>
                <div className="flex gap-2">
                  {["awareness", "engagement", "traffic", "conversion"].map((g) => (
                    <button key={g} onClick={() => setNewGoal(g)}
                      className={cn("px-3 py-1.5 rounded-lg text-sm border capitalize transition-colors", newGoal === g ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium">Content</label>
                  <Button size="sm" variant="outline" onClick={generateAIContent}>Generate with AI</Button>
                </div>
                <Textarea rows={5} value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Write your post..." />
                <div className="flex gap-2 mt-1">
                  {newPlatforms.map((p) => (
                    <span key={p} className={cn("text-xs", newContent.length > (CHAR_LIMITS[p] || 999) ? "text-red-500" : "text-muted-foreground")}>
                      {p}: {newContent.length}/{CHAR_LIMITS[p]}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Hashtags</label>
                <Input value={newHashtags} onChange={(e) => setNewHashtags(e.target.value)} placeholder="#marketing #growth #tips" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Schedule Date</label><Input type="date" value={newScheduleDate} onChange={(e) => setNewScheduleDate(e.target.value)} /></div>
                <div><label className="text-sm font-medium">Time</label><Input type="time" value={newScheduleTime} onChange={(e) => setNewScheduleTime(e.target.value)} /></div>
              </div>
              {/* Platform previews */}
              {newContent && newPlatforms.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Preview</label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {newPlatforms.map((p) => {
                      const pl = PLATFORMS.find((x) => x.value === p)!;
                      return (
                        <div key={p} className="rounded-lg border p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className={cn("h-6 w-6 rounded-full flex items-center justify-center text-white text-xs", pl.bg)}>{pl.label[0]}</div>
                            <span className="text-sm font-medium">{pl.label}</span>
                          </div>
                          <p className="text-sm" style={{ maxHeight: "80px", overflow: "hidden" }}>{newContent}</p>
                          {newHashtags && <p className="text-xs text-blue-500">{newHashtags}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => createPost()}>Save Draft</Button>
                <Button onClick={createPost} disabled={!newContent || newPlatforms.length === 0}>Schedule</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANALYTICS */}
        <TabsContent value="analytics">
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Published Posts</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalPosts}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Reach</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatNumber(totalReach)}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Engagement</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatNumber(totalEngagement)}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg Engagement Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalReach ? ((totalEngagement / totalReach) * 100).toFixed(1) : 0}%</div></CardContent></Card>
            </div>
            {engagementByPlatform.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Engagement by Platform</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={engagementByPlatform}>
                      <XAxis dataKey="name" /><YAxis /><Tooltip />
                      <Bar dataKey="engagement" radius={[4, 4, 0, 0]}>
                        {engagementByPlatform.map((d, i) => <rect key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader><CardTitle>Posting Time Heatmap</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="grid gap-px" style={{ gridTemplateColumns: "60px repeat(24, 1fr)" }}>
                    <div />
                    {Array.from({ length: 24 }, (_, h) => <div key={h} className="text-[10px] text-center text-muted-foreground">{h}</div>)}
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, di) => (
                      <React.Fragment key={day}>
                        <div className="text-xs text-muted-foreground flex items-center">{day}</div>
                        {heatmapData[di].map((val, hi) => (
                          <div key={hi} className="h-6 rounded-sm" style={{ backgroundColor: `rgba(37, 99, 235, ${val / heatmapMax})` }} title={`${day} ${hi}:00 - ${val} engagements`} />
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* THEMES */}
        <TabsContent value="themes">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {themes.map((t) => (
              <Card key={t.id} className="border-l-4" style={{ borderLeftColor: t.color }}>
                <CardHeader className="pb-2"><CardTitle className="text-base">{t.name}</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t.description || "No description"}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Content ratio:</span>
                    <Progress value={t.contentRatio * 100} className="h-2 flex-1" />
                    <span className="text-xs font-medium">{Math.round(t.contentRatio * 100)}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t._count?.posts || 0} posts</p>
                </CardContent>
              </Card>
            ))}
            {themes.length === 0 && <p className="text-muted-foreground col-span-3 text-center py-8">No content themes yet</p>}
          </div>
        </TabsContent>
      </Tabs>

      {/* CREATE POST DIALOG */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Quick Post</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Select value={newPlatforms[0] || ""} onChange={(v) => setNewPlatforms([v as Platform])} placeholder="Platform" options={PLATFORMS.map((p) => ({ label: p.label, value: p.value }))} />
            <Textarea rows={4} value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Post content..." />
            <Input type="datetime-local" value={newScheduleDate ? `${newScheduleDate}T${newScheduleTime}` : ""} onChange={(e) => { const [d, t] = e.target.value.split("T"); setNewScheduleDate(d); setNewScheduleTime(t || "10:00"); }} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={createPost} disabled={!newContent || newPlatforms.length === 0}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
