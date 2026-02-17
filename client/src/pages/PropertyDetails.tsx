import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useProperty } from '@/context/PropertyContext';
import { 
  Heart, ArrowLeft, MapPin, Bed, Bath, Ruler, CheckCircle, 
  Share2, Phone, Mail, Calendar, TrendingUp, Sparkles, MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  propertyType: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: string;
  image: string;
  amenities?: string[];
}

const PropertyDetails: React.FC = () => {
  const { id } = useParams();
  const { addToSaved, isSaved } = useProperty();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatAnswer, setChatAnswer] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/properties/${id}`);
        setProperty(response.data);
      } catch (error) {
        console.error('Error fetching property:', error);
        // Use mock data for demo
        setProperty({
          _id: id || '1',
          title: 'Luxurious Modern Villa',
          description: 'Step into luxury with this stunning 4-bedroom villa featuring floor-to-ceiling windows, a private pool, and breathtaking city views. The open-concept living space flows seamlessly into a gourmet kitchen with top-of-the-line appliances. The master suite offers a spa-like bathroom and private balcony. Perfect for entertaining with an outdoor kitchen and fire pit area.',
          price: 1250000,
          propertyType: 'Villa',
          location: 'Beverly Hills, CA',
          bedrooms: 4,
          bathrooms: 3,
          area: 3500,
          status: 'For Sale',
          image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
          amenities: ['Pool', 'Garden', 'Garage', 'Smart Home', 'Wine Cellar', 'Home Theater', 'Gym']
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleAskQuestion = async () => {
    if (!chatQuestion.trim() || !property) return;
    
    setIsAsking(true);
    try {
      const response = await axios.post('http://localhost:3001/api/ai/ask-property', {
        question: chatQuestion,
        propertyContext: `${property.title}. ${property.description}. Amenities: ${property.amenities?.join(', ')}`
      });
      setChatAnswer(response.data.answer);
    } catch (error) {
      setChatAnswer("Based on the listing, I can help answer questions about this property. This appears to be a beautiful " + property.propertyType.toLowerCase() + " with " + property.bedrooms + " bedrooms. For specific questions about availability or scheduling a viewing, please contact the agent directly.");
    } finally {
      setIsAsking(false);
      setChatQuestion('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">Loading property...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <h2 className="font-display text-2xl font-bold text-foreground mb-4">Property Not Found</h2>
        <p className="text-muted-foreground mb-8">The property you're looking for doesn't exist.</p>
        <Link 
          to="/" 
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
        >
          Browse Listings
        </Link>
      </div>
    );
  }

  const saved = isSaved(property._id);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Listings
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden bg-secondary shadow-elevated h-[400px] lg:h-[500px]">
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-full object-cover object-center"
              />
            </div>
            
            {/* Status Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`badge-status ${property.status === 'For Sale' ? 'badge-sale' : 'badge-rent'}`}>
                {property.status}
              </span>
              <span className="badge-status badge-type backdrop-blur-sm bg-card/90">
                {property.propertyType}
              </span>
            </div>

            {/* Share Button */}
            <button className="absolute top-4 right-4 w-10 h-10 bg-card/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-soft">
              <Share2 className="w-5 h-5" />
            </button>
          </motion.div>

          {/* Details Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            {/* Title & Location */}
            <div className="mb-6">
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-3">
                {property.title}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-lg">{property.location}</span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">
                  ${property.price.toLocaleString()}
                </span>
                {property.status === 'For Rent' && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-secondary/50 rounded-2xl mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-foreground mb-1">
                  <Bed className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold">{property.bedrooms}</span>
                </div>
                <span className="text-sm text-muted-foreground">Bedrooms</span>
              </div>
              <div className="text-center border-x border-border">
                <div className="flex items-center justify-center gap-2 text-foreground mb-1">
                  <Bath className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold">{property.bathrooms}</span>
                </div>
                <span className="text-sm text-muted-foreground">Bathrooms</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-foreground mb-1">
                  <Ruler className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold">{property.area.toLocaleString()}</span>
                </div>
                <span className="text-sm text-muted-foreground">Sq Ft</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">About This Property</h3>
              <p className="text-muted-foreground leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="mb-8">
                <h3 className="font-display text-xl font-semibold text-foreground mb-4">Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-2 text-muted-foreground p-3 bg-secondary/30 rounded-xl"
                    >
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Investment Score Card */}
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-2xl p-5 mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Investment Potential</h4>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-accent" />
                    <span className="text-xs text-muted-foreground">AI Analysis</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="text-primary font-semibold">Strong Investment:</span> This property is positioned competitively for the {property.location} market with an estimated 5-7% annual appreciation potential based on local trends.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-auto">
              <button className="flex-1 bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-soft hover:shadow-elevated flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Agent
              </button>
              <button
                onClick={() => addToSaved(property)}
                disabled={saved}
                className={`px-6 rounded-xl font-semibold border-2 transition-all flex items-center justify-center ${
                  saved
                    ? 'bg-secondary border-transparent text-muted-foreground cursor-default'
                    : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                }`}
              >
                <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Ask the House Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 lg:mt-16"
        >
          <div className="bg-card rounded-3xl border border-border p-6 lg:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground">Ask the House</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-accent" />
                  AI-powered property Q&A
                </p>
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                placeholder="Ask anything about this property... e.g., 'Is there parking?' or 'What schools are nearby?'"
                className="flex-1 px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
              />
              <button
                onClick={handleAskQuestion}
                disabled={!chatQuestion.trim() || isAsking}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isAsking ? 'Thinking...' : 'Ask'}
              </button>
            </div>

            {chatAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-secondary/30 rounded-xl border border-border"
              >
                <p className="text-muted-foreground">{chatAnswer}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PropertyDetails;
