require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY is missing");
}

const ai = new GoogleGenAI({ apiKey: geminiApiKey });

async function embed(text) {
  const res = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
  });

  return res.embeddings[0].values;
}

module.exports = { embed };
