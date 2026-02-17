import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Search, Menu, X, Sparkles, Home, Settings, UserPlus, LogIn } from "lucide-react";
import { useProperty } from "@/context/PropertyContext";
import { motion, AnimatePresence } from "framer-motion";

const Navbar: React.FC = () => {
  const { savedProperties } = useProperty();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/semantic-search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  const savedCount = savedProperties.length;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18 items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-elevated transition-shadow">
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-xl font-semibold text-foreground">
                RealEstate<span className="text-primary">Mate</span>
              </span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3 text-accent" />
                <span>AI-Powered</span>
              </div>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl mx-8 relative"
          >
            <div className={`relative w-full transition-all duration-300 ${isSearchFocused ? 'transform scale-[1.02]' : ''}`}>
              <input
                type="text"
                placeholder="Search by lifestyle... 'quiet neighborhood for remote work'"
                className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-foreground placeholder:text-muted-foreground transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              {searchTerm && (
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Search
                </button>
              )}
            </div>
          </form>

          {/* Right Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/admin"
              className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium text-sm px-3 py-2 rounded-lg hover:bg-secondary/50 transition-all"
            >
              <Settings className="w-4 h-4" />
              <span>Admin</span>
            </Link>

            <Link
              to="/signup"
              className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium text-sm px-3 py-2 rounded-lg hover:bg-secondary/50 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign Up</span>
            </Link>

            <Link
              to="/login"
              className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium text-sm px-3 py-2 rounded-lg hover:bg-secondary/50 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </Link>

            <Link
              to="/saved"
              className="relative p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
            >
              <Heart className="h-5 w-5" />
              <AnimatePresence>
                {savedCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm"
                  >
                    {savedCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-border/50"
            >
              <div className="py-4 space-y-4">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search by lifestyle..."
                    className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </form>

                {/* Mobile Nav Links */}
                <div className="flex flex-col gap-2">
                  <Link
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/50 text-foreground font-medium transition-colors"
                  >
                    <Home className="w-5 h-5 text-primary" />
                    Home
                  </Link>
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/50 text-foreground font-medium transition-colors"
                  >
                    <Settings className="w-5 h-5 text-primary" />
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/50 text-foreground font-medium transition-colors"
                  >
                    <UserPlus className="w-5 h-5 text-primary" />
                    Sign Up
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/50 text-foreground font-medium transition-colors"
                  >
                    <LogIn className="w-5 h-5 text-primary" />
                    Login
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
