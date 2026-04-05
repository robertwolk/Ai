import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        adAccount: true,
        adSets: {
          include: {
            ads: true,
          },
        },
        campaignMetrics: {
          orderBy: { date: "desc" },
        },
        optimizationLogs: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...campaign,
      targeting: JSON.parse(campaign.targeting),
      metrics: JSON.parse(campaign.metrics),
      adSets: campaign.adSets.map((adSet) => ({
        ...adSet,
        targeting: JSON.parse(adSet.targeting),
        metrics: JSON.parse(adSet.metrics),
        ads: adSet.ads.map((ad) => ({
          ...ad,
          creative: JSON.parse(ad.creative),
          metrics: JSON.parse(ad.metrics),
        })),
      })),
    });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
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

    const existing = await prisma.campaign.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    const simpleFields = [
      "name", "status", "objective", "externalId",
      "budgetDaily", "budgetTotal",
    ];
    for (const field of simpleFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (body.startDate !== undefined) {
      updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    }
    if (body.endDate !== undefined) {
      updateData.endDate = body.endDate ? new Date(body.endDate) : null;
    }
    if (body.targeting !== undefined) {
      updateData.targeting = JSON.stringify(body.targeting);
    }
    if (body.metrics !== undefined) {
      updateData.metrics = JSON.stringify(body.metrics);
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
      include: {
        adAccount: {
          select: { id: true, platform: true, accountName: true },
        },
      },
    });

    // Log the optimization change
    const changes: string[] = [];
    if (body.status && body.status !== existing.status) {
      changes.push(`Status: ${existing.status} -> ${body.status}`);
    }
    if (body.budgetDaily !== undefined && body.budgetDaily !== existing.budgetDaily) {
      changes.push(`Daily budget: ${existing.budgetDaily} -> ${body.budgetDaily}`);
    }
    if (body.budgetTotal !== undefined && body.budgetTotal !== existing.budgetTotal) {
      changes.push(`Total budget: ${existing.budgetTotal} -> ${body.budgetTotal}`);
    }

    if (changes.length > 0) {
      await prisma.optimizationLog.create({
        data: {
          campaignId: id,
          ruleName: "Manual update",
          actionType: body.status && body.status !== existing.status ? "PAUSE" : "BUDGET_CHANGE",
          description: changes.join("; "),
          oldValue: JSON.stringify({
            status: existing.status,
            budgetDaily: existing.budgetDaily,
            budgetTotal: existing.budgetTotal,
          }),
          newValue: JSON.stringify({
            status: body.status || existing.status,
            budgetDaily: body.budgetDaily ?? existing.budgetDaily,
            budgetTotal: body.budgetTotal ?? existing.budgetTotal,
          }),
        },
      });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}
