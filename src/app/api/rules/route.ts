import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const activeOnly = searchParams.get("active") === "true"

    const rules = await prisma.rule.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: { guideline: { select: { name: true } } },
      orderBy: { ruleCode: "asc" },
    })
    return NextResponse.json(rules)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch rules" },
      { status: 500 }
    )
  }
}
