import React from 'react';
import { useProperty } from '@/context/PropertyContext';
import { Trash2, Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PropertyCard from '@/components/property/PropertyCard';

const SavedProperties: React.FC = () => {
  const { savedProperties, removeFromSaved } = useProperty();

  if (savedProperties.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-secondary rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">No Saved Properties</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            You haven't saved any homes yet. Start exploring and save properties you love!
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-soft"
          >
            <ArrowLeft className="w-5 h-5" />
            Browse Listings
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
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
            Back to Listings
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary fill-current" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Saved Properties</h1>
              <p className="text-muted-foreground">{savedProperties.length} {savedProperties.length === 1 ? 'property' : 'properties'} saved</p>
            </div>
          </div>
        </motion.div>

        {/* Saved Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <AnimatePresence>
            {savedProperties.map((property, index) => (
              <motion.div
                key={property._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="property-card">
                  <Link to={`/property/${property._id}`}>
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={property.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'}
                        alt={property.title}
                        className="property-image w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`badge-status ${property.status === 'For Sale' ? 'badge-sale' : 'badge-rent'}`}>
                          {property.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="p-5">
                    <Link to={`/property/${property._id}`}>
                      <h3 className="font-display text-lg font-semibold text-foreground mb-1 hover:text-primary transition-colors">
                        {property.title}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground text-sm mb-2">{property.location}</p>
                    <p className="text-2xl font-bold text-primary mb-4">
                      ${property.price.toLocaleString()}
                    </p>

                    <div className="flex gap-2">
                      <Link 
                        to={`/property/${property._id}`} 
                        className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-medium text-center hover:bg-primary/90 transition-colors"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => removeFromSaved(property._id)}
                        className="p-3 border border-border rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SavedProperties;
