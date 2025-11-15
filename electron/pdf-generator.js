import puppeteer from 'puppeteer';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

class PDFGenerator {
  constructor(database) {
    this.database = database;
  }

  async generateBookPDF(bookId) {
    try {
      const book = this.database.getBookById(bookId);
      if (!book) {
        throw new Error('Book not found');
      }

      const chapters = this.database.getChaptersByBookId(bookId);
      if (chapters.length === 0) {
        throw new Error('No chapters to generate PDF from');
      }

      // Generate HTML content
      const html = this.generateHTML(book, chapters);

      // Launch puppeteer
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Generate PDF
      const downloadsPath = app.getPath('downloads');
      const filename = `${book.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
      const pdfPath = path.join(downloadsPath, filename);

      await page.pdf({
        path: pdfPath,
        format: 'Letter',
        margin: {
          top: '1in',
          right: '1in',
          bottom: '1in',
          left: '1in',
        },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: `
          <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
            <span class="pageNumber"></span> / <span class="totalPages"></span>
          </div>
        `,
      });

      await browser.close();

      return {
        success: true,
        path: pdfPath,
        filename,
      };
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }

  generateHTML(book, chapters) {
    const now = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Generate table of contents
    const toc = chapters
      .map((chapter) => {
        return `<div class="toc-item">
          <span class="toc-title">Chapter ${chapter.chapter_number}: ${chapter.title}</span>
        </div>`;
      })
      .join('\n');

    // Generate chapters content
    const chaptersHTML = chapters
      .map((chapter) => {
        return `
        <div class="chapter-page">
          <h1 class="chapter-title">Chapter ${chapter.chapter_number}</h1>
          <h2 class="chapter-subtitle">${chapter.title}</h2>
          <div class="chapter-content">
            ${chapter.content || '<p>No content available.</p>'}
          </div>
        </div>
      `;
      })
      .join('\n');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${book.title}</title>
  <style>
    @page {
      size: Letter;
      margin: 1in;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #333;
    }

    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      page-break-after: always;
    }

    .book-title {
      font-size: 48pt;
      font-weight: bold;
      margin-bottom: 0.5in;
      font-family: 'Helvetica Neue', Arial, sans-serif;
    }

    .book-author {
      font-size: 24pt;
      color: #666;
      margin-bottom: 0.25in;
    }

    .book-date {
      font-size: 14pt;
      color: #999;
    }

    .toc-page {
      page-break-after: always;
      padding-top: 0.5in;
    }

    .toc-title {
      font-size: 24pt;
      font-weight: bold;
      margin-bottom: 0.5in;
      font-family: 'Helvetica Neue', Arial, sans-serif;
    }

    .toc-item {
      margin-bottom: 0.25in;
      padding-bottom: 0.1in;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
    }

    .chapter-page {
      page-break-before: always;
      padding-top: 0.5in;
    }

    .chapter-page:first-of-type {
      page-break-before: auto;
    }

    .chapter-title {
      font-size: 14pt;
      color: #666;
      margin-bottom: 0.1in;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-weight: normal;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .chapter-subtitle {
      font-size: 32pt;
      font-weight: bold;
      margin-bottom: 0.5in;
      font-family: 'Helvetica Neue', Arial, sans-serif;
    }

    .chapter-content {
      text-align: justify;
    }

    .chapter-content h1,
    .chapter-content h2,
    .chapter-content h3 {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      margin-top: 0.3in;
      margin-bottom: 0.2in;
      page-break-after: avoid;
    }

    .chapter-content h1 {
      font-size: 18pt;
    }

    .chapter-content h2 {
      font-size: 16pt;
    }

    .chapter-content h3 {
      font-size: 14pt;
    }

    .chapter-content p {
      margin-bottom: 0.15in;
      text-indent: 0.25in;
      orphans: 3;
      widows: 3;
    }

    .chapter-content p:first-of-type {
      text-indent: 0;
    }

    .chapter-content ul,
    .chapter-content ol {
      margin-left: 0.5in;
      margin-bottom: 0.15in;
    }

    .chapter-content li {
      margin-bottom: 0.1in;
    }

    .chapter-content strong {
      font-weight: bold;
    }

    .chapter-content em {
      font-style: italic;
    }

    .chapter-content blockquote {
      margin: 0.25in 0.5in;
      padding-left: 0.25in;
      border-left: 3px solid #ddd;
      font-style: italic;
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover-page">
    <h1 class="book-title">${book.title}</h1>
    ${book.author ? `<p class="book-author">${book.author}</p>` : ''}
    <p class="book-date">${now}</p>
  </div>

  <!-- Table of Contents -->
  <div class="toc-page">
    <h2 class="toc-title">Table of Contents</h2>
    ${toc}
  </div>

  <!-- Chapters -->
  ${chaptersHTML}
</body>
</html>
    `;
  }
}

export default PDFGenerator;
