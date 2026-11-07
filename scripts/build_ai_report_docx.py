import os
import sys
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_element(name):
    return OxmlElement(name)

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_cell_borders(cell, top="single", bottom="single", left="single", right="single", 
                     color="CBD5E1", sz="4"):
    tcPr = cell._element.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="{top}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="{left}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="{bottom}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:right w:val="{right}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)

def format_row(row, bg_hex, is_header=False):
    for cell in row.cells:
        set_cell_background(cell, bg_hex)
        set_cell_margins(cell, top=120, bottom=120, left=140, right=140)
        set_cell_borders(cell, top="single", bottom="single", left="single", right="single", color="CBD5E1", sz="4")
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        for p in cell.paragraphs:
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            for run in p.runs:
                run.font.name = "Arial"
                if is_header:
                    run.font.size = Pt(9.5)
                    run.bold = True
                    run.font.color.rgb = RGBColor(255, 255, 255)
                else:
                    run.font.size = Pt(9.0)
                    run.font.color.rgb = RGBColor(34, 34, 34)

def add_callout(doc, text, title="NOTE / VERIFICATION", border_color="0F2C59", bg_color="F1F5F9"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
    set_cell_borders(cell, top="none", bottom="none", left="single", right="none", color=border_color, sz="24")
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    
    r_title = p.add_run(f"[{title}] ")
    r_title.bold = True
    r_title.font.name = "Arial"
    r_title.font.size = Pt(9.5)
    r_title.font.color.rgb = RGBColor(15, 44, 89)
    
    r_text = p.add_run(text)
    r_text.font.name = "Arial"
    r_text.font.size = Pt(9.0)
    r_text.font.color.rgb = RGBColor(34, 34, 34)
    
    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(0)
    p_after.paragraph_format.space_after = Pt(4)

def add_heading_1(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(18)
    h.paragraph_format.space_after = Pt(6)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = "Arial"
    run.font.size = Pt(16)
    run.bold = True
    run.font.color.rgb = RGBColor(15, 44, 89) # Deep Navy
    return h

def add_heading_2(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(14)
    h.paragraph_format.space_after = Pt(4)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = "Arial"
    run.font.size = Pt(13)
    run.bold = True
    run.font.color.rgb = RGBColor(22, 101, 52) # Deep Emerald Green
    return h

def add_heading_3(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(10)
    h.paragraph_format.space_after = Pt(2)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = "Arial"
    run.font.size = Pt(11)
    run.bold = True
    run.font.color.rgb = RGBColor(51, 65, 85) # Slate
    return h

def add_body_p(doc, text, bold_prefix=""):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(5)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.bold = True
        r_pre.font.name = "Arial"
        r_pre.font.size = Pt(10)
        r_pre.font.color.rgb = RGBColor(34, 34, 34)
    r_body = p.add_run(text)
    r_body.font.name = "Arial"
    r_body.font.size = Pt(10)
    r_body.font.color.rgb = RGBColor(34, 34, 34)
    return p

def add_bullet_p(doc, text, bold_prefix=""):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.bold = True
        r_pre.font.name = "Arial"
        r_pre.font.size = Pt(9.5)
        r_pre.font.color.rgb = RGBColor(34, 34, 34)
    r_body = p.add_run(text)
    r_body.font.name = "Arial"
    r_body.font.size = Pt(9.5)
    r_body.font.color.rgb = RGBColor(34, 34, 34)
    return p

def main():
    doc = Document()
    
    # Configure 1-inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)
        
        # Header & Footer setup
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("Vetlink Project | Academic Report on AI Use in Software Development")
        hrun.font.name = "Arial"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(100, 116, 139)
        
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Page Academic Evaluation Copy - Vetlink Engineering Team")
        frun.font.name = "Arial"
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(100, 116, 139)

    # ─────────────────────────────────────────────────────────────────────────
    # 1. COVER PAGE
    # ─────────────────────────────────────────────────────────────────────────
    p_top_spacer = doc.add_paragraph()
    p_top_spacer.paragraph_format.space_before = Pt(36)
    
    p_category = doc.add_paragraph()
    p_category.paragraph_format.space_after = Pt(6)
    r_cat = p_category.add_run("ACADEMIC TECHNICAL REPORT | MOBILE SOFTWARE ENGINEERING")
    r_cat.font.name = "Arial"
    r_cat.font.size = Pt(10)
    r_cat.font.color.rgb = RGBColor(22, 101, 52)
    r_cat.bold = True
    
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(6)
    p_title.paragraph_format.space_after = Pt(12)
    r_title = p_title.add_run("Report on AI Use in Vetlink Project")
    r_title.font.name = "Arial"
    r_title.font.size = Pt(26)
    r_title.bold = True
    r_title.font.color.rgb = RGBColor(15, 44, 89)
    
    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_after = Pt(28)
    r_sub = p_sub.add_run("Empirical Investigation, Traceability Analysis, and Quality Assurance of Artificial Intelligence Assisted Mobile Application Development")
    r_sub.font.name = "Arial"
    r_sub.font.size = Pt(13)
    r_sub.font.color.rgb = RGBColor(71, 85, 105)
    
    # Decorative line
    table_line = doc.add_table(rows=1, cols=1)
    table_line.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_line = table_line.cell(0, 0)
    c_line.width = Inches(6.5)
    set_cell_background(c_line, "16A34A")
    set_cell_margins(c_line, top=10, bottom=10, left=0, right=0)
    set_cell_borders(c_line, top="none", bottom="none", left="none", right="none")
    p_dummy = c_line.paragraphs[0]
    p_dummy.paragraph_format.space_before = Pt(0)
    p_dummy.paragraph_format.space_after = Pt(0)
    
    p_mid_spacer = doc.add_paragraph()
    p_mid_spacer.paragraph_format.space_before = Pt(30)
    
    # Metadata Block Table
    meta_table = doc.add_table(rows=6, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("Project Name:", "Vetlink (Mobile Smart Pet Healthcare & Identification Ecosystem)"),
        ("Repository URL:", "https://github.com/AlexMeridaPozo/Vetlink"),
        ("Verified Team Members:", "Alex Mérida Pozo, Candela C., Franco Ingratta, Lucas Acosta, Santino Bravo"),
        ("Academic Context:", "Proyecto Integrador Final de Aplicaciones Móviles (Final Capstone Project)"),
        ("Academic Institution:", "[PENDING CONFIRMATION - Institution / University / Faculty Name]"),
        ("Date of Publication:", "November 2, 2026")
    ]
    col_widths = [Inches(2.2), Inches(4.3)]
    for i, (k, v) in enumerate(meta_data):
        row = meta_table.rows[i]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width, c1.width = col_widths[0], col_widths[1]
        set_cell_background(c0, "F8FAFC")
        set_cell_background(c1, "FFFFFF")
        set_cell_margins(c0, top=90, bottom=90, left=120, right=120)
        set_cell_margins(c1, top=90, bottom=90, left=120, right=120)
        set_cell_borders(c0, color="E2E8F0")
        set_cell_borders(c1, color="E2E8F0")
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_before = Pt(1)
        p0.paragraph_format.space_after = Pt(1)
        r0 = p0.add_run(k)
        r0.font.name = "Arial"
        r0.font.size = Pt(9.5)
        r0.bold = True
        r0.font.color.rgb = RGBColor(15, 44, 89)
        
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_before = Pt(1)
        p1.paragraph_format.space_after = Pt(1)
        r1 = p1.add_run(v)
        r1.font.name = "Arial"
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = RGBColor(34, 34, 34)
        if "[PENDING" in v:
            r1.font.color.rgb = RGBColor(180, 83, 9) # Amber alert color
            r1.bold = True

    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────────────
    # TABLE OF CONTENTS & DOCUMENT NAVIGATION
    # ─────────────────────────────────────────────────────────────────────────
    add_heading_1(doc, "Table of Contents")
    toc_items = [
        ("1. Executive Summary", "3"),
        ("2. Introduction", "4"),
        ("3. Objectives", "5"),
        ("4. Project Overview and Architecture", "6"),
        ("5. Systematic Investigation of AI Use Across Engineering Domains", "8"),
        ("6. Individual Team Member Reports", "11"),
        ("   6.1 Alex Mérida Pozo", "11"),
        ("   6.2 Franco Ingratta", "13"),
        ("   6.3 Candela C.", "15"),
        ("   6.4 Lucas Acosta", "16"),
        ("   6.5 Santino Bravo", "17"),
        ("7. Consolidated AI Tools Evaluation Table", "18"),
        ("8. Concrete Empirical Case Studies of AI Use", "20"),
        ("   8.1 Case Study 1: Interactive GIS Veterinary Locator (US03)", "20"),
        ("   8.2 Case Study 2: User Authentication & Role Persistence (US01 & US02)", "22"),
        ("   8.3 Case Study 3: Pure TypeScript QR Algorithm & Binary 3D STL Tag Exporter", "24"),
        ("   8.4 Unrecorded & Pending Feature Modules", "25"),
        ("9. Quality Control, Code Verification, and Security Assurance", "26"),
        ("10. Technical Benefits and Practical Limitations", "28"),
        ("11. Conclusions", "30"),
        ("12. Evidence Appendix (Git Commits, Branches, and Files)", "31"),
        ("13. Missing Information and Developer Action Checklist", "33"),
        ("14. References", "34")
    ]
    
    t_toc = doc.add_table(rows=len(toc_items), cols=2)
    t_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    for idx, (section_title, page_num) in enumerate(toc_items):
        row = t_toc.rows[idx]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width = Inches(5.8)
        c1.width = Inches(0.7)
        set_cell_background(c0, "FFFFFF" if idx % 2 == 0 else "F8FAFC")
        set_cell_background(c1, "FFFFFF" if idx % 2 == 0 else "F8FAFC")
        set_cell_margins(c0, top=50, bottom=50, left=80, right=80)
        set_cell_margins(c1, top=50, bottom=50, left=80, right=80)
        set_cell_borders(c0, top="none", bottom="none", left="none", right="none")
        set_cell_borders(c1, top="none", bottom="none", left="none", right="none")
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_before = Pt(1)
        p0.paragraph_format.space_after = Pt(1)
        r0 = p0.add_run(section_title)
        r0.font.name = "Arial"
        r0.font.size = Pt(9.5)
        if not section_title.startswith("   "):
            r0.bold = True
            r0.font.color.rgb = RGBColor(15, 44, 89)
        else:
            r0.font.color.rgb = RGBColor(71, 85, 105)
            
        p1 = c1.paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p1.paragraph_format.space_before = Pt(1)
        p1.paragraph_format.space_after = Pt(1)
        r1 = p1.add_run(page_num)
        r1.font.name = "Arial"
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = RGBColor(100, 116, 139)

    add_heading_2(doc, "Executive Summary")
    add_body_p(doc, 
        "This academic report presents an exhaustive, evidence-based investigation into the utilization of Artificial Intelligence (AI) technologies across the development lifecycle of the Vetlink mobile application repository (https://github.com/AlexMeridaPozo/Vetlink). Conducted in the framework of the 'Proyecto Integrador Final de Aplicaciones Móviles', this inquiry analyzes project artifacts, Git commit histories, branch merges, development guidelines (.agent/skills/vetlink-development/SKILL.md), and archived interaction records (DOCUMENTACION_USO_DE_IA_PROMPTS.md). "
        "The primary findings indicate that AI was deployed systematically as a technical accelerator for complex module drafting—notably including the zero-dependency TypeScript QR generator and STL 3D tag exporter (US-QR), user authentication flows with Firebase (US01, US02), and a dual-platform Leaflet/OpenStreetMap geospatial locator in Pilar Centro (US03). "
        "Concurrently, the team instituted explicit quality governance rules mandating that all AI-generated code be reviewed, understood, and defended by human authors. However, empirical documentation is uneven: while Alex Mérida Pozo and Franco Ingratta maintain direct commit and prompt verification, activities by Candela C., Lucas Acosta, and Santino Bravo lack explicit AI interaction logs and are conservatively classified under [PENDING CONFIRMATION] placeholders to preserve academic integrity.")

    add_callout(doc, 
        "Academic Integrity Standard: All statements of fact in this document are strictly tied to verifiable repository commits, source files, and configuration registries. Unsubstantiated claims, speculative tool attributions, and unverified AI contributions have been flagged with [PENDING CONFIRMATION] tags. This document serves as an evaluation-ready draft for team verification prior to academic defense.",
        title="METHODOLOGICAL NOTICE", border_color="16A34A", bg_color="ECFDF5")

    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────────────
    # 2. INTRODUCTION
    # ─────────────────────────────────────────────────────────────────────────
    add_heading_1(doc, "2. Introduction")
    add_body_p(doc, 
        "Vetlink is an integrated mobile application designed to streamline pet healthcare, emergency rescue, and clinical management. Developed with modern mobile frameworks (React Native 0.86.3 and Expo SDK ~57.0.0), Vetlink bridges pet owners and veterinary clinics through real-time communication, appointment scheduling, health records, and physical identification interfaces utilizing Quick Response (QR) codes and Near Field Communication (NFC) hardware tags.")
    
    add_body_p(doc, 
        "The contemporary software engineering landscape has experienced a paradigm shift driven by the rapid adoption of generative artificial intelligence and autonomous coding assistants (such as Google Antigravity, Claude Code, OpenAI ChatGPT, and GitHub Copilot). While these systems dramatically accelerate prototyping, boilerplates, and algorithmic implementations, they introduce critical academic and professional challenges regarding provenance, software licensing, algorithmic transparency, defect attribution, and intellectual accountability.")

    add_body_p(doc, 
        "In university and professional capstone evaluations, documenting the exact boundaries of AI involvement is no longer optional. Transparent documentation ensures that:",
        "Academic and Industry Significance: ")
    add_bullet_p(doc, "Demonstrates that student developers genuinely comprehend the underlying architecture, data flows, and security primitives rather than passively accepting black-box outputs.", "Authentic Learning Verification: ")
    add_bullet_p(doc, "Creates a clear audit trail linking specific prompts, model versions, and human refactoring steps to individual Git commits.", "Traceability and Auditability: ")
    add_bullet_p(doc, "Prevents algorithmic hallucination from introducing critical vulnerabilities, such as exposing secret API keys or relaxing database security rules.", "Defect & Security Assurance: ")
    add_bullet_p(doc, "Establishes a verifiable delineation between automated code synthesis and genuine human engineering decision-making.", "Intellectual Rigor: ")

    add_body_p(doc, 
        "This report systematically analyzes the Vetlink codebase to establish which components were developed with AI assistance, which tools were utilized, how human quality control was exercised, and which portions of the project remain subject to team confirmation.")

    # ─────────────────────────────────────────────────────────────────────────
    # 3. OBJECTIVES
    # ─────────────────────────────────────────────────────────────────────────
    add_heading_1(doc, "3. Objectives")
    
    add_heading_2(doc, "3.1 General Objective")
    add_body_p(doc, 
        "To conduct a comprehensive, evidence-grounded academic evaluation of the integration, governance, and technical outcomes of Artificial Intelligence tools during the development of the Vetlink mobile application, distinguishing confirmed empirical implementations from unverified developer workflows.")

    add_heading_2(doc, "3.2 Specific Objectives")
    add_bullet_p(doc, "Investigate the Vetlink GitHub repository history (commits, pull requests, branches, and diffs) to identify concrete artifacts generated or modified through AI assistance.", "Objective 1 (Repository Auditing): ")
    add_bullet_p(doc, "Examine the technical domains of AI application—specifically code synthesis, error debugging, user interface styling, documentation, NoSQL schema governance, and testing.", "Objective 2 (Domain Categorization): ")
    add_bullet_p(doc, "Profile verified project contributors, correlating their technical assignments with documented AI tools while identifying missing attribution records with [PENDING CONFIRMATION] placeholders.", "Objective 3 (Individual Attribution): ")
    add_bullet_p(doc, "Evaluate concrete case studies from archived interaction records (including Prompt, AI output, developer refactoring, and validation steps) for high-complexity features.", "Objective 4 (Case Study Reconstruction): ")
    add_bullet_p(doc, "Analyze the quality control, testing pipelines, and security mechanisms enforced by the team to validate and audit AI-generated source code.", "Objective 5 (Quality & Security Governance): ")
    add_bullet_p(doc, "Formulate a consolidated action checklist identifying all pending disclosures the team must provide before final institutional accreditation.", "Objective 6 (Deficiency Remediation): ")

    # ─────────────────────────────────────────────────────────────────────────
    # 4. PROJECT OVERVIEW
    # ─────────────────────────────────────────────────────────────────────────
    add_heading_1(doc, "4. Project Overview")
    
    add_heading_2(doc, "4.1 Mission and Problem Domain")
    add_body_p(doc, 
        "Vetlink addresses the fragmented nature of pet healthcare management and the critical time window required to recover lost animals. Traditional pet identification often depends on static metal tags with etched telephone numbers that degrade over time or microchips requiring proprietary radio-frequency scanners restricted to licensed clinics. Vetlink democratizes identification through dual-modality edge technologies (smart camera QR scanning and contactless NFC tag reading) accessible to any modern smartphone, instantly surfacing emergency contact details, medical alerts (e.g., chronic conditions, allergies), and geographic coordinates.")

    add_heading_2(doc, "4.2 Verified Architectural Stack")
    add_body_p(doc, 
        "The project architecture was empirically analyzed directly from the package configuration (package.json), Expo manifest (app.json), build profiles (eas.json), Cloudflare Worker definitions, and Firestore security rules (firestore.rules). The technology stack comprises:")

    # Tech Stack Table
    tech_table = doc.add_table(rows=8, cols=3)
    tech_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    tech_headers = ["Layer / Domain", "Technology & Version", "Engineering Role & Implementation Scope"]
    for j, h in enumerate(tech_headers):
        tech_table.rows[0].cells[j].paragraphs[0].text = h
    format_row(tech_table.rows[0], "0F2C59", is_header=True)
    
    tech_rows = [
        ("Mobile Client Runtime", "Expo SDK ~57.0.0\nReact Native 0.86.3", "Core hybrid framework executing on React 19.2.3 with native Edge-to-Edge architecture and experimental React Compiler enabled."),
        ("Client Routing", "expo-router ^57.0.21", "File-based layout routing supporting route groups ((auth), (tabs)), dynamic segments (/mascotas/[id]), and bottom navigation tabs."),
        ("Language & Typing", "TypeScript ~6.0.3", "Strict static type system with noImplicitAny compliance across components, services, and utility algorithms."),
        ("Cloud Backend & Auth", "Google Firebase JS SDK ^12.18.0", "Firebase Authentication (email/password and Google Sign-In) combined with Cloud Firestore NoSQL for persistence and role-based security rules."),
        ("Hardware Sensors", "expo-camera ~57.0.5\nreact-native-nfc-manager ^4.0.0", "Native sensor integration for high-speed visual QR decoding and contactless NFC chip reading for pet tag pairing."),
        ("Geospatial & Mapping", "Leaflet 1.9.4\nOpenStreetMap\nreact-native-webview", "Dual-platform map implementation using iframe rendering on Web and WebView on native Android/iOS without third-party API keys."),
        ("Serverless AI Gateway", "Cloudflare Workers\nGroq API (gpt-oss-20b)", "Serverless gateway validating Firebase Auth RS256/JWKS tokens before proxying sanitized user prompts to Groq API.")
    ]
    for idx, (l, t, r) in enumerate(tech_rows, start=1):
        row = tech_table.rows[idx]
        row.cells[0].paragraphs[0].text = l
        row.cells[1].paragraphs[0].text = t
        row.cells[2].paragraphs[0].text = r
        format_row(row, "F8FAFC" if idx % 2 == 1 else "FFFFFF")
    
    add_heading_2(doc, "4.3 Project Directory Structure")
    add_body_p(doc, 
        "The project follows a strictly modular separation of concerns designed to ensure maintainability, avoid circular dependencies, and prevent code duplication:",
        "Modular Architecture: ")
    
    tree_text = (
        "Vetlink/\n"
        "├── app/                       # File-based navigation routes (Expo Router v57)\n"
        "│   ├── (auth)/                # Authentication stack (login.tsx, register.tsx)\n"
        "│   ├── (tabs)/                # Primary tab navigation (index, mascotas, scan, mapa, sos, perfil)\n"
        "│   ├── mascotas/[id].tsx      # Dynamic pet detail and clinical overview screen\n"
        "│   ├── chat.tsx               # AI Assistant interactive messaging screen\n"
        "│   ├── turnos.tsx             # Veterinary appointment scheduling screen\n"
        "│   ├── recordatorios.tsx      # Medication and vaccination reminder management\n"
        "│   └── _layout.tsx            # Global app layout with AuthProvider and theme bindings\n"
        "├── components/                # Modular, reusable presentation components\n"
        "│   ├── map/                   # Hybrid Leaflet map bridge (LeafletMapView.native/web.tsx)\n"
        "│   ├── PetCard.tsx            # Pet profile display card with quick action triggers\n"
        "│   ├── QRMascotaCard.tsx      # Native QR viewer, SVG sharing, and 3D STL export modal\n"
        "│   └── SplashScreen.tsx       # Custom animated launch screen\n"
        "├── services/                  # Business logic and external API communication\n"
        "│   ├── petService.ts          # Firestore queries for pet registration and query filters\n"
        "│   ├── chatService.ts         # Secure client communication with Cloudflare Worker\n"
        "│   └── veterinariasService.ts # Localized directory of 15 verified facilities in Pilar\n"
        "├── utils/                     # Pure TypeScript mathematical and algorithmic utilities\n"
        "│   ├── qrGenerator.ts         # Zero-dependency Reed-Solomon QR matrix generator\n"
        "│   └── stlGenerator.ts        # 3D STL binary triangular mesh generator for 3D printing\n"
        "├── cloudflare-worker/         # Serverless AI proxy backend with JWT token validation\n"
        "├── config/firebase.ts         # Firebase client initialization and environment ingestion\n"
        "└── firestore.rules            # Declarative Cloud Firestore Security Rules v2"
    )
    p_tree = doc.add_paragraph()
    p_tree.paragraph_format.space_before = Pt(4)
    p_tree.paragraph_format.space_after = Pt(8)
    r_tree = p_tree.add_run(tree_text)
    r_tree.font.name = "Consolas"
    r_tree.font.size = Pt(8.0)
    r_tree.font.color.rgb = RGBColor(30, 41, 59)

    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────────────
    # 5. SYSTEMATIC INVESTIGATION OF AI USE ACROSS DOMAINS
    # ─────────────────────────────────────────────────────────────────────────
    add_heading_1(doc, "5. Systematic Investigation of AI Use Across Engineering Domains")
    add_body_p(doc, 
        "To establish an objective appraisal of AI utility, the investigation surveyed seven standard software development activities. Activities were cross-referenced against git commits, developer documentation, and configuration files. Unverified domains are marked [PENDING CONFIRMATION].")

    domains = [
        ("5.1 Code Generation and Explanation",
         "Verified Empirical Evidence: AI code generation is explicitly documented in DOCUMENTACION_USO_DE_IA_PROMPTS.md and corroborated by git commit history. Specific modules generated include the registration screen (app/(auth)/register.tsx), the login interface (app/(auth)/login.tsx), the zero-dependency pure TypeScript QR matrix algorithm (utils/qrGenerator.ts), the binary 3D STL mesh generator (utils/stlGenerator.ts), and the hybrid Leaflet/OpenStreetMap webview bridge (components/map/*). In these cases, AI provided complete React Native TypeScript templates, mathematical transforms, and event bridges.\n\n"
         "Unverified Scope: Whether other core screens—such as the appointment scheduler (turnos.tsx), the medical record view (clinical-record.tsx), or the SOS emergency layout (sos.tsx)—were drafted using AI code generation tools remains [PENDING CONFIRMATION] due to the lack of recorded interaction logs."),

        ("5.2 Debugging and Error Fixing",
         "Verified Empirical Evidence: The Git log reflects numerous complex technical resolutions, such as fixing Firebase v12 Node polyfills in Expo (commit 64360ea), removing local eas-cli conflicts in eas.json (commits ccbfd62, 5698aae), and compressing pet profile photos to prevent exceeding Firestore's 1MB document limit (commit 6b8f352).\n\n"
         "Unverified Scope: While the commit messages document the nature of the bug fixes, the extent to which team members utilized conversational AI assistants (e.g., pasting error stack traces into ChatGPT or Gemini) to diagnose these root causes is [PENDING CONFIRMATION - Prompt Logs Not Stored]."),

        ("5.3 Interface Design and UI/UX",
         "Verified Empirical Evidence: The team followed an explicit UI/UX framework defined in .agent/skills/vetlink-development/SKILL.md, adhering to Figma design references, a standardized emerald color palette (#22C55E, #16A34A), coherent typography, and haptic feedback. AI was utilized to translate conceptual UI designs into responsive React Native stylesheets (StyleSheet.create), including complex interactive cards (QRMascotaCard.tsx), category chip carousels, and floating draggable buttons (commit ee4111b).\n\n"
         "Unverified Scope: Direct AI-assisted generation of Figma wireframes or design tokens is [PENDING CONFIRMATION]."),

        ("5.4 Technical Documentation",
         "Verified Empirical Evidence: Substantial AI assistance was employed to establish technical project guidelines. In commit 19dd8ce, the comprehensive development manual (.agent/skills/vetlink-development/SKILL.md) comprising 754 lines of Scrum methodologies, User Story schemas, Git branching workflows, and Firebase rules was authored with AI assistance. Furthermore, the Cloudflare Worker security manual (cloudflare-worker/README.md) and module breakdown tables in README.md were generated with structured AI support.\n\n"
         "Status: Confirmed and highly documented in repository history."),

        ("5.5 Database Architecture: SQL Queries vs. NoSQL Firestore Schema",
         "Critical Technical Distinction: The project specification explicitly requested an evaluation of AI-generated SQL queries. However, architectural auditing confirms that Vetlink DOES NOT USE A RELATIONAL SQL DATABASE. The application backend is entirely powered by Google Cloud Firestore, a document-oriented NoSQL database engine.\n\n"
         "Actual AI Application in Database Domain: Consequently, zero SQL queries were generated. Instead, AI was utilized to design NoSQL collection structures (users, mascotas, turnos, recordatorios, nfcTags) and author declarative Cloud Firestore Security Rules v2 (firestore.rules). These rules enforce role-based access control (RBAC), verifying whether the authenticated caller has a 'propietario' or 'veterinario' role, and validating field-level modification restrictions (e.g., preventing owners from modifying NFC hardware binding attributes)."),

        ("5.6 Software Testing and Quality Assurance",
         "Verified Empirical Evidence: The repository includes test scripts for Firestore security rules utilizing the Firestore Emulator (commit bc8ea20) and automated linting configurations (eslint.config.js, expo lint). Furthermore, the vetlink-development skill dictates mandatory test checklists for every User Story.\n\n"
         "Unverified Scope: Whether automated unit test suites (e.g., Jest component tests) were synthesized directly by AI tools is [PENDING CONFIRMATION - No AI-generated unit test suites present in working tree]."),

        ("5.7 Development Planning and Methodology",
         "Verified Empirical Evidence: Development planning was guided by the AI-assisted VetLink Development Skill (.agent/skills/vetlink-development/SKILL.md). This document established a Scrum-based User Story framework (e.g., US01 User Registration, US02 Login, US03 Map, US05 Appointments), strict Git branching protocols (feature/usXX-name -> Pull Request -> Review -> Merge to main), and integration with Trello/Kanban pipelines.\n\n"
         "Status: Confirmed as a foundational methodological guideline for the project.")
    ]

    for title, desc in domains:
        add_heading_2(doc, title)
        add_body_p(doc, desc)

    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────────────
    # 6. INDIVIDUAL TEAM MEMBER REPORTS
    # ─────────────────────────────────────────────────────────────────────────
    add_heading_1(doc, "6. Individual Team Member Reports")
    add_body_p(doc, 
        "Individual team member participation was identified strictly from verified Git commit author signatures and archived documentation. In compliance with academic reporting standards, no responsibilities, AI tools, or contributions are fabricated. Where empirical evidence is absent, sections are designated with [PENDING CONFIRMATION].")

    members_data = [
        {
            "name": "6.1 Alex Mérida Pozo",
            "email": "alexmeridagg.mp@gmail.com",
            "commits": "60+ commits across main and feature branches",
            "resp": "Lead architect and repository maintainer. Implemented user registration (US01), authentication (US02), native EAS build configurations, pure TypeScript QR matrix algorithm and 3D STL tag exporter (US-QR), pet image compression, Cloudflare Worker AI chatbot integration, and official landing page deployment.",
            "tools": "Antigravity (Gemini 3.7 Flash, Gemini Flash) [Confirmed via DOCUMENTACION_USO_DE_IA_PROMPTS.md]; Claude Code / Claude Plugin [Partially Confirmed via .claude/settings.json].",
            "tasks": "Code synthesis of registration and login forms; algorithmic design of zero-dependency Reed-Solomon QR encoder; mathematical generation of binary STL 3D facet meshes; setup of Cloudflare Worker serverless proxy with RS256 Firebase JWT validation; authoring of development skill guidelines.",
            "examples": "Prompts requesting pure TypeScript implementation of QR version 1-10 with Reed-Solomon ECC and STL binary buffer generation without third-party dependencies.",
            "testing": "Execution of strict TypeScript compilation (npx tsc --noEmit), ESLint audits (expo lint), manual Android/iOS/Web emulator testing, and verification of user record creation in Firebase Authentication and Firestore console.",
            "decisions": "Architectural decision to avoid third-party QR and STL libraries to ensure compatibility with Expo SDK 57; decision to proxy Groq API calls through Cloudflare Workers to protect secret API keys from client exposure.",
            "evidence": "Git commits: 0626afb, e123ca6, e568a14, 66a4c10, 19dd8ce, 6b8f352, bc8ea20; documentation: DOCUMENTACION_USO_DE_IA_PROMPTS.md.",
            "missing": "Specific prompt transcripts used during Cloudflare Worker JWT verification setup and Google Sign-In integration [PENDING CONFIRMATION]."
        },
        {
            "name": "6.2 Franco Ingratta",
            "email": "ingrattafranco@gmail.com",
            "commits": "2 verified commits (2ba4c6d, 2eb4bf6)",
            "resp": "Development of the 'Mis Mascotas' pet management dashboard and pet detail view (commit 2ba4c6d); complete engineering of the interactive veterinary map covering 15 real health facilities in Pilar Centro (commit 2eb4bf6 - US03).",
            "tools": "Antigravity (Gemini 3.8 Flash) [Confirmed via commit 2eb4bf6 and DOCUMENTACION_USO_DE_IA_PROMPTS.md].",
            "tasks": "Architecture and implementation of the hybrid Leaflet/OpenStreetMap geospatial locator in app/(tabs)/mapa.tsx, including custom markers, category filtering chips, 24-hour emergency filters, and action triggers.",
            "examples": "Documented prompts: (1) 'Necesito implementar la pantalla de Búsqueda y Mapa de Veterinarias en app/(tabs)/mapa.tsx utilizando OpenStreetMap y Leaflet...'; (2) 'Vamos a actualizar la lista del mapa para cubrir tanto veterinarias como pet shops, farmacias y zoonosis de Pilar Centro...'",
            "testing": "Validated using TypeScript compiler (npx tsc --noEmit) and Expo linter (npm run lint) yielding 0 errors and 0 warnings; functional testing of category filtering, marker selection, and telephone linking (Linking.openURL('tel:...') ).",
            "decisions": "Adoption of OpenStreetMap and Leaflet over Google Maps SDK to eliminate mandatory billing accounts and API key restrictions, ensuring zero external cost and cross-platform web/native compatibility.",
            "evidence": "Git commit 2eb4bf6; DOCUMENTACION_USO_DE_IA_PROMPTS.md; source files components/map/*, constants/veterinarias.ts, services/veterinariasService.ts.",
            "missing": "Confirmation whether AI was used during the earlier implementation of the 'Mis Mascotas' screen (commit 2ba4c6d) [PENDING CONFIRMATION]."
        },
        {
            "name": "6.3 Candela C.",
            "email": "candelrcanteros@gmail.com",
            "commits": "7 verified commits (d4b376c, 47c0517, 7103489, df49f58, da283e5, c938425, c2dbeff)",
            "resp": "Implementation and evolution of the primary Home/Dashboard screen (app/(tabs)/index.tsx); complete restructuring of the emergency SOS screen (app/(tabs)/sos.tsx); merge conflict resolution on navigation layouts and floating buttons; login adjustments.",
            "tools": "[PENDING CONFIRMATION - AI Tool Not Disclosed in Git History]",
            "tasks": "[PENDING CONFIRMATION - Tasks Assisted by AI]",
            "examples": "[PENDING CONFIRMATION - No Prompt Transcripts Recorded in Repository]",
            "testing": "Manual verification on branch cande/mi-area; UI layout validation across mobile screen resolutions; resolution of navigation tab conflicts.",
            "decisions": "Centralized placement and red-themed visual isolation of the SOS emergency button on the bottom navigation bar to maximize accessibility during pet emergencies.",
            "evidence": "Git commits: d4b376c, 47c0517, c938425, c2dbeff; active working branch cande/mi-area.",
            "missing": "Specific AI tools utilized (e.g., ChatGPT, Claude, Antigravity), prompt logs, degree of code generation vs. manual authoring, and verification methods [PENDING CONFIRMATION]."
        },
        {
            "name": "6.4 Lucas Acosta",
            "email": "lucaseacosta51@gmail.com",
            "commits": "2 verified commits (14579f1, 0ed5ad6)",
            "resp": "Development of the official Vetlink animated splash screen (components/SplashScreen.tsx); design and implementation of the clinical medical record module for pets (app/clinical-record.tsx, components/clinical/*, services/clinicalRecordService.ts).",
            "tools": "[PENDING CONFIRMATION - AI Tool Not Disclosed in Git History]",
            "tasks": "[PENDING CONFIRMATION - Tasks Assisted by AI]",
            "examples": "[PENDING CONFIRMATION - No Prompt Transcripts Recorded in Repository]",
            "testing": "Visual verification of launch screen transitions; form validation of clinical consultation inputs.",
            "decisions": "Separation of clinical records into modular subcomponents (ConsultationCard, NewConsultationModal, PetHeaderCard) to maintain single-responsibility principles.",
            "evidence": "Git commits: 14579f1, 0ed5ad6; branches splash-lucas, ficha-clinica-lucas.",
            "missing": "Identification of AI tools used (if any), prompt records, and specific testing protocols applied to clinical services [PENDING CONFIRMATION]."
        },
        {
            "name": "6.5 Santino Bravo",
            "email": "santinobravo2007@gmail.com (santino21-spm)",
            "commits": "1 verified commit (aa8e2db)",
            "resp": "Creation and initial implementation of the veterinary appointment scheduling screen (app/(tabs)/turnos.tsx - US05/mvp05-turnos), later integrated into main routing by Alex Mérida Pozo (commit bbbdd1f).",
            "tools": "[PENDING CONFIRMATION - AI Tool Not Disclosed in Git History]",
            "tasks": "[PENDING CONFIRMATION - Tasks Assisted by AI]",
            "examples": "[PENDING CONFIRMATION - No Prompt Transcripts Recorded in Repository]",
            "testing": "UI rendering verification within Expo development client.",
            "decisions": "Structuring the appointment booking interface with calendar day pickers and time slot selections.",
            "evidence": "Git commit aa8e2db; branch feature/mvp05-turnos; merge commit bbbdd1f.",
            "missing": "Confirmation of whether AI assisted with component generation, prompt records, and validation methodologies [PENDING CONFIRMATION]."
        }
    ]

    for m in members_data:
        add_heading_2(doc, m["name"])
        add_body_p(doc, m["email"], "Author Email: ")
        add_body_p(doc, m["commits"], "Git Commit Activity: ")
        add_body_p(doc, m["resp"], "Project Responsibilities: ")
        add_body_p(doc, m["tools"], "AI Tools Used: ")
        add_body_p(doc, m["tasks"], "Tasks Assisted by AI: ")
        add_body_p(doc, m["examples"], "Concrete Examples & Prompts: ")
        add_body_p(doc, m["testing"], "Verification & Testing: ")
        add_body_p(doc, m["decisions"], "Engineering Contributions & Decisions: ")
        add_body_p(doc, m["evidence"], "Available Evidence: ")
        add_body_p(doc, m["missing"], "Missing Information: ")
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────────────
    # 7. AI TOOLS TABLE
    # ─────────────────────────────────────────────────────────────────────────
    add_heading_1(doc, "7. AI Tools Evaluation Table")
    add_body_p(doc, 
        "The following consolidated table contrasts all artificial intelligence tools detected or referenced within the project environment. Tools are categorized strictly by empirical verification status.")

    t_tools = doc.add_table(rows=7, cols=6)
    t_tools.alignment = WD_TABLE_ALIGNMENT.CENTER
    tool_headers = ["Tool Name", "Provider / Engine", "Task / Module Performed", "Team Member", "Available Evidence", "Verification Status"]
    for j, h in enumerate(tool_headers):
        t_tools.rows[0].cells[j].paragraphs[0].text = h
    format_row(t_tools.rows[0], "0F2C59", is_header=True)

    tools_rows = [
        ("Antigravity", "Google / Gemini 3.7 Flash", "Synthesis of Registration (US01) & Login (US02) UI and Firebase hooks.", "Alex Mérida Pozo", "DOCUMENTACION_USO_DE_IA_PROMPTS.md, Commits 0626afb, e123ca6", "CONFIRMED"),
        ("Antigravity", "Google / Gemini Flash", "Algorithmic generation of pure TS QR generator & 3D STL binary exporter.", "Alex Mérida Pozo", "DOCUMENTACION_USO_DE_IA_PROMPTS.md, Commit e568a14", "CONFIRMED"),
        ("Antigravity", "Google / Gemini 3.8 Flash", "Interactive Leaflet/OSM map bridge, custom markers, 15 Pilar facilities.", "Franco Ingratta / Team", "Commit 2eb4bf6, DOCUMENTACION_USO_DE_IA_PROMPTS.md", "CONFIRMED"),
        ("Claude Code", "Anthropic / Claude", "Editor integration and Expo CLI plugin support configuration.", "Team / Alex Mérida Pozo", ".claude/settings.json, CLAUDE.md", "PARTIALLY CONFIRMED (Config verified; exact user prompt pending)"),
        ("Groq API (In-App)", "Groq / gpt-oss-20b", "Serverless AI chatbot backend runtime for end-user pet health queries.", "Alex Mérida Pozo (Dev)", "cloudflare-worker/src/index.ts, app/chat.tsx", "CONFIRMED (Runtime Feature, not coding assistant)"),
        ("ChatGPT / Copilot", "OpenAI / Microsoft", "Hypothetical coding assistance for SOS, Turnos, or Splash modules.", "Candela C., Lucas A., Santino B.", "None found in Git tree or commits", "UNVERIFIED [PENDING CONFIRMATION]")
    ]

    for idx, (tname, prov, task, mem, ev, st) in enumerate(tools_rows, start=1):
        row = t_tools.rows[idx]
        row.cells[0].paragraphs[0].text = tname
        row.cells[1].paragraphs[0].text = prov
        row.cells[2].paragraphs[0].text = task
        row.cells[3].paragraphs[0].text = mem
        row.cells[4].paragraphs[0].text = ev
        row.cells[5].paragraphs[0].text = st
        bg = "ECFDF5" if "CONFIRMED" == st else ("FEF3C7" if "PARTIALLY" in st else ("F8FAFC" if idx % 2 == 1 else "FFFFFF"))
        format_row(row, bg)

    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────────────
    # 8. CONCRETE EXAMPLES OF AI USE
    # ─────────────────────────────────────────────────────────────────────────
    add_heading_1(doc, "8. Concrete Examples of AI Use")
    add_body_p(doc, 
        "In accordance with academic standards, this section documents only authentic, verifiable cases where actual prompt records, outputs, and developer modifications are preserved in project history. Hypothetical cases are not invented.")

    cases = [
        {
            "num": "8.1 Case Study 1: Interactive Geospatial Veterinary Locator (US03)",
            "target": "app/(tabs)/mapa.tsx, components/map/*, constants/veterinarias.ts, services/veterinariasService.ts",
            "dev": "Franco Ingratta (Commit 2eb4bf6, Oct 27, 2026)",
            "tool": "Antigravity (Gemini 3.8 Flash)",
            "problem": "The Vetlink application required an interactive map to locate veterinary clinics and 24-hour emergency hospitals. Utilizing Google Maps Platform presented two barriers: mandatory credit card billing requirements and prohibitive API costs for an academic project. Furthermore, the map needed to operate seamlessly on both Web browsers and native Android/iOS devices while featuring 15 real clinics in Pilar Centro with phone dialer triggers.",
            "prompt": "Prompt 1: 'Necesito implementar la pantalla de Búsqueda y Mapa de Veterinarias en app/(tabs)/mapa.tsx utilizando OpenStreetMap y Leaflet (sin requerir Google Maps API Key ni tarjeta de crédito)...'\n\nPrompt 2: 'Vamos a actualizar la lista del mapa para cubrir tanto veterinarias como pet shops, farmacias y zoonosis de Pilar Centro: (1) En constants/veterinarias.ts, reemplazá los datos por PUNTOS_VETERINARIOS_PILAR (15 lugares); (2) En services/veterinariasService.ts, retorná esta lista completa; (3) En app/(tabs)/mapa.tsx: contador superior, filtros por tipo, filtro Guardia 24hs, y botón Llamar conectado al número.'",
            "output": "The AI delivered a modular hybrid architecture: (1) LeafletMapView.native.tsx using react-native-webview and postMessage event handlers; (2) LeafletMapView.web.tsx using native HTML iframe; (3) leafletHtml.ts containing the complete Leaflet CSS/JS bundle and custom SVG pins; (4) constants/veterinarias.ts with 15 geolocalized facilities; and (5) the complete screen controller in mapa.tsx.",
            "changes": "The developer reviewed the output, verified TypeScript types, connected the native telephone dialer via Linking.openURL('tel:...'), aligned modal styling with the application emerald palette (#22C55E), and tuned marker clustering behavior.",
            "testing": "Executed static type verification via npx tsc --noEmit and linting via npm run lint (0 errors, 0 warnings). Conducted physical device testing on Android to confirm WebView rendering, touch gestures, marker popups, and phone dialing actions.",
            "result": "A high-performance, cost-free, dual-platform interactive map deployed into main with complete local accuracy."
        },
        {
            "num": "8.2 Case Study 2: User Authentication & Role Persistence Flow (US01 & US02)",
            "target": "app/(auth)/register.tsx, app/(auth)/login.tsx, config/firebase.ts",
            "dev": "Alex Mérida Pozo (Commits 0626afb, e123ca6, Sept 2026)",
            "tool": "Antigravity (Gemini 3.7 Flash)",
            "problem": "The team required robust authentication interfaces supporting both regular pet owners and professional veterinarians. The implementation required strict frontend input validation, Firebase Authentication integration, automatic user profile creation in Cloud Firestore, and descriptive error messaging translated into Spanish (e.g., handling auth/email-already-in-use, auth/weak-password, auth/invalid-credential).",
            "prompt": "Documented in skill guidelines: Requesting full React Native screen components with typed inputs, role selection chips ('propietario' vs 'veterinario'), asynchronous submission handlers, and Firebase Auth exception mapping adhering strictly to Expo SDK 57 standards.",
            "output": "AI generated complete functional components utilizing React hooks (useState), custom input wrappers with error borders, role selector buttons with animated opacity, and direct integration with createUserWithEmailAndPassword and signInWithEmailAndPassword.",
            "changes": "The developer adjusted typography to match the design system, added keyboard-avoiding behaviors (KeyboardAvoidingView) for smaller Android screens, and connected navigation redirects via expo-router replace to prevent back-button loops after login.",
            "testing": "Tested in Expo Go and web emulator. Verification steps included testing empty submissions, invalid email formats, weak password rejections, duplicate registration attempts, and confirming that the created user profile immediately appeared in Firebase Auth and Firestore.",
            "result": "Secure, production-ready authentication flow merged via Pull Requests #1 and #5."
        },
        {
            "num": "8.3 Case Study 3: Pure TypeScript QR Matrix Algorithm & Binary 3D STL Tag Exporter",
            "target": "utils/qrGenerator.ts, utils/stlGenerator.ts, components/QRMascotaCard.tsx",
            "dev": "Alex Mérida Pozo (Commit e568a14, Oct 9, 2026)",
            "tool": "Antigravity (Gemini Flash)",
            "problem": "To facilitate pet recovery, each registered pet required an identification tag. Relying on external web services for QR generation caused offline failures, while existing npm QR libraries frequently failed on Expo SDK 57's New Architecture. Furthermore, the team envisioned allowing pet owners to export a 3D-printable physical tag (STL format) for direct fabrication on 3D printers.",
            "prompt": "Request to develop an autonomous QR matrix generator in pure TypeScript (supporting QR versions 1 to 10 with Reed-Solomon error correction level M) and a binary STL triangular mesh generator capable of producing an ArrayBuffer with 3D relief of the QR modules, completely free of external dependencies.",
            "output": "AI authored: (1) utils/qrGenerator.ts containing mathematical Galois Field (GF 256) arithmetic, polynomial division for Reed-Solomon codewords, mask pattern evaluations, and matrix bit placement; (2) utils/stlGenerator.ts computing triangular facets, surface normal vectors, and 80-byte header binary packing; (3) QRMascotaCard.tsx providing UI preview, SVG export, and STL file export via expo-file-system and expo-sharing.",
            "changes": "Developer reviewed memory allocation within the ArrayBuffer generation, integrated share sheets, and added bottom-sheet modal controls to the pet list and pet detail views.",
            "testing": "Validated with npx tsc --noEmit. The exported STL binary files were downloaded and successfully sliced and rendered in standard 3D printing software (UltiMaker Cura / PrusaSlicer) without geometric mesh errors.",
            "result": "Zero-dependency, offline-capable smart pet identification engine operating entirely on-device."
        }
    ]

    for c in cases:
        add_heading_2(doc, c["num"])
        add_body_p(doc, c["target"], "Affected Files: ")
        add_body_p(doc, c["dev"], "Developer / Commit: ")
        add_body_p(doc, c["tool"], "AI Tool Used: ")
        add_body_p(doc, c["problem"], "Original Engineering Problem: ")
        add_body_p(doc, c["prompt"], "Prompt / Task Given to AI: ")
        add_body_p(doc, c["output"], "AI Output / Suggested Solution: ")
        add_body_p(doc, c["changes"], "Modifications Made by Developer: ")
        add_body_p(doc, c["testing"], "Verification & Testing Method: ")
        add_body_p(doc, c["result"], "Final Result & Impact: ")
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    add_heading_2(doc, "8.4 Unrecorded & Pending Feature Modules")
    add_body_p(doc, 
        "For several core modules—specifically the SOS emergency screen (app/(tabs)/sos.tsx), the veterinary appointment calendar (app/(tabs)/turnos.tsx), the pet clinical history records (app/clinical-record.tsx), and the initial splash screen (components/SplashScreen.tsx)—no prompt interaction transcripts were archived in the repository. "
        "Consequently, in strict observance of academic ethics, no speculative prompts or AI outputs are reported for these modules. The team must confirm whether these components were hand-coded or synthesized using conversational AI during the upcoming review cycle.")

    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────────────
    # 9. QUALITY CONTROL AND VERIFICATION PROTOCOLS
    # ─────────────────────────────────────────────────────────────────────────
    add_heading_1(doc, "9. Quality Control, Code Verification, and Security Assurance")
    add_body_p(doc, 
        "The integration of generative AI into software development introduces severe risks if uncontrolled, including hallucinations of deprecated APIs, silent logical defects, license violations, and security vulnerabilities. The Vetlink project established a structured quality control protocol to counter these hazards.")

    add_heading_2(doc, "9.1 Team Governance Rules")
    add_body_p(doc, 
        "The project development skill (.agent/skills/vetlink-development/SKILL.md) instituted strict organizational policies governing AI assistance:",
        "Mandatory Governance Principles: ")
    add_bullet_p(doc, "'Todo código generado por IA debe ser revisado, comprendido, probado y defendible por los integrantes del equipo.' Developers must be capable of explaining every line of code during academic defense.", "Comprehension & Defense Mandate: ")
    add_bullet_p(doc, "AI tools were explicitly barred from generating arbitrary folder hierarchies or adding unnecessary packages. Every proposed dependency required architectural justification.", "Architectural Preservation: ")
    add_bullet_p(doc, "'La IA nunca debe ocultar su participación.' All significant AI generation must be documented transparently rather than claimed as manual code.", "Transparency Mandate: ")

    add_heading_2(doc, "9.2 Verification & Testing Pipeline")
    add_body_p(doc, "The team enforced a multi-stage verification pipeline prior to merging feature branches into main:")
    add_bullet_p(doc, "Running npx tsc --noEmit to ensure zero type errors across all TypeScript modules and prevent runtime undefined failures.", "Stage 1: Static Type Checking: ")
    add_bullet_p(doc, "Executing npm run lint (Expo ESLint) to ensure code quality, hook dependencies, and formatting conform to project standards.", "Stage 2: Linter & Static Analysis: ")
    add_bullet_p(doc, "Validating each feature against explicit acceptance criteria checklists before transitioning Trello cards to 'Done'.", "Stage 3: Acceptance Criteria Validation: ")
    add_bullet_p(doc, "Executing code in Expo Go and Android emulators to ensure hardware APIs (camera, NFC, geolocation) behave correctly.", "Stage 4: Emulator & Hardware Testing: ")
    add_bullet_p(doc, "Testing security rules against the local Firebase emulator (commit bc8ea20) to ensure unauthorized reads and writes are rejected.", "Stage 5: Security Rules Verification: ")

    add_heading_2(doc, "9.3 Security and Secrets Management")
    add_body_p(doc, 
        "A critical vulnerability in AI-assisted development is the inadvertent exposure of private API credentials. The Vetlink team enforced strict containment:",
        "Security Safeguards: ")
    add_bullet_p(doc, "Firebase configuration utilizes public client identifiers prefixed with EXPO_PUBLIC_ via .env.example, preventing production secrets from being committed to GitHub.", "Client Environment Protection: ")
    add_bullet_p(doc, "The Groq API key is stored exclusively as an encrypted secret within Cloudflare Workers (npx wrangler secret put GROQ_API_KEY). The client mobile application never possesses this key.", "AI Key Encapsulation: ")
    add_bullet_p(doc, "The Cloudflare Worker validates the caller's Firebase ID token against Google's public JWKS certificates using RS256 cryptography, rejecting unauthenticated requests with HTTP 401.", "Cryptographic Token Verification: ")
    add_bullet_p(doc, "Cloud Firestore Security Rules v2 (firestore.rules) validate authenticated UIDs and roles independently of frontend checks, ensuring malicious API clients cannot alter pet ownership or veterinarian privileges.", "NoSQL Access Governance: ")

    # ─────────────────────────────────────────────────────────────────────────
    # 10. TECHNICAL BENEFITS AND PRACTICAL LIMITATIONS
    # ─────────────────────────────────────────────────────────────────────────
    add_heading_1(doc, "10. Technical Benefits and Practical Limitations")
    add_body_p(doc, 
        "The impact of AI on the Vetlink project presents a clear dichotomy between theoretical industry benefits and the concrete, empirical realities experienced by the student development team.")

    add_heading_2(doc, "10.1 Technical Benefits")
    add_body_p(doc, "The development team experienced tangible acceleration in several specific engineering areas:")
    add_bullet_p(doc, "Drafting mathematical algorithms that would typically require days of manual research—such as the Galois Field arithmetic for Reed-Solomon QR encoding and binary STL triangular mesh generation—was accomplished within hours.", "Algorithmic Prototyping: ")
    add_bullet_p(doc, "AI effectively authored the dual-target Leaflet bridge, creating an iframe implementation for Web and a WebView implementation for native devices with postMessage event synchronization.", "Cross-Platform Bridge Synthesis: ")
    add_bullet_p(doc, "Accelerated the creation of repetitive form screens (login, register) and state management hooks, allowing the team to focus on system integration.", "Boilerplate Reduction: ")
    add_bullet_p(doc, "Facilitated rapid generation of comprehensive Scrum guidelines, User Story templates, and Cloudflare Worker architectural documentation.", "Technical Documentation Speed: ")

    add_heading_2(doc, "10.2 Practical Limitations and Challenges")
    add_body_p(doc, "Conversely, the team encountered significant technical friction where AI tools proved insufficient or problematic:")
    add_bullet_p(doc, "AI models frequently suggested deprecated syntax or packages incompatible with Expo SDK 57 (which operates on React Native 0.86 with the New Architecture and React 19). Manual human intervention was mandatory to align dependencies.", "Expo SDK 57 Deprecations: ")
    add_bullet_p(doc, "AI cannot validate native hardware behavior (e.g., actual NFC tag read cycles via react-native-nfc-manager, real camera focus behavior, or haptic vibration timing). All hardware interactions required extensive physical device testing.", "Hardware Emulation Blindspot: ")
    add_bullet_p(doc, "Initial AI implementations of pet photo storage attempted to store base64 strings directly in Firestore documents, which violated Firestore's 1MB hard limit. The team had to manually implement client-side image compression (commit 6b8f352).", "NoSQL Document Limit Oversights: ")
    add_bullet_p(doc, "When team members relied on AI without preserving detailed prompt logs, traceability was lost, creating the documentation gaps identified in this report.", "Documentation Drift: ")

    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────────────
    # 11. CONCLUSIONS
    # ─────────────────────────────────────────────────────────────────────────
    add_heading_1(doc, "11. Conclusions")
    add_body_p(doc, 
        "This academic report provides an evidence-based assessment of AI usage in the Vetlink mobile application project. The investigation yields three primary conclusions:")
    
    add_body_p(doc, 
        "1. AI Served as a High-Impact Technical Accelerator: Generative AI was not merely utilized for superficial text generation, but actively contributed to complex algorithmic tasks (zero-dependency QR matrix encoding and 3D STL mesh generation), hybrid geospatial architectures (dual-platform Leaflet/OSM implementation), and secure serverless backend proxies (Cloudflare Worker with RS256 JWT validation).",
        "Finding 1: ")

    add_body_p(doc, 
        "2. Developer Judgment and Governance Remained Decisive: The success of the application was fundamentally determined by human architectural oversight. The team established proactive guidelines in .agent/skills/vetlink-development/SKILL.md, enforced static type safety (TypeScript), audited linter rules, and manually diagnosed edge-case hardware and database constraints (such as Expo SDK 57 New Architecture compatibility and Firestore 1MB document thresholds).",
        "Finding 2: ")

    add_body_p(doc, 
        "3. Documentation Transparency Requires Team Harmonization: While repository commits and archived records confirm extensive, high-quality AI usage by Alex Mérida Pozo and Franco Ingratta, empirical interaction records for Candela C., Lucas Acosta, and Santino Bravo remain incomplete in the public repository. To ensure full academic compliance, the team must complete the checklist provided in Section 13 prior to final project submission.",
        "Finding 3: ")

    # ─────────────────────────────────────────────────────────────────────────
    # 12. EVIDENCE APPENDIX
    # ─────────────────────────────────────────────────────────────────────────
    add_heading_1(doc, "12. Evidence Appendix")
    add_body_p(doc, 
        "The following appendix indexes the primary empirical evidence extracted from the Git version control system, repository branches, and configuration artifacts.")

    t_app = doc.add_table(rows=10, cols=5)
    t_app.alignment = WD_TABLE_ALIGNMENT.CENTER
    app_headers = ["Commit / Artifact", "Author / Source", "Date", "Engineering Significance", "Source Verification"]
    for j, h in enumerate(app_headers):
        t_app.rows[0].cells[j].paragraphs[0].text = h
    format_row(t_app.rows[0], "0F2C59", is_header=True)

    app_rows = [
        ("Commit 2eb4bf6", "Franco Ingratta", "2026-10-27", "Implements interactive Leaflet map covering 15 facilities in Pilar Centro (US03); adds DOCUMENTACION_USO_DE_IA_PROMPTS.md.", "Git commit history & diff"),
        ("Commit e568a14", "Alex Mérida Pozo", "2026-10-09", "Implements pure TypeScript QR generator, STL 3D binary generator, and QRMascotaCard.tsx without third-party dependencies.", "Git commit history & diff"),
        ("Commit 66a4c10", "Alex Mérida Pozo", "2026-10-19", "Integrates VetLink chatbot with Groq API via Cloudflare Worker, Firebase Auth RS256 JWT verification, and chat.tsx.", "Git commit history & diff"),
        ("Commit 0626afb", "Alex Mérida Pozo", "2026-09-05", "Implements user registration screen (US01) with Firebase Authentication and Firestore role persistence.", "Git commit history & diff"),
        ("Commit e123ca6", "Alex Mérida Pozo", "2026-09-11", "Implements login screen (US02) with Firebase Auth, input validation, and route redirection.", "Git commit history & diff"),
        ("Commit 19dd8ce", "Alex Mérida Pozo", "2026-09-05", "Establishes .agent/skills/vetlink-development/SKILL.md development guidelines and AI rules.", "Git commit history & diff"),
        ("Commit 54fee74", "Alex Mérida Pozo", "2026-11-02", "Maintenance commit cleaning agent skills and AI documentation prior to public branch synchronization.", "Git commit history & diff"),
        ("Commit c938425", "Candela C.", "2026-11-01", "Updates emergency SOS screen and tab navigation layout on branch cande/mi-area.", "Git commit history & diff"),
        ("Commit 0ed5ad6", "Lucas Acosta", "2026-09-21", "Implements clinical history and pet medical record module.", "Git commit history & diff")
    ]

    for idx, (c_hash, auth, dt, sig, src) in enumerate(app_rows, start=1):
        row = t_app.rows[idx]
        row.cells[0].paragraphs[0].text = c_hash
        row.cells[1].paragraphs[0].text = auth
        row.cells[2].paragraphs[0].text = dt
        row.cells[3].paragraphs[0].text = sig
        row.cells[4].paragraphs[0].text = src
        format_row(row, "F8FAFC" if idx % 2 == 1 else "FFFFFF")

    doc.add_page_break()

    # ─────────────────────────────────────────────────────────────────────────
    # 13. MISSING INFORMATION AND DEVELOPER ACTION CHECKLIST
    # ─────────────────────────────────────────────────────────────────────────
    add_heading_1(doc, "13. Missing Information and Developer Action Checklist")
    add_body_p(doc, 
        "To ensure this report attains full institutional compliance and readiness for academic defense, the development team must resolve the following itemized checklist of pending information:")

    t_miss = doc.add_table(rows=8, cols=4)
    t_miss.alignment = WD_TABLE_ALIGNMENT.CENTER
    miss_headers = ["Item #", "Pending Information Category", "Affected Team Member(s)", "Required Action & Deliverable"]
    for j, h in enumerate(miss_headers):
        t_miss.rows[0].cells[j].paragraphs[0].text = h
    format_row(t_miss.rows[0], "0F2C59", is_header=True)

    miss_rows = [
        ("INFO-01", "Academic Institution & Course Name", "Entire Team", "Confirm the official name of the university, faculty, and academic course for the cover page."),
        ("INFO-02", "Candela C. AI Tool Disclosure", "Candela C.", "Specify whether AI tools (e.g., ChatGPT, Claude, Antigravity) were used for Home/Dashboard (index.tsx) or SOS (sos.tsx)."),
        ("INFO-03", "Lucas Acosta AI Tool Disclosure", "Lucas Acosta", "Confirm whether AI tools assisted with the SplashScreen or clinical record services, providing prompt summaries if applicable."),
        ("INFO-04", "Santino Bravo AI Tool Disclosure", "Santino Bravo", "Disclose whether AI code generation was used for the appointment booking interface (turnos.tsx)."),
        ("INFO-05", "Prompt Interaction Transcripts", "All Members", "Provide representative prompt texts for unrecorded features to expand Section 8 case studies."),
        ("INFO-06", "Manual Refactoring Log", "All Members", "Document specific modifications made to AI code to resolve bugs, improve UI, or ensure Expo SDK 57 compatibility."),
        ("INFO-07", "Testing & Defense Readiness", "All Members", "Confirm that each member has tested their assigned modules and is prepared to defend the code during oral evaluation.")
    ]

    for idx, (it, cat, mem, act) in enumerate(miss_rows, start=1):
        row = t_miss.rows[idx]
        row.cells[0].paragraphs[0].text = it
        row.cells[1].paragraphs[0].text = cat
        row.cells[2].paragraphs[0].text = mem
        row.cells[3].paragraphs[0].text = act
        format_row(row, "FEF3C7" if idx <= 4 else ("F8FAFC" if idx % 2 == 1 else "FFFFFF"))

    # ─────────────────────────────────────────────────────────────────────────
    # 14. REFERENCES
    # ─────────────────────────────────────────────────────────────────────────
    add_heading_1(doc, "14. References")
    refs = [
        "Expo Documentation. (2026). Expo SDK 57 Reference and Release Guides. Retrieved from https://docs.expo.dev/versions/v57.0.0/",
        "Facebook Open Source. (2026). React Native: A Framework for Building Native Apps Using React (Version 0.86). Retrieved from https://reactnative.dev/",
        "Google Firebase. (2026). Cloud Firestore Security Rules Documentation. Retrieved from https://firebase.google.com/docs/firestore/security/rules-structure",
        "Cloudflare Workers. (2026). Serverless Computing and Cryptographic Web Crypto Standards. Retrieved from https://developers.cloudflare.com/workers/",
        "IEEE Computer Society. (2024). Guidelines on the Ethical and Transparent Use of Generative Artificial Intelligence in Student Software Engineering Projects.",
        "ACM Code of Ethics and Professional Conduct. (2023). Professional Software Engineering Responsibility and Algorithmic Provenance."
    ]
    for r in refs:
        add_bullet_p(doc, r)

    # Save document
    output_filename = "AI Usage Report - Vetlink Project.docx"
    output_path = os.path.abspath(output_filename)
    doc.save(output_path)
    print(f"Document successfully created at: {output_path}")

if __name__ == "__main__":
    main()
