import React, { useState, useMemo } from 'react';
import { useProperty, Property } from '@/context/PropertyContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ArrowRight,
  Building2,
  Home as HomeIcon,
  Castle,
  Building,
  TreePine,
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
  ChevronDown,
  Compass,
  FileText,
  MessageCircle,
  TrendingUp,
  MapPin,
  ShieldCheck,
  LayoutGrid,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PropertyCard from '@/components/property/PropertyCard';
import QuickViewModal from '@/components/property/QuickViewModal';
import Footer from '@/components/layout/Footer';

const HomePage: React.FC = () => {
  const { properties, loading } = useProperty();
  const navigate = useNavigate();

  // Filters state
  const [heroSearch, setHeroSearch] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'For Sale' | 'For Rent'>('All');
  const [selectedBedrooms, setSelectedBedrooms] = useState<number | 'Any'>('Any');
  const [selectedBathrooms, setSelectedBathrooms] = useState<number | 'Any'>('Any');
  const [maxPrice, setMaxPrice] = useState<number | 'Any'>('Any');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'area-desc'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Quick View Modal
  const [quickViewProperty, setQuickViewProperty] = useState<Property | null>(null);

  const categories = [
    { name: 'All', icon: Building2 },
    { name: 'Villa', icon: Castle },
    { name: 'Apartment', icon: Building },
    { name: 'House', icon: HomeIcon },
    { name: 'Condo', icon: Building2 },
    { name: 'Townhouse', icon: HomeIcon },
    { name: 'Studio', icon: Building },
  ];

  const popularAmenities = [
    'Pool',
    'Private Backyard',
    'Gym',
    'Wine Cellar',
    'Smart Home',
    'Beach Access',
    'Fireplace',
    'Doorman 24/7',
    'Home Office Studio',
    'Mountain Views'
  ];

  const lifestyleSuggestions = [
    'Quiet neighborhood for remote work',
    'Family home with private fenced backyard',
    'Modern penthouse with panoramic city views',
    'Direct beachfront with infinity pool',
    'Ski-in ski-out mountain retreat'
  ];

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/semantic-search?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const resetFilters = () => {
    setKeyword('');
    setSelectedType('All');
    setSelectedStatus('All');
    setSelectedBedrooms('Any');
    setSelectedBathrooms('Any');
    setMaxPrice('Any');
    setSelectedAmenities([]);
    setSortBy('featured');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (keyword) count++;
    if (selectedType !== 'All') count++;
    if (selectedStatus !== 'All') count++;
    if (selectedBedrooms !== 'Any') count++;
    if (selectedBathrooms !== 'Any') count++;
    if (maxPrice !== 'Any') count++;
    if (selectedAmenities.length > 0) count += selectedAmenities.length;
    return count;
  }, [keyword, selectedType, selectedStatus, selectedBedrooms, selectedBathrooms, maxPrice, selectedAmenities]);

  // Filtering and sorting
  const filteredProperties = useMemo(() => {
    return properties
      .filter((p) => {
        // Keyword filter
        if (keyword.trim()) {
          const q = keyword.toLowerCase();
          const matchesTitle = p.title.toLowerCase().includes(q);
          const matchesLoc = p.location.toLowerCase().includes(q);
          const matchesDesc = (p.description || '').toLowerCase().includes(q);
          if (!matchesTitle && !matchesLoc && !matchesDesc) return false;
        }

        // Status
        if (selectedStatus !== 'All' && p.status !== selectedStatus) return false;

        // Property type
        if (selectedType !== 'All' && p.propertyType !== selectedType) return false;

        // Bedrooms
        if (selectedBedrooms !== 'Any' && p.bedrooms < Number(selectedBedrooms)) return false;

        // Bathrooms
        if (selectedBathrooms !== 'Any' && p.bathrooms < Number(selectedBathrooms)) return false;

        // Max price
        if (maxPrice !== 'Any' && p.price > Number(maxPrice)) return false;

        // Amenities
        if (selectedAmenities.length > 0) {
          const hasAll = selectedAmenities.every((amenity) =>
            (p.amenities || []).some((a) => a.toLowerCase().includes(amenity.toLowerCase()))
          );
          if (!hasAll) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'area-desc') return b.area - a.area;
        // Featured
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [
    properties,
    keyword,
    selectedStatus,
    selectedType,
    selectedBedrooms,
    selectedBathrooms,
    maxPrice,
    selectedAmenities,
    sortBy
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero py-20 lg:py-28 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* AI Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-accent animate-pulse" />
              <span className="text-xs font-semibold text-primary-foreground tracking-wide uppercase">
                AI-Powered Real Estate Discovery
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-6 leading-tight max-w-4xl mx-auto">
              Find Your Dream Home{' '}
              <span className="text-accent underline decoration-accent/40 decoration-wavy underline-offset-8">
                By Lifestyle
              </span>
              , Not Just Filters.
            </h1>

            <p className="text-base sm:text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Describe what truly matters to you — high ceilings, walkable parks, serene views, or an inspiring home workspace. Our AI vector search understands nuance.
            </p>

            {/* Quick Buy vs Rent selector */}
            <div className="inline-flex p-1 bg-black/20 backdrop-blur-md rounded-2xl border border-white/15 mb-6">
              <button
                type="button"
                onClick={() => setSelectedStatus('All')}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedStatus === 'All'
                    ? 'bg-primary-foreground text-foreground shadow-sm'
                    : 'text-primary-foreground/80 hover:text-primary-foreground'
                }`}
              >
                All Listings
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('For Sale')}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedStatus === 'For Sale'
                    ? 'bg-primary-foreground text-foreground shadow-sm'
                    : 'text-primary-foreground/80 hover:text-primary-foreground'
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('For Rent')}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedStatus === 'For Rent'
                    ? 'bg-primary-foreground text-foreground shadow-sm'
                    : 'text-primary-foreground/80 hover:text-primary-foreground'
                }`}
              >
                Rent
              </button>
            </div>

            {/* Main AI Search Box */}
            <div className="max-w-2xl mx-auto mb-6">
              <form onSubmit={handleHeroSearch} className="relative">
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Describe your ideal vibe... 'pet-friendly with sunny patio and pool'"
                  className="w-full px-6 py-4 pl-14 pr-32 text-sm sm:text-base bg-card/95 backdrop-blur-md text-foreground placeholder:text-muted-foreground rounded-2xl shadow-elevated focus:outline-none focus:ring-4 focus:ring-accent/30 transition-all border border-white/20"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-soft"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Lifestyle Prompts */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
              <span className="text-xs text-primary-foreground/70 font-medium mr-1">Trending vibes:</span>
              {lifestyleSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setHeroSearch(suggestion);
                    navigate(`/semantic-search?q=${encodeURIComponent(suggestion)}`);
                  }}
                  className="text-xs bg-white/10 hover:bg-white/20 text-primary-foreground/90 px-3 py-1.5 rounded-full border border-white/15 backdrop-blur-sm transition-all hover:scale-105"
                >
                  "{suggestion}"
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Catalog & Interactive Filter Section */}
      <section id="browse" className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                <Compass className="w-3.5 h-3.5" />
                <span>Curated Portfolio</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                Featured Properties
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Showing {filteredProperties.length} of {properties.length} available homes
              </p>
            </div>

            {/* Sort & View Mode Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-secondary/80 p-1 rounded-xl border border-border">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    viewMode === 'compact'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-label="Compact view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Selector */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'area-desc'
                    )
                  }
                  className="pl-3 pr-8 py-2 text-xs font-semibold bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="area-desc">Largest Area (Sq Ft)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Category Pills Bar */}
          <div className="flex overflow-x-auto pb-3 mb-6 gap-2 no-scrollbar">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedType === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedType(cat.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-soft'
                      : 'bg-card text-muted-foreground hover:text-foreground border border-border/80 hover:bg-secondary/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-accent' : ''}`} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Filter Toolbar */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 mb-8 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Keyword / Location Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by city, title or feature..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
                {keyword && (
                  <button
                    onClick={() => setKeyword('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Bedrooms Filter */}
              <div>
                <select
                  value={selectedBedrooms}
                  onChange={(e) =>
                    setSelectedBedrooms(e.target.value === 'Any' ? 'Any' : Number(e.target.value))
                  }
                  className="w-full px-3 py-2 text-xs bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="Any">Bedrooms: Any</option>
                  <option value="1">1+ Bedrooms</option>
                  <option value="2">2+ Bedrooms</option>
                  <option value="3">3+ Bedrooms</option>
                  <option value="4">4+ Bedrooms</option>
                  <option value="5">5+ Bedrooms</option>
                </select>
              </div>

              {/* Max Budget */}
              <div>
                <select
                  value={maxPrice}
                  onChange={(e) =>
                    setMaxPrice(e.target.value === 'Any' ? 'Any' : Number(e.target.value))
                  }
                  className="w-full px-3 py-2 text-xs bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="Any">Budget: Any Price</option>
                  <option value="5000">Under $5,000/mo (Rent)</option>
                  <option value="750000">Under $750,000</option>
                  <option value="1000000">Under $1,000,000</option>
                  <option value="2000000">Under $2,000,000</option>
                  <option value="3500000">Under $3,500,000</option>
                </select>
              </div>

              {/* Status / Clear Filter Button */}
              <div className="flex gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as 'All' | 'For Sale' | 'For Rent')
                  }
                  className="flex-1 px-3 py-2 text-xs bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="All">Buy & Rent</option>
                  <option value="For Sale">For Sale Only</option>
                  <option value="For Rent">For Rent Only</option>
                </select>

                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center gap-1.5 flex-shrink-0"
                    title="Reset all filters"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset ({activeFiltersCount})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Amenities Tags */}
            <div className="mt-3 pt-3 border-t border-border/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
                Amenities:
              </span>
              {popularAmenities.map((amenity) => {
                const isChecked = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                      isChecked
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3" />}
                    <span>{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Properties Grid */}
          {filteredProperties.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'grid grid-cols-1 md:grid-cols-2 gap-4'
              }
            >
              {filteredProperties.map((property, index) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  index={index}
                  onQuickView={(p) => setQuickViewProperty(p)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-3xl border border-border p-8">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                No Properties Match Your Filters
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">
                Try widening your search budget, clearing selected amenities, or exploring via our natural language Lifestyle AI.
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-soft"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Flagship AI Features Showcase */}
      <section className="py-16 bg-secondary/30 border-y border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Built for the Modern Buyer</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Why RealEstateMate Is Different
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Traditional real estate sites trap you in rigid dropdowns. We built an AI engine that understands how you actually want to live.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-card p-6 rounded-3xl border border-border hover:shadow-elevated transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">
                Semantic Lifestyle Search
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Don't guess which filters to pick. Type "sunlit morning light with space for piano and dog" and let vector embeddings do the heavy lifting.
              </p>
              <Link
                to="/semantic-search"
                className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline"
              >
                <span>Try Lifestyle Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="bg-card p-6 rounded-3xl border border-border hover:shadow-elevated transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">
                "Ask the House" RAG Chat
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Every listing has its own AI assistant grounded in listing disclosures, HOA rules, and neighborhood specs. Ask questions in natural English.
              </p>
              <Link
                to="/property/1"
                className="text-xs font-semibold text-accent inline-flex items-center gap-1 hover:underline"
              >
                <span>Chat with Sample Home</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="bg-card p-6 rounded-3xl border border-border hover:shadow-elevated transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">
                Instant Lease Agreement AI
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Upload or paste any residential lease. Extract security deposits, pet clauses, early termination fees, and calculate a lease fairness score.
              </p>
              <Link
                to="/lease-analyzer"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 hover:underline"
              >
                <span>Analyze Lease Terms</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="py-12 bg-card border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="font-display text-3xl font-extrabold text-foreground mb-1">$48M+</div>
              <div className="text-xs text-muted-foreground font-medium">Curated Real Estate Value</div>
            </div>
            <div>
              <div className="font-display text-3xl font-extrabold text-primary mb-1">98.4%</div>
              <div className="text-xs text-muted-foreground font-medium">Semantic Search Accuracy</div>
            </div>
            <div>
              <div className="font-display text-3xl font-extrabold text-accent mb-1">&lt; 2s</div>
              <div className="text-xs text-muted-foreground font-medium">Instant AI Answers</div>
            </div>
            <div>
              <div className="font-display text-3xl font-extrabold text-foreground mb-1">100%</div>
              <div className="text-xs text-muted-foreground font-medium">Verified Property Data</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        property={quickViewProperty}
        isOpen={!!quickViewProperty}
        onClose={() => setQuickViewProperty(null)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
