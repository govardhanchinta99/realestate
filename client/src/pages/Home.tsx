import React, { useContext, useState, useEffect } from 'react';
import { useProperty } from '@/context/PropertyContext';
import { Link } from 'react-router-dom';
import { Search, Sparkles, ArrowRight, Building2, Home, Castle, Building, TreePine } from 'lucide-react';
import { motion } from 'framer-motion';
import PropertyCard from '@/components/property/PropertyCard';

const HomePage: React.FC = () => {
  const { properties, loading } = useProperty();
  const [filter, setFilter] = useState('All');
  const [filteredProperties, setFilteredProperties] = useState(properties);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { name: 'All', icon: Building2 },
    { name: 'House', icon: Home },
    { name: 'Apartment', icon: Building },
    { name: 'Villa', icon: Castle },
    { name: 'Condo', icon: Building2 },
    { name: 'Land', icon: TreePine },
  ];

  useEffect(() => {
    if (filter === 'All') {
      setFilteredProperties(properties);
    } else {
      setFilteredProperties(properties.filter(p => p.propertyType === filter));
    }
  }, [properties, filter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero py-24 lg:py-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-foreground/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* AI Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-primary-foreground">AI-Powered Semantic Search</span>
            </motion.div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Find Your Dream Home
              <br />
              <span className="text-accent">By Lifestyle, Not Filters</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
              Search using natural language like "quiet neighborhood for remote work" 
              or "modern apartment with city views" – our AI understands your vibe.
            </p>

            {/* Hero Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-2xl mx-auto"
            >
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    window.location.href = `/semantic-search?q=${encodeURIComponent(searchQuery)}`;
                  }
                }}
                className="relative"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Describe your ideal home..."
                  className="w-full px-6 py-5 pl-14 text-lg bg-primary-foreground/95 backdrop-blur-sm text-foreground placeholder:text-muted-foreground rounded-2xl shadow-elevated focus:outline-none focus:ring-4 focus:ring-accent/30 transition-all"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-soft"
                >
                  <span className="hidden sm:inline">Search</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </motion.div>

            {/* Quick suggestions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 flex flex-wrap justify-center gap-2"
            >
              <span className="text-sm text-primary-foreground/60">Try:</span>
              {['Family home with backyard', 'Modern city loft', 'Beachfront property'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setSearchQuery(suggestion)}
                  className="text-sm text-primary-foreground/80 hover:text-accent underline-offset-4 hover:underline transition-colors"
                >
                  "{suggestion}"
                </button>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section id="properties" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Properties
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our curated selection of luxury homes, each handpicked for exceptional quality and lifestyle potential.
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex overflow-x-auto pb-4 mb-10 gap-3 no-scrollbar justify-start lg:justify-center"
          >
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = filter === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setFilter(cat.name)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-soft'
                      : 'bg-card text-foreground border border-border hover:border-primary/50 hover:bg-secondary/50'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-accent' : 'text-muted-foreground'} />
                  {cat.name}
                </button>
              );
            })}
          </motion.div>

          {/* Property Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {filteredProperties.map((property, index) => (
              <PropertyCard key={property._id} property={property} index={index} />
            ))}
          </div>

          {filteredProperties.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">No Properties Found</h3>
              <p className="text-muted-foreground">Try selecting a different category or broaden your search.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-16 lg:py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">Powered by AI</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Smart Features for Smart Decisions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI doesn't just search – it understands. From semantic search to instant answers, we're redefining property discovery.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Semantic Search',
                description: 'Search by lifestyle, not checkboxes. "Cozy home near parks for my dog" just works.',
                icon: '🔍'
              },
              {
                title: 'Ask the House',
                description: 'Chat with any property. Ask about amenities, lease terms, or neighborhood – get instant AI answers.',
                icon: '💬'
              },
              {
                title: 'Investment Insights',
                description: 'AI-generated analysis of rental yield potential and market positioning for every listing.',
                icon: '📊'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border hover:shadow-elevated transition-all duration-300 group"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
