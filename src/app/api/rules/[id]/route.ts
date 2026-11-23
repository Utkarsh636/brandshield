import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const body = await req.json()
    if (typeof body.isActive !== "boolean") return NextResponse.json({ error: "Only isActive may be updated" }, { status: 400 })
    const rule = await prisma.rule.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json(rule)
  } catch (error) {
    if ((error as any)?.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(
      { error: "Failed to update rule" },
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
    await prisma.rule.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if ((error as any)?.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(
      { error: "Failed to delete rule" },
      { status: 500 }
    )
  }
}
