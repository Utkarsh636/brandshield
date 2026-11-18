import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const content = await prisma.content.findUnique({
      where: { id: params.id },
      include: {
        reviews: {
          include: { findings: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    const findings = content.reviews?.[0]?.findings || []
    if (findings.length === 0) {
      return NextResponse.json({
        fixedBody: content.body,
        appliedFixes: 0,
        message: "No findings to fix.",
      })
    }

    let fixedBody = content.body
    let appliedFixes = 0
    const fixLog: Array<{ issueText: string; suggestion: string; applied: boolean }> = []

    // Sort findings by position in text (later occurrences first) to avoid offset issues
    const sortedFindings = [...findings].sort((a, b) => {
      const posA = fixedBody.lastIndexOf(a.issueText)
      const posB = fixedBody.lastIndexOf(b.issueText)
      return posB - posA
    })

    for (const finding of sortedFindings) {
      const { issueText, suggestion } = finding
      if (!issueText || !suggestion) {
        fixLog.push({ issueText, suggestion, applied: false })
        continue
      }

      // Try exact match first
      if (fixedBody.includes(issueText)) {
        fixedBody = fixedBody.replace(issueText, suggestion)
        appliedFixes++
        fixLog.push({ issueText, suggestion, applied: true })
      } else {
        // Try case-insensitive match
        const idx = fixedBody.toLowerCase().indexOf(issueText.toLowerCase())
        if (idx !== -1) {
          fixedBody =
            fixedBody.slice(0, idx) +
            suggestion +
            fixedBody.slice(idx + issueText.length)
          appliedFixes++
          fixLog.push({ issueText, suggestion, applied: true })
        } else {
          fixLog.push({ issueText, suggestion, applied: false })
        }
      }
    }

    return NextResponse.json({
      originalBody: content.body,
      fixedBody,
      appliedFixes,
      totalFindings: findings.length,
      fixLog,
    })
  } catch (error) {
    console.error("Auto-fix error:", error)
    return NextResponse.json(
      { error: "Failed to apply fixes" },
      { status: 500 }
    )
  }
}
