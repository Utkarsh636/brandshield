import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { extractDominantColors, checkVisualCompliance, recolorImage, APPROVED_COLORS } from "@/lib/visual"

function hexToRgb(hex: string) {
  const match = hex.replace("#", "").match(/.{2}/g)
  if (!match) return { r: 0, g: 0, b: 0 }
  return { r: parseInt(match[0], 16), g: parseInt(match[1], 16), b: parseInt(match[2], 16) }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const content = await prisma.content.findUnique({
      where: { id: params.id },
    })

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    if (!content.imageUrl) {
      return NextResponse.json({ error: "No image attached" }, { status: 400 })
    }

    const colors = await extractDominantColors(content.imageUrl)
    const findings = checkVisualCompliance(colors)

    if (findings.length === 0) {
      return NextResponse.json({
        fixedImageUrl: content.imageUrl,
        appliedFixes: 0,
        message: "Image colours are already brand-compliant.",
      })
    }

    // Build colour replacement map
    const replacements = findings.map((f) => ({
      from: hexToRgb(f.detectedHex),
      to: hexToRgb(f.suggestedHex),
    }))

    const fixedImageUrl = await recolorImage(content.imageUrl, replacements)

    return NextResponse.json({
      originalImageUrl: content.imageUrl,
      fixedImageUrl,
      appliedFixes: findings.length,
      colorChanges: findings.map((f) => ({
        from: f.detectedHex,
        to: f.suggestedHex,
        toName: APPROVED_COLORS.find((c) => c.hex === f.suggestedHex)?.name || "Brand colour",
      })),
      dominantColors: colors,
    })
  } catch (error) {
    console.error("Visual fix error:", error)
    return NextResponse.json(
      { error: "Failed to fix image" },
      { status: 500 }
    )
  }
}
