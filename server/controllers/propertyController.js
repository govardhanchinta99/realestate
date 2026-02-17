const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");
const {
    generatePropertyDescription,
    generatePropertyDetailsFromImage,
    generateEmbedding,
    generateInvestmentPotential,
} = require("../services/aiService");
const { Pinecone } = require("@pinecone-database/pinecone");

const collectionName = "properties";
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const index = pinecone.index(process.env.PINECONE_INDEX);

// Helper to get collection
const getCollection = () => getDB().collection(collectionName);

// @desc    Fetch all properties
// @route   GET /api/properties
const getProperties = async (req, res) => {
    try {
        const { search } = req.query;
        const query = {};

        if (search) {
            // Simple regex search on title or location
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } }
            ];
        }

        const properties = await getCollection().find(query).toArray();
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Fetch single property
// @route   GET /api/properties/:id
const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Property ID" });
        }

        const property = await getCollection().findOne({ _id: new ObjectId(id) });

        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        res.json(property);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Create a property
// @route   POST /api/properties
const createProperty = async (req, res) => {
    try {
        const {
            title,
            description,
            price,
            propertyType,
            location,
            bedrooms,
            bathrooms,
            area,
            status, // 'For Sale', 'For Rent'
            amenities,
            image
        } = req.body;

        // Basic Validation
        if (!title || !description || !price || !propertyType || !location) {
            return res
                .status(400)
                .json({ message: "Please fill in all required fields (title, description, price, propertyType, location)" });
        }

        const newProperty = {
            title,
            description,
            price: Number(price),
            propertyType, // e.g., Apartment, Villa
            location,
            bedrooms: Number(bedrooms) || 0,
            bathrooms: Number(bathrooms) || 0,
            area: Number(area) || 0, // sq ft
            status: status || 'For Sale',
            amenities: amenities || [],
            image: image || "",
            createdAt: new Date(),
        };

        const result = await getCollection().insertOne(newProperty);

        // Fetch the created document to return it
        const createdProperty = await getCollection().findOne({
            _id: result.insertedId,
        });

        /*
         * We need to create an embedding and upload it to pinecone whenever a new property is added
         */
        // Step 1: Create embed for this property
        const embeddingText = `Title: ${createdProperty.title}, 
    Type: ${createdProperty.propertyType}, 
    Location: ${createdProperty.location}, 
    Price: ${createdProperty.price}, 
    Bedrooms: ${createdProperty.bedrooms}, 
    Bathrooms: ${createdProperty.bathrooms}, 
    Description: ${createdProperty.description}`;

        const embedding = await generateEmbedding(embeddingText);

        console.log("Created embedding for property: " + createdProperty.title);

        // Step 2: Upload to pinecone
        const vector = {
            id: createdProperty._id.toString(),
            values: embedding,
            metadata: {
                title: createdProperty.title,
                propertyType: createdProperty.propertyType,
                location: createdProperty.location,
                price: createdProperty.price,
                bedrooms: createdProperty.bedrooms,
                bathrooms: createdProperty.bathrooms,
            },
        };

        await index.upsert([vector]);
        console.log(
            "Successfully uploaded embedding of property: " +
            createdProperty.title +
            " to pinecone"
        );

        res.status(201).json(createdProperty);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Update a property
// @route   PUT /api/properties/:id
const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Property ID" });
        }

        const updates = { ...req.body };
        if (updates.price) updates.price = Number(updates.price);
        if (updates.bedrooms) updates.bedrooms = Number(updates.bedrooms);
        if (updates.bathrooms) updates.bathrooms = Number(updates.bathrooms);
        if (updates.area) updates.area = Number(updates.area);

        delete updates._id; // Prevent updating ID

        const result = await getCollection().findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updates },
            { returnDocument: "after" }
        );

        if (!result) {
            // Fallback for different driver versions
            const check = await getCollection().findOne({ _id: new ObjectId(id) });
            if (!check) return res.status(404).json({ message: "Property not found" });
            return res.json(check);
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Delete a property
// @route   DELETE /api/properties/:id
const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Property ID" });
        }

        const result = await getCollection().deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Property not found" });
        }

        // Attempt to delete from Pinecone (optional but good practice)
        try {
            await index.deleteOne(id);
            console.log("Deleted from pinecone: " + id);
        } catch (pineconeError) {
            console.error("Failed to delete from pinecone:", pineconeError);
        }

        res.json({ message: "Property removed" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Generate property description
// @route   POST /api/properties/generate-description
const generateDescription = async (req, res) => {
    try {
        const { title, features, propertyType, location } = req.body;
        // Pass everything as a combined context object or string to the service
        const description = await generatePropertyDescription({ title, features, propertyType, location });
        res.json({ description });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Generate property details from image
// @route   POST /api/properties/generate-details-from-image
const generateDetailsFromImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        console.log("In generateDetailsFromImage", req.file);
        const details = await generatePropertyDetailsFromImage(
            req.file.buffer,
            req.file.mimetype
        );
        res.status(200).json({ success: true, data: details });
    } catch (error) {
        res
            .status(500)
            .json({ success: false, error: "This is an error: " + error.message });
    }
};


const getInvestmentAnalysis = async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Property ID" });
        }

        const property = await getCollection().findOne({ _id: new ObjectId(id) });
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        const location = String(property.location || '').toLowerCase();
        const yieldByArea = [
            { key: 'downtown', yield: 5.8, ppsf: 420 },
            { key: 'metro city', yield: 5.2, ppsf: 360 },
            { key: 'coastal', yield: 4.6, ppsf: 520 },
            { key: 'suburb', yield: 4.9, ppsf: 280 },
            { key: 'countryside', yield: 3.8, ppsf: 180 },
        ];

        const benchmark = yieldByArea.find((item) => location.includes(item.key)) || { yield: 4.8, ppsf: 300 };

        const analysis = await generateInvestmentPotential({
            location: property.location,
            price: Number(property.price) || 0,
            area: Number(property.area) || 0,
            avgRentalYield: benchmark.yield,
            marketPricePerSqft: benchmark.ppsf,
        });

        res.json({ propertyId: property._id, ...analysis });
    } catch (error) {
        res.status(500).json({ message: "Investment analysis failed", error: error.message });
    }
};

// @desc    Semantic search using vector embeddings
// @route   GET /api/properties/search/semantic
const semanticSearch = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: "Search query is required" });
        }

        // 1. Generate embedding for query
        const vector = await generateEmbedding(q);

        // 2. Query Pinecone
        const searchResponse = await index.query({
            vector: vector,
            topK: 3,
            includeMetadata: true,
        });

        // 3. Extract matches
        const matches = searchResponse.matches || [];

        if (matches.length === 0) {
            return res.json([]);
        }

        // 4. Return results
        const ids = matches.map((match) => new ObjectId(match.id));
        const properties = await getCollection()
            .find({ _id: { $in: ids } })
            .toArray();

        // Attach scores and maintain order
        const results = properties
            .map((property) => {
                const match = matches.find((m) => m.id === property._id.toString());
                return {
                    ...property,
                    score: match ? match.score : 0,
                };
            })
            .sort((a, b) => b.score - a.score);

        res.json(results);
    } catch (error) {
        console.error("Semantic Search Error:", error);
        res
            .status(500)
            .json({ message: "Semantic search failed", error: error.message });
    }
};

module.exports = {
    getProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    generateDescription,
    generateDetailsFromImage,
    semanticSearch,
    getInvestmentAnalysis,
};
