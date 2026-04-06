import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q") || "";

    if (!q || q.length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const [contacts, deals, campaigns] = await Promise.all([
      prisma.contact.findMany({
        where: {
          OR: [
            { firstName: { contains: q } },
            { lastName: { contains: q } },
            { email: { contains: q } },
            { company: { contains: q } },
          ],
        },
        take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          company: true,
          lifecycleStage: true,
        },
      }),
      prisma.deal.findMany({
        where: {
          OR: [
            { title: { contains: q } },
          ],
        },
        take: 10,
        select: {
          id: true,
          title: true,
          value: true,
          stage: true,
          contact: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
      prisma.campaign.findMany({
        where: {
          OR: [
            { name: { contains: q } },
          ],
        },
        take: 10,
        select: {
          id: true,
          name: true,
          platform: true,
          status: true,
          adAccount: {
            select: { id: true, accountName: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      contacts,
      deals,
      campaigns,
      totalResults: contacts.length + deals.length + campaigns.length,
    });
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
