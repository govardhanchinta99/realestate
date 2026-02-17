import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Ruler } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProperty, Property } from '@/context/PropertyContext';

interface PropertyCardProps {
  property: Property;
  index?: number;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, index = 0 }) => {
  const { addToSaved, isSaved } = useProperty();
  const saved = isSaved(property._id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="property-card group"
    >
      <Link to={`/property/${property._id}`}>
        <div className="relative h-64 overflow-hidden">
          <img
            src={property.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'}
            alt={property.title}
            className="property-image w-full h-full object-cover object-center"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`badge-status ${property.status === 'For Sale' ? 'badge-sale' : 'badge-rent'}`}>
              {property.status}
            </span>
          </div>

          {/* Property Type Badge */}
          <div className="absolute top-3 right-3">
            <span className="badge-status badge-type backdrop-blur-sm bg-card/80">
              {property.propertyType}
            </span>
          </div>

          {/* Location on hover */}
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

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-2xl font-bold text-primary">
            ${property.price.toLocaleString()}
          </span>
          {property.status === 'For Rent' && (
            <span className="text-sm text-muted-foreground">/month</span>
          )}
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-muted-foreground text-sm mb-5 pb-5 border-b border-border">
          <div className="flex items-center gap-1.5">
            <Bed size={16} className="text-primary/70" />
            <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath size={16} className="text-primary/70" />
            <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Ruler size={16} className="text-primary/70" />
            <span>{property.area.toLocaleString()} sqft</span>
          </div>
        </div>

        {/* Save Button */}
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
};

export default PropertyCard;
