import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Condition {
  metric: string;
  operator: "gt" | "lt" | "gte" | "lte" | "eq";
  value: number;
}

interface Action {
  type: string;
  field?: string;
  value?: unknown;
  adjustment?: number;
  adjustmentType?: "percentage" | "absolute";
}

function evaluateCondition(condition: Condition, metricValue: number): boolean {
  switch (condition.operator) {
    case "gt": return metricValue > condition.value;
    case "lt": return metricValue < condition.value;
    case "gte": return metricValue >= condition.value;
    case "lte": return metricValue <= condition.value;
    case "eq": return metricValue === condition.value;
    default: return false;
  }
}

export async function POST() {
  try {
    const rules = await prisma.optimizationRule.findMany({
      where: { isEnabled: true },
    });

    const campaigns = await prisma.campaign.findMany({
      where: { status: "ACTIVE" },
      include: {
        campaignMetrics: {
          orderBy: { date: "desc" },
          take: 7,
        },
      },
    });

    const executionResults: Array<{
      ruleId: string;
      ruleName: string;
      campaignId: string;
      campaignName: string;
      actionsTaken: string[];
    }> = [];

    for (const rule of rules) {
      const conditions: Condition[] = JSON.parse(rule.conditions);
      const actions: Action[] = JSON.parse(rule.actions);

      for (const campaign of campaigns) {
        const metrics = campaign.campaignMetrics;
        if (metrics.length === 0) continue;

        // Aggregate recent metrics
        const aggregated: Record<string, number> = {
          spend: metrics.reduce((s, m) => s + m.spend, 0),
          impressions: metrics.reduce((s, m) => s + m.impressions, 0),
          clicks: metrics.reduce((s, m) => s + m.clicks, 0),
          conversions: metrics.reduce((s, m) => s + m.conversions, 0),
          conversionValue: metrics.reduce((s, m) => s + m.conversionValue, 0),
          ctr: 0,
          cpc: 0,
          cpa: 0,
          roas: 0,
        };

        aggregated.ctr = aggregated.impressions > 0
          ? (aggregated.clicks / aggregated.impressions) * 100
          : 0;
        aggregated.cpc = aggregated.clicks > 0
          ? aggregated.spend / aggregated.clicks
          : 0;
        aggregated.cpa = aggregated.conversions > 0
          ? aggregated.spend / aggregated.conversions
          : 0;
        aggregated.roas = aggregated.spend > 0
          ? aggregated.conversionValue / aggregated.spend
          : 0;

        // Check all conditions
        const allConditionsMet = conditions.every((condition) => {
          const metricValue = aggregated[condition.metric] ?? 0;
          return evaluateCondition(condition, metricValue);
        });

        if (!allConditionsMet) continue;

        // Execute actions
        const actionsTaken: string[] = [];
        const updateData: Record<string, unknown> = {};

        for (const action of actions) {
          switch (action.type) {
            case "BUDGET_CHANGE": {
              const currentBudget = campaign.budgetDaily || 0;
              let newBudget: number;
              if (action.adjustmentType === "percentage" && action.adjustment) {
                newBudget = currentBudget * (1 + action.adjustment / 100);
              } else if (action.adjustment) {
                newBudget = currentBudget + action.adjustment;
              } else {
                newBudget = currentBudget;
              }
              newBudget = Math.max(0, Math.round(newBudget * 100) / 100);
              updateData.budgetDaily = newBudget;
              actionsTaken.push(
                `Budget changed from ${currentBudget} to ${newBudget}`
              );

              await prisma.optimizationLog.create({
                data: {
                  campaignId: campaign.id,
                  ruleName: rule.name,
                  actionType: "BUDGET_CHANGE",
                  description: `Auto-adjusted daily budget from ${currentBudget} to ${newBudget}`,
                  oldValue: String(currentBudget),
                  newValue: String(newBudget),
                },
              });
              break;
            }
            case "PAUSE": {
              updateData.status = "PAUSED";
              actionsTaken.push("Campaign paused");

              await prisma.optimizationLog.create({
                data: {
                  campaignId: campaign.id,
                  ruleName: rule.name,
                  actionType: "PAUSE",
                  description: `Auto-paused campaign due to rule: ${rule.name}`,
                  oldValue: campaign.status,
                  newValue: "PAUSED",
                },
              });
              break;
            }
            case "ENABLE": {
              updateData.status = "ACTIVE";
              actionsTaken.push("Campaign enabled");

              await prisma.optimizationLog.create({
                data: {
                  campaignId: campaign.id,
                  ruleName: rule.name,
                  actionType: "ENABLE",
                  description: `Auto-enabled campaign due to rule: ${rule.name}`,
                  oldValue: campaign.status,
                  newValue: "ACTIVE",
                },
              });
              break;
            }
            case "BID_CHANGE": {
              actionsTaken.push("Bid adjustment logged");

              await prisma.optimizationLog.create({
                data: {
                  campaignId: campaign.id,
                  ruleName: rule.name,
                  actionType: "BID_CHANGE",
                  description: `Bid change triggered by rule: ${rule.name}`,
                  oldValue: JSON.stringify(aggregated),
                  newValue: JSON.stringify(action),
                },
              });
              break;
            }
          }
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.campaign.update({
            where: { id: campaign.id },
            data: updateData,
          });
        }

        // Update rule last triggered
        await prisma.optimizationRule.update({
          where: { id: rule.id },
          data: { lastTriggered: new Date() },
        });

        if (actionsTaken.length > 0) {
          executionResults.push({
            ruleId: rule.id,
            ruleName: rule.name,
            campaignId: campaign.id,
            campaignName: campaign.name,
            actionsTaken,
          });
        }
      }
    }

    return NextResponse.json({
      rulesEvaluated: rules.length,
      campaignsChecked: campaigns.length,
      actionsExecuted: executionResults.length,
      results: executionResults,
    });
  } catch (error) {
    console.error("Error running optimization:", error);
    return NextResponse.json(
      { error: "Failed to run optimization" },
      { status: 500 }
    );
  }
}
