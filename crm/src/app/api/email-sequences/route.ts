import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const sequences = await prisma.emailSequence.findMany({
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const parsed = sequences.map((seq) => ({
      ...seq,
      steps: JSON.parse(seq.steps),
      enrollmentCount: seq._count.enrollments,
      _count: undefined,
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error fetching email sequences:", error);
    return NextResponse.json(
      { error: "Failed to fetch email sequences" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, steps, isActive } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "name and type are required" },
        { status: 400 }
      );
    }

    const sequence = await prisma.emailSequence.create({
      data: {
        name,
        type,
        steps: steps ? JSON.stringify(steps) : "[]",
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(
      {
        ...sequence,
        steps: JSON.parse(sequence.steps),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating email sequence:", error);
    return NextResponse.json(
      { error: "Failed to create email sequence" },
      { status: 500 }
    );
  }
}
