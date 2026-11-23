from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from pathlib import Path

OUT = Path(__file__).parent.parent / "output" / "pdf" / "BrandShield_Round3_Final.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

rose, dark, slate, light, green = map(HexColor, ["#F43F5E", "#0F172A", "#334155", "#E2E8F0", "#22C55E"])
styles = getSampleStyleSheet()
title = ParagraphStyle("title", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=30, leading=36, alignment=TA_CENTER, textColor=rose, spaceAfter=8)
subtitle = ParagraphStyle("subtitle", parent=styles["BodyText"], fontSize=12, leading=18, alignment=TA_CENTER, textColor=slate, spaceAfter=20)
h1 = ParagraphStyle("h1", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=20, textColor=rose, spaceBefore=16, spaceAfter=8)
h2 = ParagraphStyle("h2", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=13, textColor=dark, spaceBefore=12, spaceAfter=6)
body = ParagraphStyle("body", parent=styles["BodyText"], fontSize=10, leading=15, textColor=dark, spaceAfter=8)
small = ParagraphStyle("small", parent=body, fontSize=9, leading=13, textColor=slate)

def footer(canvas, doc):
    canvas.saveState(); canvas.setStrokeColor(rose); canvas.line(0.75*inch, 0.55*inch, 7.75*inch, 0.55*inch)
    canvas.setFont("Helvetica", 8); canvas.setFillColor(slate); canvas.drawString(0.75*inch, 0.35*inch, "BrandShield - Round 3 Final Submission")
    canvas.drawRightString(7.75*inch, 0.35*inch, f"Page {doc.page}"); canvas.restoreState()

story = [Spacer(1, 1.4*inch), Paragraph("BrandShield", title), Paragraph("Intelligent Brand Governance Platform", subtitle), Paragraph("Round 3 - Final Submission", ParagraphStyle("round", parent=subtitle, fontName="Helvetica-Bold", textColor=dark)), Spacer(1, .4*inch), Paragraph("BrandShield helps teams review text and visual content against active brand rules, collaborate on revisions, and confidently decide what is ready to publish.", ParagraphStyle("hero", parent=body, alignment=TA_CENTER, fontSize=12, leading=18)), PageBreak()]

story += [Paragraph("Executive Summary", h1), Paragraph("BrandShield is a production-ready hackathon MVP for brand governance. It combines AI content review, explainable findings, one-click text fixes, visual palette analysis, team collaboration, and audit-friendly revision history in one focused workflow.", body), Paragraph("What changed for Round 3", h1)]
features = [
    ("Visual content review", "Creators can attach PNG, JPEG, or WebP artwork. BrandShield extracts dominant decoded-pixel colours with Sharp, flags off-palette colours, creates a valid recoloured PNG, and provides a download."),
    ("Analytics", "A dedicated analytics workspace shows compliance score trends, weekly finding severity, most-violated rules, category and status distributions, and rule-level detail using interactive charts."),
    ("Guided onboarding", "A five-step first-visit tour introduces the workflow, remembers completion locally, and can be replayed from the sidebar."),
    ("Collaboration and audit trail", "Reviewers add threaded comments. Every submitted or saved body revision is recorded as a numbered version with a change note, snapshot, and concise difference view."),
    ("Decision and reporting", "Let BrandShield Decide turns the latest score and severity mix into an explainable recommendation. A branded PDF report can be downloaded directly from a review."),
    ("Team workflow", "The product includes in-app notifications, status-change notices, a demo entry point, and a Cmd/Ctrl+K navigation palette."),
]
for name, description in features: story += [Paragraph(name, h2), Paragraph(description, body)]
story += [PageBreak(), Paragraph("Product Workflow", h1)]
workflow = [["Step", "Experience"], ["1. Define", "Paste brand guidelines and let AI turn them into active, structured rules."], ["2. Review", "Submit text and optional artwork; receive a score, findings, and visual palette checks."], ["3. Fix", "Preview text changes or download a recoloured visual asset."], ["4. Collaborate", "Discuss findings in threaded comments and inspect every revision."], ["5. Decide", "Use the recommendation card, approve or request revision, then export a PDF report."]]
t = Table(workflow, colWidths=[1.15*inch, 5.7*inch]); t.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), dark), ("TEXTCOLOR", (0,0), (-1,0), light), ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"), ("FONTNAME", (0,1), (0,-1), "Helvetica-Bold"), ("TEXTCOLOR", (0,1), (-1,-1), dark), ("GRID", (0,0), (-1,-1), .25, HexColor("#CBD5E1")), ("ROWBACKGROUNDS", (0,1), (-1,-1), [HexColor("#F8FAFC"), HexColor("#FFF1F2")]), ("VALIGN", (0,0), (-1,-1), "TOP"), ("TOPPADDING", (0,0), (-1,-1), 8), ("BOTTOMPADDING", (0,0), (-1,-1), 8), ("LEFTPADDING", (0,0), (-1,-1), 8), ("RIGHTPADDING", (0,0), (-1,-1), 8)])); story.append(t)
story += [Paragraph("Reliability and Demo Readiness", h1), Paragraph("The final build adds client and server-side length validation, button loading states, error boundaries, empty states, database connection resilience, and clear failure states. It seeds 20 content items, 8 rules, backdated findings, comments, versions, and notifications for a coherent end-to-end demo.", body), Paragraph("Judge Demo", h1), Paragraph("Log in as Admin, open the Dashboard, and launch Demo mode. Open a low-score content item to show explainable findings, click Auto-Fix Text, save the revised version, inspect revision history, add a comment, request a recommendation, and download the report. Then submit a sample with an image to demonstrate visual review and the fixed-image download.", body), Paragraph("Technology", h1), Paragraph("Next.js 14, TypeScript, Tailwind CSS, Prisma, PostgreSQL/Neon, NextAuth, Groq, Recharts, Sharp, jsPDF, and Lucide.", body), Spacer(1, 12), Paragraph("Built for the Inkloom AI Hackathon", ParagraphStyle("end", parent=body, alignment=TA_CENTER, textColor=green, fontName="Helvetica-Bold"))]

SimpleDocTemplate(str(OUT), pagesize=letter, title="BrandShield - Round 3 Final", author="Utkarsh", leftMargin=.75*inch, rightMargin=.75*inch, topMargin=.7*inch, bottomMargin=.8*inch).build(story, onFirstPage=footer, onLaterPages=footer)
print(OUT)
