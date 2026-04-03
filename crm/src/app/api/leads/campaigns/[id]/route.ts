import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const campaign = await prisma.leadGenCampaign.findUnique({
      where: { id },
      include: {
        scrapedLeads: {
          include: {
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                company: true,
              },
            },
          },
          orderBy: { totalScore: "desc" },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Lead gen campaign not found" },
        { status: 404 }
      );
    }

    // Funnel breakdown
    const leads = campaign.scrapedLeads;
    const funnelBreakdown = {
      total: leads.length,
      new: leads.filter((l) => l.status === "NEW").length,
      enriched: leads.filter((l) => l.status === "ENRICHED").length,
      scored: leads.filter((l) => l.status === "SCORED").length,
      contacted: leads.filter((l) => l.status === "CONTACTED").length,
      qualified: leads.filter((l) => l.status === "QUALIFIED").length,
      converted: leads.filter((l) => l.status === "CONVERTED").length,
      rejected: leads.filter((l) => l.status === "REJECTED").length,
    };

    const gradeBreakdown: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    for (const lead of leads) {
      gradeBreakdown[lead.grade] = (gradeBreakdown[lead.grade] || 0) + 1;
    }

    return NextResponse.json({
      ...campaign,
      targetProfile: JSON.parse(campaign.targetProfile),
      scrapingStrategy: JSON.parse(campaign.scrapingStrategy),
      resultsSummary: JSON.parse(campaign.resultsSummary),
      scrapedLeads: leads.map((lead) => ({
        ...lead,
        rawData: JSON.parse(lead.rawData),
        enrichmentData: JSON.parse(lead.enrichmentData),
      })),
      funnelBreakdown,
      gradeBreakdown,
    });
  } catch (error) {
    console.error("Error fetching lead gen campaign:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead gen campaign" },
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

    const existing = await prisma.leadGenCampaign.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Lead gen campaign not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.targetLeadCount !== undefined) updateData.targetLeadCount = body.targetLeadCount;
    if (body.budget !== undefined) updateData.budget = body.budget;
    if (body.targetProfile !== undefined) {
      updateData.targetProfile = JSON.stringify(body.targetProfile);
    }
    if (body.scrapingStrategy !== undefined) {
      updateData.scrapingStrategy = JSON.stringify(body.scrapingStrategy);
    }
    if (body.resultsSummary !== undefined) {
      updateData.resultsSummary = JSON.stringify(body.resultsSummary);
    }

    const campaign = await prisma.leadGenCampaign.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      ...campaign,
      targetProfile: JSON.parse(campaign.targetProfile),
      scrapingStrategy: JSON.parse(campaign.scrapingStrategy),
      resultsSummary: JSON.parse(campaign.resultsSummary),
    });
  } catch (error) {
    console.error("Error updating lead gen campaign:", error);
    return NextResponse.json(
      { error: "Failed to update lead gen campaign" },
      { status: 500 }
    );
  }
}
