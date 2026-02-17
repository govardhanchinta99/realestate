import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Trash2, Edit, Plus, X, Camera, Bed, Bath, MapPin, 
  Sparkles, Upload, Building2, DollarSign, Ruler 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
}

interface FormData {
  title: string;
  description: string;
  price: string;
  propertyType: string;
  location: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  status: string;
  image: string;
}

const AdminDashboard: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingFromImage, setIsGeneratingFromImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    propertyType: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    status: 'For Sale',
    image: ''
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/properties');
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      // Mock data for demo
      setProperties([
        {
          _id: '1',
          title: 'Luxurious Modern Villa',
          description: 'Beautiful villa with pool',
          price: 1250000,
          propertyType: 'Villa',
          location: 'Beverly Hills, CA',
          bedrooms: 4,
          bathrooms: 3,
          area: 3500,
          status: 'For Sale',
          image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=80',
        },
        {
          _id: '2',
          title: 'Downtown Penthouse',
          description: 'Luxury penthouse with city views',
          price: 850000,
          propertyType: 'Apartment',
          location: 'Manhattan, NY',
          bedrooms: 2,
          bathrooms: 2,
          area: 1800,
          status: 'For Sale',
          image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80',
        },
      ]);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await axios.delete(`http://localhost:3001/api/properties/${id}`);
        fetchProperties();
      } catch (error) {
        console.error('Error deleting property:', error);
        setProperties(prev => prev.filter(p => p._id !== id));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProperty) {
        await axios.put(`http://localhost:3001/api/properties/${editingProperty._id}`, formData);
      } else {
        await axios.post('http://localhost:3001/api/properties', formData);
      }
      setIsModalOpen(false);
      setEditingProperty(null);
      setImageFile(null);
      resetForm();
      fetchProperties();
    } catch (error) {
      console.error('Error saving property:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', price: '', propertyType: '',
      location: '', bedrooms: '', bathrooms: '', area: '', status: 'For Sale', image: ''
    });
  };

  const generateDescription = async () => {
    if (!formData.title && !formData.propertyType) {
      alert('Please enter a property title or type first');
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const response = await axios.post('http://localhost:3001/api/properties/generate-description', {
        title: formData.title,
        propertyType: formData.propertyType,
        location: formData.location,
        features: `${formData.bedrooms} beds, ${formData.bathrooms} baths`
      });
      setFormData(prev => ({ ...prev, description: response.data.description }));
    } catch (error) {
      console.error('Error generating description:', error);
      // Mock AI response
      setFormData(prev => ({
        ...prev,
        description: `Welcome to this stunning ${formData.propertyType || 'property'} in ${formData.location || 'a prime location'}. This ${formData.bedrooms || '3'}-bedroom home offers ${formData.area || '2000'} sqft of living space with modern finishes throughout. Perfect for families or professionals seeking quality living.`
      }));
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const generateDetailsFromImage = async () => {
    if (!imageFile) {
      alert('Please upload an image first');
      return;
    }

    setIsGeneratingFromImage(true);
    const data = new FormData();
    data.append('image', imageFile);

    try {
      const response = await axios.post('http://localhost:3001/api/properties/generate-details-from-image', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const { title, description, propertyType } = response.data.data;
      setFormData(prev => ({ ...prev, title, description, propertyType }));
    } catch (error) {
      console.error('Error generating details:', error);
      alert('Failed to generate details from image');
    } finally {
      setIsGeneratingFromImage(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setFormData(prev => ({ ...prev, image: e.target?.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditModal = (property: Property) => {
    setEditingProperty(property);
    setImageFile(null);
    setFormData({
      title: property.title,
      description: property.description,
      price: String(property.price),
      propertyType: property.propertyType,
      location: property.location,
      bedrooms: String(property.bedrooms),
      bathrooms: String(property.bathrooms),
      area: String(property.area),
      status: property.status,
      image: property.image
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProperty(null);
    setImageFile(null);
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Property Manager</h1>
              <p className="text-muted-foreground">Manage your listings with AI assistance</p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl flex items-center gap-2 font-semibold hover:bg-primary/90 transition-all shadow-soft hover:shadow-elevated"
          >
            <Plus size={20} />
            Add Property
          </button>
        </motion.div>

        {/* Properties Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card shadow-soft rounded-2xl overflow-hidden border border-border"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Property</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {properties.map((property) => (
                  <tr key={property._id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 h-12 w-12 rounded-xl overflow-hidden bg-secondary">
                          <img className="h-12 w-12 object-cover" src={property.image || 'https://via.placeholder.com/48'} alt="" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">{property.title}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <Bed size={12} /> {property.bedrooms} · <Bath size={12} /> {property.bathrooms}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge-status badge-type">{property.propertyType}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin size={14} />
                        {property.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary">${property.price.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => openEditModal(property)} 
                        className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors mr-2"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(property._id)} 
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {properties.length === 0 && (
            <div className="text-center py-16">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No properties yet. Add your first listing!</p>
            </div>
          )}
        </motion.div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-end sm:items-center justify-center min-h-screen p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm"
                  onClick={() => setIsModalOpen(false)}
                />
                
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.95 }}
                  className="relative bg-card rounded-3xl shadow-elevated w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
                >
                  <form onSubmit={handleSubmit}>
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-display text-xl font-semibold text-foreground">
                          {editingProperty ? 'Edit Property' : 'Add New Property'}
                        </h3>
                        <p className="text-sm text-muted-foreground">Fill in the details below</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)} 
                        className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Image Upload */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Property Image</label>
                        <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-colors">
                          {formData.image ? (
                            <div className="relative">
                              <img src={formData.image} alt="Preview" className="h-40 w-full object-cover rounded-xl mx-auto" />
                              <div className="mt-4 flex justify-center gap-2">
                                <label className="cursor-pointer bg-secondary text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
                                  Change Image
                                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                </label>
                                {imageFile && (
                                  <button
                                    type="button"
                                    onClick={generateDetailsFromImage}
                                    disabled={isGeneratingFromImage}
                                    className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-accent/90 disabled:opacity-50"
                                  >
                                    <Camera size={16} />
                                    {isGeneratingFromImage ? 'Analyzing...' : 'AI Snap & List'}
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <label className="cursor-pointer">
                              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                              <p className="text-sm text-muted-foreground">Click to upload property image</p>
                              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                          placeholder="e.g., Luxurious Modern Villa"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                      </div>

                      {/* Description with AI */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-foreground">Description</label>
                          <button
                            type="button"
                            onClick={generateDescription}
                            disabled={isGeneratingDescription}
                            className="text-sm text-accent hover:text-accent/80 flex items-center gap-1 font-medium"
                          >
                            <Sparkles size={14} />
                            {isGeneratingDescription ? 'Generating...' : 'Generate with AI'}
                          </button>
                        </div>
                        <textarea
                          required
                          rows={4}
                          className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground resize-none"
                          placeholder="Describe the property features and highlights..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>

                      {/* Type & Price Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                          <select
                            className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                            value={formData.propertyType}
                            onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                          >
                            <option value="">Select Type</option>
                            <option value="House">House</option>
                            <option value="Apartment">Apartment</option>
                            <option value="Villa">Villa</option>
                            <option value="Condo">Condo</option>
                            <option value="Land">Land</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Price ($)</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                              type="number"
                              required
                              className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                              placeholder="Price"
                              value={formData.price}
                              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Location & Status Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                              type="text"
                              required
                              className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                              placeholder="City, State"
                              value={formData.location}
                              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                          <select
                            className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          >
                            <option value="For Sale">For Sale</option>
                            <option value="For Rent">For Rent</option>
                            <option value="Sold">Sold</option>
                          </select>
                        </div>
                      </div>

                      {/* Specs Row */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Bedrooms</label>
                          <div className="relative">
                            <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                              type="number"
                              className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                              placeholder="0"
                              value={formData.bedrooms}
                              onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Bathrooms</label>
                          <div className="relative">
                            <Bath className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                              type="number"
                              className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                              placeholder="0"
                              value={formData.bathrooms}
                              onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Area (sqft)</label>
                          <div className="relative">
                            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                              type="number"
                              className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                              placeholder="0"
                              value={formData.area}
                              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-6 py-3 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-soft"
                      >
                        {editingProperty ? 'Save Changes' : 'Add Property'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
