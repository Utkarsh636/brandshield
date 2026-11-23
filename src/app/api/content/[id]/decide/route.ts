import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const content = await prisma.content.findUnique({ where: { id: params.id }, include: { reviews: { include: { findings: true }, orderBy: { createdAt: "desc" }, take: 1 } } })
    if (!content) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const review = content.reviews[0]
    if (!review) return NextResponse.json({ error: "Review this content before requesting a decision" }, { status: 400 })
    const critical = review.findings.filter((f) => f.severity === "CRITICAL").length
    const warnings = review.findings.filter((f) => f.severity === "WARNING").length
    const score = review.overallScore ?? 0
    const decision = critical > 0 ? "REVISION_REQUESTED" : score >= 85 ? "APPROVED" : "REVISION_REQUESTED"
    const recommendation = decision === "APPROVED"
      ? "Approve: no critical violations remain and the compliance score meets the publishing threshold."
      : critical > 0
        ? `Request revision: ${critical} critical issue${critical === 1 ? "" : "s"} must be resolved before publishing.`
        : `Request revision: the score is ${score}/100 with ${warnings} warning${warnings === 1 ? "" : "s"}; resolve the suggested edits before approval.`
    await prisma.notification.create({ data: { userId: content.submittedBy, type: "DECISION", message: `BrandShield recommends ${decision === "APPROVED" ? "approval" : "revision"} for “${content.title}”.`, contentId: content.id } })
    return NextResponse.json({ decision, recommendation, score, critical, warnings })
  } catch (error) {
    console.error("Decision error:", error)
    return NextResponse.json({ error: "Failed to create recommendation" }, { status: 500 })
  }
}
