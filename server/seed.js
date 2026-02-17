const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = 'realestate';

const properties = [
    {
        title: "Modern Downtown Apartment",
        description: "A stunning 2-bedroom apartment in the heart of the city. Features floor-to-ceiling windows, hardwood floors, and a modern kitchen. Close to public transport and shopping.",
        price: 450000,
        propertyType: "Apartment",
        location: "Downtown, Metro City",
        bedrooms: 2,
        bathrooms: 2,
        area: 1200,
        status: "For Sale",
        amenities: ["Gym", "Pool", "Parking", "Concierge"],
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"
    },
    {
        title: "Cozy Suburban House",
        description: "Perfect family home with a spacious backyard. 3 bedrooms, 2 bathrooms, and a newly renovated kitchen. located in a quiet, friendly neighborhood.",
        price: 550000,
        propertyType: "House",
        location: "Green Valley, Suburbia",
        bedrooms: 3,
        bathrooms: 2,
        area: 1800,
        status: "For Sale",
        amenities: ["Garden", "Garage", "Fireplace"],
        image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80"
    },
    {
        title: "Luxury Beachfront Villa",
        description: "Experience luxury living with this oceanfront villa. 5 bedrooms, infinity pool, private beach access, and panoramic sea views.",
        price: 2500000,
        propertyType: "Villa",
        location: "Ocean Heights, Coastal City",
        bedrooms: 5,
        bathrooms: 4,
        area: 4500,
        status: "For Sale",
        amenities: ["Pool", "Beach Access", "Smart Home", "Home Theater"],
        image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80"
    },
    {
        title: "Urban Loft",
        description: "Stylish open-plan loft in a converted warehouse. High ceilings, exposed brick walls, and large windows. Ideal for young professionals.",
        price: 350000,
        propertyType: "Condo",
        location: "Arts District, Metro City",
        bedrooms: 1,
        bathrooms: 1,
        area: 900,
        status: "For Sale",
        amenities: ["Roof Deck", "Security", "Elevator"],
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"
    },
    {
        title: "Spacious Land Plot",
        description: "Large 2-acre plot of land ready for development. Scenic views and utilities available at the street. Great investment opportunity.",
        price: 150000,
        propertyType: "Land",
        location: "Highland Hills, Countryside",
        bedrooms: 0,
        bathrooms: 0,
        area: 87120,
        status: "For Sale",
        amenities: ["Utilities Available", "Scenic Views"],
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"
    }
];

const seedDB = async () => {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB for seeding...');
        const db = client.db(dbName);
        const collection = db.collection('properties');

        await collection.deleteMany({}); // Clear existing data
        console.log('Cleared existing properties.');

        const result = await collection.insertMany(properties);
        console.log(`${result.insertedCount} properties added successfully.`);

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await client.close();
        console.log('Database connection closed.');
        process.exit();
    }
};

seedDB();
