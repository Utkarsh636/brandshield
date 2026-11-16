import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { parseGuidelines } from "@/lib/ai"

export async function GET() {
  try {
    const guidelines = await prisma.brandGuideline.findMany({
      include: { _count: { select: { rules: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(guidelines)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch guidelines" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { name, description, rawContent } = await req.json()
    if (!name || !rawContent) {
      return NextResponse.json(
        { error: "Name and content are required" },
        { status: 400 }
      )
    }

    // Create the guideline
    const guideline = await prisma.brandGuideline.create({
      data: { name, description: description || "", rawContent },
    })

    // Use AI to parse raw guidelines into structured rules
    const parsedRules = await parseGuidelines(rawContent)

    // Create rules in database
    if (parsedRules && Array.isArray(parsedRules)) {
      for (const rule of parsedRules) {
        // Check for duplicate rule codes
        const existing = await prisma.rule.findUnique({
          where: { ruleCode: rule.ruleCode },
        })
        const code = existing
          ? `${rule.ruleCode}-${Date.now().toString(36).slice(-4)}`
          : rule.ruleCode

        await prisma.rule.create({
          data: {
            ruleCode: code,
            category: rule.category as any,
            title: rule.title,
            description: rule.description,
            severity: (rule.severity || "WARNING") as any,
            guidelineId: guideline.id,
          },
        })
      }
    }

    const fullGuideline = await prisma.brandGuideline.findUnique({
      where: { id: guideline.id },
      include: { rules: true },
    })

    return NextResponse.json(fullGuideline, { status: 201 })
  } catch (error) {
    console.error("Guideline creation error:", error)
    return NextResponse.json(
      { error: "Failed to create guideline" },
      { status: 500 }
    )
  }
}
