import mammoth from "mammoth";

export async function extractTextFromFile(buffer: Buffer, fileType: string): Promise<string> {
  const normalizedType = fileType.toLowerCase();

  if (normalizedType.includes("pdf") || normalizedType.endsWith(".pdf")) {
    // Dynamic import to prevent client bundling or bundler issues
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    return (data.text || "").trim();
  }

  if (
    normalizedType.includes("word") ||
    normalizedType.includes("docx") ||
    normalizedType.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return (result.value || "").trim();
  }

  throw new Error("Unsupported file format. Please upload a PDF or DOCX file.");
}
