import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const rules = await prisma.optimizationRule.findMany({
      orderBy: { createdAt: "desc" },
    });

    const parsed = rules.map((rule) => ({
      ...rule,
      conditions: JSON.parse(rule.conditions),
      actions: JSON.parse(rule.actions),
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error fetching optimization rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch optimization rules" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, conditions, actions } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "name and type are required" },
        { status: 400 }
      );
    }

    const rule = await prisma.optimizationRule.create({
      data: {
        name,
        type,
        conditions: conditions ? JSON.stringify(conditions) : "[]",
        actions: actions ? JSON.stringify(actions) : "[]",
        isEnabled: body.isEnabled !== undefined ? body.isEnabled : true,
      },
    });

    return NextResponse.json(
      {
        ...rule,
        conditions: JSON.parse(rule.conditions),
        actions: JSON.parse(rule.actions),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating optimization rule:", error);
    return NextResponse.json(
      { error: "Failed to create optimization rule" },
      { status: 500 }
    );
  }
}
