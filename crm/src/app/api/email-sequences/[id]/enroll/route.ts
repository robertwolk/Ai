import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { contactIds } = body;

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { error: "contactIds array is required" },
        { status: 400 }
      );
    }

    const sequence = await prisma.emailSequence.findUnique({ where: { id } });
    if (!sequence) {
      return NextResponse.json(
        { error: "Email sequence not found" },
        { status: 404 }
      );
    }

    if (!sequence.isActive) {
      return NextResponse.json(
        { error: "Email sequence is not active" },
        { status: 400 }
      );
    }

    // Verify contacts exist
    const contacts = await prisma.contact.findMany({
      where: { id: { in: contactIds } },
      select: { id: true },
    });

    const validContactIds = new Set(contacts.map((c) => c.id));

    // Check existing enrollments to avoid duplicates
    const existingEnrollments = await prisma.emailSequenceEnrollment.findMany({
      where: {
        sequenceId: id,
        contactId: { in: contactIds },
        status: "ACTIVE",
      },
      select: { contactId: true },
    });

    const alreadyEnrolled = new Set(existingEnrollments.map((e) => e.contactId));

    const toEnroll = contactIds.filter(
      (cId: string) => validContactIds.has(cId) && !alreadyEnrolled.has(cId)
    );

    const enrollments = await Promise.all(
      toEnroll.map((contactId: string) =>
        prisma.emailSequenceEnrollment.create({
          data: {
            sequenceId: id,
            contactId,
            currentStep: 0,
            status: "ACTIVE",
          },
        })
      )
    );

    // Create activity logs for enrolled contacts
    await Promise.all(
      toEnroll.map((contactId: string) =>
        prisma.activity.create({
          data: {
            contactId,
            type: "EMAIL",
            subject: `Enrolled in email sequence: ${sequence.name}`,
            body: `Contact was enrolled in the "${sequence.name}" (${sequence.type}) email sequence.`,
          },
        })
      )
    );

    return NextResponse.json({
      enrolled: enrollments.length,
      skippedNotFound: contactIds.filter((cId: string) => !validContactIds.has(cId)).length,
      skippedAlreadyEnrolled: contactIds.filter(
        (cId: string) => validContactIds.has(cId) && alreadyEnrolled.has(cId)
      ).length,
      enrollments,
    });
  } catch (error) {
    console.error("Error enrolling contacts:", error);
    return NextResponse.json(
      { error: "Failed to enroll contacts" },
      { status: 500 }
    );
  }
}
