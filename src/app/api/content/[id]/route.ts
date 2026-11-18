import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const content = await prisma.content.findUnique({
      where: { id: params.id },
      include: {
        submitter: { select: { name: true, email: true, role: true } },
        reviews: {
          include: {
            findings: {
              include: { rule: true },
              orderBy: { severity: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })
    if (!content)
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(content)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reqBody = await req.json()
    const updateData: any = {}
    if (reqBody.status) updateData.status = reqBody.status
    if (reqBody.body) updateData.body = reqBody.body
    const content = await prisma.content.update({
      where: { id: params.id },
      data: updateData,
    })
    return NextResponse.json(content)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update content" },
      { status: 500 }
    )
  }
}
