import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET() {
  try {
    const [
      totalContent,
      approvedContent,
      rejectedContent,
      totalFindings,
      totalRules,
      recentContent,
    ] = await Promise.all([
      prisma.content.count(),
      prisma.content.count({ where: { status: "APPROVED" } }),
      prisma.content.count({ where: { status: "REJECTED" } }),
      prisma.finding.count(),
      prisma.rule.count({ where: { isActive: true } }),
      prisma.content.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          submitter: { select: { name: true } },
          reviews: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: { overallScore: true },
          },
        },
      }),
    ])

    // Findings by category
    const findingsByCategory = await prisma.finding.groupBy({
      by: ["category"],
      _count: { id: true },
    })

    // Findings by severity
    const findingsBySeverity = await prisma.finding.groupBy({
      by: ["severity"],
      _count: { id: true },
    })

    return NextResponse.json({
      totalContent,
      approvedContent,
      rejectedContent,
      totalFindings,
      totalRules,
      approvalRate:
        totalContent > 0
          ? Math.round((approvedContent / totalContent) * 100)
          : 0,
      findingsByCategory: findingsByCategory.map((f) => ({
        category: f.category,
        count: f._count.id,
      })),
      findingsBySeverity: findingsBySeverity.map((f) => ({
        severity: f.severity,
        count: f._count.id,
      })),
      recentContent,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
