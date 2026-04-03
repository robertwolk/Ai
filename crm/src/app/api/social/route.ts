import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    const [accounts, upcomingPosts, allPosts, contentThemes] = await Promise.all([
      prisma.socialAccount.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.socialPost.findMany({
        where: {
          status: { in: ["SCHEDULED", "APPROVED"] },
          scheduledAt: { gte: now },
        },
        orderBy: { scheduledAt: "asc" },
        take: 20,
        include: {
          socialAccount: {
            select: { id: true, platform: true, accountName: true },
          },
        },
      }),
      prisma.socialPost.findMany({
        where: { status: "PUBLISHED" },
        select: { metrics: true },
      }),
      prisma.contentTheme.findMany({
        include: {
          posts: {
            select: { id: true, status: true },
          },
          series: true,
        },
      }),
    ]);

    // Aggregate post metrics
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalReach = 0;
    let totalImpressions = 0;

    for (const post of allPosts) {
      try {
        const m = JSON.parse(post.metrics);
        totalLikes += m.likes || 0;
        totalComments += m.comments || 0;
        totalShares += m.shares || 0;
        totalReach += m.reach || 0;
        totalImpressions += m.impressions || 0;
      } catch {
        // skip malformed
      }
    }

    const themesWithStats = contentThemes.map((theme) => ({
      id: theme.id,
      name: theme.name,
      description: theme.description,
      color: theme.color,
      contentRatio: theme.contentRatio,
      postCount: theme.posts.length,
      publishedCount: theme.posts.filter((p) => p.status === "PUBLISHED").length,
      seriesCount: theme.series.length,
    }));

    return NextResponse.json({
      accounts,
      upcomingPosts,
      postMetrics: {
        totalPublished: allPosts.length,
        totalLikes,
        totalComments,
        totalShares,
        totalReach,
        totalImpressions,
      },
      contentThemes: themesWithStats,
    });
  } catch (error) {
    console.error("Error fetching social dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch social dashboard" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { socialAccountId, content, platform, ...rest } = body;

    if (!socialAccountId || !content || !platform) {
      return NextResponse.json(
        { error: "socialAccountId, content, and platform are required" },
        { status: 400 }
      );
    }

    const account = await prisma.socialAccount.findUnique({
      where: { id: socialAccountId },
    });
    if (!account) {
      return NextResponse.json(
        { error: "Social account not found" },
        { status: 404 }
      );
    }

    const post = await prisma.socialPost.create({
      data: {
        socialAccountId,
        content,
        platform,
        status: rest.status || "DRAFT",
        scheduledAt: rest.scheduledAt ? new Date(rest.scheduledAt) : null,
        mediaUrls: rest.mediaUrls ? JSON.stringify(rest.mediaUrls) : "[]",
        hashtags: rest.hashtags ? JSON.stringify(rest.hashtags) : "[]",
        contentThemeId: rest.contentThemeId,
        contentSeriesId: rest.contentSeriesId,
      },
      include: {
        socialAccount: {
          select: { id: true, platform: true, accountName: true },
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating social post:", error);
    return NextResponse.json(
      { error: "Failed to create social post" },
      { status: 500 }
    );
  }
}
