import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET() {
  try {
    // All reviews with scores, grouped by date
    const reviews = await prisma.review.findMany({
      where: { status: "COMPLETED", overallScore: { gte: 0 } },
      select: { overallScore: true, createdAt: true, contentId: true },
      orderBy: { createdAt: "asc" },
    })

    // Build daily score trend (average score per day)
    const dailyScores: Record<string, { total: number; count: number }> = {}
    for (const r of reviews) {
      const day = r.createdAt.toISOString().slice(0, 10)
      if (!dailyScores[day]) dailyScores[day] = { total: 0, count: 0 }
      dailyScores[day].total += r.overallScore!
      dailyScores[day].count++
    }
    const scoreTrend = Object.entries(dailyScores)
      .map(([date, { total, count }]) => ({
        date,
        avgScore: Math.round(total / count),
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Most violated rules (top 10)
    const ruleViolations = await prisma.finding.groupBy({
      by: ["ruleId"],
      _count: { id: true },
      where: { ruleId: { not: null } },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    })

    const ruleIds = ruleViolations.map((r) => r.ruleId!).filter(Boolean)
    const ruleDetails = await prisma.rule.findMany({
      where: { id: { in: ruleIds } },
      select: { id: true, ruleCode: true, title: true, category: true, severity: true },
    })

    const mostViolatedRules = ruleViolations.map((rv) => {
      const rule = ruleDetails.find((r) => r.id === rv.ruleId)
      return {
        ruleCode: rule?.ruleCode || "Unknown",
        title: rule?.title || "Unknown rule",
        category: rule?.category || "MESSAGING",
        severity: rule?.severity || "WARNING",
        count: rv._count.id,
      }
    })

    // Findings by category
    const categoryBreakdown = await prisma.finding.groupBy({
      by: ["category"],
      _count: { id: true },
    })

    // Findings by severity
    const severityBreakdown = await prisma.finding.groupBy({
      by: ["severity"],
      _count: { id: true },
    })

    // Severity trend by week
    const allFindings = await prisma.finding.findMany({
      select: { severity: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    })

    const weeklyMap: Record<string, Record<string, number>> = {}
    for (const f of allFindings) {
      const d = f.createdAt
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - d.getDay())
      const key = weekStart.toISOString().slice(0, 10)
      if (!weeklyMap[key]) weeklyMap[key] = { CRITICAL: 0, WARNING: 0, SUGGESTION: 0 }
      weeklyMap[key][f.severity]++
    }
    const severityTrend = Object.entries(weeklyMap)
      .map(([week, counts]) => ({ week, ...counts }))
      .sort((a, b) => a.week.localeCompare(b.week))

    // Content by status
    const statusBreakdown = await prisma.content.groupBy({
      by: ["status"],
      _count: { id: true },
    })

    // Content type distribution
    const typeBreakdown = await prisma.content.groupBy({
      by: ["contentType"],
      _count: { id: true },
    })

    return NextResponse.json({
      scoreTrend,
      mostViolatedRules,
      categoryBreakdown: categoryBreakdown.map((c) => ({
        category: c.category,
        count: c._count.id,
      })),
      severityBreakdown: severityBreakdown.map((s) => ({
        severity: s.severity,
        count: s._count.id,
      })),
      severityTrend,
      statusBreakdown: statusBreakdown.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      typeBreakdown: typeBreakdown.map((t) => ({
        type: t.contentType,
        count: t._count.id,
      })),
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
