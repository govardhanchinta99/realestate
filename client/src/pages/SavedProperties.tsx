import React, { useState } from 'react';
import { useProperty, Property } from '@/context/PropertyContext';
import {
  Heart,
  ArrowLeft,
  Trash2,
  Share2,
  Building,
  Bed,
  Bath,
  Ruler,
  Check,
  Scale,
  Sparkles,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import PropertyCard from '@/components/property/PropertyCard';
import QuickViewModal from '@/components/property/QuickViewModal';
import Footer from '@/components/layout/Footer';

const SavedProperties: React.FC = () => {
  const { savedProperties, removeFromSaved, properties } = useProperty();
  const [filter, setFilter] = useState<'All' | 'For Sale' | 'For Rent'>('All');
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [quickViewProperty, setQuickViewProperty] = useState<Property | null>(null);

  const filteredSaved = savedProperties.filter((p) => {
    if (filter === 'All') return true;
    return p.status === filter;
  });

  const handleShareCollection = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Collection link copied to clipboard!');
  };

  const handleToggleCompare = (id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        toast.warning('You can compare up to 3 properties at a time');
        return prev;
      }
      return [...prev, id];
    });
  };

  const comparePropertiesList = savedProperties.filter((p) =>
    selectedForCompare.includes(p._id)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <section className="bg-gradient-hero py-14 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-3 text-xs font-semibold text-primary-foreground">
            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
            <span>Personal Favorites Collection</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-primary-foreground mb-3">
            Saved Properties ({savedProperties.length})
          </h1>
          <p className="text-xs sm:text-sm text-primary-foreground/80 max-w-md mx-auto">
            Your shortlisted luxury homes, villas, and apartments saved across your browsing session.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {savedProperties.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-border p-8 max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <Heart className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              No Saved Properties Yet
            </h2>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Explore our AI-curated listings or search by lifestyle, and tap the heart icon on any home to save it for later.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-soft"
            >
              <span>Explore Featured Properties</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div>
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/60">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilter('All')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filter === 'All'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                  }`}
                >
                  All ({savedProperties.length})
                </button>
                <button
                  onClick={() => setFilter('For Sale')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filter === 'For Sale'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                  }`}
                >
                  For Sale
                </button>
                <button
                  onClick={() => setFilter('For Rent')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filter === 'For Rent'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                  }`}
                >
                  For Rent
                </button>
              </div>

              <div className="flex items-center gap-2">
                {savedProperties.length >= 2 && (
                  <button
                    onClick={() => {
                      setIsCompareMode(!isCompareMode);
                      if (!isCompareMode && selectedForCompare.length === 0) {
                        setSelectedForCompare(savedProperties.slice(0, 2).map((p) => p._id));
                      }
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                      isCompareMode
                        ? 'bg-accent text-accent-foreground border-accent font-bold'
                        : 'bg-card text-foreground border-border hover:bg-secondary/60'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>{isCompareMode ? 'Exit Compare' : 'Compare Homes'}</span>
                  </button>
                )}

                <button
                  onClick={handleShareCollection}
                  className="px-3.5 py-2 rounded-xl bg-card text-foreground text-xs font-semibold border border-border hover:bg-secondary/60 transition-colors flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Collection</span>
                </button>
              </div>
            </div>

            {/* Compare Mode Table */}
            {isCompareMode && (
              <div className="mb-10 p-6 bg-card border-2 border-accent/40 rounded-3xl shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-accent font-bold text-sm">
                    <Scale className="w-4 h-4" />
                    <span>Side-by-Side Property Comparison (Select up to 3)</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Comparing {comparePropertiesList.length} properties
                  </span>
                </div>

                {comparePropertiesList.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="py-3 px-4 font-semibold text-muted-foreground w-1/4">Feature</th>
                          {comparePropertiesList.map((p) => (
                            <th key={p._id} className="py-3 px-4 font-bold text-foreground">
                              {p.title}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        <tr>
                          <td className="py-3 px-4 font-semibold text-muted-foreground">Image</td>
                          {comparePropertiesList.map((p) => (
                            <td key={p._id} className="py-3 px-4">
                              <img
                                src={p.image}
                                alt={p.title}
                                className="w-24 h-16 rounded-lg object-cover"
                              />
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-muted-foreground">Price</td>
                          {comparePropertiesList.map((p) => (
                            <td key={p._id} className="py-3 px-4 font-display font-bold text-primary text-sm">
                              ${p.price.toLocaleString()}
                              {p.status === 'For Rent' && ' /mo'}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-muted-foreground">Status / Type</td>
                          {comparePropertiesList.map((p) => (
                            <td key={p._id} className="py-3 px-4 text-foreground">
                              {p.status} · {p.propertyType}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-muted-foreground">Location</td>
                          {comparePropertiesList.map((p) => (
                            <td key={p._id} className="py-3 px-4 text-foreground">
                              {p.location}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-muted-foreground">Beds / Baths</td>
                          {comparePropertiesList.map((p) => (
                            <td key={p._id} className="py-3 px-4 text-foreground">
                              {p.bedrooms} Beds / {p.bathrooms} Baths
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-muted-foreground">Living Area</td>
                          {comparePropertiesList.map((p) => (
                            <td key={p._id} className="py-3 px-4 text-foreground">
                              {p.area.toLocaleString()} sq ft
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-muted-foreground">Price per Sq Ft</td>
                          {comparePropertiesList.map((p) => (
                            <td key={p._id} className="py-3 px-4 text-foreground font-semibold">
                              ${p.area > 0 ? Math.round(p.price / p.area).toLocaleString() : 'N/A'}/sqft
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-muted-foreground">Top Amenities</td>
                          {comparePropertiesList.map((p) => (
                            <td key={p._id} className="py-3 px-4 text-foreground">
                              {(p.amenities || []).slice(0, 3).join(', ')}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-muted-foreground">Action</td>
                          {comparePropertiesList.map((p) => (
                            <td key={p._id} className="py-3 px-4">
                              <Link
                                to={`/property/${p._id}`}
                                className="inline-flex items-center gap-1 text-primary font-bold hover:underline"
                              >
                                <span>View Listing</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Select properties from the cards below to compare them.
                  </p>
                )}
              </div>
            )}

            {/* Saved Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSaved.map((property, idx) => (
                <div key={property._id} className="relative group/saved">
                  {isCompareMode && (
                    <div className="absolute top-2 left-2 z-20">
                      <button
                        onClick={() => handleToggleCompare(property._id)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold shadow-md transition-all ${
                          selectedForCompare.includes(property._id)
                            ? 'bg-accent text-accent-foreground scale-105'
                            : 'bg-card text-foreground hover:bg-secondary'
                        }`}
                      >
                        {selectedForCompare.includes(property._id) ? '✓ Comparing' : '+ Compare'}
                      </button>
                    </div>
                  )}

                  <PropertyCard
                    property={property}
                    index={idx}
                    onQuickView={(p) => setQuickViewProperty(p)}
                  />

                  {/* Remove Button Action */}
                  <div className="mt-2 text-right">
                    <button
                      onClick={() => {
                        removeFromSaved(property._id);
                        toast.info(`Removed "${property.title}" from saved homes`);
                      }}
                      className="text-[11px] text-muted-foreground hover:text-destructive transition-colors inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove from Saved</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        property={quickViewProperty}
        isOpen={!!quickViewProperty}
        onClose={() => setQuickViewProperty(null)}
      />

      <Footer />
    </div>
  );
};

export default SavedProperties;
