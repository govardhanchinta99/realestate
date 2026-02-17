require('dotenv').config();
const { MongoClient } = require('mongodb');
const { GoogleGenAI } = require('@google/genai');
const { Pinecone } = require('@pinecone-database/pinecone');

const REQUIRED_ENV = ['MONGO_URI', 'GEMINI_API_KEY', 'PINECONE_API_KEY', 'PINECONE_INDEX'];

function mask(value) {
  if (!value) return '<missing>';
  if (value.length <= 8) return '********';
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

async function checkMongo(mongoUri) {
  const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 8000 });
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    return { ok: true, message: 'MongoDB ping succeeded.' };
  } catch (error) {
    return { ok: false, message: `MongoDB ping failed: ${error.message}` };
  } finally {
    await client.close().catch(() => {});
  }
}

async function checkGoogle(geminiApiKey) {
  try {
    const genAI = new GoogleGenAI({ apiKey: geminiApiKey });
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Reply with only OK',
    });

    const text = (result.text || '').trim();
    return { ok: true, message: `Google Gemini call succeeded (response: "${text}").` };
  } catch (error) {
    return { ok: false, message: `Google Gemini call failed: ${error.message}` };
  }
}

async function checkPinecone(apiKey, indexName) {
  try {
    const pinecone = new Pinecone({ apiKey });
    const index = pinecone.index(indexName);
    await index.describeIndexStats();
    return { ok: true, message: `Pinecone index "${indexName}" is reachable.` };
  } catch (error) {
    return { ok: false, message: `Pinecone check failed: ${error.message}` };
  }
}

async function main() {
  const env = Object.fromEntries(REQUIRED_ENV.map((key) => [key, process.env[key]]));
  const missing = REQUIRED_ENV.filter((key) => !env[key]);

  console.log('=== Integration connection check ===');
  console.log(`MONGO_URI: ${mask(env.MONGO_URI || '')}`);
  console.log(`GEMINI_API_KEY: ${mask(env.GEMINI_API_KEY || '')}`);
  console.log(`PINECONE_API_KEY: ${mask(env.PINECONE_API_KEY || '')}`);
  console.log(`PINECONE_INDEX: ${env.PINECONE_INDEX || '<missing>'}`);
  console.log('');

  if (missing.length > 0) {
    console.error(`Missing required env vars: ${missing.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const [mongo, google, pinecone] = await Promise.all([
    checkMongo(env.MONGO_URI),
    checkGoogle(env.GEMINI_API_KEY),
    checkPinecone(env.PINECONE_API_KEY, env.PINECONE_INDEX),
  ]);

  const checks = [
    { name: 'MongoDB', ...mongo },
    { name: 'Google Gemini', ...google },
    { name: 'Pinecone', ...pinecone },
  ];

  let hasFailure = false;
  for (const check of checks) {
    const status = check.ok ? 'PASS' : 'FAIL';
    console.log(`[${status}] ${check.name}: ${check.message}`);
    if (!check.ok) hasFailure = true;
  }

  process.exitCode = hasFailure ? 1 : 0;
}

main().catch((error) => {
  console.error('Unexpected check failure:', error);
  process.exit(1);
});
