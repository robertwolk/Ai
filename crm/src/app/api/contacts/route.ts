import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const q = searchParams.get("q") || "";
    const lifecycleStage = searchParams.get("lifecycleStage") || "";
    const source = searchParams.get("source") || "";
    const tags = searchParams.get("tags") || "";
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (q) {
      where.OR = [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { email: { contains: q } },
        { company: { contains: q } },
      ];
    }

    if (lifecycleStage) {
      where.lifecycleStage = lifecycleStage;
    }

    if (source) {
      where.source = source;
    }

    if (tags) {
      where.tags = { contains: tags };
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          deals: {
            select: {
              id: true,
              value: true,
            },
          },
        },
      }),
      prisma.contact.count({ where }),
    ]);

    const contactsWithDealInfo = contacts.map((contact) => {
      const dealCount = contact.deals.length;
      const totalDealValue = contact.deals.reduce((sum, deal) => sum + deal.value, 0);
      const { deals, ...rest } = contact;
      return { ...rest, dealCount, totalDealValue };
    });

    return NextResponse.json({
      contacts: contactsWithDealInfo,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, ...rest } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "firstName, lastName, and email are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.contact.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "A contact with this email already exists" },
        { status: 409 }
      );
    }

    const contact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        email,
        phone: rest.phone,
        company: rest.company,
        jobTitle: rest.jobTitle,
        source: rest.source || "MANUAL",
        sourceCampaign: rest.sourceCampaign,
        sourceAd: rest.sourceAd,
        sourceKeyword: rest.sourceKeyword,
        utmSource: rest.utmSource,
        utmMedium: rest.utmMedium,
        utmCampaign: rest.utmCampaign,
        utmContent: rest.utmContent,
        utmTerm: rest.utmTerm,
        gclid: rest.gclid,
        fbclid: rest.fbclid,
        tags: rest.tags ? JSON.stringify(rest.tags) : "[]",
        customFields: rest.customFields ? JSON.stringify(rest.customFields) : "{}",
        lifecycleStage: rest.lifecycleStage || "LEAD",
        leadScore: rest.leadScore || 0,
        acquisitionCost: rest.acquisitionCost,
      },
    });

    await prisma.activity.create({
      data: {
        contactId: contact.id,
        type: "NOTE",
        subject: "Contact created",
        body: `Contact ${firstName} ${lastName} (${email}) was created.`,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
