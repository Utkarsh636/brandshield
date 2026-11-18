const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.finding.deleteMany()
  await prisma.review.deleteMany()
  await prisma.content.deleteMany()
  await prisma.rule.deleteMany()
  await prisma.brandGuideline.deleteMany()
  await prisma.user.deleteMany()

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@brandshield.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('  Created admin user:', admin.email)

  // Create creator user
  const creatorPassword = await bcrypt.hash('creator123', 10)
  const creator = await prisma.user.create({
    data: {
      email: 'creator@brandshield.com',
      name: 'Content Creator',
      password: creatorPassword,
      role: 'CREATOR',
    },
  })
  console.log('  Created creator user:', creator.email)

  // Create brand guideline
  const guideline = await prisma.brandGuideline.create({
    data: {
      name: 'BrandShield Demo Brand Guidelines',
      description:
        'Official brand guidelines for BrandShield demo organisation. ' +
        'Covers tone of voice, approved terminology, factual claims, ' +
        'messaging standards, and accessibility requirements.',
      rawContent:
        'Brand Voice & Tone\n' +
        'Our brand voice is confident, clear, and approachable. ' +
        'Always use active voice in customer-facing content. ' +
        'Avoid passive constructions that weaken the message.\n\n' +
        'Terminology\n' +
        'Refer to the people who use our product as "customers", not "users". ' +
        'In external communications the word "users" is prohibited. ' +
        'Never use jargon or acronyms without defining them on first use.\n\n' +
        'Approved Claims\n' +
        'Our product uptime claim is "99.9% uptime". This figure is valid ' +
        'until Q2 2025 and must not be rounded to 100%.\n\n' +
        'Messaging Standards\n' +
        'Do not make comparative claims against named competitors without ' +
        'prior legal approval. All competitive positioning must be reviewed.\n\n' +
        'Accessibility\n' +
        'All content must maintain a Flesch-Kincaid readability score of 60 ' +
        'or above, equivalent to an 8th-grade reading level.',
    },
  })
  console.log('  Created brand guideline:', guideline.name)

  // Create rules
  const rulesData = [
    {
      ruleCode: 'T-001',
      category: 'TONE',
      title: 'Always use active voice in customer-facing content',
      description:
        'Customer-facing content must use active voice to project confidence ' +
        'and clarity. Passive constructions (e.g., "Mistakes were made", ' +
        '"Your request has been received") weaken the message and should be ' +
        'rewritten in active form (e.g., "We made a mistake", "We received ' +
        'your request").',
      severity: 'WARNING',
    },
    {
      ruleCode: 'TERM-001',
      category: 'TERMINOLOGY',
      title: 'Use "customers" instead of "users" in external communications',
      description:
        'The word "users" is prohibited in all external-facing content. ' +
        'Our audience should always be referred to as "customers". ' +
        'Internal documentation may use "users" when referring to the ' +
        'technical user base, but any content that reaches customers, ' +
        'prospects, or the public must say "customers".',
      severity: 'WARNING',
    },
    {
      ruleCode: 'F-001',
      category: 'FACTS',
      title: 'Product uptime claim must state "99.9% uptime"',
      description:
        'The only approved uptime figure is "99.9%". Do not round to ' +
        '"100%" or "nearly 100%". Do not state "99.99%" unless approved ' +
        'by engineering. This claim is valid until Q2 2025 and must be ' +
        'reverified before continued use after that date. Always cite the ' +
        'exact figure when making reliability claims.',
      severity: 'CRITICAL',
    },
    {
      ruleCode: 'M-001',
      category: 'MESSAGING',
      title: 'No comparative claims against competitors without legal approval',
      description:
        'Content must not name competitors or make direct comparisons ' +
        '(e.g., "faster than CompetitorX", "unlike OtherProduct") without ' +
        'written approval from the legal team. Indirect competitive ' +
        'positioning is allowed only when it does not reference a specific ' +
        'company, product, or service by name.',
      severity: 'CRITICAL',
    },
    {
      ruleCode: 'A-001',
      category: 'ACCESSIBILITY',
      title: 'Maintain Flesch-Kincaid readability score of 60+',
      description:
        'All published content must achieve a Flesch-Kincaid readability ' +
        'score of 60 or above, corresponding to an 8th-grade reading level. ' +
        'This ensures content is accessible to a broad audience. Avoid long ' +
        'sentences (over 25 words), excessive subordinate clauses, and ' +
        'multi-syllable jargon where simpler alternatives exist.',
      severity: 'SUGGESTION',
    },
    {
      ruleCode: 'TERM-002',
      category: 'TERMINOLOGY',
      title: 'Define jargon and acronyms on first use',
      description:
        'Every acronym or technical term must be written out in full on ' +
        'its first appearance, with the abbreviation in parentheses — ' +
        'e.g., "Application Programming Interface (API)". Subsequent ' +
        'references may use the abbreviation alone. Industry-standard ' +
        'abbreviations (e.g., URL, PDF) are exempt.',
      severity: 'WARNING',
    },
  ]

  const rules: any[] = []
  for (const rule of rulesData) {
    const created = await prisma.rule.create({
      data: {
        ...rule,
        guidelineId: guideline.id,
      },
    })
    rules.push(created)
    console.log(`  Created rule: ${rule.ruleCode} — ${rule.title}`)
  }

  // Helper to find rule by code
  const ruleByCode = (code: string) => rules.find((r) => r.ruleCode === code)

  // ── Demo content 1: Bad email (many violations) ──
  const content1 = await prisma.content.create({
    data: {
      title: 'Q4 Product Launch Email',
      body:
        'Dear users,\n\n' +
        'We are excited to announce our latest product update! Your feedback ' +
        'has been received and changes were made based on your suggestions.\n\n' +
        'Our platform now delivers 100% uptime, making it faster than ' +
        'CompetitorX and more reliable than any alternative on the market.\n\n' +
        'The new AI-powered RAG pipeline leverages our proprietary LLM ' +
        'orchestration layer to deliver real-time NLP insights.\n\n' +
        'We look forward to serving you better.\n\nBest regards,\nThe BrandShield Team',
      contentType: 'EMAIL',
      status: 'REVISION_REQUESTED',
      submittedBy: creator.id,
    },
  })
  const review1 = await prisma.review.create({
    data: {
      contentId: content1.id,
      overallScore: 18,
      summary:
        'This content has multiple critical violations including false uptime claims, ' +
        'unauthorized competitor comparisons, prohibited terminology, and undefined acronyms. ' +
        'Significant rewriting is required.',
      status: 'COMPLETED',
    },
  })
  const findings1 = [
    { issueText: 'users', explanation: 'The word "users" is prohibited in external communications. Must use "customers".', suggestion: 'customers', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-001' },
    { issueText: 'Your feedback has been received and changes were made', explanation: 'Passive voice weakens the message. Rewrite in active voice.', suggestion: 'We received your feedback and made changes', severity: 'WARNING', category: 'TONE', ruleCode: 'T-001' },
    { issueText: '100% uptime', explanation: 'The only approved uptime figure is "99.9%". Stating "100%" is a critical factual violation.', suggestion: '99.9% uptime', severity: 'CRITICAL', category: 'FACTS', ruleCode: 'F-001' },
    { issueText: 'faster than CompetitorX', explanation: 'Naming competitors in comparative claims requires legal approval.', suggestion: 'faster than other solutions on the market', severity: 'CRITICAL', category: 'MESSAGING', ruleCode: 'M-001' },
    { issueText: 'RAG', explanation: 'The acronym "RAG" is not defined on first use.', suggestion: 'Retrieval-Augmented Generation (RAG)', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-002' },
    { issueText: 'LLM', explanation: 'The acronym "LLM" is not defined on first use.', suggestion: 'Large Language Model (LLM)', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-002' },
    { issueText: 'NLP', explanation: 'The acronym "NLP" is not defined on first use.', suggestion: 'Natural Language Processing (NLP)', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-002' },
    { issueText: 'leverages our proprietary LLM orchestration layer to deliver real-time NLP insights', explanation: 'Dense jargon reduces readability below the required Flesch-Kincaid score of 60.', suggestion: 'uses our AI technology to provide instant language analysis', severity: 'SUGGESTION', category: 'ACCESSIBILITY', ruleCode: 'A-001' },
  ]
  for (const f of findings1) {
    await prisma.finding.create({
      data: {
        reviewId: review1.id,
        ruleId: ruleByCode(f.ruleCode)?.id || null,
        issueText: f.issueText,
        explanation: f.explanation,
        suggestion: f.suggestion,
        severity: f.severity,
        category: f.category,
      },
    })
  }
  console.log('  Created content: Q4 Product Launch Email (score: 18, 8 findings)')

  // ── Demo content 2: Good blog post (approved, high score) ──
  const content2 = await prisma.content.create({
    data: {
      title: 'How We Protect Your Data — Blog Post',
      body:
        'At BrandShield, we take data security seriously. Our customers trust us ' +
        'with their most important brand assets, and we honour that trust every day.\n\n' +
        'We built our platform with security at its core. Every piece of data is ' +
        'encrypted at rest and in transit. We run regular security audits and maintain ' +
        '99.9% uptime across all services.\n\n' +
        'Our team monitors systems around the clock. When something needs attention, ' +
        'we act fast. We notify affected customers within 24 hours of any incident.\n\n' +
        'Your data belongs to you. We never sell it, share it, or use it for purposes ' +
        'you have not approved. Read our full privacy policy for details.',
      contentType: 'BLOG_POST',
      status: 'APPROVED',
      submittedBy: creator.id,
    },
  })
  const review2 = await prisma.review.create({
    data: {
      contentId: content2.id,
      overallScore: 95,
      summary:
        'Excellent brand compliance. Active voice used consistently, correct terminology ' +
        '("customers" not "users"), accurate uptime figure (99.9%), no competitor mentions, ' +
        'and clear readable language throughout.',
      status: 'COMPLETED',
    },
  })
  console.log('  Created content: How We Protect Your Data (score: 95, approved)')

  // ── Demo content 3: Social media post (some warnings) ──
  const content3 = await prisma.content.create({
    data: {
      title: 'Product Update Tweet Thread',
      body:
        'Big news! Our latest release makes brand compliance 10x easier for our users.\n\n' +
        'New features:\n' +
        '- AI-powered content review in seconds\n' +
        '- Smart rule suggestions via our proprietary NLP engine\n' +
        '- One-click fixes for common violations\n\n' +
        'Try it today and see why teams love BrandShield!',
      contentType: 'SOCIAL_POST',
      status: 'UNDER_REVIEW',
      submittedBy: creator.id,
    },
  })
  const review3 = await prisma.review.create({
    data: {
      contentId: content3.id,
      overallScore: 62,
      summary:
        'Content has moderate compliance issues. Uses prohibited term "users" instead of ' +
        '"customers" and includes an undefined acronym (NLP). No critical violations found.',
      status: 'COMPLETED',
    },
  })
  const findings3 = [
    { issueText: 'users', explanation: 'External content must say "customers" not "users".', suggestion: 'customers', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-001' },
    { issueText: 'NLP', explanation: 'The acronym "NLP" should be defined on first use.', suggestion: 'Natural Language Processing (NLP)', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-002' },
  ]
  for (const f of findings3) {
    await prisma.finding.create({
      data: {
        reviewId: review3.id,
        ruleId: ruleByCode(f.ruleCode)?.id || null,
        issueText: f.issueText,
        explanation: f.explanation,
        suggestion: f.suggestion,
        severity: f.severity,
        category: f.category,
      },
    })
  }
  console.log('  Created content: Product Update Tweet Thread (score: 62, 2 findings)')

  // ── Demo content 4: Advertisement (rejected, critical issues) ──
  const content4 = await prisma.content.create({
    data: {
      title: 'Google Ads — Performance Campaign Copy',
      body:
        'BrandShield: Better than Grammarly for brand compliance.\n\n' +
        'Unlike Acme Corp and BrandGuard, our AI catches what others miss. ' +
        '100% accuracy guaranteed. Zero false positives.\n\n' +
        'Join 10,000+ users who switched from the competition.\n' +
        'Start your free trial — results were seen in minutes.',
      contentType: 'ADVERTISEMENT',
      status: 'REJECTED',
      submittedBy: admin.id,
    },
  })
  const review4 = await prisma.review.create({
    data: {
      contentId: content4.id,
      overallScore: 8,
      summary:
        'This advertisement contains multiple critical violations: naming three competitors ' +
        'directly (Grammarly, Acme Corp, BrandGuard), making unverified claims ("100% accuracy", ' +
        '"Zero false positives"), using prohibited terminology, and employing passive voice.',
      status: 'COMPLETED',
    },
  })
  const findings4 = [
    { issueText: 'Better than Grammarly', explanation: 'Direct competitor comparison without legal approval.', suggestion: 'The leading solution', severity: 'CRITICAL', category: 'MESSAGING', ruleCode: 'M-001' },
    { issueText: 'Unlike Acme Corp and BrandGuard', explanation: 'Names two competitors in a comparative claim. Requires legal approval.', suggestion: 'Unlike traditional tools', severity: 'CRITICAL', category: 'MESSAGING', ruleCode: 'M-001' },
    { issueText: '100% accuracy guaranteed', explanation: 'Unverified factual claim. No approved accuracy figure exists.', suggestion: 'Industry-leading accuracy', severity: 'CRITICAL', category: 'FACTS', ruleCode: 'F-001' },
    { issueText: 'users', explanation: 'Must use "customers" in external content.', suggestion: 'customers', severity: 'WARNING', category: 'TERMINOLOGY', ruleCode: 'TERM-001' },
    { issueText: 'results were seen in minutes', explanation: 'Passive voice weakens the call to action.', suggestion: 'see results in minutes', severity: 'WARNING', category: 'TONE', ruleCode: 'T-001' },
  ]
  for (const f of findings4) {
    await prisma.finding.create({
      data: {
        reviewId: review4.id,
        ruleId: ruleByCode(f.ruleCode)?.id || null,
        issueText: f.issueText,
        explanation: f.explanation,
        suggestion: f.suggestion,
        severity: f.severity,
        category: f.category,
      },
    })
  }
  console.log('  Created content: Google Ads Copy (score: 8, rejected, 5 findings)')

  // ── Demo content 5: Internal document (pending, no review yet) ──
  const content5 = await prisma.content.create({
    data: {
      title: 'Customer Onboarding Welcome Email',
      body:
        'Welcome to BrandShield!\n\n' +
        'We are thrilled to have you as a customer. Here is what you can expect ' +
        'in your first week:\n\n' +
        '1. Upload your brand guidelines — our AI will parse them into rules\n' +
        '2. Submit your first piece of content for review\n' +
        '3. See exactly where your content aligns or deviates from your brand\n\n' +
        'Our team is here to help. Reach out any time at support@brandshield.com.\n\n' +
        'Best,\nThe BrandShield Team',
      contentType: 'EMAIL',
      status: 'PENDING',
      submittedBy: admin.id,
    },
  })
  console.log('  Created content: Customer Onboarding Email (pending, no review)')

  console.log('\nSeeding complete!')
  console.log(`  ${rules.length} rules, 5 content items, 3 reviews, ${findings1.length + findings3.length + findings4.length} findings`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
