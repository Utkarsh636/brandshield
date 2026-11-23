import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const guideline = await prisma.brandGuideline.findUnique({
      where: { id: params.id },
      include: { rules: { orderBy: { ruleCode: "asc" } } },
    })
    if (!guideline)
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(guideline)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch guideline" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    await prisma.brandGuideline.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if ((error as any)?.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(
      { error: "Failed to delete guideline" },
      { status: 500 }
    )
  }
}
