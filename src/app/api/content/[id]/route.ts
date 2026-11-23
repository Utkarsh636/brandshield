import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const VALID_STATUSES = ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "REVISION_REQUESTED"]

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
        comments: {
          where: { parentId: null },
          include: {
            author: { select: { id: true, name: true, email: true } },
            replies: { include: { author: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: "asc" } },
          },
          orderBy: { createdAt: "desc" },
        },
        versions: { orderBy: { version: "desc" } },
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
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const reqBody = await req.json() as { status?: string; body?: string; title?: string; imageUrl?: string | null; contentType?: string; changeNote?: string }
    const updateData: any = {}
    if (reqBody.status) {
      if (!VALID_STATUSES.includes(reqBody.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      updateData.status = reqBody.status
    }
    if (typeof reqBody.title === "string") updateData.title = reqBody.title.trim().slice(0, 160)
    if (typeof reqBody.body === "string") {
      if (!reqBody.body.trim() || reqBody.body.length > 20000) return NextResponse.json({ error: "Content must be between 1 and 20,000 characters" }, { status: 400 })
      updateData.body = reqBody.body.trim()
    }
    if (typeof reqBody.imageUrl === "string" || reqBody.imageUrl === null) updateData.imageUrl = reqBody.imageUrl
    if (reqBody.contentType) updateData.contentType = reqBody.contentType
    if (Object.keys(updateData).length === 0) return NextResponse.json({ error: "No changes provided" }, { status: 400 })

    const previous = await prisma.content.findUnique({ where: { id: params.id } })
    if (!previous) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const content = await prisma.$transaction(async (tx) => {
      const updated = await tx.content.update({ where: { id: params.id }, data: updateData })
      if (updateData.body && updateData.body !== previous.body) {
        const latest = await tx.contentVersion.aggregate({ where: { contentId: params.id }, _max: { version: true } })
        await tx.contentVersion.create({
          data: {
            contentId: params.id,
            body: updateData.body,
            version: (latest._max.version || 0) + 1,
            changedBy: (session.user as any).id,
            changeNote: reqBody.changeNote?.slice(0, 280) || "Content updated",
          },
        })
      }
      if (updateData.status && updateData.status !== previous.status) {
        await tx.notification.create({
          data: { userId: previous.submittedBy, type: "STATUS", message: `“${previous.title}” is now ${updateData.status.replace(/_/g, " ").toLowerCase()}.`, contentId: params.id },
        })
      }
      return updated
    })
    return NextResponse.json(content)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update content" },
      { status: 500 }
    )
  }
}
