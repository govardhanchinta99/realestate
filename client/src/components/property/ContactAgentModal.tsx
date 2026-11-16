import React, { useState } from 'react';
import { Property } from '@/context/PropertyContext';
import { X, Calendar, Clock, Phone, Mail, User, CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface ContactAgentModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

const ContactAgentModal: React.FC<ContactAgentModalProps> = ({ property, isOpen, onClose }) => {
  const [tab, setTab] = useState<'tour' | 'message'>('tour');
  const [tourType, setTourType] = useState<'in-person' | 'video'>('in-person');
  const [selectedDate, setSelectedDate] = useState('Tomorrow, 2:00 PM');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(
    `Hello, I am interested in "${property.title}" listed at $${property.price.toLocaleString()}. Please provide more details.`
  );
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Please provide your name and email');
      return;
    }

    setSubmitted(true);
    toast.success('Inquiry submitted! An agent will reach out shortly.');
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2200);
  };

  const dates = [
    'Today, 4:00 PM',
    'Tomorrow, 10:00 AM',
    'Tomorrow, 2:00 PM',
    'This Saturday, 11:00 AM',
    'This Sunday, 1:00 PM',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">Request Confirmed!</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Your request for <strong className="text-foreground">{property.title}</strong> has been received. Our listing specialist will contact you at{' '}
              <span className="text-primary font-medium">{email}</span>.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/60 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Agent Guarantee</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h3 className="font-display text-xl font-bold text-foreground">
                Connect with Listing Agent
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {property.title} · {property.location}
              </p>
            </div>

            {/* Mode Tabs */}
            <div className="flex bg-secondary p-1 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => setTab('tour')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  tab === 'tour'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Schedule a Tour
              </button>
              <button
                type="button"
                onClick={() => setTab('message')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  tab === 'message'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Send Message
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'tour' && (
                <div className="space-y-3">
                  {/* Tour Type */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTourType('in-person')}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                        tourType === 'in-person'
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-border bg-card text-muted-foreground hover:bg-secondary/40'
                      }`}
                    >
                      In-Person Tour
                    </button>
                    <button
                      type="button"
                      onClick={() => setTourType('video')}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                        tourType === 'video'
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-border bg-card text-muted-foreground hover:bg-secondary/40'
                      }`}
                    >
                      Live Video Walkthrough
                    </button>
                  </div>

                  {/* Date Slots */}
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Select Preferred Time
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {dates.slice(0, 4).map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setSelectedDate(d)}
                          className={`p-2 rounded-lg text-xs border text-left flex items-center justify-between transition-all ${
                            selectedDate === d
                              ? 'border-primary bg-primary/10 text-primary font-semibold'
                              : 'border-border bg-card text-muted-foreground hover:bg-secondary/30'
                          }`}
                        >
                          <span className="truncate">{d}</span>
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="(555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Custom Note</label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:bg-primary/90 transition-all shadow-soft mt-2"
              >
                {tab === 'tour' ? `Confirm Tour for ${selectedDate}` : 'Send Inquiry to Agent'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactAgentModal;
