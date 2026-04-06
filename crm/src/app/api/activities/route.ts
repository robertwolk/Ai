import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const type = searchParams.get("type") || "";
    const contactId = searchParams.get("contactId") || "";
    const dealId = searchParams.get("dealId") || "";
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (contactId) where.contactId = contactId;
    if (dealId) where.dealId = dealId;

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          contact: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          deal: {
            select: { id: true, title: true },
          },
        },
      }),
      prisma.activity.count({ where }),
    ]);

    return NextResponse.json({
      activities,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contactId, type, subject, ...rest } = body;

    if (!contactId || !type || !subject) {
      return NextResponse.json(
        { error: "contactId, type, and subject are required" },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.findUnique({ where: { id: contactId } });
    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const activity = await prisma.activity.create({
      data: {
        contactId,
        type,
        subject,
        body: rest.body,
        outcome: rest.outcome,
        dealId: rest.dealId,
        dueDate: rest.dueDate ? new Date(rest.dueDate) : null,
        completedAt: rest.completedAt ? new Date(rest.completedAt) : null,
        assignedToId: rest.assignedToId,
      },
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        deal: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}
