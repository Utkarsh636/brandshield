import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const [notifications, unread] = await Promise.all([
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ])
  return NextResponse.json({ notifications, unread })
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id, all } = await req.json()
  const userId = (session.user as any).id
  await prisma.notification.updateMany({ where: { userId, ...(all ? {} : { id }) }, data: { isRead: true } })
  return NextResponse.json({ ok: true })
}
