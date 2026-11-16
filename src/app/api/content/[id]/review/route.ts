import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { reviewContent } from "@/lib/ai"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const content = await prisma.content.findUnique({
      where: { id: params.id },
    })
    if (!content)
      return NextResponse.json({ error: "Not found" }, { status: 404 })

    const rules = await prisma.rule.findMany({ where: { isActive: true } })
    const aiResult = await reviewContent(
      content.body,
      content.contentType,
      rules
    )

    const review = await prisma.review.create({
      data: {
        contentId: content.id,
        overallScore: aiResult.overallScore,
        summary: aiResult.summary,
        status: "COMPLETED",
      },
    })

    for (const finding of aiResult.findings) {
      let matchedRule = finding.matchedRuleCode
        ? rules.find((r) => r.ruleCode === finding.matchedRuleCode)
        : null

      await prisma.finding.create({
        data: {
          reviewId: review.id,
          ruleId: matchedRule?.id || null,
          issueText: finding.issueText,
          explanation: finding.explanation,
          suggestion: finding.suggestion,
          severity: finding.severity,
          category: finding.category,
        },
      })
    }

    const hasCritical = aiResult.findings.some(
      (f) => f.severity === "CRITICAL"
    )
    await prisma.content.update({
      where: { id: content.id },
      data: { status: hasCritical ? "REVISION_REQUESTED" : "UNDER_REVIEW" },
    })

    const fullReview = await prisma.review.findUnique({
      where: { id: review.id },
      include: { findings: { include: { rule: true } } },
    })

    return NextResponse.json(fullReview, { status: 201 })
  } catch (error) {
    console.error("Re-review error:", error)
    return NextResponse.json(
      { error: "Failed to re-review content" },
      { status: 500 }
    )
  }
}
