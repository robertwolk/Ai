import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface ScoringResult {
  contactId: string;
  fitScore: number;
  intentScore: number;
  engagementScore: number;
  totalScore: number;
  grade: string;
}

function calculateFitScore(contact: {
  company: string | null;
  jobTitle: string | null;
  source: string;
}): number {
  let score = 0;

  // Company presence
  if (contact.company) score += 20;

  // Job title scoring
  if (contact.jobTitle) {
    const title = contact.jobTitle.toLowerCase();
    if (title.includes("ceo") || title.includes("founder") || title.includes("owner")) {
      score += 30;
    } else if (title.includes("vp") || title.includes("director") || title.includes("head")) {
      score += 25;
    } else if (title.includes("manager") || title.includes("lead")) {
      score += 20;
    } else {
      score += 10;
    }
  }

  // Source quality
  const highValueSources = ["REFERRAL", "ORGANIC"];
  const medValueSources = ["GOOGLE_ADS", "META_ADS"];
  if (highValueSources.includes(contact.source)) {
    score += 30;
  } else if (medValueSources.includes(contact.source)) {
    score += 20;
  } else {
    score += 10;
  }

  return Math.min(100, score);
}

function calculateIntentScore(activities: { type: string }[]): number {
  let score = 0;

  const typeWeights: Record<string, number> = {
    FORM_SUBMIT: 30,
    MEETING: 25,
    EMAIL: 15,
    CALL: 15,
    PAGE_VIEW: 5,
    AD_CLICK: 10,
  };

  for (const activity of activities) {
    score += typeWeights[activity.type] || 5;
  }

  return Math.min(100, score);
}

function calculateEngagementScore(
  activities: { createdAt: Date }[],
  deals: { stage: string }[]
): number {
  let score = 0;

  // Recent activity bonus
  const now = Date.now();
  const recentActivities = activities.filter(
    (a) => now - a.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000
  );
  score += Math.min(40, recentActivities.length * 10);

  // Activity volume
  score += Math.min(30, activities.length * 3);

  // Deal progression
  const stageScores: Record<string, number> = {
    LEAD: 5,
    QUALIFIED: 10,
    MEETING_BOOKED: 15,
    PROPOSAL_SENT: 20,
    NEGOTIATION: 25,
    WON: 30,
  };
  for (const deal of deals) {
    score += stageScores[deal.stage] || 0;
  }

  return Math.min(100, score);
}

function gradeFromScore(score: number): string {
  if (score >= 75) return "A";
  if (score >= 50) return "B";
  if (score >= 25) return "C";
  return "D";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contactIds } = body;

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { error: "contactIds array is required" },
        { status: 400 }
      );
    }

    const contacts = await prisma.contact.findMany({
      where: { id: { in: contactIds } },
      include: {
        activities: {
          select: { type: true, createdAt: true },
        },
        deals: {
          select: { stage: true },
        },
      },
    });

    const results: ScoringResult[] = [];

    for (const contact of contacts) {
      const fitScore = calculateFitScore(contact);
      const intentScore = calculateIntentScore(contact.activities);
      const engagementScore = calculateEngagementScore(
        contact.activities,
        contact.deals
      );
      const totalScore = Math.round(
        fitScore * 0.35 + intentScore * 0.35 + engagementScore * 0.3
      );
      const grade = gradeFromScore(totalScore);

      // Create lead score record
      await prisma.leadScore.create({
        data: {
          contactId: contact.id,
          fitScore,
          intentScore,
          engagementScore,
          totalScore,
          grade,
          scoringDetails: JSON.stringify({
            fitFactors: {
              hasCompany: !!contact.company,
              jobTitle: contact.jobTitle,
              source: contact.source,
            },
            intentFactors: {
              activityCount: contact.activities.length,
              activityTypes: [...new Set(contact.activities.map((a) => a.type))],
            },
            engagementFactors: {
              dealCount: contact.deals.length,
              dealStages: contact.deals.map((d) => d.stage),
            },
          }),
        },
      });

      // Update contact leadScore
      await prisma.contact.update({
        where: { id: contact.id },
        data: { leadScore: totalScore },
      });

      results.push({
        contactId: contact.id,
        fitScore,
        intentScore,
        engagementScore,
        totalScore,
        grade,
      });
    }

    return NextResponse.json({
      scored: results.length,
      results,
    });
  } catch (error) {
    console.error("Error scoring leads:", error);
    return NextResponse.json(
      { error: "Failed to score leads" },
      { status: 500 }
    );
  }
}
