import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { getApiUrl } from '@/lib/api';

export interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  propertyType: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: 'For Sale' | 'For Rent';
  image: string;
  images?: string[];
  amenities: string[];
  yearBuilt?: number;
  featured?: boolean;
  score?: number; // for semantic match relevance
  tags?: string[];
}

interface PropertyContextType {
  properties: Property[];
  savedProperties: Property[];
  loading: boolean;
  fetchProperties: (search?: string) => Promise<void>;
  addToSaved: (property: Property) => void;
  removeFromSaved: (propertyId: string) => void;
  toggleSaved: (property: Property) => boolean;
  isSaved: (propertyId: string) => boolean;
  addProperty: (propertyData: Partial<Property>) => Promise<Property>;
  updateProperty: (id: string, propertyData: Partial<Property>) => Promise<Property>;
  deleteProperty: (id: string) => Promise<void>;
  getPropertyById: (id: string) => Property | undefined;
}

export const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
};

// Initial Mock Dataset with rich imagery and diverse locations
export const initialMockProperties: Property[] = [
  {
    _id: '1',
    title: 'The Glass Horizon Villa',
    description: 'An architectural marvel nestled in the hills with uninterrupted panoramic skyline views. Features floor-to-ceiling automated glass walls, an infinity edge pool, temperature-controlled wine cellar, and integrated smart home automation throughout.',
    price: 2850000,
    propertyType: 'Villa',
    location: 'Beverly Hills, CA',
    bedrooms: 5,
    bathrooms: 6,
    area: 5200,
    status: 'For Sale',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80'
    ],
    amenities: ['Infinity Pool', 'Smart Home', 'Wine Cellar', 'Spa & Sauna', 'Private Gym', 'Home Theater', 'Solar Power'],
    yearBuilt: 2023,
    featured: true,
    tags: ['luxury', 'quiet', 'private', 'pool', 'views', 'modern', 'entertaining']
  },
  {
    _id: '2',
    title: 'Skyline Terrace Penthouse',
    description: 'Bespoke two-level penthouse in prime Tribeca. Expansive wrap-around private terrace with Manhattan skyline vistas, 14-foot coffered ceilings, chevron white oak floors, and a private key-locked elevator foyer.',
    price: 1850000,
    propertyType: 'Apartment',
    location: 'Tribeca, New York, NY',
    bedrooms: 3,
    bathrooms: 3,
    area: 2600,
    status: 'For Sale',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80'
    ],
    amenities: ['Private Terrace', 'Doorman 24/7', 'Concierge', 'Private Elevator', 'Wine Cooler', 'Fitness Center'],
    yearBuilt: 2021,
    featured: true,
    tags: ['penthouse', 'city views', 'walkable', 'dining', 'luxury', 'remote work']
  },
  {
    _id: '3',
    title: 'Emerald Bay Coastal Sanctuary',
    description: 'Direct beachfront living with private stairs to white sand beaches. Sun-drenched open living spaces, organic limestone finishes, custom cedar cabinetry, and an expansive ocean-view entertaining deck with firepit.',
    price: 3450000,
    propertyType: 'Villa',
    location: 'Malibu, CA',
    bedrooms: 4,
    bathrooms: 4,
    area: 4100,
    status: 'For Sale',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80'
    ],
    amenities: ['Direct Beach Access', 'Oceanfront Deck', 'Outdoor Kitchen', 'Hot Tub', 'Fire Pit', 'Gated Security'],
    yearBuilt: 2022,
    featured: true,
    tags: ['beachfront', 'ocean view', 'sunset', 'quiet', 'nature', 'luxury']
  },
  {
    _id: '4',
    title: 'Modernist Craftsman Oasis',
    description: 'Warm modern sanctuary featuring mature oak canopies, expansive fenced yard, designer chef kitchen with marble waterfall island, and a separate quiet backyard studio perfect for remote creative work.',
    price: 795000,
    propertyType: 'House',
    location: 'South Congress, Austin, TX',
    bedrooms: 3,
    bathrooms: 3,
    area: 2450,
    status: 'For Sale',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80',
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200&q=80',
      'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1200&q=80'
    ],
    amenities: ['Private Backyard', 'Home Office Studio', 'Fireplace', '2-Car Garage', 'EV Charger', 'Covered Patio'],
    yearBuilt: 2020,
    featured: false,
    tags: ['family', 'backyard', 'dog friendly', 'quiet', 'home office', 'remote work', 'green']
  },
  {
    _id: '5',
    title: 'Brick & Timber Designer Loft',
    description: 'Authentic historic timber loft with soaring 16-foot ceilings, exposed Chicago brick, oversized industrial windows, radiant heated polished concrete floors, and custom steel floating staircase.',
    price: 3600,
    propertyType: 'Apartment',
    location: 'Fulton Market, Chicago, IL',
    bedrooms: 2,
    bathrooms: 2,
    area: 1750,
    status: 'For Rent',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
      'https://images.unsplash.com/photo-1502005229762-ee1b2da97306?w=1200&q=80'
    ],
    amenities: ['Exposed Brick', 'High Ceilings', 'In-Unit Laundry', 'Rooftop Lounge', 'Pet Friendly', 'Bike Room'],
    yearBuilt: 2019,
    featured: false,
    tags: ['loft', 'industrial', 'rent', 'city', 'nightlife', 'creative', 'pet friendly']
  },
  {
    _id: '6',
    title: 'Alpine Panorama Chalet',
    description: 'Spectacular timber and stone mountain lodge with direct ski-in/ski-out trail access. Dramatic cathedral great room with floor-to-ceiling stone hearth, heated outdoor plunge pool, and wraparound mountain view deck.',
    price: 2150000,
    propertyType: 'House',
    location: 'Aspen, CO',
    bedrooms: 4,
    bathrooms: 4,
    area: 3600,
    status: 'For Sale',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=80',
      'https://images.unsplash.com/photo-1542314831-c6a4d2753a4d?w=1200&q=80'
    ],
    amenities: ['Ski-in/Ski-out', 'Stone Fireplace', 'Heated Plunge Pool', 'Ski Locker', 'Heated Driveway', 'Mountain Views'],
    yearBuilt: 2021,
    featured: true,
    tags: ['mountain', 'ski', 'fireplace', 'snow', 'nature', 'luxury', 'retreat']
  },
  {
    _id: '7',
    title: 'Sunset Marina Waterfront Condo',
    description: 'Ultra-modern waterfront residence overlooking Biscayne Bay. Features floor-to-ceiling tinted glass, deep sunrise and sunset balconies, private boat slip options, and 5-star resort building amenities.',
    price: 940000,
    propertyType: 'Condo',
    location: 'Coconut Grove, Miami, FL',
    bedrooms: 2,
    bathrooms: 2,
    area: 1450,
    status: 'For Sale',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
      'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=1200&q=80'
    ],
    amenities: ['Waterfront Pool', 'Marina Access', 'Tennis Court', 'Valet Parking', 'Concierge', 'Sunset Balcony'],
    yearBuilt: 2022,
    featured: false,
    tags: ['waterfront', 'condo', 'pool', 'miami', 'warm', 'boating', 'balcony']
  },
  {
    _id: '8',
    title: 'Historic Cobblestone Townhome',
    description: 'Impeccably preserved 19th-century brick townhouse blending heritage architectural details with serene contemporary living. Private walled brick garden, 4 wood-burning fireplaces, and a sunlit top-floor primary suite.',
    price: 1550000,
    propertyType: 'Townhouse',
    location: 'Beacon Hill, Boston, MA',
    bedrooms: 4,
    bathrooms: 3,
    area: 3100,
    status: 'For Sale',
    image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80'
    ],
    amenities: ['Private English Garden', 'Fireplaces', 'Custom Library', 'Wine Cellar', 'Original Crown Moldings'],
    yearBuilt: 2018,
    featured: false,
    tags: ['historic', 'townhouse', 'garden', 'walkable', 'charming', 'library']
  },
  {
    _id: '9',
    title: 'Minimalist Zen Urban Studio',
    description: 'Intelligently configured architectural studio with built-in Japanese ash cabinetry, hidden Murphy bed system, floor-to-ceiling soundproof triple-pane windows, and high-speed fiber internet included.',
    price: 2100,
    propertyType: 'Studio',
    location: 'Capitol Hill, Seattle, WA',
    bedrooms: 0,
    bathrooms: 1,
    area: 620,
    status: 'For Rent',
    image: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80'
    ],
    amenities: ['Soundproof Windows', 'High Speed Fiber', 'Rooftop Deck', 'Bike Storage', 'Keyless Entry', 'In-Unit Washer'],
    yearBuilt: 2023,
    featured: false,
    tags: ['studio', 'rent', 'minimalist', 'quiet', 'transit', 'cafes', 'modern']
  },
  {
    _id: '10',
    title: 'Mid-Century Palm Oasis',
    description: 'Iconic butterfly-roof modernist villa with seamless indoor-outdoor living. Terrazzo floors, clerestory windows capturing mountain ridge lines, private saltwater swimming pool surrounded by towering palm trees.',
    price: 1250000,
    propertyType: 'Villa',
    location: 'Palm Springs, CA',
    bedrooms: 3,
    bathrooms: 3,
    area: 2800,
    status: 'For Sale',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80'
    ],
    amenities: ['Saltwater Pool', 'Outdoor Fireplace', 'Mid-Century Architecture', 'Mountain Views', 'Solar Array'],
    yearBuilt: 2021,
    featured: true,
    tags: ['midcentury', 'pool', 'desert', 'palms', 'modernist', 'sunny']
  },
  {
    _id: '11',
    title: 'Redwood Forest Haven',
    description: 'Eco-conscious sustainable timber retreat set amidst 2 acres of towering redwoods. Featuring passive solar orientation, rainwater capture, radiant wood floors, and a private natural cedar hot tub.',
    price: 685000,
    propertyType: 'House',
    location: 'West Hills, Portland, OR',
    bedrooms: 3,
    bathrooms: 2,
    area: 2100,
    status: 'For Sale',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80',
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=80'
    ],
    amenities: ['Cedar Hot Tub', 'Acreage', 'Forest Trails', 'Passive Solar', 'Wood Stove', 'Organic Garden'],
    yearBuilt: 2022,
    featured: false,
    tags: ['eco', 'trees', 'nature', 'quiet', 'woodland', 'peaceful', 'dog friendly']
  },
  {
    _id: '12',
    title: 'Bay View Executive Residence',
    description: 'High-floor residence in a premier full-service tower overlooking the Bay Bridge and marina. Chef kitchen with Sub-Zero appliances, custom motorized solar shades, and 24-hour concierge and valet services.',
    price: 4500,
    propertyType: 'Apartment',
    location: 'Rincon Hill, San Francisco, CA',
    bedrooms: 2,
    bathrooms: 2,
    area: 1600,
    status: 'For Rent',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80'
    ],
    amenities: ['Bay Views', '24/7 Concierge', 'Valet Parking', 'Indoor Heated Pool', 'Wine Cellar Lockers', 'Gym'],
    yearBuilt: 2022,
    featured: false,
    tags: ['water view', 'rent', 'luxury', 'city', 'executive', 'san francisco']
  }
];

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load local stored properties or fallback to mock
  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const stored = localStorage.getItem('realestate_properties');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored properties:', e);
    }
    return initialMockProperties;
  });

  // Load saved (bookmarked) properties from localStorage
  const [savedProperties, setSavedProperties] = useState<Property[]>(() => {
    try {
      const stored = localStorage.getItem('realestate_saved_properties');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading saved properties:', e);
    }
    return [];
  });

  const [loading, setLoading] = useState<boolean>(false);

  // Sync saved properties to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('realestate_saved_properties', JSON.stringify(savedProperties));
    } catch (e) {
      console.warn('Failed to save saved properties to localStorage:', e);
    }
  }, [savedProperties]);

  // Sync custom added properties to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('realestate_properties', JSON.stringify(properties));
    } catch (e) {
      console.warn('Failed to save properties to localStorage:', e);
    }
  }, [properties]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async (search = '') => {
    try {
      setLoading(true);
      const url = getApiUrl(`/api/properties${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      const response = await axios.get(url, { timeout: 4000 });
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setProperties(response.data);
      }
    } catch (error) {
      // Backend not running or timeout -> keep local/mock properties
      console.log('Using local property catalog');
    } finally {
      setLoading(false);
    }
  };

  const addToSaved = (property: Property) => {
    setSavedProperties((prev) => {
      if (prev.some((item) => item._id === property._id)) {
        return prev;
      }
      return [...prev, property];
    });
  };

  const removeFromSaved = (propertyId: string) => {
    setSavedProperties((prev) => prev.filter((item) => item._id !== propertyId));
  };

  const toggleSaved = (property: Property): boolean => {
    const exists = savedProperties.some((item) => item._id === property._id);
    if (exists) {
      removeFromSaved(property._id);
      return false;
    } else {
      addToSaved(property);
      return true;
    }
  };

  const isSaved = (propertyId: string) => {
    return savedProperties.some((item) => item._id === propertyId);
  };

  const getPropertyById = (id: string): Property | undefined => {
    return properties.find((p) => String(p._id) === String(id));
  };

  const addProperty = async (propertyData: Partial<Property>): Promise<Property> => {
    const newProperty: Property = {
      _id: propertyData._id || `prop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: propertyData.title || 'Untitled Property',
      description: propertyData.description || '',
      price: Number(propertyData.price) || 0,
      propertyType: propertyData.propertyType || 'House',
      location: propertyData.location || 'Location Not Specified',
      bedrooms: Number(propertyData.bedrooms) || 0,
      bathrooms: Number(propertyData.bathrooms) || 0,
      area: Number(propertyData.area) || 0,
      status: (propertyData.status as 'For Sale' | 'For Rent') || 'For Sale',
      image: propertyData.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
      images: propertyData.images || [propertyData.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80'],
      amenities: propertyData.amenities || ['Modern Finishes'],
      yearBuilt: propertyData.yearBuilt || new Date().getFullYear(),
      featured: propertyData.featured || false,
      tags: propertyData.tags || []
    };

    // Try backend sync if available
    try {
      const response = await axios.post(getApiUrl('/api/properties'), newProperty, { timeout: 3000 });
      if (response.data && response.data._id) {
        newProperty._id = String(response.data._id);
      }
    } catch (e) {
      console.log('Saved property locally in context');
    }

    setProperties((prev) => [newProperty, ...prev]);
    return newProperty;
  };

  const updateProperty = async (id: string, propertyData: Partial<Property>): Promise<Property> => {
    let updated: Property | null = null;
    setProperties((prev) =>
      prev.map((item) => {
        if (String(item._id) === String(id)) {
          updated = { ...item, ...propertyData };
          return updated;
        }
        return item;
      })
    );

    // Also update in saved if present
    setSavedProperties((prev) =>
      prev.map((item) => (String(item._id) === String(id) ? { ...item, ...propertyData } : item))
    );

    try {
      await axios.put(getApiUrl(`/api/properties/${id}`), propertyData, { timeout: 3000 });
    } catch (e) {
      console.log('Updated property locally in context');
    }

    return updated || (propertyData as Property);
  };

  const deleteProperty = async (id: string): Promise<void> => {
    setProperties((prev) => prev.filter((item) => String(item._id) !== String(id)));
    removeFromSaved(id);

    try {
      await axios.delete(getApiUrl(`/api/properties/${id}`), { timeout: 3000 });
    } catch (e) {
      console.log('Deleted property locally in context');
    }
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
        toggleSaved,
        isSaved,
        addProperty,
        updateProperty,
        deleteProperty,
        getPropertyById
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};
