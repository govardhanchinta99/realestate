import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import { useProperty, Property } from "@/context/PropertyContext";
import { Heart, MapPin, ArrowLeft, Search, Sparkles, Bed, Bath, Ruler } from "lucide-react";
import { motion } from "framer-motion";

const SemanticSearch: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q");
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToSaved, isSaved } = useProperty();

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:3001/api/properties/search/semantic?q=${encodeURIComponent(query)}`
        );
        setResults(response.data);
      } catch (error) {
        console.error("Error fetching semantic search results:", error);
        // Mock results for demo
        setResults([
          {
            _id: '1',
            title: 'Luxurious Modern Villa',
            description: 'Step into luxury with this stunning 4-bedroom villa.',
            price: 1250000,
            propertyType: 'Villa',
            location: 'Beverly Hills, CA',
            bedrooms: 4,
            bathrooms: 3,
            area: 3500,
            status: 'For Sale',
            image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
          },
          {
            _id: '3',
            title: 'Cozy Family Home',
            description: 'Charming family home in a quiet neighborhood.',
            price: 575000,
            propertyType: 'House',
            location: 'Austin, TX',
            bedrooms: 3,
            bathrooms: 2,
            area: 2200,
            status: 'For Sale',
            image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <Sparkles className="w-6 h-6 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-muted-foreground font-medium">Searching with AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back & Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <Search className="w-6 h-6 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm text-accent font-medium">AI Semantic Search</span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Results for "{query}"
              </h1>
            </div>
          </div>
          
          <p className="text-muted-foreground ml-16">
            Found {results.length} {results.length === 1 ? 'property' : 'properties'} matching your lifestyle criteria
          </p>
        </motion.div>

        {results.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-secondary rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">No Matching Properties</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              We couldn't find properties matching "{query}". Try describing your ideal home differently.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all"
            >
              Browse All Listings
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {results.map((property, index) => {
              const saved = isSaved(property._id);
              return (
                <motion.div
                  key={property._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="property-card group"
                >
                  <Link to={`/property/${property._id}`}>
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={property.image || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80"}
                        alt={property.title}
                        className="property-image w-full h-full object-cover object-center"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className={`badge-status ${property.status === 'For Sale' ? 'badge-sale' : 'badge-rent'}`}>
                          {property.status}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className="badge-status badge-type backdrop-blur-sm bg-card/80">
                          {property.propertyType}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center gap-1.5 text-primary-foreground text-sm">
                          <MapPin size={14} className="flex-shrink-0" />
                          <span className="truncate font-medium">{property.location}</span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="p-5">
                    <Link to={`/property/${property._id}`}>
                      <h3 className="font-display text-lg font-semibold text-foreground mb-2 hover:text-primary transition-colors line-clamp-1">
                        {property.title}
                      </h3>
                    </Link>

                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-2xl font-bold text-primary">
                        ${property.price.toLocaleString()}
                      </span>
                      {property.status === 'For Rent' && (
                        <span className="text-sm text-muted-foreground">/month</span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-muted-foreground text-sm mb-5 pb-5 border-b border-border">
                      <div className="flex items-center gap-1.5">
                        <Bed size={16} className="text-primary/70" />
                        <span>{property.bedrooms} Beds</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bath size={16} className="text-primary/70" />
                        <span>{property.bathrooms} Baths</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Ruler size={16} className="text-primary/70" />
                        <span>{property.area.toLocaleString()} sqft</span>
                      </div>
                    </div>

                    <button
                      onClick={() => addToSaved(property)}
                      disabled={saved}
                      className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                        saved 
                          ? 'bg-secondary text-muted-foreground cursor-default' 
                          : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-soft'
                      }`}
                    >
                      <Heart size={18} className={saved ? "fill-current" : ""} />
                      {saved ? 'Saved' : 'Save Property'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SemanticSearch;
