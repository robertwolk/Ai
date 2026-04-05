import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await prisma.socialPost.findUnique({
      where: { id },
      include: {
        socialAccount: true,
        contentTheme: true,
        contentSeries: true,
        approvals: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...post,
      mediaUrls: JSON.parse(post.mediaUrls),
      hashtags: JSON.parse(post.hashtags),
      metrics: JSON.parse(post.metrics),
    });
  } catch (error) {
    console.error("Error fetching social post:", error);
    return NextResponse.json(
      { error: "Failed to fetch social post" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.socialPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.content !== undefined) updateData.content = body.content;
    if (body.platform !== undefined) updateData.platform = body.platform;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.scheduledAt !== undefined) {
      updateData.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
    }
    if (body.publishedAt !== undefined) {
      updateData.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
    }
    if (body.mediaUrls !== undefined) {
      updateData.mediaUrls = JSON.stringify(body.mediaUrls);
    }
    if (body.hashtags !== undefined) {
      updateData.hashtags = JSON.stringify(body.hashtags);
    }
    if (body.metrics !== undefined) {
      updateData.metrics = JSON.stringify(body.metrics);
    }
    if (body.contentThemeId !== undefined) updateData.contentThemeId = body.contentThemeId;
    if (body.contentSeriesId !== undefined) updateData.contentSeriesId = body.contentSeriesId;

    // Auto-schedule on approval
    if (body.status === "APPROVED" && existing.status !== "APPROVED") {
      if (!existing.scheduledAt && !body.scheduledAt) {
        // Default to 24 hours from now if no scheduled time set
        updateData.scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }
      updateData.status = "SCHEDULED";
    }

    const post = await prisma.socialPost.update({
      where: { id },
      data: updateData,
      include: {
        socialAccount: {
          select: { id: true, platform: true, accountName: true },
        },
      },
    });

    return NextResponse.json({
      ...post,
      mediaUrls: JSON.parse(post.mediaUrls),
      hashtags: JSON.parse(post.hashtags),
      metrics: JSON.parse(post.metrics),
    });
  } catch (error) {
    console.error("Error updating social post:", error);
    return NextResponse.json(
      { error: "Failed to update social post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.socialPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.socialPost.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting social post:", error);
    return NextResponse.json(
      { error: "Failed to delete social post" },
      { status: 500 }
    );
  }
}
