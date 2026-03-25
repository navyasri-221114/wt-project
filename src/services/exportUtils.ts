/**
 * exportUtils.ts
 * Client-side export utilities — Resume PDF, Analytics PDF, Analytics CSV
 * Uses jsPDF + jspdf-autotable for high-quality PDF generation.
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  objective?: string;
  education?: string;
  technicalSkills?: string;
  softSkills?: string;
  projects?: string;
  internships?: string;
  certifications?: string;
  achievements?: string;
  activities?: string;
  languages?: string;
  hobbies?: string;
  declaration?: string;
}

export interface StudentAnalyticsRow {
  name: string;
  email: string;
  department: string;
  college: string;
  year: string | number;
  cgpa: string | number;
  skills: string;
  applications: number;
  interviews: number;
  selected: number;
  performance: string;
  joinedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** sky brand colour used as accent throughout PDFs */
const BRAND = { r: 79, g: 70, b: 229 }; // #4F46E5

/** Draws a styled header band */
function drawHeader(doc: jsPDF, title: string, subtitle?: string) {
  const W = doc.internal.pageSize.getWidth();

  // Background gradient band
  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.rect(0, 0, W, 42, "F");

  // Top-right decorative circle
  doc.setFillColor(255, 255, 255, 0.08);
  doc.circle(W - 18, -8, 38, "F");
  doc.circle(W - 5, 28, 22, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(title, 14, 20);

  // Subtitle
  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 240);
    doc.text(subtitle, 14, 30);
  }

  // Reset text colour
  doc.setTextColor(30, 30, 30);
}

/** A thin labelled horizontal rule */
function sectionTitle(doc: jsPDF, label: string, y: number, pageW: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
  doc.text(label.toUpperCase(), 14, y);
  doc.setDrawColor(BRAND.r, BRAND.g, BRAND.b);
  doc.setLineWidth(0.4);
  doc.line(14 + doc.getTextWidth(label.toUpperCase()) + 3, y - 1, pageW - 14, y - 1);
  doc.setTextColor(30, 30, 30);
}

/** Splits multiline text, returns the ending Y position */
function richText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight = 5.5
): number {
  if (!text || text.trim() === "—") return y;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const lines = text.split("\n").flatMap((l) => doc.splitTextToSize(l.trim(), maxWidth));
  lines.forEach((line) => {
    doc.text(line, x, y);
    y += lineHeight;
  });
  return y;
}

/** Draws a two-column bullet list (for skills) */
function skillBadges(doc: jsPDF, skills: string, x: number, y: number, maxWidth: number): number {
  const items = skills
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  let cx = x;
  let cy = y;
  const badgeH = 6;
  const badgePad = 4;
  const lineGap = 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);

  items.forEach((item) => {
    const tw = doc.getTextWidth(item) + badgePad * 2;
    if (cx + tw > x + maxWidth) {
      cx = x;
      cy += lineGap;
    }
    doc.setFillColor(237, 233, 254); // light sky
    doc.setDrawColor(BRAND.r, BRAND.g, BRAND.b);
    doc.roundedRect(cx, cy - badgeH + 1, tw, badgeH, 1.5, 1.5, "FD");
    doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
    doc.text(item, cx + badgePad, cy);
    cx += tw + 3;
  });

  doc.setTextColor(30, 30, 30);
  return cy + lineGap;
}

/** Footer on each page */
function addFooter(doc: jsPDF, label: string) {
  const pages = doc.getNumberOfPages();
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(220, 220, 230);
    doc.setLineWidth(0.3);
    doc.line(14, H - 14, W - 14, H - 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(150, 150, 160);
    doc.text(label, 14, H - 9);
    doc.text(`Page ${i} of ${pages}`, W - 14, H - 9, { align: "right" });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. RESUME PDF
// ─────────────────────────────────────────────────────────────────────────────

export function exportResumePDF(data: any) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  
  if (data.templateStyle === "corporate") {
    // ── CORPORATE LAYOUT (Single Column Centered) ──
    const MARGIN = 20;
    const CONTENT_W = W - MARGIN * 2;
    let y = 25;

    // Header (Center aligned)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(20, 20, 20);
    const name = data.name?.toUpperCase() || "YOUR NAME";
    doc.text(name, W / 2, y, { align: "center" });
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(data.job_title?.toUpperCase() || "PROFESSIONAL", W / 2, y, { align: "center" });
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const contactLinks = [data.phone, data.email, data.location].filter(Boolean).join("  |  ");
    doc.text(contactLinks, W / 2, y, { align: "center" });
    y += 5;
    const webLinks = [data.linkedin, data.portfolio].filter(Boolean).join("  |  ");
    doc.text(webLinks, W / 2, y, { align: "center" });
    y += 12;

    const sectionHeader = (title: string, yPos: number) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text(title.toUpperCase(), MARGIN, yPos);
      doc.setDrawColor(40, 40, 40);
      doc.setLineWidth(0.4);
      doc.line(MARGIN, yPos + 2, W - MARGIN, yPos + 2);
      return yPos + 8;
    };

    // Summary
    if (data.objective) {
      y = sectionHeader("Professional Summary", y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(60, 60, 60);
      const lines = doc.splitTextToSize(data.objective, CONTENT_W);
      doc.text(lines, MARGIN, y);
      y += lines.length * 5 + 6;
    }

    // Skills
    if (data.languages || data.web_tech || data.tools) {
      y = sectionHeader("Technical Skills", y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(60, 60, 60);

      const addSkillLine = (label: string, skills: string) => {
        if (!skills) return;
        doc.setFont("helvetica", "bold");
        doc.text(`${label}: `, MARGIN, y);
        const lw = doc.getTextWidth(`${label}: `);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(skills, CONTENT_W - lw);
        doc.text(lines, MARGIN + lw, y);
        y += lines.length * 5 + 2;
      };

      addSkillLine("Languages", data.languages);
      addSkillLine("Frameworks", data.web_tech);
      addSkillLine("Tools", data.tools);
      y += 4;
    }

    // Experience
    if (data.company) {
      y = sectionHeader("Professional Experience", y);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(30, 30, 30);
      doc.text(data.role, MARGIN, y);
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(data.duration, W - MARGIN, y, { align: "right" });
      y += 5;

      doc.setFont("helvetica", "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(79, 70, 229); // brand color
      doc.text(data.company, MARGIN, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(60, 60, 60);
      const lines = doc.splitTextToSize(`• ${data.work}`, CONTENT_W - 5);
      doc.text(lines, MARGIN + 5, y);
      y += lines.length * 5 + 6;
    }

    // Projects
    if (data.project1_title || data.project2_title) {
      y = sectionHeader("Projects", y);
      
      const drawProj = (title: string, tech: string, desc: string) => {
        if (!title) return;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(30, 30, 30);
        doc.text(title, MARGIN, y);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.5);
        doc.setTextColor(100, 100, 100);
        doc.text(tech, W - MARGIN, y, { align: "right" });
        y += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(60, 60, 60);
        const lines = doc.splitTextToSize(`• ${desc}`, CONTENT_W - 5);
        doc.text(lines, MARGIN + 5, y);
        y += lines.length * 5 + 4;
      };

      drawProj(data.project1_title, data.project1_tech, data.project1_desc);
      drawProj(data.project2_title, data.project2_tech, data.project2_desc);
      y += 2;
    }

    // Education
    if (data.degree) {
      y = sectionHeader("Education", y);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text(data.degree, MARGIN, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(data.year, W - MARGIN, y, { align: "right" });
      y += 5;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(79, 70, 229);
      doc.text(data.college, MARGIN, y);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(`GPA: ${data.cgpa}`, W - MARGIN, y, { align: "right" });
    }

  } else if (data.templateStyle === "minimal") {
    // ── MINIMAL LAYOUT (Left Aligned whitespace heavy) ──
    const MARGIN = 25;
    const CONTENT_W = W - MARGIN * 2;
    let y = 30;

    // Header (Left aligned)
    doc.setFont("times", "normal"); // serif
    doc.setFontSize(26);
    doc.setTextColor(20, 20, 20);
    const name = data.name || "Your Name";
    doc.text(name, MARGIN, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    const contactLinks = [data.phone, data.email, data.location, data.linkedin].filter(Boolean).join("   •   ");
    doc.text(contactLinks, MARGIN, y);
    y += 15;

    // Summary
    if (data.objective) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(50, 50, 50);
      const lines = doc.splitTextToSize(data.objective, CONTENT_W);
      doc.text(lines, MARGIN, y);
      y += lines.length * 5 + 10;
    }

    const sectionHeader = (title: string, yPos: number) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(title.toUpperCase(), MARGIN, yPos);
      return yPos + 6;
    };

    // Experience
    if (data.company) {
      y = sectionHeader("EXPERIENCE", y);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      doc.text(data.role, MARGIN, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(80, 80, 80);
      doc.text(data.company, MARGIN, y);
      doc.setFontSize(8.5);
      doc.setTextColor(150, 150, 150);
      doc.text(data.duration, W - MARGIN, y, { align: "right" });
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(50, 50, 50);
      const lines = doc.splitTextToSize(`• ${data.work}`, CONTENT_W - 5);
      doc.text(lines, MARGIN + 5, y);
      y += lines.length * 5 + 8;
    }

    // Projects
    if (data.project1_title || data.project2_title) {
      y = sectionHeader("PROJECTS", y);
      
      const drawProj = (title: string, desc: string) => {
        if (!title) return;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(30, 30, 30);
        doc.text(title, MARGIN, y);
        y += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(50, 50, 50);
        const lines = doc.splitTextToSize(desc, CONTENT_W);
        doc.text(lines, MARGIN, y);
        y += lines.length * 5 + 6;
      };

      drawProj(data.project1_title, data.project1_desc);
      drawProj(data.project2_title, data.project2_desc);
      y += 2;
    }

    // Education
    if (data.degree) {
      y = sectionHeader("EDUCATION", y);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      doc.text(data.degree, MARGIN, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(80, 80, 80);
      doc.text(data.college, MARGIN, y);
      doc.setFontSize(8.5);
      doc.setTextColor(150, 150, 150);
      doc.text(data.year, W - MARGIN, y, { align: "right" });
      y += 8;
    }

    // Skills
    if (data.languages || data.web_tech || data.tools) {
      y = sectionHeader("SKILLS", y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(50, 50, 50);
      const skillsTxt = [data.languages, data.web_tech, data.tools].filter(Boolean).join("  •  ");
      const lines = doc.splitTextToSize(skillsTxt, CONTENT_W);
      doc.text(lines, MARGIN, y);
      y += lines.length * 5 + 6;
    }

  } else if (data.templateStyle === "technical") {
    // ── TECHNICAL LAYOUT (Dense Monospace) ──
    const MARGIN = 15;
    const CONTENT_W = W - MARGIN * 2;
    let y = 20;

    doc.setFont("courier", "bold");
    doc.setFontSize(24);
    doc.setTextColor(20, 20, 20);
    const name = data.name || "USER_NAME";
    doc.text(name, MARGIN, y);
    y += 6;

    doc.setFont("courier", "bold");
    doc.setFontSize(10);
    doc.setTextColor(79, 70, 229);
    doc.text(`> ${data.job_title || "ROLE_UNSPECIFIED"}`, MARGIN, y);
    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`${data.email || ""} | ${data.phone || ""} | ${data.github || "github.com"}`, W - MARGIN, y, { align: "right" });
    y += 4;
    doc.setDrawColor(40, 40, 40);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, W - MARGIN, y);
    y += 8;

    const colWidth = (CONTENT_W - 10) / 3;
    const rightX = MARGIN + colWidth * 2 + 10;
    
    // LEFT COL (Summary, Experience, Projects)
    let leftY = y;
    const secHead = (txt: string, xPos: number, yPos: number) => {
      doc.setFont("courier", "bold");
      doc.setFontSize(10);
      doc.setTextColor(20, 20, 20);
      doc.text(`[ ${txt.toUpperCase()} ]`, xPos, yPos);
      return yPos + 6;
    };

    if (data.objective) {
      leftY = secHead("SUMMARY", MARGIN, leftY);
      doc.setFont("courier", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      const lines = doc.splitTextToSize(data.objective, colWidth * 2);
      doc.text(lines, MARGIN, leftY);
      leftY += lines.length * 4 + 6;
    }

    if (data.company) {
      leftY = secHead("EXPERIENCE", MARGIN, leftY);
      doc.setFont("courier", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(30, 30, 30);
      doc.text(data.role, MARGIN, leftY);
      doc.setFont("courier", "normal");
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(data.duration, MARGIN + colWidth * 2, leftY, { align: "right" });
      leftY += 4;
      doc.setFont("courier", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(79, 70, 229);
      doc.text(data.company, MARGIN, leftY);
      leftY += 5;
      doc.setFont("courier", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      const lines = doc.splitTextToSize(`> ${data.work}`, colWidth * 2 - 4);
      doc.text(lines, MARGIN + 4, leftY);
      leftY += lines.length * 4 + 6;
    }

    if (data.project1_title || data.project2_title) {
      leftY = secHead("PROJECTS", MARGIN, leftY);
      const pDraw = (t: string, tech: string, d: string) => {
        if (!t) return;
        doc.setFont("courier", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(30, 30, 30);
        doc.text(t, MARGIN + 2, leftY);
        doc.setFontSize(8);
        doc.setTextColor(79, 70, 229);
        doc.text(tech, MARGIN + colWidth * 2 - 2, leftY, { align: "right" });
        leftY += 4;
        doc.setFont("courier", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(60, 60, 60);
        const lns = doc.splitTextToSize(`> ${d}`, colWidth * 2 - 6);
        doc.text(lns, MARGIN + 4, leftY);
        leftY += lns.length * 4 + 6;
      };
      doc.setDrawColor(220, 220, 220); // soft border
      doc.setLineWidth(0.2);
      doc.rect(MARGIN, leftY - 4, colWidth * 2, 80); // we won't draw rect dynamically accurately, skip it.
      pDraw(data.project1_title, data.project1_tech, data.project1_desc);
      pDraw(data.project2_title, data.project2_tech, data.project2_desc);
    }

    // RIGHT COL (Education, Skills)
    let rightY = y;
    if (data.degree) {
      rightY = secHead("EDUCATION", rightX, rightY);
      doc.setFont("courier", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);
      const degLines = doc.splitTextToSize(data.degree, colWidth);
      doc.text(degLines, rightX, rightY);
      rightY += degLines.length * 4;
      doc.setFont("courier", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(80, 80, 80);
      const colLines = doc.splitTextToSize(data.college, colWidth);
      doc.text(colLines, rightX, rightY);
      rightY += colLines.length * 4;
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(data.year, rightX, rightY);
      rightY += 4;
      doc.setFont("courier", "bold");
      doc.setTextColor(79, 70, 229);
      doc.text(`GPA: ${data.cgpa}`, rightX, rightY);
      rightY += 8;
    }

    if (data.languages || data.web_tech || data.tools) {
      rightY = secHead("SKILLS", rightX, rightY);
      const skDraw = (lbl: string, s: string) => {
        if (!s) return;
        doc.setFont("courier", "bold");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(lbl, rightX, rightY);
        rightY += 4;
        doc.setFont("courier", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(30, 30, 30);
        const lns = doc.splitTextToSize(s, colWidth);
        doc.text(lns, rightX, rightY);
        rightY += lns.length * 4 + 4;
      };
      skDraw("LANGUAGES", data.languages);
      skDraw("FRAMEWORKS", data.web_tech);
      skDraw("TOOLS", data.tools);
    }
    
  } else {
    // ── MODERN LAYOUT (Split Column) ──
    const SIDEBAR_W = W * 0.33;
    const MAIN_X = SIDEBAR_W + 10;
    const RIGHT_CONTENT_W = W - MAIN_X - 10;
    
    // Backgrounds
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, SIDEBAR_W, H, "F");
    
    let ly = 20; // Left Y
    let ry = 25; // Right Y
    const MARGIN_L = 10;

    // Name & Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(20, 20, 20);
    const nameLines = doc.splitTextToSize(data.name?.toUpperCase() || "YOUR NAME", SIDEBAR_W - MARGIN_L * 2);
    doc.text(nameLines, MARGIN_L, ly);
    ly += nameLines.length * 7 + 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(data.job_title?.toUpperCase() || "PROFESSIONAL", MARGIN_L, ly);
    ly += 12;

    const sidebarHeader = (title: string, yPos: number) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(title.toUpperCase(), MARGIN_L, yPos);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(MARGIN_L, yPos + 1.5, SIDEBAR_W - MARGIN_L, yPos + 1.5);
      return yPos + 7;
    };

    // Contact
    ly = sidebarHeader("Contact", ly);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    const contacts = [
      { label: "Phone", val: data.phone },
      { label: "Email", val: data.email },
      { label: "Location", val: data.location },
      { label: "LinkedIn", val: data.linkedin },
      { label: "GitHub", val: data.portfolio }
    ];
    contacts.forEach(c => {
      if (c.val && c.val !== "—" && c.val !== "") {
        doc.setFont("helvetica", "bold");
        doc.text(c.label, MARGIN_L, ly);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(c.val, SIDEBAR_W - MARGIN_L * 2);
        doc.text(lines, MARGIN_L, ly + 4);
        ly += 4 + lines.length * 4;
      }
    });
    ly += 5;

    // Education
    ly = sidebarHeader("Education", ly);
    if (data.degree) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(40, 40, 40);
      const degLines = doc.splitTextToSize(data.degree, SIDEBAR_W - MARGIN_L * 2);
      doc.text(degLines, MARGIN_L, ly);
      ly += degLines.length * 4;
      
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text(data.college || "", MARGIN_L, ly);
      ly += 4;
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(79, 70, 229);
      doc.text(`${data.year || ""} | GPA: ${data.cgpa || ""}`, MARGIN_L, ly);
      ly += 10;
    }

    // Skills
    ly = sidebarHeader("Skills", ly);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    [data.languages, data.web_tech, data.tools].forEach(s => {
      if (s && s !== "—" && s !== "") {
        const sLines = doc.splitTextToSize(`• ${s}`, SIDEBAR_W - MARGIN_L * 2);
        doc.text(sLines, MARGIN_L, ly);
        ly += sLines.length * 4 + 1;
      }
    });
    ly += 5;

    // Languages
    if (data.spoken_languages) {
      ly = sidebarHeader("Languages", ly);
      doc.setFont("helvetica", "italic");
      doc.text(data.spoken_languages, MARGIN_L, ly);
    }

    // ── RIGHT MAIN CONTENT ─────────────────────────────────────────────────────
    const mainHeader = (title: string, yPos: number) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text(title.toUpperCase(), MAIN_X, yPos);
      doc.setDrawColor(20, 20, 20);
      doc.setLineWidth(0.5);
      doc.line(MAIN_X, yPos + 2, W - 10, yPos + 2);
      return yPos + 10;
    };

    // Profile
    ry = mainHeader("Profile", ry);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const objLines = doc.splitTextToSize(data.objective || "", RIGHT_CONTENT_W);
    doc.text(objLines, MAIN_X, ry);
    ry += objLines.length * 5 + 10;

    // Experience (Timeline)
    if (data.company) {
      ry = mainHeader("Work Experience", ry);
      // Timeline Line
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.3);
      doc.line(MAIN_X + 2, ry, MAIN_X + 2, ry + 25);
      
      // Dot
      doc.setFillColor(20, 20, 20);
      doc.circle(MAIN_X + 2, ry + 1, 1, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.text(data.role?.toUpperCase() || "", MAIN_X + 6, ry + 2);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(data.duration || "", W - 10, ry + 2, { align: "right" });
      ry += 6;

      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 100, 100);
      doc.text(data.company || "", MAIN_X + 6, ry);
      ry += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const expLines = doc.splitTextToSize(`• ${data.work || ""}`, RIGHT_CONTENT_W - 6);
      doc.text(expLines, MAIN_X + 6, ry);
      ry += expLines.length * 5 + 12;
    }

    // Projects
    ry = mainHeader("Projects", ry);
    const drawProj = (title: string, tech: string, desc: string) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.text(title.toUpperCase(), MAIN_X, ry);
      doc.setFontSize(8);
      doc.setTextColor(79, 70, 229);
      doc.text(tech, W - 10, ry, { align: "right" });
      ry += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(80, 80, 80);
      const lines = doc.splitTextToSize(`• ${desc}`, RIGHT_CONTENT_W);
      doc.text(lines, MAIN_X, ry);
      ry += lines.length * 4.5 + 6;
    };

    if (data.project1_title) drawProj(data.project1_title, data.project1_tech || "", data.project1_desc || "");
    if (data.project2_title) drawProj(data.project2_title, data.project2_tech || "", data.project2_desc || "");
    ry += 4;

    // References
    if (data.ref1_name) {
      ry = mainHeader("References", ry);
      const refW = RIGHT_CONTENT_W / 2 - 5;
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(40, 40, 40);
      doc.text(data.ref1_name.toUpperCase(), MAIN_X, ry);
      if (data.ref2_name) doc.text(data.ref2_name.toUpperCase(), MAIN_X + refW + 10, ry);
      ry += 4;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      doc.text(data.ref1_role || "", MAIN_X, ry);
      if (data.ref2_role) doc.text(data.ref2_role || "", MAIN_X + refW + 10, ry);
      ry += 4;

      doc.setFont("helvetica", "bold");
      doc.setTextColor(79, 70, 229);
      doc.text(data.ref1_contact || "", MAIN_X, ry);
      if (data.ref2_contact) doc.text(data.ref2_contact || "", MAIN_X + refW + 10, ry);
    }
  }

  doc.save(`Resume_${(data.name || "Alex_Johnson").replace(/\s+/g, "_")}.pdf`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. STUDENT ANALYTICS PDF
// ─────────────────────────────────────────────────────────────────────────────

export function exportAnalyticsPDF(
  students: StudentAnalyticsRow[],
  stats: { totalStudents: number; placementRate: number }
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const MARGIN = 14;
  const now = new Date();

  // ── Header ──────────────────────────────────────────────────────────────────
  drawHeader(
    doc,
    "Campus Placement — Student Analytics Report",
    `Generated: ${now.toLocaleString("en-IN")}  •  Academic Year ${now.getFullYear()}-${now.getFullYear() + 1}`
  );

  let y = 52;

  // ── Summary Cards ───────────────────────────────────────────────────────────
  const placedCount = students.filter((s) => s.selected > 0).length;
  const excellentCount = students.filter((s) => s.performance === "Excellent").length;
  const avgCgpa =
    students.filter((s) => +s.cgpa > 0).reduce((sum, s) => sum + +s.cgpa, 0) /
      (students.filter((s) => +s.cgpa > 0).length || 1);

  const summaryCards = [
    { label: "Total Students", value: String(stats.totalStudents || students.length), color: [79, 70, 229] },
    { label: "Placement Rate", value: `${stats.placementRate?.toFixed(1) ?? ((placedCount / (students.length || 1)) * 100).toFixed(1)}%`, color: [16, 185, 129] },
    { label: "Placed Students", value: String(placedCount), color: [245, 158, 11] },
    { label: "Excellent Performers", value: String(excellentCount), color: [236, 72, 153] },
    { label: "Average CGPA", value: isNaN(avgCgpa) ? "N/A" : avgCgpa.toFixed(2), color: [59, 130, 246] },
  ];

  const cardW = (W - MARGIN * 2 - 8 * (summaryCards.length - 1)) / summaryCards.length;
  summaryCards.forEach((card, i) => {
    const cx = MARGIN + i * (cardW + 8);
    doc.setFillColor(card.color[0], card.color[1], card.color[2]);
    doc.roundedRect(cx, y, cardW, 22, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(card.value, cx + cardW / 2, y + 12, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(220, 220, 255);
    doc.text(card.label.toUpperCase(), cx + cardW / 2, y + 19, { align: "center" });
  });

  y += 30;

  // ── Performance Distribution Bar ────────────────────────────────────────────
  const perfGroups = {
    Excellent: students.filter((s) => s.performance === "Excellent").length,
    Good: students.filter((s) => s.performance === "Good").length,
    Average: students.filter((s) => s.performance === "Average").length,
    "Needs Improvement": students.filter((s) => s.performance === "Needs Improvement").length,
  };
  const total = students.length || 1;
  const perfColors: Record<string, [number, number, number]> = {
    Excellent: [16, 185, 129],
    Good: [79, 70, 229],
    Average: [245, 158, 11],
    "Needs Improvement": [239, 68, 68],
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 90);
  doc.text("PERFORMANCE DISTRIBUTION", MARGIN, y);
  y += 5;

  const barTotalW = W - MARGIN * 2;
  let bx = MARGIN;
  Object.entries(perfGroups).forEach(([label, count]) => {
    const segW = (count / total) * barTotalW;
    if (segW < 1) return;
    const [r, g, b] = perfColors[label];
    doc.setFillColor(r, g, b);
    doc.rect(bx, y, segW, 7, "F");
    bx += segW;
  });
  y += 9;

  // Legend
  let lx = MARGIN;
  Object.entries(perfGroups).forEach(([label, count]) => {
    const [r, g, b] = perfColors[label];
    doc.setFillColor(r, g, b);
    doc.rect(lx, y, 4, 4, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(60, 60, 70);
    doc.text(`${label}: ${count} (${((count / total) * 100).toFixed(0)}%)`, lx + 6, y + 3.5);
    lx += doc.getTextWidth(`${label}: ${count} (${((count / total) * 100).toFixed(0)}%)`) + 12;
  });

  y += 10;

  // ── Table ───────────────────────────────────────────────────────────────────
  const performanceColor = (p: string): [number, number, number] => {
    if (p === "Excellent") return [16, 185, 129];
    if (p === "Good") return [79, 70, 229];
    if (p === "Needs Improvement") return [239, 68, 68];
    return [245, 158, 11];
  };

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["#", "Name", "Department", "College", "Yr", "CGPA", "Apps", "Interviews", "Selected", "Performance", "Joined"]],
    body: students.map((s, i) => [
      i + 1,
      s.name,
      s.department,
      s.college,
      s.year,
      s.cgpa,
      s.applications,
      s.interviews,
      s.selected,
      s.performance,
      s.joinedAt,
    ]),
    headStyles: {
      fillColor: [BRAND.r, BRAND.g, BRAND.b],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: { fillColor: [248, 247, 255] },
    bodyStyles: { fontSize: 8, textColor: [40, 40, 50] },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },
      4: { halign: "center", cellWidth: 10 },
      5: { halign: "center", cellWidth: 14 },
      6: { halign: "center", cellWidth: 12 },
      7: { halign: "center", cellWidth: 18 },
      8: { halign: "center", cellWidth: 16 },
      9: { halign: "center", cellWidth: 30 },
      10: { halign: "center", cellWidth: 20 },
    },
    didDrawCell: (data) => {
      // Colour-code the performance column
      if (data.column.index === 9 && data.section === "body") {
        const perf = String(data.cell.raw);
        const [r, g, b] = performanceColor(perf);
        doc.setFillColor(r, g, b);
        const pad = 2;
        const bw = data.cell.width - pad * 2;
        const bh = data.cell.height - pad * 2;
        doc.roundedRect(data.cell.x + pad, data.cell.y + pad, bw, bh, 2, 2, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(255, 255, 255);
        doc.text(perf, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, {
          align: "center",
        });
      }
    },
  });

  // ── Insights Section ─────────────────────────────────────────────────────────
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  if (finalY < doc.internal.pageSize.getHeight() - 40) {
    doc.setPage(doc.getNumberOfPages());
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
    doc.text("KEY INSIGHTS", MARGIN, finalY);

    const insights = [
      `• ${placedCount} out of ${students.length} students have received placement offers (${((placedCount / total) * 100).toFixed(1)}% rate).`,
      `• Average CGPA across all students: ${isNaN(avgCgpa) ? "N/A" : avgCgpa.toFixed(2)}.`,
      `• ${excellentCount} students classified as Excellent performers based on CGPA ≥ 8.5 and at least one offer.`,
      `• Total applications submitted: ${students.reduce((s, r) => s + r.applications, 0)}.`,
      `• Total interviews conducted: ${students.reduce((s, r) => s + r.interviews, 0)}.`,
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(55, 55, 65);
    let iy = finalY + 7;
    insights.forEach((ins) => {
      doc.text(ins, MARGIN, iy);
      iy += 6;
    });
  }

  addFooter(doc, `Campus Placement System — Confidential Report — ${now.toLocaleDateString("en-IN")}`);
  doc.save(`Student_Analytics_Report_${now.toISOString().slice(0, 10)}.pdf`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. STUDENT ANALYTICS CSV
// ─────────────────────────────────────────────────────────────────────────────

export function exportAnalyticsCSV(students: StudentAnalyticsRow[]) {
  const headers = [
    "Name",
    "Email",
    "Department",
    "College",
    "Year",
    "CGPA",
    "Skills",
    "Applications",
    "Interviews",
    "Selected",
    "Performance",
    "Joined At",
  ];

  const escape = (val: string | number) => {
    const s = String(val ?? "");
    // Wrap in quotes if it contains commas, quotes, or newlines
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = students.map((s) =>
    [
      s.name,
      s.email,
      s.department,
      s.college,
      s.year,
      s.cgpa,
      s.skills,
      s.applications,
      s.interviews,
      s.selected,
      s.performance,
      s.joinedAt,
    ]
      .map(escape)
      .join(",")
  );

  // BOM for Excel to detect UTF-8
  const csv = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `Student_Analytics_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
