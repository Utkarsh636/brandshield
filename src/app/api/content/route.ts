import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { reviewContent } from "@/lib/ai"
import { extractDominantColors, checkVisualCompliance } from "@/lib/visual"

export async function GET() {
  try {
    const contents = await prisma.content.findMany({
      include: {
        submitter: { select: { name: true, email: true } },
        reviews: {
          include: { _count: { select: { findings: true } } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(contents)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { title, body, contentType, imageUrl } = await req.json()
    if (typeof title !== "string" || typeof body !== "string" || !title.trim() || !body.trim()) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400 }
      )
    }
    if (title.trim().length > 160 || body.trim().length > 20000) {
      return NextResponse.json({ error: "Title must be at most 160 characters and content at most 20,000 characters" }, { status: 400 })
    }
    if (imageUrl && (typeof imageUrl !== "string" || imageUrl.length > 3_000_000 || !/^data:image\/(png|jpeg|webp);base64,/.test(imageUrl))) {
      return NextResponse.json({ error: "Please attach a PNG, JPEG, or WebP image smaller than 2MB" }, { status: 400 })
    }

    const userId = (session.user as any).id

    // Create content
    const content = await prisma.content.create({
      data: {
        title: title.trim(),
        body: body.trim(),
        imageUrl: imageUrl || null,
        contentType: contentType || "TEXT",
        status: "UNDER_REVIEW",
        submittedBy: userId,
      },
    })
    await prisma.contentVersion.create({
      data: { contentId: content.id, body: content.body, version: 1, changedBy: userId, changeNote: "Initial submission" },
    })

    // Get all active rules
    const rules = await prisma.rule.findMany({ where: { isActive: true } })

    if (rules.length === 0) {
      // No rules to review against
      await prisma.content.update({
        where: { id: content.id },
        data: { status: "PENDING" },
      })
      return NextResponse.json(
        {
          ...content,
          message: "No active brand rules found. Please add guidelines first.",
        },
        { status: 201 }
      )
    }

    // Run AI review
    const aiResult = await reviewContent(body, contentType || "TEXT", rules)

    // Create review
    const review = await prisma.review.create({
      data: {
        contentId: content.id,
        overallScore: aiResult.overallScore,
        summary: aiResult.summary,
        status: "COMPLETED",
      },
    })

    // Create findings
    for (const finding of aiResult.findings) {
      // Try to match rule by code
      let matchedRule = null
      if (finding.matchedRuleCode) {
        matchedRule = rules.find((r) => r.ruleCode === finding.matchedRuleCode)
      }

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

    // Visual review if image is present
    if (imageUrl) {
      try {
        const colors = await extractDominantColors(imageUrl)
        const visualFindings = checkVisualCompliance(colors)
        for (const vf of visualFindings) {
          await prisma.finding.create({
            data: {
              reviewId: review.id,
              ruleId: rules.find((r) => r.ruleCode === "V-001")?.id || null,
              issueText: vf.issueText,
              explanation: vf.explanation,
              suggestion: vf.suggestion,
              severity: vf.severity,
              category: "VISUAL",
            },
          })
        }
      } catch (e) {
        console.error("Visual review error:", e)
      }
    }

    // Update content status based on findings
    const hasCritical = aiResult.findings.some(
      (f) => f.severity === "CRITICAL"
    )
    await prisma.content.update({
      where: { id: content.id },
      data: { status: hasCritical ? "REVISION_REQUESTED" : "UNDER_REVIEW" },
    })

    const fullContent = await prisma.content.findUnique({
      where: { id: content.id },
      include: {
        reviews: {
          include: {
            findings: { include: { rule: true } },
          },
        },
      },
    })

    return NextResponse.json(fullContent, { status: 201 })
  } catch (error) {
    console.error("Content submission error:", error)
    return NextResponse.json(
      { error: "Failed to submit content" },
      { status: 500 }
    )
  }
}
