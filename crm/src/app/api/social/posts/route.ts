import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get("platform") || "";
    const status = searchParams.get("status") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (platform) where.platform = platform;
    if (status) where.status = status;

    if (dateFrom || dateTo) {
      const createdAt: Record<string, Date> = {};
      if (dateFrom) createdAt.gte = new Date(dateFrom);
      if (dateTo) createdAt.lte = new Date(dateTo);
      where.createdAt = createdAt;
    }

    const [posts, total] = await Promise.all([
      prisma.socialPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          socialAccount: {
            select: { id: true, platform: true, accountName: true },
          },
          contentTheme: {
            select: { id: true, name: true, color: true },
          },
        },
      }),
      prisma.socialPost.count({ where }),
    ]);

    const postsWithParsed = posts.map((post) => ({
      ...post,
      mediaUrls: JSON.parse(post.mediaUrls),
      hashtags: JSON.parse(post.hashtags),
      metrics: JSON.parse(post.metrics),
    }));

    return NextResponse.json({
      posts: postsWithParsed,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching social posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch social posts" },
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
        publishedAt: rest.publishedAt ? new Date(rest.publishedAt) : null,
        mediaUrls: rest.mediaUrls ? JSON.stringify(rest.mediaUrls) : "[]",
        hashtags: rest.hashtags ? JSON.stringify(rest.hashtags) : "[]",
        metrics: rest.metrics ? JSON.stringify(rest.metrics) : "{}",
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
