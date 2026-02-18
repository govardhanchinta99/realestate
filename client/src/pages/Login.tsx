import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LogIn, Mail, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: { theme: string; size: string; text: string; shape: string }
          ) => void;
        };
      };
    };
  }
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  const handleGoogleLogin = async (credential: string) => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await axios.post('http://localhost:3001/api/auth/google', { credential });
      setMessage(response.data.message || 'Google login successful');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || 'Google login failed');
      else setError('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!googleClientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const buttonEl = document.getElementById('google-login-btn');
      if (!window.google || !buttonEl) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          if (response.credential) handleGoogleLogin(response.credential);
        },
      });

      buttonEl.innerHTML = '';
      window.google.accounts.id.renderButton(buttonEl, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
      });
    };

    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [googleClientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', { email, password });
      setMessage(response.data.message || 'Login successful');
      setEmail('');
      setPassword('');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || 'Login failed');
      else setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-soft p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <LogIn className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Log in with email or Google</p>
        </div>

        {googleClientId ? (
          <div id="google-login-btn" className="flex justify-center mb-4" />
        ) : (
          <p className="text-xs text-muted-foreground text-center mb-4">Set VITE_GOOGLE_CLIENT_ID to enable Google login.</p>
        )}

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or with email</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-10 pr-3 py-3 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="w-full pl-10 pr-3 py-3 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground text-center">
          New here? <Link to="/signup" className="text-primary font-medium hover:underline">Create account</Link>
        </p>

        {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
