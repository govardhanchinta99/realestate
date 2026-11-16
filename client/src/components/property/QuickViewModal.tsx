import React from 'react';
import { Property, useProperty } from '@/context/PropertyContext';
import { X, Heart, MapPin, Bed, Bath, Ruler, ArrowRight, Sparkles, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface QuickViewModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ property, isOpen, onClose }) => {
  const { isSaved, toggleSaved } = useProperty();

  if (!isOpen || !property) return null;

  const saved = isSaved(property._id);

  const handleToggleSaved = () => {
    const nowSaved = toggleSaved(property);
    if (nowSaved) {
      toast.success(`Saved "${property.title}" to favorites!`);
    } else {
      toast.info(`Removed from saved homes`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-3xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Column */}
        <div className="relative md:w-1/2 h-64 md:h-auto min-h-[280px] bg-muted overflow-hidden">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold text-white shadow-md ${
                property.status === 'For Sale' ? 'bg-emerald-600' : 'bg-amber-600'
              }`}
            >
              {property.status}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-card/90 text-foreground shadow-md backdrop-blur-sm">
              {property.propertyType}
            </span>
          </div>
        </div>

        {/* Info Column */}
        <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-between overflow-y-auto custom-scrollbar">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>{property.location}</span>
            </div>

            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              {property.title}
            </h2>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-display text-3xl font-bold text-primary">
                ${property.price.toLocaleString()}
              </span>
              {property.status === 'For Rent' && (
                <span className="text-sm text-muted-foreground font-medium">/month</span>
              )}
            </div>

            {/* Specs row */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-secondary/50 rounded-xl mb-4 text-center text-xs">
              <div>
                <span className="block text-foreground font-bold text-base">{property.bedrooms}</span>
                <span className="text-muted-foreground">Bedrooms</span>
              </div>
              <div className="border-x border-border/60">
                <span className="block text-foreground font-bold text-base">{property.bathrooms}</span>
                <span className="text-muted-foreground">Bathrooms</span>
              </div>
              <div>
                <span className="block text-foreground font-bold text-base">{property.area.toLocaleString()}</span>
                <span className="text-muted-foreground">Sq Ft</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-xs leading-relaxed mb-4 line-clamp-3">
              {property.description}
            </p>

            {/* Amenities tags */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="mb-6">
                <div className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-accent" />
                  <span>Key Features</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {property.amenities.slice(0, 4).map((amenity, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[11px] bg-secondary text-secondary-foreground font-medium flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex gap-2 pt-2 border-t border-border/60">
            <Link
              to={`/property/${property._id}`}
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl text-xs hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-soft"
            >
              <span>Full Listing Page</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleToggleSaved}
              className={`p-3 rounded-xl border transition-all ${
                saved
                  ? 'bg-red-50 text-red-500 border-red-200'
                  : 'bg-card text-muted-foreground border-border hover:text-red-500 hover:border-red-200'
              }`}
              aria-label="Toggle Saved"
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-red-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
