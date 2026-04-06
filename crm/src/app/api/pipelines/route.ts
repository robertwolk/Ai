import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const pipelines = await prisma.pipeline.findMany({
      include: {
        deals: {
          select: {
            id: true,
            stage: true,
            value: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const pipelinesWithStats = pipelines.map((pipeline) => {
      const stageMap: Record<string, { count: number; totalValue: number }> = {};
      for (const deal of pipeline.deals) {
        if (!stageMap[deal.stage]) {
          stageMap[deal.stage] = { count: 0, totalValue: 0 };
        }
        stageMap[deal.stage].count++;
        stageMap[deal.stage].totalValue += deal.value;
      }

      const { deals, ...rest } = pipeline;
      return {
        ...rest,
        stages: JSON.parse(pipeline.stages),
        dealCountByStage: stageMap,
        totalDeals: deals.length,
      };
    });

    return NextResponse.json(pipelinesWithStats);
  } catch (error) {
    console.error("Error fetching pipelines:", error);
    return NextResponse.json(
      { error: "Failed to fetch pipelines" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, stages, isDefault } = body;

    if (!name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    const pipeline = await prisma.pipeline.create({
      data: {
        name,
        stages: stages ? JSON.stringify(stages) : "[]",
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(
      { ...pipeline, stages: JSON.parse(pipeline.stages) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating pipeline:", error);
    return NextResponse.json(
      { error: "Failed to create pipeline" },
      { status: 500 }
    );
  }
}
