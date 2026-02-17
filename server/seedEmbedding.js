require("dotenv").config();
const { Pinecone } = require("@pinecone-database/pinecone");
const { MongoClient } = require("mongodb");
const { embed } = require("./utils/embed");

const pineconeApiKey = process.env.PINECONE_API_KEY;
const pineconeIndex = process.env.PINECONE_INDEX;
const mongoUri = process.env.MONGO_URI;

if (!pineconeApiKey || !pineconeIndex || !mongoUri) {
  console.error("Missing environment variables");
  process.exit(1);
}

async function main() {
  const pinecone = new Pinecone({ apiKey: pineconeApiKey });
  const index = pinecone.index(pineconeIndex).namespace("properties");

  const client = new MongoClient(mongoUri);
  await client.connect();

  const db = client.db("realestate");
  const properties = await db.collection("properties").find({}).toArray();

  console.log(`🏠 Found ${properties.length} properties`);

  const vectors = [];

  for (const property of properties) {
    const content = `
Title: ${property.title}
Type: ${property.propertyType}
Location: ${property.location}
Price: ${property.price}
Bedrooms: ${property.bedrooms}
Bathrooms: ${property.bathrooms}
Description: ${property.description}
`.trim();

    const values = await embed(content);

    vectors.push({
      id: property._id.toString(),
      values,
      metadata: {
        title: property.title,
        propertyType: property.propertyType,
        location: property.location,
        price: property.price,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        description: property.description,
      },
    });

    console.log(`✅ Embedded: ${property.title}`);
  }

  await index.upsert(vectors);
  console.log("🚀 Property embeddings uploaded");

  await client.close();
}

main();
