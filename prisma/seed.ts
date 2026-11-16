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
  const rules = [
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

  for (const rule of rules) {
    await prisma.rule.create({
      data: {
        ...rule,
        guidelineId: guideline.id,
      },
    })
    console.log(`  Created rule: ${rule.ruleCode} — ${rule.title}`)
  }

  console.log('\nSeeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
