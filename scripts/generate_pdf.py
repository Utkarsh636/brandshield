from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    HRFlowable
)

# Colors
DARK_BG = HexColor("#0f172a")
ROSE = HexColor("#f43f5e")
ROSE_LIGHT = HexColor("#fda4af")
SLATE_700 = HexColor("#334155")
SLATE_400 = HexColor("#94a3b8")
SLATE_200 = HexColor("#e2e8f0")
WHITE = HexColor("#ffffff")
GREEN = HexColor("#22c55e")
YELLOW = HexColor("#eab308")
RED = HexColor("#ef4444")
BLUE = HexColor("#3b82f6")
PURPLE = HexColor("#a855f7")

# Styles
title_style = ParagraphStyle("Title", fontName="Helvetica-Bold", fontSize=28, textColor=ROSE, spaceAfter=6, alignment=TA_CENTER)
subtitle_style = ParagraphStyle("Subtitle", fontName="Helvetica", fontSize=13, textColor=SLATE_400, spaceAfter=20, alignment=TA_CENTER)
heading1_style = ParagraphStyle("H1", fontName="Helvetica-Bold", fontSize=20, textColor=ROSE, spaceBefore=24, spaceAfter=10)
heading2_style = ParagraphStyle("H2", fontName="Helvetica-Bold", fontSize=14, textColor=WHITE, spaceBefore=16, spaceAfter=8)
heading3_style = ParagraphStyle("H3", fontName="Helvetica-Bold", fontSize=11, textColor=ROSE_LIGHT, spaceBefore=12, spaceAfter=6)
body_style = ParagraphStyle("Body", fontName="Helvetica", fontSize=10, textColor=SLATE_200, leading=15, spaceAfter=8)
body_bold = ParagraphStyle("BodyBold", fontName="Helvetica-Bold", fontSize=10, textColor=WHITE, leading=15, spaceAfter=4)
caption_style = ParagraphStyle("Caption", fontName="Helvetica", fontSize=9, textColor=SLATE_400, spaceAfter=4)
bullet_style = ParagraphStyle("Bullet", fontName="Helvetica", fontSize=10, textColor=SLATE_200, leading=15, leftIndent=18, bulletIndent=6, spaceAfter=4, bulletFontName="Helvetica", bulletFontSize=10)
section_label = ParagraphStyle("SectionLabel", fontName="Helvetica-Bold", fontSize=9, textColor=ROSE, spaceBefore=8, spaceAfter=2, letterSpacing=2)
page_footer = ParagraphStyle("Footer", fontName="Helvetica", fontSize=8, textColor=SLATE_400, alignment=TA_CENTER)
stat_value = ParagraphStyle("StatVal", fontName="Helvetica-Bold", fontSize=22, textColor=ROSE, alignment=TA_CENTER)
stat_label = ParagraphStyle("StatLabel", fontName="Helvetica", fontSize=9, textColor=SLATE_400, alignment=TA_CENTER, spaceAfter=4)

def hr():
    return HRFlowable(width="100%", thickness=0.5, color=SLATE_700, spaceAfter=12, spaceBefore=12)

def section(num, title_text):
    return [
        Paragraph(f"SECTION {num:02d}", section_label),
        Paragraph(title_text, heading1_style),
        hr(),
    ]

def bullet(text):
    return Paragraph(f"•  {text}", bullet_style)

output_path = "/Users/utkarsh060/projects/brandshield/BrandShield_Round2_TheBuild.pdf"

doc = SimpleDocTemplate(
    output_path,
    pagesize=letter,
    topMargin=0.75*inch,
    bottomMargin=0.75*inch,
    leftMargin=0.85*inch,
    rightMargin=0.85*inch,
    title="BrandShield — Round 2: The Build",
    subject="Inkloom AI Hackathon — Round 2 Submission",
    author="Utkarsh",
)

story = []

# ── PAGE 1: Cover ──
story.append(Spacer(1, 1.5*inch))
story.append(Paragraph("BrandShield", title_style))
story.append(Paragraph("Intelligent Brand Governance Platform", subtitle_style))
story.append(Spacer(1, 0.3*inch))
story.append(Paragraph("AI-powered content review that checks every piece of content<br/>against your brand's approved guidelines, facts, and terminology<br/>— and automatically fixes what it finds.", ParagraphStyle("HeroBody", fontName="Helvetica", fontSize=11, textColor=SLATE_200, alignment=TA_CENTER, leading=17, spaceAfter=30)))
story.append(hr())
story.append(Paragraph("Round 2 Submission — The Build", ParagraphStyle("R2", fontName="Helvetica-Bold", fontSize=14, textColor=WHITE, alignment=TA_CENTER, spaceAfter=6)))
story.append(Paragraph("Inkloom AI Hackathon 2024", ParagraphStyle("Hack", fontName="Helvetica", fontSize=11, textColor=SLATE_400, alignment=TA_CENTER, spaceAfter=6)))
story.append(Paragraph("Solo Developer: Utkarsh  |  November 2024", ParagraphStyle("Author", fontName="Helvetica", fontSize=10, textColor=SLATE_400, alignment=TA_CENTER, spaceAfter=30)))
story.append(PageBreak())

# ── PAGE 2: Table of Contents ──
story.append(Paragraph("Table of Contents", heading1_style))
story.append(hr())
toc_items = [
    ("01", "Executive Summary"),
    ("02", "Completed Features"),
    ("03", "Technology & Architecture"),
    ("04", "Auto-Fix Engine (Key Innovation)"),
    ("05", "Changes from Round 1 Plan"),
    ("06", "Known Limitations"),
    ("07", "Three Improvements for Round 3"),
    ("08", "Demo Walkthrough"),
]
for num, t in toc_items:
    story.append(Paragraph(f"<b>{num}</b>  —  {t}", ParagraphStyle("TOC", fontName="Helvetica", fontSize=11, textColor=SLATE_200, leading=22, leftIndent=12)))
story.append(PageBreak())

# ── SECTION 01: Executive Summary ──
story.extend(section(1, "Executive Summary"))
story.append(Paragraph("BrandShield is a working, deployed AI-powered brand governance platform. Organizations upload their brand guidelines, the AI parses them into structured rules, content creators submit drafts for review, and the AI checks every piece of content against every active rule — returning a compliance score, detailed findings with explanations, and suggested fixes.", body_style))
story.append(Paragraph("The key innovation beyond the Round 1 plan is the <b>Auto-Fix All</b> engine: with one click, every AI-suggested correction is applied to the content body. The user sees a side-by-side before/after diff, reviews the changes, and can save the fixed version and re-run the AI review to confirm compliance.", body_style))
story.append(Spacer(1, 12))

# Stats row
stat_data = [
    [Paragraph("12", stat_value), Paragraph("6", stat_value), Paragraph("5", stat_value), Paragraph("15", stat_value)],
    [Paragraph("Features Built", stat_label), Paragraph("Brand Rules", stat_label), Paragraph("Demo Content Items", stat_label), Paragraph("Pre-seeded Findings", stat_label)],
]
stat_table = Table(stat_data, colWidths=[1.5*inch]*4)
stat_table.setStyle(TableStyle([
    ("ALIGN", (0,0), (-1,-1), "CENTER"),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("TOPPADDING", (0,0), (-1,0), 10),
    ("BOTTOMPADDING", (0,1), (-1,1), 10),
    ("LINEBELOW", (0,0), (-1,0), 0.5, SLATE_700),
]))
story.append(stat_table)
story.append(PageBreak())

# ── SECTION 02: Completed Features ──
story.extend(section(2, "Completed Features"))

features = [
    ("Authentication & Roles", "One-click demo login for Admin and Creator roles. NextAuth.js with JWT sessions, bcrypt password hashing, role-based access control. Protected dashboard redirects unauthenticated users to login."),
    ("Brand Guideline Ingestion", "Paste raw brand guidelines text. AI (Groq/Qwen 3.8 27B) parses them into structured rules with code, category, severity, title, and description. Collapsible upload form with character counter."),
    ("Structured Rule Management", "View all rules as cards with rule code, category badge, severity badge, and source guideline. Toggle rules active/inactive. Search rules by title, code, or description. Filter by category."),
    ("Content Submission + AI Review", "Submit any text content (email, ad, blog, social post, document) with title and type selector. AI reviews against all active rules in real-time. Loading animation with progress indicator during the 15-30 second review."),
    ("Explainable Findings", "Each finding shows: severity badge (Critical/Warning/Suggestion), category badge, matched rule code, flagged text in red, explanation of why it violates the rule, and suggested fix in green. Staggered animation on scroll."),
    ("Brand Compliance Scoring", "0-100 score color-coded (green 80+, yellow 50-79, red below 50). Review summary text. Severity mini-bar showing Critical/Warning/Suggestion counts."),
    ("Auto-Fix All Engine", "One-click applies every suggested fix. Side-by-side Original vs Fixed diff. Change log with strikethrough originals and green replacements. 'Save Fixed Version & Re-review' persists changes and triggers fresh AI review. Copy button for fixed text."),
    ("Content Approval Workflow", "Approve, Reject, Request Revision buttons with loading states. Toast notifications on status change. Buttons disable when content already has that status. Re-run Review for fresh AI analysis."),
    ("Governance Dashboard", "Stat cards (Total Content, Approved, Compliance Rate, Active Rules) with clickable navigation. Findings by Category bar chart. Findings by Severity breakdown. Recent Content list with status badges and color-coded scores."),
    ("Content Queue", "Table view with title, type, status badge, color-coded score, date. Status filter tabs with counts (All, Pending, Under Review, etc.). Submit New button."),
    ("Mobile Responsive Layout", "Hamburger menu with sidebar overlay on mobile. Branded avatar with user initial. Desktop sidebar with navigation, user info, and sign-out."),
    ("Rich Demo Dataset", "5 pre-seeded content items: approved blog post (95/100), rejected ad (8/100), tweet under review (62/100), email needing revision (18/100), pending onboarding email. 15 findings across all severity levels and categories. 'Load Sample' button on submit page."),
]

for fname, fdesc in features:
    story.append(Paragraph(fname, heading3_style))
    story.append(Paragraph(fdesc, body_style))

story.append(PageBreak())

# ── SECTION 03: Technology & Architecture ──
story.extend(section(3, "Technology & Architecture"))

tech_data = [
    ["Layer", "Technology", "Purpose"],
    ["Frontend", "Next.js 14 (App Router), TypeScript, Tailwind CSS", "Server-side rendering, type safety, utility-first styling"],
    ["Backend", "Next.js API Routes", "Monolithic architecture — no separate backend server needed"],
    ["Database", "PostgreSQL (Neon serverless), Prisma ORM", "6 models, type-safe queries, connection pooling"],
    ["AI / LLM", "Groq SDK, Qwen 3.8 27B model", "Fast inference (seconds), JSON structured output"],
    ["Auth", "NextAuth.js, bcrypt, JWT sessions", "Credentials provider, role-based access (Admin/Creator)"],
    ["Icons", "Lucide React", "Consistent, tree-shakeable icon library"],
]
tech_table = Table(tech_data, colWidths=[1.1*inch, 2.5*inch, 2.5*inch])
tech_table.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), SLATE_700),
    ("TEXTCOLOR", (0,0), (-1,0), WHITE),
    ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE", (0,0), (-1,-1), 9),
    ("TEXTCOLOR", (0,1), (-1,-1), SLATE_200),
    ("ALIGN", (0,0), (-1,-1), "LEFT"),
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("TOPPADDING", (0,0), (-1,-1), 6),
    ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ("LEFTPADDING", (0,0), (-1,-1), 8),
    ("LINEBELOW", (0,0), (-1,-1), 0.5, SLATE_700),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [HexColor("#1e293b"), HexColor("#0f172a")]),
]))
story.append(tech_table)
story.append(Spacer(1, 16))

story.append(Paragraph("Database Schema", heading2_style))
story.append(Paragraph("6 models: <b>User</b> (email, password, role), <b>BrandGuideline</b> (name, description, rawContent), <b>Rule</b> (ruleCode, category, title, description, severity, isActive), <b>Content</b> (title, body, contentType, status), <b>Review</b> (overallScore, summary, status), <b>Finding</b> (issueText, explanation, suggestion, severity, category). Enums: Role, RuleCategory, Severity, ContentType, ContentStatus, ReviewStatus.", body_style))

story.append(Paragraph("AI Pipeline", heading2_style))
story.append(Paragraph("Two core AI functions:", body_bold))
story.append(bullet("<b>reviewContent()</b> — Takes content body + all active rules. Prompts the LLM to check content against every rule. Returns JSON with overallScore (0-100), summary, and findings array (each with issueText, explanation, suggestion, severity, category, matchedRuleCode). Uses response_format: json_object for reliable structured output."))
story.append(bullet("<b>parseGuidelines()</b> — Takes raw guideline text. Prompts the LLM to extract structured rules with code, category, title, description, severity. Returns JSON array of parsed rules."))
story.append(PageBreak())

# ── SECTION 04: Auto-Fix Engine ──
story.extend(section(4, "Auto-Fix Engine (Key Innovation)"))
story.append(Paragraph("The Auto-Fix engine is the standout feature that goes beyond what was planned in Round 1. It transforms BrandShield from a 'find problems' tool into a 'find and fix problems' tool.", body_style))

story.append(Paragraph("How It Works", heading2_style))
story.append(bullet("User clicks <b>'Auto-Fix All'</b> button (gradient purple, wand icon) on the content detail page."))
story.append(bullet("API endpoint <b>/api/content/[id]/fix</b> fetches the content body and latest review findings."))
story.append(bullet("For each finding, the engine attempts to replace the <b>issueText</b> with the <b>suggestion</b> in the content body. Exact match first, case-insensitive fallback."))
story.append(bullet("Returns: originalBody, fixedBody, appliedFixes count, totalFindings count, and a fixLog (each fix marked as applied or skipped)."))
story.append(bullet("Frontend shows a <b>side-by-side Original vs Fixed</b> diff panel with red (original) and green (fixed) highlighting."))
story.append(bullet("A <b>Changes Made</b> log lists every fix with strikethrough original text, arrow, and green replacement. Skipped fixes are shown greyed out with '(not found in text)'."))
story.append(bullet("<b>'Save Fixed Version & Re-review'</b> button persists the fixed body to the database and triggers a fresh AI review. The user sees the score jump (e.g., from 18/100 to 85+/100)."))
story.append(bullet("<b>Copy</b> button copies the fixed text to clipboard."))

story.append(Spacer(1, 12))
story.append(Paragraph("This is the demo's most impressive moment: a piece of content with 8 violations and a score of 18/100 gets auto-fixed in one click, and after re-review scores 85+.", ParagraphStyle("Highlight", fontName="Helvetica-Bold", fontSize=10, textColor=GREEN, leading=15, spaceAfter=12)))
story.append(PageBreak())

# ── SECTION 05: Changes from Round 1 ──
story.extend(section(5, "Changes from Round 1 Plan"))

changes = [
    ("Simplified to Next.js monolith", "Dropped the separate FastAPI Python backend. Next.js API routes handle everything. Reason: For a hackathon MVP, a single deployment is simpler and faster to iterate on."),
    ("Groq SDK instead of OpenAI GPT-4o", "Using Qwen 3.8 27B via Groq for fast inference (seconds). The originally planned llama-3.1-70b was decommissioned during development. Groq's JSON mode ensures reliable structured output."),
    ("Dropped visual content review", "Image/logo/colour checking with CLIP model deferred to Round 3. Focused on making text review + auto-fix bulletproof for the MVP."),
    ("Dropped Celery + Redis async processing", "Next.js handles synchronous AI review. A loading animation keeps users informed during the 15-30 second review. Simpler architecture."),
    ("Added Auto-Fix All (not in original plan)", "The biggest addition. During testing, having findings without the ability to apply them felt incomplete. The auto-fix with before/after diff is the demo's highlight."),
    ("Prisma ORM instead of raw SQL + pgvector", "Type-safe queries and easy schema management. Dropped vector embeddings — structured rule matching works well without semantic search for the MVP."),
]

for title_text, desc in changes:
    story.append(Paragraph(title_text, heading3_style))
    story.append(Paragraph(desc, body_style))

story.append(PageBreak())

# ── SECTION 06: Known Limitations ──
story.extend(section(6, "Known Limitations"))
limitations = [
    "Visual content review (images, logos, colours) is not implemented — text-only for now.",
    "Auto-fix uses simple string replacement. If the AI's flagged text doesn't exactly match the content, that fix is skipped (shown in the change log).",
    "No real-time collaboration — single-user approval workflow (no threaded comments or multi-reviewer).",
    "No governance trend analytics over time — dashboard shows aggregates but not historical patterns.",
    "Guidelines are paste-only — no PDF/DOCX file upload parsing yet.",
    "AI review takes 15-30 seconds on the free Groq tier. Loading animation shown during wait.",
    "No browser extension or external API integrations.",
]
for lim in limitations:
    story.append(bullet(lim))
story.append(Spacer(1, 20))

# ── SECTION 07: Three Improvements for Round 3 ──
story.extend(section(7, "Three Improvements for Round 3"))

story.append(Paragraph("Improvement 1: Visual Content Review", heading2_style))
story.append(Paragraph("Add image upload support with AI-powered visual analysis. The system will check uploaded images against brand visual standards: colour palette compliance (extract dominant colours, compare to approved hex codes), logo detection and usage verification (correct variant, minimum clear space), and image style consistency. Creators can submit images alongside text, and the review flags visual violations with the same explainable findings format.", body_style))
story.append(Paragraph("<b>Impact:</b> Transforms BrandShield from text-only to multi-modal, covering the full range of marketing materials.", ParagraphStyle("Impact", fontName="Helvetica", fontSize=10, textColor=GREEN, leading=15, spaceAfter=12)))

story.append(Paragraph("Improvement 2: Governance Analytics Dashboard", heading2_style))
story.append(Paragraph("Add time-series analytics: compliance score trends over weeks/months (line chart), most-violated rules ranked by frequency, team/user compliance comparison, rule dispute rates (which rules get overridden most), and expiring fact claims needing re-verification.", body_style))
story.append(Paragraph("<b>Impact:</b> Transforms BrandShield from a point-in-time checker into a continuous improvement system. Brand managers get data-driven insights to improve guidelines and prove ROI.", ParagraphStyle("Impact", fontName="Helvetica", fontSize=10, textColor=GREEN, leading=15, spaceAfter=12)))

story.append(Paragraph("Improvement 3: Real-Time Collaboration & Revision Workflow", heading2_style))
story.append(Paragraph("Add threaded comments on findings, multi-reviewer assignment, inline annotations (like Google Docs suggestions), full revision versioning with diffable history (original → AI review → human feedback → revision → re-review → approval), and email/in-app notifications.", body_style))
story.append(Paragraph("<b>Impact:</b> Teams collaborate on content review without switching tools. The audit trail shows who reviewed what, when, and what changed — critical for compliance.", ParagraphStyle("Impact", fontName="Helvetica", fontSize=10, textColor=GREEN, leading=15, spaceAfter=12)))
story.append(PageBreak())

# ── SECTION 08: Demo Walkthrough ──
story.extend(section(8, "Demo Walkthrough"))
story.append(Paragraph("Step-by-step guide for judges evaluating the live product:", body_bold))
story.append(Spacer(1, 8))

demo_steps = [
    ("Open the app", "Landing page shows hero section, feature grid, and 'How it works' 3-step section."),
    ("Click 'Get Started'", "On the login page, click the 'Admin' quick-login button (one click, no typing needed)."),
    ("Dashboard", "See 5 content items, 1 approved, 20% compliance rate, 6 active rules. Findings breakdown by category and severity. Recent content with color-coded scores."),
    ("Brand Rules", "View 6 pre-loaded rules with search bar, category filter, and active/inactive toggles."),
    ("Submit Content", "Click 'Load Sample' (top right) to fill a deliberately bad email. Click 'Submit for Review'. Watch the AI loading animation (15-30 seconds)."),
    ("Content Detail", "Score of ~18/100 in red. 8 findings with severity badges, flagged text, explanations, and suggested fixes."),
    ("Auto-Fix All", "Click the purple 'Auto-Fix All' button. See side-by-side before/after diff. Review the change log. Click 'Save Fixed Version & Re-review'."),
    ("Verify Fix", "Score jumps to 85+/100. Findings drop to 0-1. The content is now brand-compliant."),
    ("Approve", "Click 'Approve' to complete the workflow. Toast notification confirms the status change."),
]

for i, (step_title, step_desc) in enumerate(demo_steps, 1):
    story.append(Paragraph(f"<b>Step {i}: {step_title}</b>", ParagraphStyle("StepTitle", fontName="Helvetica-Bold", fontSize=10, textColor=ROSE_LIGHT, spaceAfter=2)))
    story.append(Paragraph(step_desc, body_style))

story.append(Spacer(1, 24))
story.append(hr())
story.append(Paragraph("BrandShield transforms brand governance from a manual, reactive process into an intelligent, proactive system. Upload guidelines, submit content, see violations, fix them in one click, and approve — all in one platform.", ParagraphStyle("Closing", fontName="Helvetica-Bold", fontSize=11, textColor=WHITE, alignment=TA_CENTER, leading=17, spaceAfter=8)))
story.append(Paragraph("Built by Utkarsh for the Inkloom AI Hackathon 2024", ParagraphStyle("ClosingSub", fontName="Helvetica", fontSize=10, textColor=SLATE_400, alignment=TA_CENTER)))

# Build
doc.build(story)
print(f"PDF generated: {output_path}")
