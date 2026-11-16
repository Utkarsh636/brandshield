import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const rule = await prisma.rule.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json(rule)
  } catch (error) {
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
    await prisma.rule.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete rule" },
      { status: 500 }
    )
  }
}
