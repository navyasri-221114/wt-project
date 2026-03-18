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

/** Indigo brand colour used as accent throughout PDFs */
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
    doc.setFillColor(237, 233, 254); // light indigo
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

export function exportResumePDF(data: ResumeData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const MARGIN = 14;
  const CONTENT_W = W - MARGIN * 2;

  // ── Header ──────────────────────────────────────────────────────────────────
  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.rect(0, 0, W, 52, "F");

  // Decorative circles
  doc.setFillColor(255, 255, 255);
  doc.setGState(new (doc as any).GState({ opacity: 0.06 }));
  doc.circle(W - 20, -5, 42, "F");
  doc.circle(W - 8, 36, 26, "F");
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(data.name || "Your Name", MARGIN, 22);

  // Contact line
  const contactParts = [data.email, data.phone, data.linkedin, data.github].filter(Boolean);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(210, 210, 245);
  doc.text(contactParts.join("  •  "), MARGIN, 33);

  // Objective teaser inside header
  if (data.objective) {
    const objLines = doc.splitTextToSize(data.objective, CONTENT_W);
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 240);
    doc.text(objLines.slice(0, 2).join(" "), MARGIN, 43, { maxWidth: CONTENT_W });
  }

  doc.setTextColor(30, 30, 30);
  let y = 60;

  // ── Professional Summary ──────────────────────────────────────────────────
  if (data.objective) {
    sectionTitle(doc, "Professional Summary", y, W);
    y += 5;
    y = richText(doc, data.objective, MARGIN, y, CONTENT_W) + 4;
  }

  // ── Education ────────────────────────────────────────────────────────────
  if (data.education) {
    sectionTitle(doc, "Education", y, W);
    y += 5;
    y = richText(doc, data.education, MARGIN, y, CONTENT_W) + 4;
  }

  // ── Experience / Internships ──────────────────────────────────────────────
  if (data.internships) {
    sectionTitle(doc, "Experience & Internships", y, W);
    y += 5;
    const items = data.internships.split("\n").filter(Boolean);
    items.forEach((item) => {
      // Bullet point
      doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
      doc.circle(MARGIN + 1, y - 1.5, 1, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const ll = doc.splitTextToSize(item.trim(), CONTENT_W - 6);
      doc.text(ll, MARGIN + 5, y);
      y += ll.length * 5.5;
    });
    y += 4;
  }

  // ── Projects ─────────────────────────────────────────────────────────────
  if (data.projects) {
    if (y > 230) { doc.addPage(); y = 20; }
    sectionTitle(doc, "Projects", y, W);
    y += 5;
    const items = data.projects.split("\n").filter(Boolean);
    items.forEach((item) => {
      doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
      doc.circle(MARGIN + 1, y - 1.5, 1, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const ll = doc.splitTextToSize(item.trim(), CONTENT_W - 6);
      doc.text(ll, MARGIN + 5, y);
      y += ll.length * 5.5;
    });
    y += 4;
  }

  // ── Two-column: Technical + Soft Skills ──────────────────────────────────
  if (data.technicalSkills || data.softSkills) {
    if (y > 220) { doc.addPage(); y = 20; }
    sectionTitle(doc, "Skills", y, W);
    y += 5;
    const halfW = (CONTENT_W - 8) / 2;

    if (data.technicalSkills) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 90);
      doc.text("TECHNICAL", MARGIN, y);
      y += 4;
      skillBadges(doc, data.technicalSkills, MARGIN, y, halfW);
    }
    if (data.softSkills) {
      const rx = MARGIN + halfW + 8;
      const ry = y - 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 90);
      doc.text("SOFT SKILLS", rx, ry);
      skillBadges(doc, data.softSkills, rx, ry + 4, halfW);
    }
    y += 20;
  }

  // ── Certifications ───────────────────────────────────────────────────────
  if (data.certifications) {
    if (y > 230) { doc.addPage(); y = 20; }
    sectionTitle(doc, "Certifications", y, W);
    y += 5;
    y = richText(doc, data.certifications, MARGIN, y, CONTENT_W) + 4;
  }

  // ── Achievements ─────────────────────────────────────────────────────────
  if (data.achievements) {
    if (y > 230) { doc.addPage(); y = 20; }
    sectionTitle(doc, "Achievements", y, W);
    y += 5;
    y = richText(doc, data.achievements, MARGIN, y, CONTENT_W) + 4;
  }

  // ── Languages ────────────────────────────────────────────────────────────
  if (data.languages) {
    if (y > 240) { doc.addPage(); y = 20; }
    sectionTitle(doc, "Languages", y, W);
    y += 5;
    y = richText(doc, data.languages, MARGIN, y, CONTENT_W) + 4;
  }

  // ── Declaration ──────────────────────────────────────────────────────────
  if (data.declaration) {
    if (y > 240) { doc.addPage(); y = 20; }
    y += 2;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(110, 110, 120);
    const dl = doc.splitTextToSize(data.declaration, CONTENT_W);
    doc.text(dl, MARGIN, y);
    y += dl.length * 5 + 6;
    // Signature line
    doc.setDrawColor(180, 180, 190);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, MARGIN + 45, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(130, 130, 140);
    doc.text("Signature", MARGIN, y + 4);
  }

  addFooter(doc, `Resume — ${data.name} — Generated on ${new Date().toLocaleDateString("en-IN")}`);
  doc.save(`Resume_${(data.name || "export").replace(/\s+/g, "_")}.pdf`);
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
