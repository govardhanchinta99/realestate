import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';

export interface Property {
  _id: string;
  title: string;
  description?: string;
  price: number;
  propertyType: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: string;
  image: string;
  amenities?: string[];
}

interface PropertyContextType {
  properties: Property[];
  savedProperties: Property[];
  loading: boolean;
  fetchProperties: (search?: string) => Promise<void>;
  addToSaved: (property: Property) => void;
  removeFromSaved: (propertyId: string) => void;
  isSaved: (propertyId: string) => boolean;
}

export const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
};

interface PropertyProviderProps {
  children: ReactNode;
}

export const PropertyProvider: React.FC<PropertyProviderProps> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async (search = '') => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3001/api/properties?search=${search}`);
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      // Set mock data for demo purposes
      setProperties(mockProperties);
    } finally {
      setLoading(false);
    }
  };

  const addToSaved = (property: Property) => {
    setSavedProperties((prev) => {
      if (prev.find((item) => item._id === property._id)) {
        return prev;
      }
      return [...prev, property];
    });
  };

  const removeFromSaved = (propertyId: string) => {
    setSavedProperties((prev) => prev.filter((item) => item._id !== propertyId));
  };

  const isSaved = (propertyId: string) => {
    return savedProperties.some((item) => item._id === propertyId);
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        savedProperties,
        loading,
        fetchProperties,
        addToSaved,
        removeFromSaved,
        isSaved
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

// Mock data for demo
const mockProperties: Property[] = [
  {
    _id: '1',
    title: 'Luxurious Modern Villa',
    description: 'Step into luxury with this stunning 4-bedroom villa featuring floor-to-ceiling windows, a private pool, and breathtaking city views. Perfect for entertaining with an open-concept living space and gourmet kitchen.',
    price: 1250000,
    propertyType: 'Villa',
    location: 'Beverly Hills, CA',
    bedrooms: 4,
    bathrooms: 3,
    area: 3500,
    status: 'For Sale',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    amenities: ['Pool', 'Garden', 'Garage', 'Smart Home', 'Wine Cellar']
  },
  {
    _id: '2',
    title: 'Downtown Penthouse Loft',
    description: 'Urban sophistication meets comfort in this stunning penthouse loft. Exposed brick, industrial beams, and panoramic windows create the perfect backdrop for city living.',
    price: 850000,
    propertyType: 'Apartment',
    location: 'Manhattan, NY',
    bedrooms: 2,
    bathrooms: 2,
    area: 1800,
    status: 'For Sale',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    amenities: ['Rooftop Access', 'Concierge', 'Gym', 'Doorman']
  },
  {
    _id: '3',
    title: 'Cozy Family Home',
    description: 'Charming family home nestled in a quiet neighborhood with excellent schools nearby. Features a spacious backyard, updated kitchen, and a warm fireplace for those cozy evenings.',
    price: 575000,
    propertyType: 'House',
    location: 'Austin, TX',
    bedrooms: 3,
    bathrooms: 2,
    area: 2200,
    status: 'For Sale',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    amenities: ['Backyard', 'Fireplace', 'Garage', 'Patio']
  },
  {
    _id: '4',
    title: 'Oceanfront Paradise',
    description: 'Wake up to the sound of waves in this breathtaking beachfront property. Direct beach access, infinity pool, and sunset views make this the ultimate coastal retreat.',
    price: 2100000,
    propertyType: 'Villa',
    location: 'Malibu, CA',
    bedrooms: 5,
    bathrooms: 4,
    area: 4200,
    status: 'For Sale',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    amenities: ['Beach Access', 'Pool', 'Hot Tub', 'Outdoor Kitchen']
  },
  {
    _id: '5',
    title: 'Modern City Condo',
    description: 'Sleek and modern condo in the heart of the city. Floor-to-ceiling windows, premium finishes, and access to world-class amenities including rooftop pool and fitness center.',
    price: 425000,
    propertyType: 'Condo',
    location: 'Miami, FL',
    bedrooms: 1,
    bathrooms: 1,
    area: 950,
    status: 'For Rent',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
    amenities: ['Pool', 'Gym', 'Valet Parking', 'Concierge']
  },
  {
    _id: '6',
    title: 'Rustic Mountain Retreat',
    description: 'Escape to this enchanting mountain cabin surrounded by nature. Vaulted ceilings, stone fireplace, and wraparound deck with stunning mountain views. Perfect for those seeking tranquility.',
    price: 695000,
    propertyType: 'House',
    location: 'Aspen, CO',
    bedrooms: 3,
    bathrooms: 2,
    area: 2000,
    status: 'For Sale',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80',
    amenities: ['Fireplace', 'Deck', 'Hot Tub', 'Mountain Views']
  },
  {
    _id: '7',
    title: 'Historic Brownstone',
    description: 'Beautifully restored brownstone with original details preserved. High ceilings, ornate moldings, and a private garden. Classic elegance meets modern convenience.',
    price: 1450000,
    propertyType: 'House',
    location: 'Brooklyn, NY',
    bedrooms: 4,
    bathrooms: 3,
    area: 2800,
    status: 'For Sale',
    image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80',
    amenities: ['Garden', 'Fireplace', 'Wine Cellar', 'Original Details']
  },
  {
    _id: '8',
    title: 'Minimalist Studio Apartment',
    description: 'Perfectly designed studio for the modern professional. Smart storage solutions, premium appliances, and a location steps from transit and trendy cafes.',
    price: 1800,
    propertyType: 'Apartment',
    location: 'San Francisco, CA',
    bedrooms: 0,
    bathrooms: 1,
    area: 550,
    status: 'For Rent',
    image: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80',
    amenities: ['Laundry', 'Gym', 'Rooftop', 'Bike Storage']
  }
];
