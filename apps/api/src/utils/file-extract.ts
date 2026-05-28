/**
 * Extract text content from uploaded file buffer based on MIME type.
 * Does not throw on failure — returns empty string instead.
 */
export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  try {
    if (mimeType === 'text/plain') {
      return buffer.toString('utf-8');
    }

    if (mimeType === 'application/pdf') {
      // pdf-parse is CJS - use dynamic require
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>;
      const result = await pdfParse(buffer);
      return result.text || '';
    }

    // image/png, image/jpeg — no OCR yet
    return '';
  } catch (err) {
    console.warn('⚠️ Text extraction failed:', err instanceof Error ? err.message : err);
    return '';
  }
}
