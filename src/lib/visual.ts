import sharp from "sharp"

// Brand colour palette — matches rule V-001.
export const BRAND_PALETTE = {
  primary: { name: "Rose", hex: "#F43F5E", r: 244, g: 63, b: 94 },
  secondary: { name: "Slate Dark", hex: "#0F172A", r: 15, g: 23, b: 42 },
  accent: { name: "White", hex: "#FFFFFF", r: 255, g: 255, b: 255 },
  text: { name: "Slate Light", hex: "#E2E8F0", r: 226, g: 232, b: 240 },
  muted: { name: "Slate", hex: "#64748B", r: 100, g: 116, b: 139 },
}

export const APPROVED_COLORS = Object.values(BRAND_PALETTE)

export interface RGB { r: number; g: number; b: number }
export interface DetectedColor { hex: string; rgb: RGB; percentage: number }

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0")).join("").toUpperCase()
}

function colorDistance(a: RGB, b: RGB) {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2)
}

function findNearestBrandColor(color: RGB) {
  return APPROVED_COLORS.reduce((best, candidate) => {
    const distance = colorDistance(color, candidate)
    return distance < best.distance ? { ...candidate, distance } : best
  }, { ...APPROVED_COLORS[0], distance: Infinity })
}

function imageBuffer(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/)
  if (!match) throw new Error("Only PNG, JPEG, and WebP images are supported")
  return Buffer.from(match[2], "base64")
}

// Use decoded pixels, never compressed JPG/PNG bytes. A capped resize keeps this safe for serverless use.
export async function extractDominantColors(dataUrl: string): Promise<DetectedColor[]> {
  const { data, info } = await sharp(imageBuffer(dataUrl))
    .rotate()
    .resize({ width: 160, height: 160, fit: "inside", withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const colors: Record<string, { rgb: RGB; count: number }> = {}
  let sampled = 0
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i + 3] < 32) continue
    const rgb = { r: Math.min(255, Math.round(data[i] / 16) * 16), g: Math.min(255, Math.round(data[i + 1] / 16) * 16), b: Math.min(255, Math.round(data[i + 2] / 16) * 16) }
    const key = `${rgb.r},${rgb.g},${rgb.b}`
    colors[key] ||= { rgb, count: 0 }
    colors[key].count++
    sampled++
  }
  return Object.values(colors)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map(({ rgb, count }) => ({ hex: rgbToHex(rgb.r, rgb.g, rgb.b), rgb, percentage: Math.round((count / Math.max(sampled, 1)) * 100) }))
}

export function checkVisualCompliance(colors: DetectedColor[]) {
  return colors.flatMap((color) => {
    if (color.percentage < 5) return []
    const nearest = findNearestBrandColor(color.rgb)
    if (nearest.distance <= 80) return []
    return [{
      issueText: `Colour ${color.hex} (${color.percentage}% of image)`,
      explanation: `Detected colour ${color.hex} is outside the approved brand palette. The nearest approved colour is ${nearest.name} (${nearest.hex}).`,
      suggestion: `Replace with ${nearest.name} (${nearest.hex})`,
      severity: color.percentage > 20 ? "WARNING" as const : "SUGGESTION" as const,
      category: "VISUAL" as const,
      detectedHex: color.hex,
      suggestedHex: nearest.hex,
    }]
  })
}

// Recolour the decoded image and export a fresh PNG. This preserves a valid image file.
export async function recolorImage(dataUrl: string, replacements: Array<{ from: RGB; to: RGB }>) {
  const source = imageBuffer(dataUrl)
  const { data, info } = await sharp(source).rotate().ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i + 3] < 32) continue
    const pixel = { r: data[i], g: data[i + 1], b: data[i + 2] }
    const replacement = replacements.find((entry) => colorDistance(pixel, entry.from) < 42)
    if (replacement) {
      data[i] = replacement.to.r
      data[i + 1] = replacement.to.g
      data[i + 2] = replacement.to.b
    }
  }
  const fixed = await sharp(data, { raw: info }).png().toBuffer()
  return `data:image/png;base64,${fixed.toString("base64")}`
}
