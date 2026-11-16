import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ExternalLink,
  RotateCcw,
  Building,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { getApiUrl } from '@/lib/api';
import { useProperty, Property } from '@/context/PropertyContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  properties?: Property[];
}

const RealEstateChatbot: React.FC = () => {
  const { properties } = useProperty();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I'm RealEstateMate AI. I can search properties by lifestyle, answer policy & refund questions, or help you find your dream home. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const isPropertyQuery = (text: string) => {
    const keywords = [
      'house', 'villa', 'apartment', 'flat', 'penthouse', 'condo', 'studio',
      'bhk', 'bedroom', 'bedrooms', 'beds', 'bath', 'pool', 'backyard',
      'location', 'neighborhood', 'area', 'california', 'texas', 'new york',
      'for sale', 'rent', 'buy', 'price', 'quiet', 'lifestyle', 'pet'
    ];
    return keywords.some((word) => text.toLowerCase().includes(word));
  };

  const handleSend = async (customMessage?: string) => {
    const textToSend = (customMessage || input).trim();
    if (!textToSend || isLoading) return;

    setInput('');
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: textToSend
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let botAnswer = '';
      let matchedProps: Property[] | undefined = undefined;

      if (isPropertyQuery(textToSend)) {
        // Try backend semantic search
        try {
          const res = await axios.get(
            getApiUrl(`/api/properties/search/semantic?q=${encodeURIComponent(textToSend)}`),
            { timeout: 4000 }
          );
          if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            matchedProps = res.data.slice(0, 3);
          }
        } catch (e) {
          // Fallback to local properties filter
        }

        if (!matchedProps || matchedProps.length === 0) {
          const lower = textToSend.toLowerCase();
          matchedProps = properties
            .filter(
              (p) =>
                p.title.toLowerCase().includes(lower) ||
                p.location.toLowerCase().includes(lower) ||
                p.propertyType.toLowerCase().includes(lower) ||
                (p.amenities || []).some((a) => a.toLowerCase().includes(lower)) ||
                (p.tags || []).some((t) => t.toLowerCase().includes(lower))
            )
            .slice(0, 3);
        }

        if (matchedProps.length === 0) {
          matchedProps = properties.slice(0, 2);
          botAnswer = `I couldn't find exact matches for "${textToSend}", but here are two top-rated homes you might love:`;
        } else {
          botAnswer = `I found ${matchedProps.length} homes matching your lifestyle criteria:`;
        }
      } else {
        // Policy / Knowledge base question
        try {
          const res = await axios.post(
            getApiUrl('/api/ai/ask-policy'),
            {
              question: textToSend,
              history: messages.map((m) => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                content: m.content
              }))
            },
            { timeout: 6000 }
          );
          botAnswer = res.data.answer;
        } catch (err) {
          // Local intelligent fallback for policy
          const lower = textToSend.toLowerCase();
          if (lower.includes('refund') || lower.includes('cancel')) {
            botAnswer =
              'According to RealEstateMate Policy: Inspection fees and booking deposits are 100% refundable up to 48 hours before scheduled walkthroughs. Platform service subscriptions include a 14-day risk-free satisfaction guarantee.';
          } else if (lower.includes('semantic') || lower.includes('how it works')) {
            botAnswer =
              'Our semantic search uses Gemini AI vector embeddings and Pinecone vector database. Instead of checking rigid boxes, it matches the meaning of your search with listing descriptions and disclosures.';
          } else {
            botAnswer =
              "I'm here to help with property discovery, lease clause inspection, or marketplace questions. What kind of home or information are you looking for?";
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          content: botAnswer,
          properties: matchedProps
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          role: 'assistant',
          content:
            "I'm having a brief connection pause, but you can explore all our featured listings directly on the home page!"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const starterChips = [
    'Find luxury villas with pool',
    'Rentals under $3,500/mo',
    'What is your refund policy?',
    'How does semantic search work?'
  ];

  return (
    <>
      {/* Floating Widget Launcher */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Assistant"
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-hero text-primary-foreground rounded-2xl shadow-elevated hover:scale-105 transition-all duration-300 flex items-center justify-center group"
          >
            <div className="relative">
              <MessageCircle className="w-6 h-6 text-primary-foreground" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] sm:w-[400px] h-[560px] bg-card rounded-3xl shadow-2xl border border-border/80 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-hero p-4 text-primary-foreground flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-accent">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold tracking-tight">RealEstateMate AI</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-primary-foreground/75">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Gemini Pro & RAG Engine</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setMessages([
                      {
                        id: 'reset',
                        role: 'assistant',
                        content: 'Chat refreshed. How can I help you find your dream home?'
                      }
                    ])
                  }
                  title="Reset conversation"
                  className="p-1.5 rounded-lg text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/30 custom-scrollbar text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-xl bg-accent/20 text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] space-y-2.5 ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`p-3.5 rounded-2xl leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-xs shadow-soft'
                          : 'bg-card border border-border rounded-tl-xs text-foreground shadow-xs'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>

                    {/* Interactive Property Cards inside Chat! */}
                    {msg.properties && msg.properties.length > 0 && (
                      <div className="space-y-2 w-full pt-1">
                        {msg.properties.map((p) => (
                          <div
                            key={p._id}
                            className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs hover:border-primary/50 transition-all flex gap-3 p-2.5"
                          >
                            <img
                              src={p.image}
                              alt=""
                              className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-secondary"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-display font-bold text-foreground text-xs truncate">
                                {p.title}
                              </h4>
                              <p className="text-[11px] text-muted-foreground truncate">{p.location}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="font-bold text-primary font-display">
                                  ${p.price.toLocaleString()}
                                  {p.status === 'For Rent' && <span className="text-[10px]">/mo</span>}
                                </span>
                                <Link
                                  to={`/property/${p._id}`}
                                  onClick={() => setIsOpen(false)}
                                  className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                                >
                                  <span>View</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 items-center text-muted-foreground">
                  <div className="w-7 h-7 rounded-xl bg-accent/20 text-accent flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="p-3 bg-card border border-border rounded-2xl rounded-tl-xs flex items-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Starters */}
            <div className="px-3 py-2 bg-card border-t border-border flex gap-1.5 overflow-x-auto no-scrollbar">
              {starterChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 whitespace-nowrap transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Row */}
            <div className="p-3 bg-card border-t border-border/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about homes, leases or policies..."
                  className="flex-1 px-3.5 py-2.5 text-xs bg-secondary/60 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40 flex-shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RealEstateChatbot;
