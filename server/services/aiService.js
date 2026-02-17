require("dotenv").config();
const { Pinecone } = require("@pinecone-database/pinecone");
const { GoogleGenAI } = require("@google/genai");

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    console.error("CRITICAL ERROR: GEMINI_API_KEY is not defined in environment variables.");
}
const genAI = new GoogleGenAI({ apiKey: geminiApiKey });

const pineconeApiKey = process.env.PINECONE_API_KEY;
const pineconeIndexName = process.env.PINECONE_INDEX;

if (!pineconeApiKey || !pineconeIndexName) {
    console.error("CRITICAL ERROR: PINECONE_API_KEY or PINECONE_INDEX is not defined.");
}

const pinecone = new Pinecone({ apiKey: pineconeApiKey });
const index = pinecone.index(pineconeIndexName);

/*
 * Feature 1: Property Description Generation using AI
 */
async function generatePropertyDescription({ title, features, propertyType, location }) {
    const prompt = `You are an expert real estate copywriter.
    Write a compelling, luxury-style property description (max 150 words) for a property with the following details:
    Title: ${title}
    Type: ${propertyType}
    Location: ${location}
    Features/Highlights: ${features}
    
    Tone: Professional, inviting, and persuasive. Focus on the lifestyle and benefits.`;

    try {
        const result = await genAI.models.generateContent(
            {
                model: "gemini-2.5-flash",
                contents: prompt
            });
        return result.text;
    } catch (error) {
        console.error("Error generating property description:", error);
        return "Description unavailable";
    }
}

/*
 * Feature 2: Snap & Sell using AI (Multi-modal) -> Snap & List
 * Admin uploads property image, AI generates property description, type and features.
 */
async function generatePropertyDetailsFromImage(imageBuffer, mimeType) {
    console.log("In generatePropertyDetailsFromImage", imageBuffer, mimeType);
    const imagePart = {
        inlineData: {
            data: imageBuffer.toString("base64"),
            mimeType: mimeType,
        },
    };

    const prompt = `
        Analyze this real estate image and extract details for a property listing.
        Return ONLY a JSON object with the following properties:
        {
            "title": "A catchy title for the listing",
            "description": "A compelling description (max 100 words)",
            "propertyType": "Type of property (e.g., Apartment, House, Villa, Office)",
            "features": "Comma-separated list of visible features (e.g., Hardwood floors, Modern kitchen, Pool)"
        }
        Do not include markdown formatting like \`\`\`json.
    `;

    try {
        console.log(`Generating details for image. Size: ${imageBuffer.length}, Type: ${mimeType}`);
        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: prompt },
                        imagePart
                    ]
                }
            ]
        });
        const text = result.text.replace(/```json|```/g, '').trim();
        console.log("Gemini Response:", text);
        return JSON.parse(text);
    } catch (error) {
        console.error("Vision Error Full:", error);
        throw new Error("Failed to analyze image");
    }
}

/*
 * Feature 3: Semantic Search Embedding Generation
 */
async function generateEmbedding(text) {
    try {
        const result = await genAI.models.embedContent({
            model: 'gemini-embedding-001',
            contents: text
        });
        return result.embeddings[0].values;
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
}

/*
 * Feature 4: RAG - Answer Customer Questions about Policy
 */
async function answerCustomerQuestion(question, history = []) {
    try {
        console.log("Answering question:", question);
        console.log("History depth:", history.length);
        function normalizeQuestion(q) {
            if (/refund/i.test(q)) {
                return "What is the refund policy?";
            }
            return q;
        }

        // 1. Convert question to vector
        const normalizedQuestion = normalizeQuestion(question);

        const embeddingResult = await genAI.models.embedContent({
            model: 'gemini-embedding-001',
            contents: normalizedQuestion
        });


        const queryVector = embeddingResult.embeddings[0].values;

        // 2. Search Pinecone for context
        const queryResponse = await index.query({
            vector: queryVector,
            topK: 3,
            includeMetadata: true,
            filter: { type: 'real_estate_knowledge' } // Only search real estate knowledge chunks
        });

        const matches = queryResponse.matches || [];
        if (matches.length === 0) {
            return "I couldn't find any specific information about that in our policy.";
        }

        // 3. Construct Context
        const contextText = matches.map(match => match.metadata.text).join("\n\n---\n\n");

        // Format history
        const historyText = history.map(msg => {
            const role = msg.role === 'user' ? 'Customer' : 'Agent';
            return `${role}: ${msg.content}`;
        }).join("\n");

        // 4. Prompt LLM
       const prompt = `
        You are RealEstateMate AI, a helpful assistant for real estate customers.

        Use the POLICY CONTEXT to answer questions about refunds, cancellations, and terms.
        Explain clearly in simple language.

        Only say "I couldn't find that information in our policy" if the policy context is empty or unrelated.

        POLICY CONTEXT:
        ${contextText}

        USER QUESTION:
        ${question}
        `;

        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        return result.text;

    } catch (error) {
        console.error("Error answering customer question:", error);
        throw new Error("Failed to generate answer");
    }
}

module.exports = {
    generatePropertyDescription,
    generatePropertyDetailsFromImage,
    generateEmbedding,
    answerCustomerQuestion
};
