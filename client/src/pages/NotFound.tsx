import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, ArrowLeft, Search } from 'lucide-react';

const NotFound: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mb-6 text-primary shadow-soft">
        <Home className="w-10 h-10" />
      </div>

      <div className="inline-block px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold uppercase tracking-wider mb-3">
        404 Page Not Found
      </div>

      <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground mb-3">
        Looking for a Home That Doesn't Exist?
      </h1>

      <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
        We couldn't find the page at <code className="text-foreground bg-secondary px-2 py-0.5 rounded font-mono text-xs">{location.pathname}</code>. It might have been moved, sold, or renamed.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-soft"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>

        <Link
          to="/semantic-search"
          className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-foreground text-xs font-semibold rounded-xl hover:bg-secondary/80 transition-all border border-border"
        >
          <Search className="w-4 h-4" />
          <span>Search Properties by Lifestyle</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
