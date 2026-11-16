import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/context/ThemeContext';
import { PropertyProvider } from '@/context/PropertyContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import RealEstateChatbot from '@/components/chat/RealEstateChatbot';
import HomePage from '@/pages/Home';
import PropertyDetails from '@/pages/PropertyDetails';
import SavedProperties from '@/pages/SavedProperties';
import SemanticSearch from '@/pages/SemanticSearch';
import LeaseAnalyzer from '@/pages/LeaseAnalyzer';
import AdminDashboard from '@/pages/AdminDashboard';
import Signup from '@/pages/Signup';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import { Shield, ArrowRight, User } from 'lucide-react';

const queryClient = new QueryClient();

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loginAsDemo } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Administrator Access Required
        </h2>
        <p className="text-xs text-muted-foreground max-w-sm mb-6 leading-relaxed">
          The Admin Hub is reserved for administrative accounts. For evaluation, you can switch to the Demo Admin account with one click below.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => loginAsDemo('admin')}
            className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-soft flex items-center gap-1.5"
          >
            <Shield className="w-4 h-4" />
            <span>Switch to Demo Admin</span>
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-5 py-2.5 bg-secondary text-foreground text-xs font-semibold rounded-xl hover:bg-secondary/80 transition-colors"
          >
            Return to Previous Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <PropertyProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-right" richColors closeButton />
            <BrowserRouter>
              <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary selection:text-primary-foreground">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/property/:id" element={<PropertyDetails />} />
                    <Route path="/saved" element={<SavedProperties />} />
                    <Route path="/semantic-search" element={<SemanticSearch />} />
                    <Route path="/lease-analyzer" element={<LeaseAnalyzer />} />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <RealEstateChatbot />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </PropertyProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
