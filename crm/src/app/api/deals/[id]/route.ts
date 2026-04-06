import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const STAGE_PROBABILITIES: Record<string, number> = {
  LEAD: 10,
  QUALIFIED: 20,
  MEETING_BOOKED: 40,
  PROPOSAL_SENT: 60,
  NEGOTIATION: 80,
  WON: 100,
  LOST: 0,
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        contact: true,
        pipeline: true,
        activities: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    return NextResponse.json(deal);
  } catch (error) {
    console.error("Error fetching deal:", error);
    return NextResponse.json(
      { error: "Failed to fetch deal" },
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

    const existing = await prisma.deal.findUnique({
      where: { id },
      include: { pipeline: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const simpleFields = [
      "title", "value", "currency", "pipelineId",
      "expectedCloseDate", "lostReason", "sourcePlatform",
      "sourceCampaign", "assignedToId",
    ];

    for (const field of simpleFields) {
      if (body[field] !== undefined) {
        if (field === "expectedCloseDate") {
          updateData[field] = body[field] ? new Date(body[field]) : null;
        } else {
          updateData[field] = body[field];
        }
      }
    }

    // Handle stage change
    const stageChanged = body.stage !== undefined && body.stage !== existing.stage;
    if (stageChanged) {
      updateData.stage = body.stage;
      updateData.probability = STAGE_PROBABILITIES[body.stage] ?? existing.probability;

      if (body.stage === "WON") {
        updateData.probability = 100;
        updateData.actualCloseDate = new Date();
      } else if (body.stage === "LOST") {
        updateData.probability = 0;
        updateData.actualCloseDate = new Date();
      }
    }

    // Allow explicit probability override
    if (body.probability !== undefined && !stageChanged) {
      updateData.probability = body.probability;
    }

    const deal = await prisma.deal.update({
      where: { id },
      data: updateData,
      include: {
        contact: true,
        pipeline: true,
      },
    });

    if (stageChanged) {
      await prisma.activity.create({
        data: {
          contactId: existing.contactId,
          dealId: id,
          type: "NOTE",
          subject: `Deal moved from ${existing.stage} to ${body.stage}`,
          body: `Deal "${existing.title}" stage changed from ${existing.stage} to ${body.stage}.`,
        },
      });
    }

    return NextResponse.json(deal);
  } catch (error) {
    console.error("Error updating deal:", error);
    return NextResponse.json(
      { error: "Failed to update deal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.deal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    await prisma.deal.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting deal:", error);
    return NextResponse.json(
      { error: "Failed to delete deal" },
      { status: 500 }
    );
  }
}
