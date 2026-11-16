import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Heart,
  Search,
  Menu,
  X,
  Sparkles,
  Home,
  Shield,
  UserPlus,
  LogIn,
  LogOut,
  Sun,
  Moon,
  FileText,
  Compass,
  ChevronDown,
  User
} from 'lucide-react';
import { useProperty } from '@/context/PropertyContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const { savedProperties } = useProperty();
  const { isAuthenticated, isAdmin, user, logout, loginAsDemo } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/semantic-search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setIsMenuOpen(false);
    }
  };

  const savedCount = savedProperties.length;

  const navLinks = [
    { label: 'Explore Homes', to: '/', icon: Compass },
    { label: 'Lifestyle AI', to: '/semantic-search', icon: Sparkles, badge: 'AI' },
    { label: 'Lease Analyzer', to: '/lease-analyzer', icon: FileText, badge: 'AI' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-hero rounded-2xl flex items-center justify-center shadow-soft group-hover:scale-105 transition-all duration-300">
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-display text-xl font-bold tracking-tight text-foreground flex items-center gap-1">
                RealEstate<span className="text-primary font-extrabold">Mate</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                <Sparkles className="w-3 h-3 text-accent" />
                <span>AI-Powered Marketplace</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-secondary text-foreground font-bold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : ''}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold rounded-full bg-accent/15 text-accent">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  location.pathname === '/admin'
                    ? 'bg-primary text-primary-foreground font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Hub</span>
              </Link>
            )}
          </nav>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-sm mx-4 relative"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Lifestyle search... 'quiet with pool'"
                className="w-full pl-10 pr-16 py-2.5 text-xs bg-secondary/50 border border-border/70 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              {searchTerm && (
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-2.5 py-1 rounded-full text-[11px] font-semibold hover:bg-primary/90 transition-colors"
                >
                  Find
                </button>
              )}
            </div>
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Saved Properties Heart */}
            <Link
              to="/saved"
              aria-label="Saved properties"
              className={`relative p-2.5 rounded-xl transition-all ${
                location.pathname === '/saved'
                  ? 'bg-secondary text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              <Heart className={`w-4 h-4 ${savedCount > 0 ? 'text-red-500 fill-red-500/20' : ''}`} />
              <AnimatePresence>
                {savedCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-xs"
                  >
                    {savedCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* User Account / Profile Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-secondary/60 transition-colors border border-border/60"
                >
                  <img
                    src={
                      user?.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                        user?.name || 'User'
                      )}`
                    }
                    alt={user?.name}
                    className="w-7 h-7 rounded-lg object-cover bg-secondary"
                  />
                  <span className="hidden sm:inline text-xs font-semibold text-foreground max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-elevated p-2 z-50 text-xs"
                    >
                      <div className="p-2 border-b border-border/60 mb-1">
                        <p className="font-semibold text-foreground">{user?.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-[10px] uppercase">
                          {isAdmin ? 'Administrator' : 'Buyer'}
                        </span>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-xl text-foreground hover:bg-secondary transition-colors"
                        >
                          <Shield className="w-3.5 h-3.5 text-primary" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      <Link
                        to="/saved"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 p-2 rounded-xl text-foreground hover:bg-secondary transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5 text-red-500" />
                        <span>Saved Properties ({savedCount})</span>
                      </Link>

                      <div className="border-t border-border/60 my-1 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 p-2 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-foreground hover:text-primary transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-soft"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-secondary/60 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden border-t border-border/60 pb-6"
            >
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative my-4">
                <input
                  type="text"
                  placeholder="Search lifestyle... 'near park for dog'"
                  className="w-full pl-10 pr-4 py-3 text-xs bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </form>

              {/* Mobile Links */}
              <div className="flex flex-col gap-1 text-sm font-medium">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-secondary/60 text-foreground transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-primary" />
                        <span>{link.label}</span>
                      </div>
                      {link.badge && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-accent/20 text-accent">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}

                <Link
                  to="/saved"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-secondary/60 text-foreground transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>Saved Homes</span>
                  </div>
                  {savedCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-600">
                      {savedCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/60 text-foreground transition-colors"
                >
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Admin Hub</span>
                </Link>
              </div>

              {/* Mobile Auth actions */}
              <div className="mt-4 pt-4 border-t border-border/60 flex flex-col gap-2">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl border border-destructive/30 text-destructive text-xs font-semibold flex items-center justify-center gap-2 hover:bg-destructive/10"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out ({user?.name})</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="py-2.5 text-center text-xs font-semibold rounded-xl bg-secondary text-foreground"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="py-2.5 text-center text-xs font-semibold rounded-xl bg-primary text-primary-foreground"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Navbar;
