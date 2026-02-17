import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PropertyProvider } from "@/context/PropertyContext";
import Navbar from "@/components/layout/Navbar";
import RealEstateChatbot from "@/components/chat/RealEstateChatbot";
import HomePage from "@/pages/Home";
import PropertyDetails from "@/pages/PropertyDetails";
import SavedProperties from "@/pages/SavedProperties";
import SemanticSearch from "@/pages/SemanticSearch";
import AdminDashboard from "@/pages/AdminDashboard";
import Signup from "@/pages/Signup";
import Login from "@/pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PropertyProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/property/:id" element={<PropertyDetails />} />
              <Route path="/saved" element={<SavedProperties />} />
              <Route path="/semantic-search" element={<SemanticSearch />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <RealEstateChatbot />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </PropertyProvider>
  </QueryClientProvider>
);

export default App;
