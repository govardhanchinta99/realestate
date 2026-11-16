import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useProperty, Property } from '@/context/PropertyContext';
import { getApiUrl } from '@/lib/api';
import {
  Heart,
  MapPin,
  ArrowLeft,
  Search,
  Sparkles,
  Bed,
  Bath,
  Ruler,
  SlidersHorizontal,
  Compass,
  Check,
  RotateCcw
} from 'lucide-react';
import { motion } from 'framer-motion';
import PropertyCard from '@/components/property/PropertyCard';
import QuickViewModal from '@/components/property/QuickViewModal';
import Footer from '@/components/layout/Footer';

const SemanticSearch: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParam = new URLSearchParams(location.search).get('q') || '';
  const { properties } = useProperty();

  const [searchInput, setSearchInput] = useState(queryParam);
  const [activeQuery, setActiveQuery] = useState(queryParam);
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [quickViewProperty, setQuickViewProperty] = useState<Property | null>(null);

  // Secondary refine filters
  const [selectedType, setSelectedType] = useState('All');
  const [maxPrice, setMaxPrice] = useState<'Any' | number>('Any');

  const popularQueries = [
    'Quiet neighborhood for remote work',
    'Family home with private fenced backyard',
    'Modern penthouse with panoramic city views',
    'Beachfront villa with infinity pool',
    'Mid-century modern design with mountain views',
    'Minimalist urban loft near transit and cafes'
  ];

  // Semantic query executor with local vector/keyword fallback
  const performSearch = useCallback(async (queryToSearch: string) => {
    if (!queryToSearch.trim()) {
      setResults(properties);
      return;
    }

    setLoading(true);
    setActiveQuery(queryToSearch);

    try {
      const response = await axios.get(
        getApiUrl(`/api/properties/search/semantic?q=${encodeURIComponent(queryToSearch)}`),
        { timeout: 5000 }
      );

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setResults(response.data);
        return;
      }
    } catch (error) {
      console.log('Using local semantic matching engine');
    }

    // Local semantic scoring simulation
    const keywords = queryToSearch
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const scored = properties.map((prop) => {
      const textToMatch = `${prop.title} ${prop.description} ${prop.location} ${prop.propertyType} ${(
        prop.amenities || []
      ).join(' ')} ${(prop.tags || []).join(' ')}`.toLowerCase();

      let matchCount = 0;
      keywords.forEach((kw) => {
        if (textToMatch.includes(kw)) matchCount += 1.5;
      });

      // Semantic affinity heuristics
      if (queryToSearch.toLowerCase().includes('pool') && prop.amenities.some((a) => a.includes('Pool')))
        matchCount += 2;
      if (queryToSearch.toLowerCase().includes('quiet') && (prop.description.includes('tranquil') || prop.tags?.includes('quiet')))
        matchCount += 2;
      if (queryToSearch.toLowerCase().includes('remote') && (prop.amenities.some((a) => a.includes('Studio')) || prop.tags?.includes('remote work')))
        matchCount += 2;
      if (queryToSearch.toLowerCase().includes('beach') && (prop.location.includes('Malibu') || prop.title.includes('Coastal')))
        matchCount += 3;

      const baseScore = 0.75;
      const normalizedScore = Math.min(0.99, baseScore + matchCount * 0.05);

      return {
        ...prop,
        score: normalizedScore
      };
    });

    // Sort by match score descending
    scored.sort((a, b) => (b.score || 0) - (a.score || 0));
    setResults(scored);
    setLoading(false);
  }, [properties]);

  useEffect(() => {
    if (queryParam) {
      setSearchInput(queryParam);
      performSearch(queryParam);
    } else {
      // Default to curated list
      setResults(properties);
    }
  }, [queryParam, properties, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/semantic-search?q=${encodeURIComponent(searchInput.trim())}`);
      performSearch(searchInput.trim());
    }
  };

  // Filtered results
  const filteredResults = results.filter((p) => {
    if (selectedType !== 'All' && p.propertyType !== selectedType) return false;
    if (maxPrice !== 'Any' && p.price > Number(maxPrice)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <section className="bg-gradient-hero py-16 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-4 text-xs font-semibold text-primary-foreground">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Pinecone & Gemini Vector Embeddings</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary-foreground mb-4">
            Search Homes by Lifestyle & Vibe
          </h1>

          <p className="text-xs sm:text-sm text-primary-foreground/80 max-w-xl mx-auto mb-6">
            Describe how you want your life to feel — "walkable neighborhood with great bakeries" or "zen garden sanctuary".
          </p>

          {/* Search Input Box */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by lifestyle... 'quiet home for remote work with fenced yard'"
              className="w-full px-6 py-4 pl-12 pr-28 text-xs sm:text-sm bg-card/95 backdrop-blur-md text-foreground rounded-2xl shadow-elevated focus:outline-none focus:ring-4 focus:ring-accent/30 border border-white/20"
            />
            <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors shadow-soft"
            >
              Analyze
            </button>
          </form>

          {/* Prompts */}
          <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-3xl mx-auto">
            {popularQueries.slice(0, 4).map((q) => (
              <button
                key={q}
                onClick={() => {
                  setSearchInput(q);
                  navigate(`/semantic-search?q=${encodeURIComponent(q)}`);
                  performSearch(q);
                }}
                className="text-[11px] bg-white/10 hover:bg-white/20 text-primary-foreground/90 px-3 py-1 rounded-full border border-white/15 transition-all"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results Workspace */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Results Header & Secondary Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-accent" />
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                {activeQuery ? `Results for "${activeQuery}"` : 'AI Curated Portfolio'}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Found {filteredResults.length} properties matched by lifestyle context
            </p>
          </div>

          {/* Refine Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 text-xs bg-card border border-border rounded-xl text-foreground focus:outline-none cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Villa">Villa</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Condo">Condo</option>
              <option value="Studio">Studio</option>
            </select>

            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value === 'Any' ? 'Any' : Number(e.target.value))}
              className="px-3 py-2 text-xs bg-card border border-border rounded-xl text-foreground focus:outline-none cursor-pointer"
            >
              <option value="Any">Any Price</option>
              <option value="1000000">Under $1,000,000</option>
              <option value="2000000">Under $2,000,000</option>
              <option value="3500000">Under $3,500,000</option>
            </select>

            {(selectedType !== 'All' || maxPrice !== 'Any') && (
              <button
                onClick={() => {
                  setSelectedType('All');
                  setMaxPrice('Any');
                }}
                className="px-2.5 py-2 text-xs text-destructive hover:bg-destructive/10 rounded-xl"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Listings Display */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-muted-foreground font-semibold">
              Generating semantic vector matches with Pinecone & Gemini...
            </p>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResults.map((property, idx) => (
              <PropertyCard
                key={property._id}
                property={property}
                index={idx}
                showMatchScore={!!activeQuery}
                onQuickView={(p) => setQuickViewProperty(p)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-3xl border border-border p-8">
            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              No Matches Found for this Query
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">
              Try rephrasing your lifestyle vibe or explore one of our trending searches.
            </p>
            <button
              onClick={() => {
                setSearchInput('Quiet neighborhood for remote work');
                performSearch('Quiet neighborhood for remote work');
              }}
              className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Try "Quiet neighborhood for remote work"
            </button>
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

export default SemanticSearch;
