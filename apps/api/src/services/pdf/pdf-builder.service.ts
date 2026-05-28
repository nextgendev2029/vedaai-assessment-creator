import PDFDocument from 'pdfkit';
import type { IGeneratedPaper } from '../../models/generated-paper.model';

/* ─── Constants ───────────────────────────────────────────────────────────── */

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Easy',
  medium: 'Moderate',
  hard: 'Hard',
};

const MARGIN = 50;
const FOOTER_SPACE = 30;

/**
 * Build a professional exam-paper PDF from a GeneratedPaper document.
 * Returns a Buffer containing the PDF data.
 */
export function buildPaperPdf(paper: IGeneratedPaper): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
      info: {
        Title: `${paper.subject} - ${paper.topic}`,
        Author: 'VedaAI Assessment Creator',
        Subject: paper.subject,
      },
    });

    const contentWidth = doc.page.width - MARGIN * 2;
    const bottomLimit = doc.page.height - MARGIN - FOOTER_SPACE;
    let pageNum = 1;

    doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    /* ─── Helpers ──────────────────────────────────────────────────────── */

    function addFooter() {
      doc.save();
      doc.font('Helvetica').fontSize(8).fillColor('#999999');
      doc.text(`Page ${pageNum}`, MARGIN, doc.page.height - MARGIN - 10, {
        width: contentWidth,
        align: 'center',
      });
      doc.restore();
    }

    function ensureSpace(needed: number) {
      if (doc.y + needed > bottomLimit) {
        addFooter();
        doc.addPage();
        pageNum++;
      }
    }

    function hr() {
      doc.save();
      doc.strokeColor('#cccccc').lineWidth(0.5);
      doc.moveTo(MARGIN, doc.y).lineTo(MARGIN + contentWidth, doc.y).stroke();
      doc.restore();
      doc.y += 8;
    }

    /** Write text at margin with full content width. Always resets x to margin. */
    function writeText(
      text: string,
      opts: {
        font?: string;
        size?: number;
        color?: string;
        align?: 'left' | 'center' | 'right';
        indent?: number;
        lineGap?: number;
      } = {},
    ) {
      const {
        font = 'Helvetica',
        size = 10,
        color = '#333333',
        align = 'left',
        indent = 0,
        lineGap = 2,
      } = opts;

      doc.font(font).fontSize(size).fillColor(color);
      doc.text(text, MARGIN + indent, doc.y, {
        width: contentWidth - indent,
        align,
        lineGap,
      });
    }

    /* ═══ HEADER ═══════════════════════════════════════════════════════════ */

    writeText(paper.schoolName || 'Delhi Public School, Sector-4, Bokaro', {
      font: 'Helvetica-Bold', size: 14, color: '#1a1a1a', align: 'center',
    });
    doc.moveDown(0.3);

    writeText(`${paper.subject} — ${paper.className}`, {
      size: 11, color: '#333333', align: 'center',
    });
    doc.moveDown(0.2);

    writeText(`Topic: ${paper.topic}`, {
      size: 10, color: '#555555', align: 'center',
    });
    doc.moveDown(0.6);

    hr();

    /* ═══ TIME / MARKS ROW ═════════════════════════════════════════════════ */

    const rowY = doc.y;
    doc.font('Helvetica').fontSize(10).fillColor('#333333');
    doc.text(`Time Allowed: ${paper.durationMinutes} minutes`, MARGIN, rowY, {
      width: contentWidth / 2,
      align: 'left',
    });
    doc.text(`Maximum Marks: ${paper.maxMarks}`, MARGIN + contentWidth / 2, rowY, {
      width: contentWidth / 2,
      align: 'right',
    });
    doc.y = rowY + 16;
    doc.moveDown(0.4);

    hr();

    /* ═══ GENERAL INSTRUCTIONS ═════════════════════════════════════════════ */

    writeText('General Instructions:', {
      font: 'Helvetica-Bold', size: 9, color: '#333333',
    });
    doc.moveDown(0.2);

    writeText(paper.instructions || 'All questions are compulsory unless stated otherwise.', {
      size: 9, color: '#555555',
    });
    doc.moveDown(0.5);

    hr();

    /* ═══ STUDENT INFO ═════════════════════════════════════════════════════ */

    writeText('Name: ________________________________________          Roll No: __________________', {
      size: 9,
    });
    doc.moveDown(0.3);

    writeText(`Class: ${paper.className}          Section: __________________`, {
      size: 9,
    });
    doc.moveDown(0.5);

    hr();
    doc.moveDown(0.3);

    /* ═══ SECTIONS ═════════════════════════════════════════════════════════ */

    let globalQ = 1;

    for (const section of paper.sections) {
      ensureSpace(50);

      // Section title (centered, bold)
      writeText(section.title, {
        font: 'Helvetica-Bold', size: 11, color: '#1a1a1a', align: 'center',
      });
      doc.moveDown(0.15);

      // Section instruction (centered, italic-style)
      writeText(section.instruction, {
        size: 8, color: '#777777', align: 'center',
      });
      doc.moveDown(0.5);

      // Questions
      for (const q of section.questions) {
        const diffLabel = DIFFICULTY_LABELS[q.difficulty] || q.difficulty;
        const marksLabel = q.marks === 1 ? '1 Mark' : `${q.marks} Marks`;

        // Build single full-width line: "1. Question text [Easy] [1 Mark]"
        const questionLine = `${globalQ}. ${q.text}    [${diffLabel}] [${marksLabel}]`;

        // Estimate height: ~15px per line, assume ~80 chars per line at font 10
        const estimatedLines = Math.ceil(questionLine.length / 80) + 1;
        const estimatedHeight = estimatedLines * 14 + (q.type === 'mcq' ? 60 : 0);
        ensureSpace(estimatedHeight);

        // Render question as one full-width paragraph
        writeText(questionLine, {
          size: 10, color: '#222222', lineGap: 3,
        });
        doc.moveDown(0.2);

        // MCQ options — indented, full width
        if (q.type === 'mcq' && q.options && q.options.length > 0) {
          for (let i = 0; i < q.options.length; i++) {
            const optLine = `(${String.fromCharCode(65 + i)}) ${q.options[i]}`;
            writeText(optLine, {
              size: 9, color: '#555555', indent: 24, lineGap: 2,
            });
          }
          doc.moveDown(0.2);
        }

        doc.moveDown(0.4);
        globalQ++;
      }

      doc.moveDown(0.3);
    }

    /* ═══ END OF PAPER ═════════════════════════════════════════════════════ */

    ensureSpace(30);
    doc.moveDown(0.5);
    writeText('— End of Question Paper —', {
      font: 'Helvetica-Bold', size: 9, color: '#999999', align: 'center',
    });

    /* ═══ ANSWER KEY ═══════════════════════════════════════════════════════ */

    if (paper.answerKey && paper.answerKey.length > 0) {
      addFooter();
      doc.addPage();
      pageNum++;

      writeText('Answer Key', {
        font: 'Helvetica-Bold', size: 13, color: '#1a1a1a', align: 'center',
      });
      doc.moveDown(0.6);

      hr();
      doc.moveDown(0.3);

      for (let i = 0; i < paper.answerKey.length; i++) {
        const entry = paper.answerKey[i];
        ensureSpace(25);

        writeText(`${entry.questionId}. ${entry.answer}`, {
          font: 'Helvetica', size: 9.5, color: '#444444', lineGap: 2,
        });
        doc.moveDown(0.3);
      }
    }

    /* ═══ FINAL FOOTER + CLOSE ═════════════════════════════════════════════ */

    addFooter();
    doc.end();
  });
}
