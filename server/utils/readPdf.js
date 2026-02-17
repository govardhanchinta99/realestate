const fs = require("fs");
const pdfParse = require("pdf-parse");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

async function readPdfSafe(filePath) {
  // 👇 FIX: convert Buffer → Uint8Array
  const buffer = new Uint8Array(fs.readFileSync(filePath));

  // 1️⃣ Try pdf-parse first
  try {
    const data = await pdfParse(buffer);
    if (data.text && data.text.trim()) {
      console.log("✅ PDF read using pdf-parse");
      return data.text;
    }
  } catch (err) {
    console.warn("⚠️ pdf-parse failed, falling back");
  }

  // 2️⃣ Fallback to pdfjs
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(it => it.str).join(" ") + "\n";
  }

  if (!text.trim()) {
    throw new Error("PDF has no extractable text");
  }

  console.log("✅ PDF read using pdfjs");
  return text;
}

module.exports = { readPdfSafe };
