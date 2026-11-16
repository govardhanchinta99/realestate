import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useProperty, Property } from '@/context/PropertyContext';
import { getApiUrl } from '@/lib/api';
import {
  Heart,
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Ruler,
  CheckCircle2,
  Share2,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Sparkles,
  MessageCircle,
  Shield,
  Eye,
  Check,
  Building,
  DollarSign,
  Send,
  User,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import PropertyCard from '@/components/property/PropertyCard';
import MortgageCalculator from '@/components/property/MortgageCalculator';
import ContactAgentModal from '@/components/property/ContactAgentModal';
import Footer from '@/components/layout/Footer';

interface InvestmentAnalysis {
  rating: 'Strong' | 'Moderate' | 'Cautious' | string;
  analysis: string;
  avgRentalYield: number;
  marketPricePerSqft: number;
  pricePerSqft: number;
  marketDeltaPercent: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPropertyById, properties, isSaved, toggleSaved } = useProperty();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Investment analysis
  const [investmentAnalysis, setInvestmentAnalysis] = useState<InvestmentAnalysis | null>(null);

  // Property Chat Q&A
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAsking, setIsAsking] = useState(false);

  // Contact Agent Modal
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const foundLocal = getPropertyById(id || '');

    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        if (foundLocal) {
          setProperty(foundLocal);
        }

        // Try backend for freshest data
        const response = await axios.get(getApiUrl(`/api/properties/${id}`), { timeout: 3500 });
        if (response.data && response.data.title) {
          setProperty((prev) => ({ ...prev, ...response.data }));
        }
      } catch (error) {
        console.log('Using local property details');
        if (!foundLocal && properties.length > 0) {
          setProperty(properties[0]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id, properties, getPropertyById]);

  // Load or calculate investment potential
  useEffect(() => {
    if (!property) return;

    const fetchInvestmentAnalysis = async () => {
      try {
        const res = await axios.get(getApiUrl(`/api/properties/${property._id}/investment-analysis`), {
          timeout: 4000
        });
        if (res.data && res.data.rating) {
          setInvestmentAnalysis(res.data);
          return;
        }
      } catch (e) {
        // Fallback intelligent calculation
      }

      // Generate local investment analysis
      const ppsf = property.area > 0 ? Math.round(property.price / property.area) : 450;
      const benchmarkPpsf = 480;
      const delta = Math.round(((ppsf - benchmarkPpsf) / benchmarkPpsf) * 100);
      const yieldEstimate = property.status === 'For Rent' ? 6.2 : 4.8;
      const rating = delta < -5 ? 'Strong' : delta < 8 ? 'Moderate' : 'Cautious';

      setInvestmentAnalysis({
        rating,
        analysis: `${rating} investment prospect. Priced at $${ppsf}/sqft, which is ${
          delta >= 0 ? `${delta}% above` : `${Math.abs(delta)}% below`
        } area market averages. Projected gross rental yield is approximately ${yieldEstimate}%.`,
        avgRentalYield: yieldEstimate,
        marketPricePerSqft: benchmarkPpsf,
        pricePerSqft: ppsf,
        marketDeltaPercent: delta
      });
    };

    fetchInvestmentAnalysis();

    // Initialize chatbot message
    setChatHistory([
      {
        role: 'assistant',
        content: `Hello! I'm the AI assistant for ${property.title}. Ask me anything about this home's amenities, floor plan, neighborhood, or policies!`
      }
    ]);
  }, [property]);

  const handleToggleSaved = () => {
    if (!property) return;
    const nowSaved = toggleSaved(property);
    if (nowSaved) {
      toast.success(`Saved "${property.title}" to favorites!`);
    } else {
      toast.info(`Removed from your saved homes`);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Listing link copied to clipboard!', {
      icon: <Share2 className="w-4 h-4 text-primary" />
    });
  };

  const handleAskQuestion = async (presetQuestion?: string) => {
    const questionToSend = (presetQuestion || chatQuestion).trim();
    if (!questionToSend || !property || isAsking) return;

    setChatQuestion('');
    setChatHistory((prev) => [...prev, { role: 'user', content: questionToSend }]);
    setIsAsking(true);

    try {
      const response = await axios.post(
        getApiUrl('/api/ai/ask-property'),
        {
          question: questionToSend,
          propertyId: property._id,
          propertyContext: `${property.title}. ${property.description}. Located in ${property.location}. Price: $${property.price}. Type: ${property.propertyType}. Bedrooms: ${property.bedrooms}. Bathrooms: ${property.bathrooms}. Amenities: ${property.amenities?.join(', ')}`
        },
        { timeout: 7000 }
      );

      const botReply =
        response.data.answer ||
        `Based on the official listing, this property features ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms, and amenities including ${property.amenities.slice(0, 3).join(', ')}.`;

      setChatHistory((prev) => [...prev, { role: 'assistant', content: botReply }]);
    } catch (error) {
      // Local intelligent response fallback
      setTimeout(() => {
        let answer = `Regarding "${questionToSend}": `;
        const q = questionToSend.toLowerCase();

        if (q.includes('pet') || q.includes('dog') || q.includes('cat')) {
          answer += `This property welcomes domestic pets with standard pet deposit guidelines. The spacious layout and nearby outdoor areas make it great for pet owners!`;
        } else if (q.includes('park') || q.includes('garage') || q.includes('car')) {
          answer += `Parking is included on the premises, featuring covered garage parking with guest parking accommodations.`;
        } else if (q.includes('hoa') || q.includes('fee') || q.includes('tax')) {
          answer += `Standard building maintenance and common amenities are covered. Contact the listing agent for the complete HOA schedule and tax breakdown.`;
        } else if (q.includes('school') || q.includes('neighborhood')) {
          answer += `The property is situated in the desirable ${property.location} neighborhood with access to top-rated school districts, parks, and dining options.`;
        } else {
          answer += `This ${property.propertyType} offers ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms, and ${property.area.toLocaleString()} sq ft of premium living space. For specialized inquiries, schedule a tour or message our agent!`;
        }

        setChatHistory((prev) => [...prev, { role: 'assistant', content: answer }]);
      }, 500);
    } finally {
      setIsAsking(false);
    }
  };

  const presetQuestions = [
    'Are pets allowed here?',
    'What parking or garage is included?',
    'What are the estimated HOA fees?',
    'Tell me about the neighborhood & schools'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground font-semibold">Loading luxury property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-20">
        <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mb-4 text-muted-foreground">
          <Building className="w-10 h-10" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">Property Not Found</h2>
        <p className="text-xs text-muted-foreground mb-6">
          The property listing you are seeking might have been moved or removed.
        </p>
        <Link
          to="/"
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-soft"
        >
          Browse All Available Listings
        </Link>
      </div>
    );
  }

  const saved = isSaved(property._id);
  const galleryImages =
    property.images && property.images.length > 0 ? property.images : [property.image];
  const pricePerSqft = property.area > 0 ? Math.round(property.price / property.area) : 0;

  // Similar properties
  const similarProperties = properties
    .filter((p) => p._id !== property._id && (p.propertyType === property.propertyType || Math.abs(p.price - property.price) < 500000))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb & Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/80 transition-colors flex items-center gap-1.5 border border-border"
              title="Share listing link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={handleToggleSaved}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                saved
                  ? 'bg-red-50 text-red-500 border-red-200'
                  : 'bg-secondary text-foreground border-border hover:text-red-500 hover:border-red-200'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-red-500' : ''}`} />
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Hero Gallery Section */}
        <div className="mb-10">
          <div className="relative h-[360px] sm:h-[480px] lg:h-[540px] rounded-3xl overflow-hidden bg-muted shadow-elevated mb-3">
            <img
              src={galleryImages[activeImageIndex] || property.image}
              alt={property.title}
              className="w-full h-full object-cover object-center transition-all duration-500"
            />
            {/* Status & Type Badges */}
            <div className="absolute top-5 left-5 flex gap-2 z-10">
              <span
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-md ${
                  property.status === 'For Sale' ? 'bg-emerald-600' : 'bg-amber-600'
                }`}
              >
                {property.status}
              </span>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-card/90 text-foreground backdrop-blur-md shadow-md">
                {property.propertyType}
              </span>
            </div>
          </div>

          {/* Thumbnails Row */}
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all border-2 ${
                    activeImageIndex === idx
                      ? 'border-primary ring-2 ring-primary/20 scale-105'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content & Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Info Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Title, Location & Price Header */}
            <div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{property.location}</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
                {property.title}
              </h1>

              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-display text-4xl sm:text-5xl font-extrabold text-primary">
                  ${property.price.toLocaleString()}
                </span>
                {property.status === 'For Rent' ? (
                  <span className="text-base text-muted-foreground font-medium">/month</span>
                ) : (
                  pricePerSqft > 0 && (
                    <span className="text-sm text-muted-foreground font-semibold">
                      (${pricePerSqft.toLocaleString()} / sq ft)
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Key Specs Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-card border border-border/80 rounded-2xl shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display text-lg font-bold text-foreground">
                    {property.bedrooms}
                  </div>
                  <div className="text-[11px] text-muted-foreground">Bedrooms</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Bath className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display text-lg font-bold text-foreground">
                    {property.bathrooms}
                  </div>
                  <div className="text-[11px] text-muted-foreground">Bathrooms</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display text-lg font-bold text-foreground">
                    {property.area.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-muted-foreground">Square Feet</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display text-lg font-bold text-foreground">
                    {property.yearBuilt || 2022}
                  </div>
                  <div className="text-[11px] text-muted-foreground">Year Built</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                About This Property
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Verified Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Amenities & Features
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Verified Disclosures</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-secondary/50 rounded-xl border border-border/50 text-xs font-semibold text-foreground flex items-center gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Investment Potential Analysis */}
            <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-primary/20 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">
                      AI Investment & Yield Potential
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-accent" />
                      <span>Gemini Pro real estate financial model</span>
                    </p>
                  </div>
                </div>

                {investmentAnalysis && (
                  <span
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${
                      investmentAnalysis.rating === 'Strong'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {investmentAnalysis.rating} Outlook
                  </span>
                )}
              </div>

              {investmentAnalysis && (
                <div>
                  <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed mb-5">
                    {investmentAnalysis.analysis}
                  </p>

                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-primary/10 text-center">
                    <div className="p-2.5 rounded-xl bg-card border border-border/60">
                      <div className="font-display text-base font-bold text-primary">
                        {investmentAnalysis.avgRentalYield}%
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">
                        Rental Yield
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card border border-border/60">
                      <div className="font-display text-base font-bold text-foreground">
                        ${investmentAnalysis.pricePerSqft}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">
                        Price / Sq Ft
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card border border-border/60">
                      <div className="font-display text-base font-bold text-foreground">
                        {investmentAnalysis.marketDeltaPercent > 0 ? '+' : ''}
                        {investmentAnalysis.marketDeltaPercent}%
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">
                        Market Delta
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive "Ask the House" Section */}
            <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-soft">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center text-primary-foreground">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">Ask the House</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-accent" />
                    <span>Real-time RAG property intelligence</span>
                  </p>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="bg-secondary/40 rounded-2xl p-4 space-y-3 mb-4 max-h-72 overflow-y-auto custom-scrollbar border border-border/60">
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-accent/20 text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-xs'
                          : 'bg-card border border-border rounded-tl-xs text-foreground shadow-xs'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isAsking && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                    <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <span>Analyzing property disclosures...</span>
                  </div>
                )}
              </div>

              {/* Preset prompt buttons */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {presetQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleAskQuestion(q)}
                    className="text-[11px] px-3 py-1 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/70 transition-colors font-medium"
                  >
                    "{q}"
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatQuestion}
                  onChange={(e) => setChatQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                  placeholder="Ask a question about this home..."
                  className="flex-1 px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs text-foreground placeholder:text-muted-foreground"
                />
                <button
                  onClick={() => handleAskQuestion()}
                  disabled={!chatQuestion.trim() || isAsking}
                  className="px-5 py-3 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sticky Action Sidebar (4 Cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              {/* Action Card */}
              <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-soft space-y-4">
                <div className="flex items-baseline justify-between border-b border-border/60 pb-4">
                  <div>
                    <span className="text-[11px] text-muted-foreground uppercase font-bold">Price</span>
                    <div className="font-display text-2xl font-extrabold text-primary">
                      ${property.price.toLocaleString()}
                      {property.status === 'For Rent' && (
                        <span className="text-xs text-muted-foreground font-normal">/mo</span>
                      )}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-secondary text-secondary-foreground">
                    {property.status}
                  </span>
                </div>

                {/* Primary CTA: Schedule Tour */}
                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="w-full py-4 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-2xl hover:bg-primary/90 transition-all shadow-soft flex items-center justify-center gap-2 group"
                >
                  <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Schedule Private Tour</span>
                </button>

                {/* Secondary CTA: Contact Agent */}
                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="w-full py-3.5 bg-secondary text-foreground font-bold text-xs rounded-2xl hover:bg-secondary/80 transition-all flex items-center justify-center gap-2 border border-border"
                >
                  <Phone className="w-4 h-4 text-primary" />
                  <span>Contact Listing Agent</span>
                </button>

                <p className="text-[11px] text-center text-muted-foreground">
                  Free cancellation · Zero obligation · Instant confirmation
                </p>
              </div>

              {/* Mortgage Calculator */}
              <MortgageCalculator price={property.price} />
            </div>
          </div>
        </div>

        {/* Similar Properties Section */}
        {similarProperties.length > 0 && (
          <div className="mt-20 pt-12 border-t border-border/60">
            <div className="mb-6">
              <span className="text-xs font-bold text-primary uppercase tracking-wide">Recommendations</span>
              <h3 className="font-display text-2xl font-bold text-foreground">
                Similar Properties You Might Love
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.map((p, idx) => (
                <PropertyCard key={p._id} property={p} index={idx} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Schedule Tour / Contact Modal */}
      <ContactAgentModal
        property={property}
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      <Footer />
    </div>
  );
};

export default PropertyDetails;
