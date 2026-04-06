import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    // Fetch all data in parallel
    const [
      allDeals,
      newContactsCount,
      recentActivities,
      contacts,
      wonDeals,
    ] = await Promise.all([
      prisma.deal.findMany({
        select: {
          id: true,
          title: true,
          value: true,
          stage: true,
          createdAt: true,
          actualCloseDate: true,
          contact: {
            select: { id: true, firstName: true, lastName: true, company: true },
          },
        },
      }),
      prisma.contact.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.activity.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          contact: {
            select: { id: true, firstName: true, lastName: true },
          },
          deal: {
            select: { id: true, title: true },
          },
        },
      }),
      prisma.contact.findMany({
        select: { id: true, source: true },
      }),
      prisma.deal.findMany({
        where: {
          stage: "WON",
          actualCloseDate: { gte: sixMonthsAgo },
        },
        select: {
          value: true,
          actualCloseDate: true,
          createdAt: true,
        },
      }),
    ]);

    // totalRevenue
    const totalRevenue = allDeals
      .filter((d) => d.stage === "WON")
      .reduce((sum, d) => sum + d.value, 0);

    // activeDeals
    const activeDeals = allDeals.filter(
      (d) => d.stage !== "WON" && d.stage !== "LOST"
    ).length;

    // conversionRate
    const totalDeals = allDeals.length;
    const wonCount = allDeals.filter((d) => d.stage === "WON").length;
    const conversionRate = totalDeals > 0 ? (wonCount / totalDeals) * 100 : 0;

    // pipelineByStage
    const pipelineByStage: Record<string, { count: number; totalValue: number }> = {};
    for (const deal of allDeals) {
      if (!pipelineByStage[deal.stage]) {
        pipelineByStage[deal.stage] = { count: 0, totalValue: 0 };
      }
      pipelineByStage[deal.stage].count++;
      pipelineByStage[deal.stage].totalValue += deal.value;
    }

    // topDeals (active, by value, top 5)
    const topDeals = allDeals
      .filter((d) => d.stage !== "WON" && d.stage !== "LOST")
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // revenueByMonth (last 6 months)
    const revenueByMonth: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      revenueByMonth[key] = 0;
    }
    for (const deal of wonDeals) {
      if (deal.actualCloseDate) {
        const d = deal.actualCloseDate;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (key in revenueByMonth) {
          revenueByMonth[key] += deal.value;
        }
      }
    }

    // leadsBySource
    const leadsBySource: Record<string, number> = {};
    for (const contact of contacts) {
      const src = contact.source || "UNKNOWN";
      leadsBySource[src] = (leadsBySource[src] || 0) + 1;
    }

    // dealVelocity (avg days from creation to WON)
    const wonDealsWithDates = allDeals.filter(
      (d) => d.stage === "WON" && d.actualCloseDate
    );
    let dealVelocity = 0;
    if (wonDealsWithDates.length > 0) {
      const totalDays = wonDealsWithDates.reduce((sum, d) => {
        const closeDate = d.actualCloseDate as Date;
        const diffMs = closeDate.getTime() - d.createdAt.getTime();
        return sum + diffMs / (1000 * 60 * 60 * 24);
      }, 0);
      dealVelocity = Math.round(totalDays / wonDealsWithDates.length);
    }

    // Convert objects to arrays for the frontend
    const pipelineByStageArr = Object.entries(pipelineByStage).map(
      ([stage, { count, totalValue }]) => ({ stage, count, totalValue })
    );

    const revenueByMonthArr = Object.entries(revenueByMonth).map(
      ([month, revenue]) => ({ month, revenue })
    );

    const leadsBySourceArr = Object.entries(leadsBySource).map(
      ([source, count]) => ({ source, count })
    );

    return NextResponse.json({
      totalRevenue,
      activeDeals,
      newContacts: newContactsCount,
      conversionRate: Math.round(conversionRate * 100) / 100,
      pipelineByStage: pipelineByStageArr,
      recentActivities,
      topDeals,
      revenueByMonth: revenueByMonthArr,
      leadsBySource: leadsBySourceArr,
      dealVelocity,
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
