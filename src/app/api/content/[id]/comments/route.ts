import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { body, findingId, parentId } = await req.json()
    if (typeof body !== "string" || !body.trim() || body.trim().length > 2000) {
      return NextResponse.json({ error: "Comment must be between 1 and 2,000 characters" }, { status: 400 })
    }
    const content = await prisma.content.findUnique({ where: { id: params.id }, select: { id: true, title: true, submittedBy: true } })
    if (!content) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (findingId) {
      const finding = await prisma.finding.findFirst({ where: { id: findingId, review: { contentId: params.id } } })
      if (!finding) return NextResponse.json({ error: "Finding does not belong to this content" }, { status: 400 })
    }
    if (parentId) {
      const parent = await prisma.comment.findFirst({ where: { id: parentId, contentId: params.id } })
      if (!parent) return NextResponse.json({ error: "Parent comment not found" }, { status: 400 })
    }
    const comment = await prisma.comment.create({
      data: { body: body.trim(), contentId: params.id, findingId: findingId || null, parentId: parentId || null, authorId: (session.user as any).id },
      include: { author: { select: { id: true, name: true, email: true } } },
    })
    if (content.submittedBy !== (session.user as any).id) {
      await prisma.notification.create({ data: { userId: content.submittedBy, type: "COMMENT", message: `${comment.author.name || "A teammate"} commented on “${content.title}”.`, contentId: params.id } })
    }
    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("Comment error:", error)
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}
