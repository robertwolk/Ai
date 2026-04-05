import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const campaigns = await prisma.leadGenCampaign.findMany({
      include: {
        scrapedLeads: {
          select: {
            id: true,
            grade: true,
            status: true,
            fitScore: true,
            intentScore: true,
            engagementScore: true,
            totalScore: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const campaignsWithStats = campaigns.map((campaign) => {
      const leads = campaign.scrapedLeads;
      const gradeBreakdown: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
      const statusBreakdown: Record<string, number> = {};

      for (const lead of leads) {
        gradeBreakdown[lead.grade] = (gradeBreakdown[lead.grade] || 0) + 1;
        statusBreakdown[lead.status] = (statusBreakdown[lead.status] || 0) + 1;
      }

      const { scrapedLeads, ...rest } = campaign;
      return {
        ...rest,
        targetProfile: JSON.parse(campaign.targetProfile),
        scrapingStrategy: JSON.parse(campaign.scrapingStrategy),
        resultsSummary: JSON.parse(campaign.resultsSummary),
        totalLeads: leads.length,
        gradeBreakdown,
        statusBreakdown,
        avgFitScore: leads.length > 0
          ? Math.round(leads.reduce((s, l) => s + l.fitScore, 0) / leads.length)
          : 0,
        avgIntentScore: leads.length > 0
          ? Math.round(leads.reduce((s, l) => s + l.intentScore, 0) / leads.length)
          : 0,
      };
    });

    // Funnel metrics across all campaigns
    const allLeads = campaigns.flatMap((c) => c.scrapedLeads);
    const funnelMetrics = {
      total: allLeads.length,
      enriched: allLeads.filter((l) => l.status !== "NEW").length,
      scored: allLeads.filter((l) =>
        ["SCORED", "CONTACTED", "QUALIFIED", "CONVERTED"].includes(l.status)
      ).length,
      contacted: allLeads.filter((l) =>
        ["CONTACTED", "QUALIFIED", "CONVERTED"].includes(l.status)
      ).length,
      qualified: allLeads.filter((l) =>
        ["QUALIFIED", "CONVERTED"].includes(l.status)
      ).length,
      converted: allLeads.filter((l) => l.status === "CONVERTED").length,
    };

    // Source quality (from contacts linked to leads)
    const contacts = await prisma.contact.findMany({
      where: { scrapedLeads: { some: {} } },
      select: { source: true, leadScore: true },
    });

    const sourceQuality: Record<string, { count: number; avgScore: number }> = {};
    for (const contact of contacts) {
      const src = contact.source || "UNKNOWN";
      if (!sourceQuality[src]) {
        sourceQuality[src] = { count: 0, avgScore: 0 };
      }
      sourceQuality[src].count++;
      sourceQuality[src].avgScore += contact.leadScore;
    }
    for (const src of Object.keys(sourceQuality)) {
      sourceQuality[src].avgScore = Math.round(
        sourceQuality[src].avgScore / sourceQuality[src].count
      );
    }

    return NextResponse.json({
      campaigns: campaignsWithStats,
      funnelMetrics,
      sourceQuality,
    });
  } catch (error) {
    console.error("Error fetching lead gen dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead gen data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, ...rest } = body;

    if (!name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    const campaign = await prisma.leadGenCampaign.create({
      data: {
        name,
        status: rest.status || "DRAFT",
        targetProfile: rest.targetProfile ? JSON.stringify(rest.targetProfile) : "{}",
        scrapingStrategy: rest.scrapingStrategy ? JSON.stringify(rest.scrapingStrategy) : "{}",
        targetLeadCount: rest.targetLeadCount || 500,
        budget: rest.budget,
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Error creating lead gen campaign:", error);
    return NextResponse.json(
      { error: "Failed to create lead gen campaign" },
      { status: 500 }
    );
  }
}
