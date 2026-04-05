import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        deals: true,
        activities: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        leadScores: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error("Error fetching contact:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact" },
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

    const existing = await prisma.contact.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Track which fields changed for activity log
    const changes: string[] = [];
    const updateData: Record<string, unknown> = {};

    const trackableFields = [
      "firstName", "lastName", "email", "phone", "company", "jobTitle",
      "source", "lifecycleStage", "leadScore",
    ] as const;

    for (const field of trackableFields) {
      if (body[field] !== undefined && body[field] !== (existing as Record<string, unknown>)[field]) {
        changes.push(`${field}: "${(existing as Record<string, unknown>)[field]}" -> "${body[field]}"`);
        updateData[field] = body[field];
      }
    }

    // Handle JSON fields
    if (body.tags !== undefined) {
      updateData.tags = typeof body.tags === "string" ? body.tags : JSON.stringify(body.tags);
    }
    if (body.customFields !== undefined) {
      updateData.customFields = typeof body.customFields === "string"
        ? body.customFields
        : JSON.stringify(body.customFields);
    }

    // Copy remaining simple fields
    const otherFields = [
      "sourceCampaign", "sourceAd", "sourceKeyword",
      "utmSource", "utmMedium", "utmCampaign", "utmContent", "utmTerm",
      "gclid", "fbclid", "acquisitionCost",
    ];
    for (const field of otherFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: updateData,
    });

    if (changes.length > 0) {
      await prisma.activity.create({
        data: {
          contactId: id,
          type: "NOTE",
          subject: "Contact updated",
          body: `Fields changed: ${changes.join("; ")}`,
        },
      });
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error("Error updating contact:", error);
    return NextResponse.json(
      { error: "Failed to update contact" },
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

    const existing = await prisma.contact.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    await prisma.contact.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json(
      { error: "Failed to delete contact" },
      { status: 500 }
    );
  }
}
