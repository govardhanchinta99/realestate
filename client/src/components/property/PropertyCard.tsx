import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Ruler, Sparkles, Eye, ArrowUpRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProperty, Property } from '@/context/PropertyContext';
import { toast } from 'sonner';

interface PropertyCardProps {
  property: Property;
  index?: number;
  onQuickView?: (property: Property) => void;
  showMatchScore?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  index = 0,
  onQuickView,
  showMatchScore = false,
}) => {
  const { toggleSaved, isSaved } = useProperty();
  const saved = isSaved(property._id);
  const [isHovered, setIsHovered] = useState(false);

  const handleToggleHeart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggleSaved(property);
    if (nowSaved) {
      toast.success(`Saved "${property.title}" to your favorites!`, {
        icon: <Heart className="w-4 h-4 text-red-500 fill-red-500" />,
      });
    } else {
      toast.info(`Removed from your saved homes`);
    }
  };

  const pricePerSqft = property.area > 0 ? Math.round(property.price / property.area) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-card rounded-2xl border border-border/70 overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Image Container */}
        <div className="relative h-60 w-full overflow-hidden bg-muted">
          <Link to={`/property/${property._id}`} className="block w-full h-full">
            <img
              src={property.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'}
              alt={property.title}
              loading="lazy"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </Link>

          {/* Gradient protection overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Badges Top Left */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm ${
                property.status === 'For Sale'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              {property.status}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-card/90 text-foreground backdrop-blur-md shadow-sm">
              {property.propertyType}
            </span>
          </div>

          {/* Top Right Save Button */}
          <button
            onClick={handleToggleHeart}
            aria-label={saved ? 'Remove from saved' : 'Save property'}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 z-10 shadow-md ${
              saved
                ? 'bg-red-50 text-red-500 hover:scale-110'
                : 'bg-card/85 text-foreground/80 hover:bg-card hover:text-red-500 hover:scale-110'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${saved ? 'fill-red-500 text-red-500 scale-110' : ''}`}
            />
          </button>

          {/* AI Match Score Badge if applicable */}
          {(showMatchScore || property.score) && (
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{Math.round((property.score || 0.94) * 100)}% Match</span>
            </div>
          )}

          {/* Quick View Button on Hover */}
          {onQuickView && (
            <button
              onClick={() => onQuickView(property)}
              className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-card/90 text-foreground text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md backdrop-blur-sm hover:bg-card"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5">
          {/* Price & Rate */}
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-2xl font-bold text-foreground">
                ${property.price.toLocaleString()}
              </span>
              {property.status === 'For Rent' && (
                <span className="text-xs text-muted-foreground font-medium">/month</span>
              )}
            </div>
            {pricePerSqft > 0 && property.status === 'For Sale' && (
              <span className="text-xs text-muted-foreground font-medium">
                ${pricePerSqft.toLocaleString()}/sqft
              </span>
            )}
          </div>

          {/* Title */}
          <Link to={`/property/${property._id}`} className="block group/link">
            <h3 className="font-display text-base font-semibold text-foreground line-clamp-1 group-hover/link:text-primary transition-colors">
              {property.title}
            </h3>
          </Link>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-1 mb-4">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
            <span className="truncate">{property.location}</span>
          </div>

          {/* Specs Row */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/60 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-primary/80" />
              <span>
                <strong className="text-foreground font-semibold">{property.bedrooms}</strong>{' '}
                {property.bedrooms === 1 ? 'Bed' : 'Beds'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 justify-center border-x border-border/60">
              <Bath className="w-3.5 h-3.5 text-primary/80" />
              <span>
                <strong className="text-foreground font-semibold">{property.bathrooms}</strong>{' '}
                {property.bathrooms === 1 ? 'Bath' : 'Baths'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <Ruler className="w-3.5 h-3.5 text-primary/80" />
              <span>
                <strong className="text-foreground font-semibold">
                  {property.area.toLocaleString()}
                </strong>{' '}
                sqft
              </span>
            </div>
          </div>

          {/* Amenities Pills (preview top 3) */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {property.amenities.slice(0, 3).map((amenity, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md text-[11px] bg-secondary/80 text-secondary-foreground font-medium"
                >
                  {amenity}
                </span>
              ))}
              {property.amenities.length > 3 && (
                <span className="px-1.5 py-0.5 rounded-md text-[11px] text-muted-foreground font-medium">
                  +{property.amenities.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Link */}
      <div className="px-5 pb-5 pt-1">
        <Link
          to={`/property/${property._id}`}
          className="w-full py-2.5 px-4 rounded-xl bg-secondary/70 hover:bg-primary hover:text-primary-foreground text-foreground text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 group/btn"
        >
          <span>Explore Details</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
