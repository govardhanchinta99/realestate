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

async function generatePropertyDescription({ title, features, propertyType, location }) {
    const prompt = `You are an expert real estate copywriter.
    Write a compelling, luxury-style property description (max 150 words) for a property with the following details:
    Title: ${title}
    Type: ${propertyType}
    Location: ${location}
    Features/Highlights: ${features}

    Tone: Professional, inviting, and persuasive. Focus on the lifestyle and benefits.`;

    try {
        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });
        return result.text;
    } catch (error) {
        console.error("Error generating property description:", error);
        return "Description unavailable";
    }
}

async function generatePropertyDetailsFromImage(imageBuffer, mimeType) {
    const imagePart = {
        inlineData: {
            data: imageBuffer.toString("base64"),
            mimeType,
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
        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: 'user',
                    parts: [{ text: prompt }, imagePart]
                }
            ]
        });
        const text = result.text.replace(/```json|```/g, '').trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Vision Error Full:", error);
        throw new Error("Failed to analyze image");
    }
}

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

async function answerCustomerQuestion(question, history = []) {
    try {
        const normalizedQuestion = /refund/i.test(question) ? "What is the refund policy?" : question;

        const embeddingResult = await genAI.models.embedContent({
            model: 'gemini-embedding-001',
            contents: normalizedQuestion
        });

        const queryVector = embeddingResult.embeddings[0].values;
        const queryResponse = await index.query({
            vector: queryVector,
            topK: 3,
            includeMetadata: true,
            filter: { type: 'real_estate_knowledge' }
        });

        const matches = queryResponse.matches || [];
        if (matches.length === 0) {
            return "I couldn't find any specific information about that in our policy.";
        }

        const contextText = matches.map((match) => match.metadata.text).join("\n\n---\n\n");
        const historyText = history.map((msg) => {
            const role = msg.role === 'user' ? 'Customer' : 'Agent';
            return `${role}: ${msg.content}`;
        }).join("\n");

        const prompt = `
You are RealEstateMate AI, a helpful assistant for real estate customers.

Use the POLICY CONTEXT to answer questions about refunds, cancellations, and terms.
Explain clearly in simple language.

Only say "I couldn't find that information in our policy" if the policy context is empty or unrelated.

CONVERSATION HISTORY:
${historyText}

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

async function answerPropertyQuestion({ question, propertyContext }) {
    try {
        const prompt = `
You are RealEstateMate AI helping a buyer with questions about ONE specific property.

PROPERTY CONTEXT:
${propertyContext}

USER QUESTION:
${question}

Instructions:
- Answer strictly from PROPERTY CONTEXT.
- If the information is not present, respond with exactly: "Please contact the agent."
- Keep answer under 80 words.
`;

        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        return (result.text || "Please contact the agent.").trim();
    } catch (error) {
        console.error("Error answering property question:", error);
        return "Please contact the agent.";
    }
}

async function summarizeLeaseTerms(leaseText) {
    const prompt = `
Extract key terms from the lease text below and return ONLY valid JSON in this shape:
{
  "securityDeposit": "",
  "noticePeriod": "",
  "petPolicy": "",
  "hiddenFees": [""],
  "summary": ""
}

If any field is missing, use "Not specified".

LEASE TEXT:
${leaseText}
`;

    try {
        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        const cleaned = (result.text || "").replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (error) {
        console.error("Error summarizing lease:", error);
        return {
            securityDeposit: "Not specified",
            noticePeriod: "Not specified",
            petPolicy: "Not specified",
            hiddenFees: ["Not specified"],
            summary: "Unable to summarize lease at this time."
        };
    }
}

async function generateInvestmentPotential({ location, price, area, avgRentalYield, marketPricePerSqft }) {
    const pricePerSqft = area > 0 ? price / area : 0;
    const marketDeltaPercent = marketPricePerSqft > 0
        ? ((pricePerSqft - marketPricePerSqft) / marketPricePerSqft) * 100
        : 0;

    const prompt = `
You are a real-estate investment analyst.
Given these metrics, write a concise assessment (max 80 words):
- Location: ${location}
- Listing price: ${price}
- Area (sqft): ${area}
- Price per sqft: ${pricePerSqft.toFixed(2)}
- Market avg price per sqft: ${marketPricePerSqft}
- Difference vs market: ${marketDeltaPercent.toFixed(1)}%
- Average rental yield: ${avgRentalYield}%

Return JSON only:
{ "rating": "Strong|Moderate|Cautious", "analysis": "..." }
`;

    try {
        const result = await genAI.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
        const cleaned = (result.text || "").replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
            ...parsed,
            avgRentalYield,
            marketPricePerSqft,
            pricePerSqft: Number(pricePerSqft.toFixed(2)),
            marketDeltaPercent: Number(marketDeltaPercent.toFixed(1)),
        };
    } catch (error) {
        console.error("Error generating investment analysis:", error);
        const rating = marketDeltaPercent < -5 && avgRentalYield >= 5 ? "Strong" : marketDeltaPercent < 5 ? "Moderate" : "Cautious";
        return {
            rating,
            analysis: `${rating} investment outlook based on local yield and price-per-sqft comparison.`,
            avgRentalYield,
            marketPricePerSqft,
            pricePerSqft: Number(pricePerSqft.toFixed(2)),
            marketDeltaPercent: Number(marketDeltaPercent.toFixed(1)),
        };
    }
}

module.exports = {
    generatePropertyDescription,
    generatePropertyDetailsFromImage,
    generateEmbedding,
    answerCustomerQuestion,
    answerPropertyQuestion,
    summarizeLeaseTerms,
    generateInvestmentPotential,
};
