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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const stage = searchParams.get("stage") || "";
    const pipelineId = searchParams.get("pipelineId") || "";
    const contactId = searchParams.get("contactId") || "";
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (stage) where.stage = stage;
    if (pipelineId) where.pipelineId = pipelineId;
    if (contactId) where.contactId = contactId;

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
          pipeline: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.deal.count({ where }),
    ]);

    return NextResponse.json({
      deals,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching deals:", error);
    return NextResponse.json(
      { error: "Failed to fetch deals" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, value, contactId, pipelineId, ...rest } = body;

    if (!title || value === undefined || !contactId || !pipelineId) {
      return NextResponse.json(
        { error: "title, value, contactId, and pipelineId are required" },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.findUnique({ where: { id: contactId } });
    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const pipeline = await prisma.pipeline.findUnique({ where: { id: pipelineId } });
    if (!pipeline) {
      return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });
    }

    const stage = rest.stage || "LEAD";
    const probability = STAGE_PROBABILITIES[stage] ?? 10;

    const deal = await prisma.deal.create({
      data: {
        title,
        value,
        contactId,
        pipelineId,
        stage,
        probability,
        currency: rest.currency || "USD",
        expectedCloseDate: rest.expectedCloseDate ? new Date(rest.expectedCloseDate) : null,
        sourcePlatform: rest.sourcePlatform,
        sourceCampaign: rest.sourceCampaign,
        assignedToId: rest.assignedToId,
      },
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        pipeline: {
          select: { id: true, name: true },
        },
      },
    });

    await prisma.activity.create({
      data: {
        contactId,
        dealId: deal.id,
        type: "NOTE",
        subject: "Deal created",
        body: `Deal "${title}" created with value ${value} ${deal.currency} in pipeline "${pipeline.name}".`,
      },
    });

    return NextResponse.json(deal, { status: 201 });
  } catch (error) {
    console.error("Error creating deal:", error);
    return NextResponse.json(
      { error: "Failed to create deal" },
      { status: 500 }
    );
  }
}
