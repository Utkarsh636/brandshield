export type { User, BrandGuideline, Rule, Content, Review, Finding } from '@prisma/client'
export { Role, RuleCategory, Severity, ContentType, ContentStatus, ReviewStatus } from '@prisma/client'

export interface ReviewFinding {
  issueText: string
  explanation: string
  suggestion: string
  severity: 'CRITICAL' | 'WARNING' | 'SUGGESTION'
  category: 'TONE' | 'TERMINOLOGY' | 'FACTS' | 'MESSAGING' | 'ACCESSIBILITY' | 'VISUAL'
  matchedRuleCode?: string
}

export interface AIReviewResponse {
  overallScore: number
  summary: string
  findings: ReviewFinding[]
}
