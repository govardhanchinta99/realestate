require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { readPdfSafe } = require("./utils/readPdf");
const { Pinecone } = require("@pinecone-database/pinecone");
const { embed } = require("./utils/embed");

const pineconeApiKey = process.env.PINECONE_API_KEY;
const pineconeIndex = process.env.PINECONE_INDEX;

if (!pineconeApiKey || !pineconeIndex) {
  console.error("Missing Pinecone configuration");
  process.exit(1);
}

const pc = new Pinecone({ apiKey: pineconeApiKey });
const index = pc.index(pineconeIndex).namespace("knowledge_base");

// -------- Helper: Chunk text --------
function chunkText(text, size = 500) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

async function ingest() {
  try {
    let knowledgeText = "";

    const pdfPath = path.join(__dirname, "RealEstateMate_Refund_Policy.pdf");
    const mdPath = path.join(__dirname, "RealEstateGuide.md");

    if (fs.existsSync(pdfPath)) {
      console.log("📄 Reading PDF...");
      knowledgeText = await readPdfSafe(pdfPath);
    } else if (fs.existsSync(mdPath)) {
      console.log("📝 Reading Markdown...");
      knowledgeText = fs.readFileSync(mdPath, "utf-8");
    } else {
      console.log("⚠️ No guide found, creating default one...");
      knowledgeText = `
Refund Policy:
- Refunds allowed within 7 days
- Property must be unoccupied
- Processing time: 5-7 business days
`;
      fs.writeFileSync(mdPath, knowledgeText);
    }

    if (!knowledgeText.trim()) {
      throw new Error("Knowledge text is empty");
    }

    const chunks = chunkText(knowledgeText);
    console.log(`🔹 Total chunks: ${chunks.length}`);

    const vectors = [];

    for (let i = 0; i < chunks.length; i++) {
      const values = await embed(chunks[i]);

      vectors.push({
        id: `knowledge_${i}`,
        values,
        metadata: {
          source: "policy_docs",
          text: chunks[i],
        },
      });

      console.log(`✅ Embedded chunk ${i + 1}/${chunks.length}`);
    }

    await index.upsert(vectors);
    console.log("🚀 Knowledge base ingested successfully");

  } catch (err) {
    console.error("❌ Ingestion failed:", err);
    process.exit(1);
  }
}

ingest();
