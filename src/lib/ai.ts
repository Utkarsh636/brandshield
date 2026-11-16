import Groq from "groq-sdk"
import { Rule } from "@prisma/client"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" })

export interface ReviewFinding {
  issueText: string
  explanation: string
  suggestion: string
  severity: "CRITICAL" | "WARNING" | "SUGGESTION"
  category: "TONE" | "TERMINOLOGY" | "FACTS" | "MESSAGING" | "ACCESSIBILITY" | "VISUAL"
  matchedRuleCode?: string
}

export interface AIReviewResult {
  overallScore: number
  summary: string
  findings: ReviewFinding[]
}

export async function reviewContent(
  content: string,
  contentType: string,
  rules: Rule[]
): Promise<AIReviewResult> {
  const rulesContext = rules
    .filter((r) => r.isActive)
    .map(
      (r) =>
        `[${r.ruleCode}] (${r.category}, ${r.severity}): ${r.title} — ${r.description}`
    )
    .join("\n")

  const prompt = `You are BrandShield, an AI brand governance reviewer. Your job is to review content against an organisation's brand guidelines and flag any violations.

## Brand Rules
${rulesContext}

## Content to Review
Type: ${contentType}
---
${content}
---

## Instructions
1. Review the content against EVERY rule listed above.
2. For each violation found, identify:
   - The specific text that violates the rule (quote it exactly)
   - Which rule it violates (use the rule code like T-001, TERM-001, etc.)
   - A clear explanation of why it's a violation
   - A specific suggested correction that preserves the original meaning
   - The severity (CRITICAL, WARNING, or SUGGESTION) matching the rule's severity
   - The category (TONE, TERMINOLOGY, FACTS, MESSAGING, ACCESSIBILITY, VISUAL)
3. Give an overall brand compliance score from 0-100 (100 = perfect compliance).
4. Write a 2-3 sentence summary of the review.

If the content has no violations, return an empty findings array and a score of 100.

## Response Format
Respond ONLY with valid JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "overallScore": <number 0-100>,
  "summary": "<2-3 sentence summary>",
  "findings": [
    {
      "issueText": "<exact quoted text from content>",
      "explanation": "<why this violates the rule>",
      "suggestion": "<suggested replacement text>",
      "severity": "<CRITICAL|WARNING|SUGGESTION>",
      "category": "<TONE|TERMINOLOGY|FACTS|MESSAGING|ACCESSIBILITY|VISUAL>",
      "matchedRuleCode": "<rule code like T-001>"
    }
  ]
}`

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a brand governance AI. You MUST respond with valid JSON only. No markdown, no code blocks, no explanation — just the JSON object.",
        },
        { role: "user", content: prompt },
      ],
      model: "qwen/qwen3.8-27b",
      temperature: 0.3,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    })

    const response = chatCompletion.choices[0]?.message?.content || "{}"

    // Extract JSON (handle possible markdown wrapping)
    let jsonStr = response.trim()
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    }

    const parsed: AIReviewResult = JSON.parse(jsonStr)

    // Validate and sanitize
    return {
      overallScore: Math.min(100, Math.max(0, parsed.overallScore || 0)),
      summary: parsed.summary || "Review completed.",
      findings: (parsed.findings || []).map((f) => ({
        issueText: f.issueText || "",
        explanation: f.explanation || "",
        suggestion: f.suggestion || "",
        severity: (["CRITICAL", "WARNING", "SUGGESTION"].includes(f.severity)
          ? f.severity
          : "WARNING") as ReviewFinding["severity"],
        category: (["TONE", "TERMINOLOGY", "FACTS", "MESSAGING", "ACCESSIBILITY", "VISUAL"].includes(f.category)
          ? f.category
          : "MESSAGING") as ReviewFinding["category"],
        matchedRuleCode: f.matchedRuleCode || undefined,
      })),
    }
  } catch (error) {
    console.error("AI Review Error:", error)
    return {
      overallScore: -1,
      summary:
        "Review could not be completed due to an AI processing error. Please try again.",
      findings: [],
    }
  }
}

export async function parseGuidelines(rawContent: string): Promise<
  Array<{
    ruleCode: string
    category: string
    title: string
    description: string
    severity: string
  }>
> {
  const parsePrompt = `You are a brand guideline parser. Extract structured brand rules from the following brand guidelines text.

## Guidelines Text
${rawContent}

## Instructions
Parse each distinct rule/directive from the guidelines. For each rule, extract:
- A short code (format: category prefix + number, e.g., T-001 for tone, TERM-001 for terminology, F-001 for facts, M-001 for messaging, A-001 for accessibility, V-001 for visual)
- Category: TONE, TERMINOLOGY, FACTS, MESSAGING, ACCESSIBILITY, or VISUAL
- Title: a short title for the rule (under 80 chars)
- Description: the full rule description
- Severity: CRITICAL (must follow), WARNING (should follow), or SUGGESTION (nice to follow)

Extract at least 3 rules and at most 15 rules. Be thorough but avoid duplicates.

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "rules": [
    {
      "ruleCode": "T-001",
      "category": "TONE",
      "title": "Short rule title",
      "description": "Full description of the rule",
      "severity": "WARNING"
    }
  ]
}`

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a brand guideline parser. Respond with valid JSON only.",
        },
        { role: "user", content: parsePrompt },
      ],
      model: "qwen/qwen3.8-27b",
      temperature: 0.2,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    })

    const response = chatCompletion.choices[0]?.message?.content || "{}"
    let jsonStr = response.trim()
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) jsonStr = jsonMatch[1].trim()

    const parsed = JSON.parse(jsonStr)
    return parsed.rules || []
  } catch (error) {
    console.error("Guideline parsing error:", error)
    return []
  }
}
