import { allCourses } from "../data";

function escapedHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
}

function contentToHtml(content: string): string {
  const blocks = content.trim().split(/\n\n+/);
  let html = "";
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    const lines = trimmed.split("\n").filter(l => l.trim());
    if (lines.every(l => /^[-•]/.test(l.trim()))) {
      html += "<ul>" + lines.map(l => `<li>${escapedHtml(l.replace(/^[-•]\s*/, ""))}</li>`).join("") + "</ul>";
    } else if (lines.every(l => /^\d+\./.test(l.trim()))) {
      html += "<ol>" + lines.map(l => `<li>${escapedHtml(l.replace(/^\d+\.\s*/, ""))}</li>`).join("") + "</ol>";
    } else if (trimmed.includes("|") && trimmed.includes("---")) {
      const tableLines = trimmed.split("\n").filter(l => l.trim());
      const headers = tableLines[0].split("|").map(h => h.trim()).filter(Boolean);
      const rows = tableLines.slice(2).map(row => row.split("|").map(c => c.trim()).filter(Boolean));
      html += `<table border="1" style="border-collapse:collapse;width:100%;margin:8pt 0;font-size:10pt">
        <thead><tr>${headers.map(h => `<th style="background:#f0f0f0;padding:4pt 6pt;text-align:left">${escapedHtml(h)}</th>`).join("")}</tr></thead>
        <tbody>${rows.map(row => `<tr>${row.map(c => `<td style="padding:4pt 6pt">${escapedHtml(c)}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>`;
    } else {
      html += `<p>${escapedHtml(trimmed.replace(/\n/g, " "))}</p>`;
    }
  }
  return html;
}

export function generateDocHtml(courseCode?: string): string {
  const courses = courseCode
    ? allCourses.filter(c => c.code === courseCode)
    : allCourses;

  const style = `
    body { font-family: "Times New Roman", Times, serif; font-size: 12pt; color: #000; margin: 0; padding: 0; }
    h1.doc-title { font-size: 22pt; font-weight: bold; text-align: center; margin: 40pt 0 6pt; }
    h2.course-title { font-size: 18pt; font-weight: bold; margin: 36pt 0 4pt; border-bottom: 2pt solid #000; padding-bottom: 4pt; page-break-before: always; }
    h3.chapter-title { font-size: 15pt; font-weight: bold; margin: 24pt 0 8pt; page-break-before: always; }
    h4.section-heading { font-size: 13pt; font-weight: bold; margin: 16pt 0 6pt; }
    p { margin: 6pt 0; line-height: 1.7; text-align: justify; }
    ul, ol { margin: 6pt 0 6pt 20pt; }
    li { margin: 3pt 0; line-height: 1.6; }
    .summary-box { border-left: 3pt solid #555; padding: 8pt 12pt; background: #f9f9f9; margin: 12pt 0; }
    .key-terms table { width: 100%; border-collapse: collapse; margin: 10pt 0; font-size: 11pt; }
    .key-terms td { border: 1pt solid #ccc; padding: 5pt 8pt; vertical-align: top; }
    .key-terms td:first-child { font-weight: bold; width: 28%; background: #f5f5f5; }
    .practice-q { margin: 8pt 0; padding: 6pt 10pt; border: 1pt solid #ccc; }
    .course-meta { color: #444; font-size: 11pt; margin: 4pt 0 16pt; }
    .objectives ol { margin-left: 18pt; }
    .objectives li { margin: 5pt 0; }
    .doc-header { text-align: center; border-bottom: 3pt solid #000; padding-bottom: 16pt; margin-bottom: 30pt; }
    .preface p { font-size: 11pt; }
  `;

  let body = `
    <div class="doc-header">
      <h1 class="doc-title" style="page-break-before:avoid">JUPEB Christian Religious Studies</h1>
      <p style="font-size:13pt;margin:4pt 0">CRS 001 · CRS 002 · CRS 003 · CRS 004</p>
      <p style="font-size:11pt;color:#555;margin:4pt 0">University of Lagos · School of Foundation Studies</p>
      <p style="font-size:10pt;color:#777;margin:4pt 0">Compiled from official JUPEB/UNILAG lecture notes · Dr. Falako, Francis O.</p>
    </div>
  `;

  if (!courseCode) {
    body += `
      <div class="preface">
        <h3 style="font-size:13pt;text-transform:uppercase;letter-spacing:2pt">Preface</h3>
        <p>This document contains the complete four-course JUPEB Christian Religious Studies curriculum, compiled from the official University of Lagos School of Foundation Studies lecture notes. It covers CRS 001 (Old Testament Studies) and CRS 002 (New Testament Studies: The Gospels) in the first semester, and CRS 003 (History of Christianity in West Africa) and CRS 004 (Religion and Society) in the second semester — totalling 12 credit units.</p>
        <p>Each chapter contains full expository content, in-text definitions, key terms, and practice questions drawn from examination topics.</p>
      </div>
    `;
  }

  for (const course of courses) {
    body += `
      <h2 class="course-title">${course.code}: ${course.title}</h2>
      <p class="course-meta">${course.semester} | ${course.units} Credit Units</p>
      <p>${escapedHtml(course.description)}</p>
      <div class="objectives">
        <h4 style="font-size:12pt;font-weight:bold;margin:14pt 0 6pt;text-transform:uppercase;font-size:11pt;letter-spacing:1pt">Specific Objectives</h4>
        <p style="font-style:italic;font-size:11pt">At the end of this course, candidates should be able to:</p>
        <ol>${course.objectives.map(o => `<li>${escapedHtml(o)}</li>`).join("")}</ol>
      </div>
    `;

    for (const chapter of course.chapters) {
      body += `
        <h3 class="chapter-title">Chapter ${chapter.number}: ${escapedHtml(chapter.title)}</h3>
      `;

      for (const section of chapter.sections) {
        body += `
          <h4 class="section-heading">${escapedHtml(section.heading)}</h4>
          ${contentToHtml(section.content)}
        `;
      }

      body += `
        <div class="summary-box">
          <p style="font-size:10pt;font-weight:bold;text-transform:uppercase;letter-spacing:1pt;margin-bottom:4pt">Chapter Summary</p>
          <p>${escapedHtml(chapter.summary)}</p>
        </div>

        <div class="key-terms">
          <p style="font-size:10pt;font-weight:bold;text-transform:uppercase;letter-spacing:1pt;margin:14pt 0 4pt">Key Terms &amp; Definitions</p>
          <table>
            <tbody>
              ${chapter.keyTerms.map(kt => `
                <tr>
                  <td>${escapedHtml(kt.term)}</td>
                  <td>${escapedHtml(kt.definition)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div>
          <p style="font-size:10pt;font-weight:bold;text-transform:uppercase;letter-spacing:1pt;margin:14pt 0 6pt">Practice &amp; Examination Questions</p>
          ${chapter.practiceQuestions.map((q, i) => `
            <div class="practice-q">
              <p><strong>${i + 1}.</strong> ${escapedHtml(q)}</p>
            </div>
          `).join("")}
        </div>
      `;
    }
  }

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <meta name=ProgId content=Word.Document>
  <meta name=Generator content="Microsoft Word 15">
  <meta name=Originator content="Microsoft Word 15">
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    ${style}
    @page { margin: 2.5cm; size: A4; }
    @media print { .chapter-title { page-break-before: always; } }
  </style>
  <title>JUPEB Christian Religious Studies</title>
</head>
<body>
  ${body}
</body>
</html>`;
}

export function downloadCourseDoc(courseCode?: string) {
  const filename = courseCode
    ? `JUPEB_${courseCode.replace(" ", "_")}.doc`
    : "JUPEB_CRS_Complete_Textbook.doc";

  const html = generateDocHtml(courseCode);
  const blob = new Blob(["\ufeff", html], {
    type: "application/msword",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
