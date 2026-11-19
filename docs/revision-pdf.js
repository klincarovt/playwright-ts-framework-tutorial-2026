// Exports docs/me/Revision.md to docs/me/Revision.pdf using Playwright's Chromium.
// Run: node docs/revision-pdf.js
const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const src = path.join(__dirname, 'me/Revision.md');
const out = path.join(__dirname, 'me/Revision.pdf');

const css = `
  body { font-family: system-ui, sans-serif; font-size: 11px; line-height: 1.45; color: #222; }
  h1 { border-bottom: 2px solid #333; page-break-before: always; }
  h1:first-of-type { page-break-before: avoid; }
  h3 { margin-top: 18px; page-break-after: avoid; }
  table { border-collapse: collapse; width: 100%; margin: 6px 0; page-break-inside: avoid; }
  th, td { border: 1px solid #bbb; padding: 3px 6px; text-align: left; vertical-align: top; }
  th { background: #eee; }
  code { background: #f2f2f2; padding: 0 3px; border-radius: 3px; }
  pre { background: #f2f2f2; padding: 8px; white-space: pre-wrap; }
  details { border-left: 3px solid #6a9; padding-left: 8px; margin: 4px 0; }
  summary { font-weight: bold; color: #386; }
`;

(async () => {
  // Open every answer so it shows in the PDF
  const md = fs.readFileSync(src, 'utf8').replace(/<details>/g, '<details open>');

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(`<html><head><meta charset="utf-8"><style>${css}</style></head><body><main id="c"></main></body></html>`);

  // Markdown -> HTML in the page, with the "marked" library from a CDN
  await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js' });
  await page.evaluate((text) => {
    document.getElementById('c').innerHTML = window.marked.parse(text);
  }, md);

  await page.pdf({ path: out, format: 'A4', margin: { top: '15mm', bottom: '15mm', left: '12mm', right: '12mm' } });
  await browser.close();
  console.log('PDF written to', out);
})();
