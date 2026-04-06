import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "contacts";
    const lifecycleStage = searchParams.get("lifecycleStage") || "";
    const source = searchParams.get("source") || "";

    if (type !== "contacts") {
      return new Response(
        JSON.stringify({ error: "Only 'contacts' export is currently supported" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const where: Record<string, unknown> = {};
    if (lifecycleStage) where.lifecycleStage = lifecycleStage;
    if (source) where.source = source;

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        deals: {
          select: { value: true },
        },
      },
    });

    // Build CSV
    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Company",
      "Job Title",
      "Source",
      "Lifecycle Stage",
      "Lead Score",
      "Deal Count",
      "Total Deal Value",
      "Tags",
      "Created At",
    ];

    const csvRows: string[] = [headers.join(",")];

    for (const contact of contacts) {
      const dealCount = contact.deals.length;
      const totalDealValue = contact.deals.reduce((s, d) => s + d.value, 0);

      const row = [
        escapeCsv(contact.id),
        escapeCsv(contact.firstName),
        escapeCsv(contact.lastName),
        escapeCsv(contact.email),
        escapeCsv(contact.phone || ""),
        escapeCsv(contact.company || ""),
        escapeCsv(contact.jobTitle || ""),
        escapeCsv(contact.source),
        escapeCsv(contact.lifecycleStage),
        String(contact.leadScore),
        String(dealCount),
        String(totalDealValue),
        escapeCsv(contact.tags),
        contact.createdAt.toISOString(),
      ];

      csvRows.push(row.join(","));
    }

    const csvContent = csvRows.join("\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="contacts-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting:", error);
    return new Response(
      JSON.stringify({ error: "Failed to export data" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
