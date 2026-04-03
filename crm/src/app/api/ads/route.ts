import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [adAccounts, campaigns, recentOptimizations] = await Promise.all([
      prisma.adAccount.findMany({
        include: {
          campaigns: {
            include: {
              campaignMetrics: true,
            },
          },
        },
      }),
      prisma.campaign.findMany({
        include: {
          adAccount: {
            select: { id: true, platform: true, accountName: true },
          },
          campaignMetrics: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.optimizationLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          campaign: {
            select: { id: true, name: true, platform: true },
          },
        },
      }),
    ]);

    // Aggregate per ad account (platform)
    const platforms = adAccounts.map((account) => {
      let totalSpend = 0;
      let totalImpressions = 0;
      let totalClicks = 0;
      let totalConversions = 0;
      let totalConversionValue = 0;

      for (const campaign of account.campaigns) {
        for (const m of campaign.campaignMetrics) {
          totalSpend += m.spend;
          totalImpressions += m.impressions;
          totalClicks += m.clicks;
          totalConversions += m.conversions;
          totalConversionValue += m.conversionValue;
        }
      }

      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      const cpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
      const roas = totalSpend > 0 ? totalConversionValue / totalSpend : 0;

      return {
        id: account.id,
        platform: account.platform,
        accountName: account.accountName,
        isActive: account.isActive,
        totalSpend: Math.round(totalSpend * 100) / 100,
        totalImpressions,
        totalClicks,
        totalConversions,
        ctr: Math.round(ctr * 100) / 100,
        cpa: Math.round(cpa * 100) / 100,
        roas: Math.round(roas * 100) / 100,
      };
    });

    // Aggregate campaigns with metrics
    const campaignsWithMetrics = campaigns.map((campaign) => {
      const metrics = campaign.campaignMetrics;
      const spend = metrics.reduce((s, m) => s + m.spend, 0);
      const impressions = metrics.reduce((s, m) => s + m.impressions, 0);
      const clicks = metrics.reduce((s, m) => s + m.clicks, 0);
      const conversions = metrics.reduce((s, m) => s + m.conversions, 0);
      const conversionValue = metrics.reduce((s, m) => s + m.conversionValue, 0);

      const { campaignMetrics, ...rest } = campaign;
      return {
        ...rest,
        totalSpend: Math.round(spend * 100) / 100,
        totalImpressions: impressions,
        totalClicks: clicks,
        totalConversions: conversions,
        ctr: impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0,
        cpa: conversions > 0 ? Math.round((spend / conversions) * 100) / 100 : 0,
        roas: spend > 0 ? Math.round((conversionValue / spend) * 100) / 100 : 0,
      };
    });

    campaignsWithMetrics.sort((a, b) => b.totalSpend - a.totalSpend);

    // Totals across all platforms
    const totalSpend = platforms.reduce((s, p) => s + p.totalSpend, 0);
    const totalConversions = platforms.reduce((s, p) => s + p.totalConversions, 0);
    const totalConversionValue = campaignsWithMetrics.reduce(
      (s, c) => s + (c.roas * c.totalSpend),
      0
    );
    const blendedCpa = totalConversions > 0 ? Math.round((totalSpend / totalConversions) * 100) / 100 : 0;
    const blendedRoas = totalSpend > 0 ? Math.round((totalConversionValue / totalSpend) * 100) / 100 : 0;

    return NextResponse.json({
      platforms,
      campaigns: campaignsWithMetrics,
      recentOptimizations,
      totalSpend: Math.round(totalSpend * 100) / 100,
      totalConversions,
      blendedRoas,
      blendedCpa,
    });
  } catch (error) {
    console.error("Error fetching ads data:", error);
    return NextResponse.json(
      { error: "Failed to fetch ads data" },
      { status: 500 }
    );
  }
}
