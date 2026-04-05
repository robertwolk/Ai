import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        adAccount: {
          select: { id: true, platform: true, accountName: true },
        },
        campaignMetrics: {
          orderBy: { date: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const campaignsWithAggregates = campaigns.map((campaign) => {
      const metrics = campaign.campaignMetrics;
      const totalSpend = metrics.reduce((s, m) => s + m.spend, 0);
      const totalImpressions = metrics.reduce((s, m) => s + m.impressions, 0);
      const totalClicks = metrics.reduce((s, m) => s + m.clicks, 0);
      const totalConversions = metrics.reduce((s, m) => s + m.conversions, 0);

      return {
        ...campaign,
        targeting: JSON.parse(campaign.targeting),
        metrics: JSON.parse(campaign.metrics),
        totalSpend: Math.round(totalSpend * 100) / 100,
        totalImpressions,
        totalClicks,
        totalConversions,
      };
    });

    return NextResponse.json({ campaigns: campaignsWithAggregates });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adAccountId, name, platform, ...rest } = body;

    if (!adAccountId || !name || !platform) {
      return NextResponse.json(
        { error: "adAccountId, name, and platform are required" },
        { status: 400 }
      );
    }

    const adAccount = await prisma.adAccount.findUnique({
      where: { id: adAccountId },
    });
    if (!adAccount) {
      return NextResponse.json(
        { error: "Ad account not found" },
        { status: 404 }
      );
    }

    const campaign = await prisma.campaign.create({
      data: {
        adAccountId,
        name,
        platform,
        externalId: rest.externalId,
        status: rest.status || "DRAFT",
        objective: rest.objective,
        budgetDaily: rest.budgetDaily,
        budgetTotal: rest.budgetTotal,
        startDate: rest.startDate ? new Date(rest.startDate) : null,
        endDate: rest.endDate ? new Date(rest.endDate) : null,
        targeting: rest.targeting ? JSON.stringify(rest.targeting) : "{}",
        metrics: rest.metrics ? JSON.stringify(rest.metrics) : "{}",
      },
      include: {
        adAccount: {
          select: { id: true, platform: true, accountName: true },
        },
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
