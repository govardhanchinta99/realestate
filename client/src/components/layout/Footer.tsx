import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Sparkles, Heart, Shield, FileText, ArrowRight, Github, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-border/70 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center text-primary-foreground shadow-soft">
                <Home className="w-5 h-5" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">
                RealEstate<span className="text-primary">Mate</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              AI-driven luxury real estate discovery. Search by lifestyle, analyze lease agreements, and chat with listings in real time.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-accent">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Semantic Search & RAG Architecture</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-sm font-bold text-foreground mb-4">Explore Marketplace</h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Featured Properties
                </Link>
              </li>
              <li>
                <Link to="/semantic-search" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <span>Lifestyle AI Search</span>
                  <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary font-bold text-[9px]">NEW</span>
                </Link>
              </li>
              <li>
                <Link to="/lease-analyzer" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <span>Lease Agreement Analyzer</span>
                  <span className="px-1.5 py-0.2 rounded bg-accent/20 text-accent font-bold text-[9px]">AI</span>
                </Link>
              </li>
              <li>
                <Link to="/saved" className="hover:text-primary transition-colors">
                  Saved Homes Collection
                </Link>
              </li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="font-display text-sm font-bold text-foreground mb-4">Popular Collections</h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link to="/semantic-search?q=luxury+villa+with+pool" className="hover:text-primary transition-colors">
                  Luxury Villas & Estates
                </Link>
              </li>
              <li>
                <Link to="/semantic-search?q=modern+penthouse+city+view" className="hover:text-primary transition-colors">
                  Downtown Penthouses
                </Link>
              </li>
              <li>
                <Link to="/semantic-search?q=beachfront+ocean+view" className="hover:text-primary transition-colors">
                  Coastal & Beachfront Living
                </Link>
              </li>
              <li>
                <Link to="/semantic-search?q=quiet+suburban+home+for+remote+work" className="hover:text-primary transition-colors">
                  Suburban Remote Work Havens
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Newsletter */}
          <div>
            <h4 className="font-display text-sm font-bold text-foreground mb-4">Stay Ahead of Market</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Receive AI-curated property drops tailored to your lifestyle preferences.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to RealEstateMate alerts!'); }} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="w-full px-3 py-2 text-xs bg-secondary/60 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors flex-shrink-0"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} RealEstateMate. Built with Gemini AI & Vector Embeddings.</p>
          <div className="flex items-center gap-6">
            <Link to="/admin" className="hover:text-primary transition-colors">
              Admin Portal
            </Link>
            <Link to="/" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
