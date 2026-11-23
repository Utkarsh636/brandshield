const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

let prisma: any

async function connect() {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      prisma = new PrismaClient()
      await prisma.$connect()
      console.log('  Database connected')
      return
    } catch (e: any) {
      console.log(`  Connection attempt ${attempt}/5 failed, waiting 10s...`)
      if (prisma) await prisma.$disconnect().catch(() => {})
      if (attempt === 5) throw e
      await new Promise(r => setTimeout(r, 10000))
    }
  }
}

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60))
  return d
}

async function main() {
  console.log('Seeding database...')
  await connect()

  await prisma.notification.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.contentVersion.deleteMany()
  await prisma.finding.deleteMany()
  await prisma.review.deleteMany()
  await prisma.content.deleteMany()
  await prisma.rule.deleteMany()
  await prisma.brandGuideline.deleteMany()
  await prisma.user.deleteMany()

  // ── Users ──
  const adminPw = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: { email: 'admin@brandshield.com', name: 'Admin User', password: adminPw, role: 'ADMIN' },
  })

  const creatorPw = await bcrypt.hash('creator123', 10)
  const creator = await prisma.user.create({
    data: { email: 'creator@brandshield.com', name: 'Content Creator', password: creatorPw, role: 'CREATOR' },
  })
  console.log('  Users created')

  // ── Brand Guideline ──
  const guideline = await prisma.brandGuideline.create({
    data: {
      name: 'BrandShield Official Brand Guidelines',
      description: 'Covers tone of voice, approved terminology, factual claims, messaging standards, accessibility requirements, and visual identity.',
      rawContent: 'Brand Voice & Tone\nOur brand voice is confident, clear, and approachable. Always use active voice in customer-facing content. Avoid passive constructions.\n\nTerminology\nRefer to people who use our product as "customers", not "users". Never use jargon or acronyms without defining them on first use.\n\nApproved Claims\nOur product uptime claim is "99.9% uptime". Do not round to 100%.\n\nMessaging\nDo not make comparative claims against named competitors without legal approval.\n\nAccessibility\nAll content must maintain a Flesch-Kincaid readability score of 60 or above.\n\nVisual Identity\nPrimary brand colour is Rose (#F43F5E). Secondary: Slate (#0F172A). Logo must have minimum 24px clear space. Never stretch or recolour the logo.',
    },
  })

  // ── Rules ──
  const rulesData = [
    { ruleCode: 'T-001', category: 'TONE', title: 'Always use active voice in customer-facing content', description: 'Customer-facing content must use active voice. Passive constructions weaken the message and should be rewritten.', severity: 'WARNING' },
    { ruleCode: 'TERM-001', category: 'TERMINOLOGY', title: 'Use "customers" instead of "users" in external content', description: 'The word "users" is prohibited in all external-facing content. Always say "customers".', severity: 'WARNING' },
    { ruleCode: 'F-001', category: 'FACTS', title: 'Product uptime claim must state "99.9% uptime"', description: 'The only approved uptime figure is "99.9%". Do not round to "100%" or state "99.99%".', severity: 'CRITICAL' },
    { ruleCode: 'M-001', category: 'MESSAGING', title: 'No comparative claims against competitors without legal approval', description: 'Content must not name competitors or make direct comparisons without written legal approval.', severity: 'CRITICAL' },
    { ruleCode: 'A-001', category: 'ACCESSIBILITY', title: 'Maintain Flesch-Kincaid readability score of 60+', description: 'All published content must achieve a readability score of 60+. Avoid long sentences and multi-syllable jargon.', severity: 'SUGGESTION' },
    { ruleCode: 'TERM-002', category: 'TERMINOLOGY', title: 'Define jargon and acronyms on first use', description: 'Every acronym must be written out in full on first appearance with abbreviation in parentheses.', severity: 'WARNING' },
    { ruleCode: 'V-001', category: 'VISUAL', title: 'Use approved brand colour palette only', description: 'Primary: Rose #F43F5E. Secondary: Slate #0F172A. Accent: White. Do not use off-brand colours in marketing materials.', severity: 'WARNING' },
    { ruleCode: 'V-002', category: 'VISUAL', title: 'Logo must have minimum clear space', description: 'The BrandShield logo must have at least 24px of clear space on all sides. Never crop, stretch, or overlay the logo.', severity: 'CRITICAL' },
  ]

  const rules: any[] = []
  for (const r of rulesData) {
    const created = await prisma.rule.create({ data: { ...r, guidelineId: guideline.id } })
    rules.push(created)
  }
  console.log(`  ${rules.length} rules created`)

  const ruleByCode = (code: string) => rules.find((r: any) => r.ruleCode === code)

  // ── Helper to create content + review + findings ──
  async function createContent(data: {
    title: string; body: string; contentType: string; status: string;
    submittedBy: string; daysAgo: number; score?: number; summary?: string;
    findings?: Array<{ issueText: string; explanation: string; suggestion: string; severity: string; category: string; ruleCode: string }>;
  }) {
    const createdAt = daysAgo(data.daysAgo)
    const content = await prisma.content.create({
      data: {
        title: data.title, body: data.body, contentType: data.contentType,
        status: data.status, submittedBy: data.submittedBy, createdAt, updatedAt: createdAt,
      },
    })

    // Initial version
    await prisma.contentVersion.create({
      data: { contentId: content.id, body: data.body, version: 1, changedBy: data.submittedBy, changeNote: 'Initial submission', createdAt },
    })

    if (data.score !== undefined) {
      const reviewDate = new Date(createdAt.getTime() + 30000)
      const review = await prisma.review.create({
        data: {
          contentId: content.id, overallScore: data.score, summary: data.summary || '',
          status: 'COMPLETED', createdAt: reviewDate, updatedAt: reviewDate,
        },
      })

      if (data.findings) {
        for (const f of data.findings) {
          await prisma.finding.create({
            data: {
              reviewId: review.id, ruleId: ruleByCode(f.ruleCode)?.id || null,
              issueText: f.issueText, explanation: f.explanation, suggestion: f.suggestion,
              severity: f.severity, category: f.category, createdAt: reviewDate,
            },
          })
        }
      }
    }
    return content
  }

  // ── WEEK 1 (25-28 days ago): Team just started ──

  const c1 = await createContent({
    title: 'Q4 Product Launch Email', contentType: 'EMAIL', status: 'REVISION_REQUESTED',
    submittedBy: creator.id, daysAgo: 28,
    score: 18, summary: 'Multiple critical violations: false uptime claims, competitor comparisons, prohibited terminology, undefined acronyms.',
    findings: [
      { issueText: 'users', explanation: '"users" is prohibited in external content.', suggestion: 'customers', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-001' },
      { issueText: 'Your feedback has been received and changes were made', explanation: 'Passive voice weakens the message.', suggestion: 'We received your feedback and made changes', severity: 'WARNING', category: 'TONE', ruleCode: 'T-001' },
      { issueText: '100% uptime', explanation: 'Only approved figure is "99.9%".', suggestion: '99.9% uptime', severity: 'CRITICAL', category: 'FACTS', ruleCode: 'F-001' },
      { issueText: 'faster than CompetitorX', explanation: 'Naming competitors requires legal approval.', suggestion: 'faster than other solutions on the market', severity: 'CRITICAL', category: 'MESSAGING', ruleCode: 'M-001' },
      { issueText: 'RAG', explanation: 'Acronym not defined on first use.', suggestion: 'Retrieval-Augmented Generation (RAG)', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-002' },
      { issueText: 'LLM', explanation: 'Acronym not defined on first use.', suggestion: 'Large Language Model (LLM)', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-002' },
      { issueText: 'NLP', explanation: 'Acronym not defined on first use.', suggestion: 'Natural Language Processing (NLP)', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-002' },
      { issueText: 'leverages our proprietary LLM orchestration layer to deliver real-time NLP insights', explanation: 'Dense jargon reduces readability.', suggestion: 'uses our AI technology to provide instant language analysis', severity: 'SUGGESTION', category: 'ACCESSIBILITY', ruleCode: 'A-001' },
    ],
    body: 'Dear users,\n\nWe are excited to announce our latest product update! Your feedback has been received and changes were made based on your suggestions.\n\nOur platform now delivers 100% uptime, making it faster than CompetitorX and more reliable than any alternative on the market.\n\nThe new AI-powered RAG pipeline leverages our proprietary LLM orchestration layer to deliver real-time NLP insights.\n\nWe look forward to serving you better.\n\nBest regards,\nThe BrandShield Team',
  })
  console.log('  Week 1: Q4 Product Launch Email (18/100)')

  await createContent({
    title: 'Google Ads — Performance Campaign Copy', contentType: 'ADVERTISEMENT', status: 'REJECTED',
    submittedBy: admin.id, daysAgo: 27,
    score: 8, summary: 'Critical: names three competitors, unverified claims, prohibited terminology, passive voice.',
    findings: [
      { issueText: 'Better than Grammarly', explanation: 'Direct competitor comparison.', suggestion: 'The leading solution', severity: 'CRITICAL', category: 'MESSAGING', ruleCode: 'M-001' },
      { issueText: 'Unlike Acme Corp and BrandGuard', explanation: 'Names two competitors.', suggestion: 'Unlike traditional tools', severity: 'CRITICAL', category: 'MESSAGING', ruleCode: 'M-001' },
      { issueText: '100% accuracy guaranteed', explanation: 'Unverified claim.', suggestion: 'Industry-leading accuracy', severity: 'CRITICAL', category: 'FACTS', ruleCode: 'F-001' },
      { issueText: 'users', explanation: 'Must use "customers".', suggestion: 'customers', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-001' },
      { issueText: 'results were seen in minutes', explanation: 'Passive voice.', suggestion: 'see results in minutes', severity: 'WARNING', category: 'TONE', ruleCode: 'T-001' },
    ],
    body: 'BrandShield: Better than Grammarly for brand compliance.\n\nUnlike Acme Corp and BrandGuard, our AI catches what others miss. 100% accuracy guaranteed. Zero false positives.\n\nJoin 10,000+ users who switched from the competition.\nStart your free trial — results were seen in minutes.',
  })
  console.log('  Week 1: Google Ads Copy (8/100)')

  await createContent({
    title: 'Product Comparison Page Copy', contentType: 'TEXT', status: 'REJECTED',
    submittedBy: creator.id, daysAgo: 26,
    score: 15, summary: 'Multiple competitor naming violations and unverified claims.',
    findings: [
      { issueText: 'outperforms Grammarly Business', explanation: 'Direct competitor comparison.', suggestion: 'outperforms traditional writing tools', severity: 'CRITICAL', category: 'MESSAGING', ruleCode: 'M-001' },
      { issueText: 'Unlike Frontify', explanation: 'Names competitor.', suggestion: 'Unlike static guideline platforms', severity: 'CRITICAL', category: 'MESSAGING', ruleCode: 'M-001' },
      { issueText: '10x faster than manual review', explanation: 'Unverified speed claim.', suggestion: 'significantly faster than manual review', severity: 'CRITICAL', category: 'FACTS', ruleCode: 'F-001' },
      { issueText: 'users report', explanation: 'Must use "customers".', suggestion: 'customers report', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-001' },
      { issueText: 'Our SaaS platform', explanation: 'Acronym not defined.', suggestion: 'Our Software as a Service (SaaS) platform', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-002' },
      { issueText: 'ROI was demonstrated', explanation: 'Passive voice.', suggestion: 'We demonstrated ROI', severity: 'WARNING', category: 'TONE', ruleCode: 'T-001' },
      { issueText: 'The platform, which leverages advanced natural language processing capabilities alongside machine learning algorithms to provide comprehensive brand governance', explanation: 'Readability too low.', suggestion: 'The platform uses AI to check your content against brand rules', severity: 'SUGGESTION', category: 'ACCESSIBILITY', ruleCode: 'A-001' },
    ],
    body: 'Why BrandShield?\n\nBrandShield outperforms Grammarly Business in brand-specific compliance checking. Unlike Frontify, we don\'t just publish guidelines — we enforce them automatically.\n\nOur SaaS platform is 10x faster than manual review. Over 500 users report catching violations they previously missed.\n\nROI was demonstrated within the first week of deployment. The platform, which leverages advanced natural language processing capabilities alongside machine learning algorithms to provide comprehensive brand governance, delivers unmatched results.',
  })
  console.log('  Week 1: Product Comparison Page (15/100)')

  // ── WEEK 2 (18-21 days ago): Improving ──

  await createContent({
    title: 'Customer Apology Email', contentType: 'EMAIL', status: 'REVISION_REQUESTED',
    submittedBy: creator.id, daysAgo: 21,
    score: 38, summary: 'Heavy use of passive voice and prohibited terminology. No critical factual violations.',
    findings: [
      { issueText: 'A mistake was made', explanation: 'Passive voice.', suggestion: 'We made a mistake', severity: 'WARNING', category: 'TONE', ruleCode: 'T-001' },
      { issueText: 'users', explanation: 'Must use "customers".', suggestion: 'customers', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-001' },
      { issueText: 'Your account has been restored', explanation: 'Passive voice.', suggestion: 'We have restored your account', severity: 'WARNING', category: 'TONE', ruleCode: 'T-001' },
      { issueText: 'Steps are being taken', explanation: 'Passive voice.', suggestion: 'We are taking steps', severity: 'WARNING', category: 'TONE', ruleCode: 'T-001' },
      { issueText: 'SLA', explanation: 'Acronym not defined.', suggestion: 'Service Level Agreement (SLA)', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-002' },
    ],
    body: 'Dear users,\n\nA mistake was made during our scheduled maintenance window yesterday. We sincerely apologise for the disruption.\n\nYour account has been restored and all data is intact. Steps are being taken to ensure this does not happen again. We are reviewing our SLA commitments.\n\nThank you for your patience.\n\nBest regards,\nThe BrandShield Team',
  })
  console.log('  Week 2: Customer Apology Email (38/100)')

  await createContent({
    title: 'Partner Onboarding Document', contentType: 'DOCUMENT', status: 'REVISION_REQUESTED',
    submittedBy: admin.id, daysAgo: 20,
    score: 45, summary: 'Moderate issues: undefined acronyms and some passive voice. Content is factually accurate.',
    findings: [
      { issueText: 'API', explanation: 'Define on first use.', suggestion: 'Application Programming Interface (API)', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-002' },
      { issueText: 'SDK', explanation: 'Define on first use.', suggestion: 'Software Development Kit (SDK)', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-002' },
      { issueText: 'Access will be granted', explanation: 'Passive voice.', suggestion: 'We will grant you access', severity: 'WARNING', category: 'TONE', ruleCode: 'T-001' },
      { issueText: 'The onboarding process, which encompasses multiple integration steps including authentication configuration, endpoint mapping, and webhook setup, requires careful attention to detail', explanation: 'Sentence too complex.', suggestion: 'The onboarding process has several steps. Follow each one carefully.', severity: 'SUGGESTION', category: 'ACCESSIBILITY', ruleCode: 'A-001' },
    ],
    body: 'Partner Onboarding Guide\n\nWelcome to the BrandShield partner programme. This document covers API integration, SDK setup, and webhook configuration.\n\nStep 1: Access will be granted to your partner portal within 24 hours.\nStep 2: Configure your API keys in the dashboard.\nStep 3: Install our SDK in your application.\n\nThe onboarding process, which encompasses multiple integration steps including authentication configuration, endpoint mapping, and webhook setup, requires careful attention to detail.\n\nOur team maintains 99.9% uptime across all partner endpoints.',
  })
  console.log('  Week 2: Partner Onboarding Doc (45/100)')

  await createContent({
    title: 'Product Update Tweet Thread', contentType: 'SOCIAL_POST', status: 'UNDER_REVIEW',
    submittedBy: creator.id, daysAgo: 19,
    score: 62, summary: 'Uses "users" instead of "customers" and includes an undefined acronym. No critical violations.',
    findings: [
      { issueText: 'users', explanation: 'Must use "customers".', suggestion: 'customers', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-001' },
      { issueText: 'NLP', explanation: 'Acronym not defined.', suggestion: 'Natural Language Processing (NLP)', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-002' },
    ],
    body: 'Big news! Our latest release makes brand compliance 10x easier for our users.\n\nNew features:\n- AI-powered content review in seconds\n- Smart rule suggestions via our proprietary NLP engine\n- One-click fixes for common violations\n\nTry it today and see why teams love BrandShield!',
  })
  console.log('  Week 2: Product Update Tweet (62/100)')

  await createContent({
    title: 'Instagram Product Carousel Caption', contentType: 'SOCIAL_POST', status: 'UNDER_REVIEW',
    submittedBy: creator.id, daysAgo: 18,
    score: 55, summary: 'Undefined acronyms and borderline readability. Otherwise clean.',
    findings: [
      { issueText: 'AI/ML', explanation: 'Define acronyms.', suggestion: 'Artificial Intelligence / Machine Learning (AI/ML)', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-002' },
      { issueText: 'ROI', explanation: 'Define on first use.', suggestion: 'Return on Investment (ROI)', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-002' },
      { issueText: 'Our cutting-edge AI/ML-powered platform delivers unprecedented ROI', explanation: 'Jargon-heavy, low readability.', suggestion: 'Our AI platform saves you time and money', severity: 'SUGGESTION', category: 'ACCESSIBILITY', ruleCode: 'A-001' },
    ],
    body: 'Slide 1: Your brand. Protected by AI.\nSlide 2: Upload guidelines. We turn them into rules.\nSlide 3: Submit content. Get instant feedback.\nSlide 4: Our cutting-edge AI/ML-powered platform delivers unprecedented ROI for marketing teams.\nSlide 5: Start free today.',
  })
  console.log('  Week 2: Instagram Carousel (55/100)')

  // ── WEEK 3 (11-14 days ago): Getting good ──

  await createContent({
    title: 'Weekly Newsletter — November Issue', contentType: 'EMAIL', status: 'APPROVED',
    submittedBy: creator.id, daysAgo: 14,
    score: 88, summary: 'Excellent compliance. One minor suggestion about sentence length.',
    findings: [
      { issueText: 'As we continue to evolve our platform and introduce new features designed to help our customers maintain consistent brand governance across all their communication channels', explanation: 'Sentence exceeds 25 words.', suggestion: 'We keep improving our platform. New features help you maintain consistent branding across all channels.', severity: 'SUGGESTION', category: 'ACCESSIBILITY', ruleCode: 'A-001' },
    ],
    body: 'Dear customers,\n\nHere is what happened at BrandShield this month.\n\nWe launched one-click Auto-Fix — submit content, see findings, and fix every violation instantly. Our customers saved an average of 4 hours per week on content review.\n\nWe maintain 99.9% uptime across all services. As we continue to evolve our platform and introduce new features designed to help our customers maintain consistent brand governance across all their communication channels, your feedback drives our roadmap.\n\nThank you for being part of our journey.\n\nThe BrandShield Team',
  })
  console.log('  Week 3: Newsletter (88/100)')

  await createContent({
    title: 'How We Protect Your Data — Blog Post', contentType: 'BLOG_POST', status: 'APPROVED',
    submittedBy: creator.id, daysAgo: 13,
    score: 95, summary: 'Excellent brand compliance. Active voice, correct terminology, accurate claims, clear language.',
    findings: [],
    body: 'At BrandShield, we take data security seriously. Our customers trust us with their most important brand assets, and we honour that trust every day.\n\nWe built our platform with security at its core. Every piece of data is encrypted at rest and in transit. We run regular security audits and maintain 99.9% uptime across all services.\n\nOur team monitors systems around the clock. When something needs attention, we act fast. We notify affected customers within 24 hours of any incident.\n\nYour data belongs to you. We never sell it, share it, or use it for purposes you have not approved.',
  })
  console.log('  Week 3: Data Protection Blog (95/100)')

  await createContent({
    title: 'Facebook Ad — Summer Campaign', contentType: 'ADVERTISEMENT', status: 'UNDER_REVIEW',
    submittedBy: admin.id, daysAgo: 12,
    score: 70, summary: 'Mostly clean ad copy. Minor terminology and tone issues.',
    findings: [
      { issueText: 'users love', explanation: 'Must use "customers".', suggestion: 'customers love', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-001' },
      { issueText: 'Content was reviewed', explanation: 'Passive voice.', suggestion: 'We reviewed your content', severity: 'WARNING', category: 'TONE', ruleCode: 'T-001' },
    ],
    body: 'Your brand deserves better.\n\nBrandShield reviews every piece of content before it goes live. Content was reviewed by AI in seconds — not days.\n\nOver 500 customers trust us. Our users love the one-click Auto-Fix feature.\n\nTry it free. No credit card needed.',
  })
  console.log('  Week 3: Facebook Ad (70/100)')

  await createContent({
    title: 'Sales Deck — Intro Slide Copy', contentType: 'DOCUMENT', status: 'APPROVED',
    submittedBy: admin.id, daysAgo: 11,
    score: 92, summary: 'Strong, brand-compliant copy. Active voice, correct terminology.',
    findings: [],
    body: 'BrandShield\nIntelligent Brand Governance\n\nWe help marketing teams review content against brand guidelines — automatically.\n\nOur customers save 15+ hours per week on manual review. We catch tone, terminology, and factual violations that human reviewers miss.\n\nWe maintain 99.9% uptime. Your guidelines. Your rules. Enforced by AI.',
  })
  console.log('  Week 3: Sales Deck (92/100)')

  // ── WEEK 4 (1-7 days ago): High compliance ──

  await createContent({
    title: 'Homepage Hero Copy', contentType: 'TEXT', status: 'APPROVED',
    submittedBy: creator.id, daysAgo: 7,
    score: 97, summary: 'Near-perfect compliance. Clear, active, brand-aligned.',
    findings: [],
    body: 'Protect your brand before you publish.\n\nBrandShield reviews every piece of content against your brand guidelines. We catch inconsistencies in tone, terminology, facts, and messaging — automatically.\n\nOur customers trust us to maintain their brand integrity across every channel.',
  })
  console.log('  Week 4: Homepage Hero (97/100)')

  await createContent({
    title: 'Engineering Blog — API Launch', contentType: 'BLOG_POST', status: 'APPROVED',
    submittedBy: admin.id, daysAgo: 6,
    score: 86, summary: 'Good compliance. One acronym needed definition.',
    findings: [
      { issueText: 'REST', explanation: 'Define on first use.', suggestion: 'Representational State Transfer (REST)', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-002' },
    ],
    body: 'We are excited to announce the BrandShield REST API.\n\nOur customers can now integrate brand compliance checking directly into their content pipelines. Submit content via API, receive findings in structured JSON, and automate your review workflow.\n\nWe built the API with developer experience in mind. Clear documentation, predictable responses, and 99.9% uptime.',
  })
  console.log('  Week 4: Engineering Blog (86/100)')

  await createContent({
    title: 'LinkedIn Thought Leadership Post', contentType: 'SOCIAL_POST', status: 'APPROVED',
    submittedBy: admin.id, daysAgo: 5,
    score: 91, summary: 'Strong brand voice. Active, clear, on-message.',
    findings: [],
    body: 'Brand consistency is not a nice-to-have. It is a revenue driver.\n\nCompanies with consistent brand presentation see 23% higher revenue. Yet 85% of organisations struggle with it.\n\nWe built BrandShield to close that gap. Upload your guidelines. Submit your content. Get instant, explainable feedback. Fix violations with one click.\n\nYour brand is your promise to your customers. Keep it consistent.',
  })
  console.log('  Week 4: LinkedIn Post (91/100)')

  await createContent({
    title: 'App Store Description', contentType: 'TEXT', status: 'APPROVED',
    submittedBy: creator.id, daysAgo: 4,
    score: 90, summary: 'Clean copy. One minor passive voice instance.',
    findings: [
      { issueText: 'guidelines are enforced', explanation: 'Passive voice.', suggestion: 'we enforce your guidelines', severity: 'WARNING', category: 'TONE', ruleCode: 'T-001' },
    ],
    body: 'BrandShield — AI Brand Governance\n\nReview content against your brand guidelines before publishing. Our AI checks tone, terminology, facts, and messaging. Every finding explains which rule was violated and suggests a fix.\n\nWith BrandShield, your brand guidelines are enforced automatically. Submit content, see results in seconds, fix issues with one click.',
  })
  console.log('  Week 4: App Store Description (90/100)')

  await createContent({
    title: 'Customer Onboarding Welcome Email', contentType: 'EMAIL', status: 'APPROVED',
    submittedBy: admin.id, daysAgo: 3,
    score: 93, summary: 'Warm, clear, brand-compliant. Excellent use of active voice.',
    findings: [],
    body: 'Welcome to BrandShield!\n\nWe are thrilled to have you as a customer. Here is what you can expect in your first week:\n\n1. Upload your brand guidelines — our AI will parse them into rules\n2. Submit your first piece of content for review\n3. See exactly where your content aligns or deviates from your brand\n\nOur team is here to help. Reach out any time at support@brandshield.com.\n\nBest,\nThe BrandShield Team',
  })
  console.log('  Week 4: Onboarding Email (93/100)')

  await createContent({
    title: 'Support Email Template', contentType: 'EMAIL', status: 'REVISION_REQUESTED',
    submittedBy: creator.id, daysAgo: 2,
    score: 42, summary: 'Heavy passive voice throughout. Needs rewriting in active voice.',
    findings: [
      { issueText: 'Your ticket has been received', explanation: 'Passive voice.', suggestion: 'We received your ticket', severity: 'WARNING', category: 'TONE', ruleCode: 'T-001' },
      { issueText: 'A response will be provided', explanation: 'Passive voice.', suggestion: 'We will respond', severity: 'WARNING', category: 'TONE', ruleCode: 'T-001' },
      { issueText: 'users', explanation: 'Must use "customers".', suggestion: 'customers', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-001' },
      { issueText: 'Your issue is being investigated', explanation: 'Passive voice.', suggestion: 'We are investigating your issue', severity: 'WARNING', category: 'TONE', ruleCode: 'T-001' },
    ],
    body: 'Dear user,\n\nYour ticket has been received by our support team. A response will be provided within 24 hours.\n\nYour issue is being investigated and we appreciate your patience. All users are important to us.\n\nBest regards,\nSupport Team',
  })
  console.log('  Week 4: Support Email Template (42/100)')

  const c18 = await createContent({
    title: 'Internal Memo — Brand Refresh', contentType: 'DOCUMENT', status: 'APPROVED',
    submittedBy: admin.id, daysAgo: 1,
    score: 96, summary: 'Near-perfect internal document. Clear and brand-aligned.',
    findings: [],
    body: 'Team,\n\nWe are updating our brand guidelines effective next quarter. Key changes:\n\n1. Primary colour shifts from Rose #E11D48 to Rose #F43F5E\n2. We will introduce a new tagline: "Protect your brand before you publish"\n3. All external content must be reviewed through BrandShield before publication\n\nPlease update your templates and reach out to the brand team with questions.\n\nThank you,\nAdmin User',
  })
  console.log('  Week 4: Internal Memo (96/100)')

  await createContent({
    title: 'Press Release — Series A Announcement', contentType: 'DOCUMENT', status: 'PENDING',
    submittedBy: admin.id, daysAgo: 0,
    body: 'FOR IMMEDIATE RELEASE\n\nBrandShield Raises $5M Series A to Scale AI Brand Governance Platform\n\nBrandShield, the AI-powered brand governance platform, today announced a $5 million Series A funding round. The investment will accelerate product development and team expansion.\n\n"Organisations produce more content than ever, across more channels, with more creators," said the CEO. "BrandShield ensures every piece maintains brand integrity."\n\nThe platform serves customers across technology, financial services, healthcare, and e-commerce industries. BrandShield maintains 99.9% uptime and processes content reviews in seconds.\n\nFor media enquiries: press@brandshield.com',
  })
  console.log('  Week 4: Press Release (pending)')

  // ── Comments on key content ──
  await prisma.comment.create({
    data: { body: 'Please fix the uptime claim and competitor references before we can publish this.', contentId: c1.id, authorId: admin.id, createdAt: daysAgo(27) },
  })
  await prisma.comment.create({
    data: { body: 'Working on fixes now. Will use Auto-Fix to resolve the straightforward issues.', contentId: c1.id, authorId: creator.id, createdAt: daysAgo(27) },
  })
  await prisma.comment.create({
    data: { body: 'Auto-fix applied 7 of 8 corrections. Re-submitting for review.', contentId: c1.id, authorId: creator.id, createdAt: daysAgo(26) },
  })

  await prisma.comment.create({
    data: { body: 'This brand refresh memo looks great. Approved for distribution.', contentId: c18.id, authorId: admin.id, createdAt: daysAgo(1) },
  })

  // ── Notifications ──
  const notifs = [
    { userId: creator.id, type: 'REVIEW_COMPLETE', message: 'AI review completed for "Q4 Product Launch Email" — Score: 18/100', contentId: c1.id, createdAt: daysAgo(28) },
    { userId: creator.id, type: 'COMMENT', message: 'Admin User commented on "Q4 Product Launch Email"', contentId: c1.id, createdAt: daysAgo(27) },
    { userId: admin.id, type: 'STATUS_CHANGE', message: '"Internal Memo — Brand Refresh" was approved', contentId: c18.id, createdAt: daysAgo(1), isRead: true },
    { userId: creator.id, type: 'REVIEW_COMPLETE', message: 'AI review completed for "Support Email Template" — Score: 42/100', createdAt: daysAgo(2) },
    { userId: admin.id, type: 'REVIEW_COMPLETE', message: 'AI review completed for "Press Release" — Pending review', createdAt: daysAgo(0) },
  ]
  for (const n of notifs) {
    await prisma.notification.create({ data: n })
  }

  console.log('  Comments + notifications created')
  console.log('\nSeeding complete! 20 content items, 8 rules, comments, versions, notifications.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
