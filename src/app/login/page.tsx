'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Loader2, Eye, EyeOff } from 'lucide-react';

// Demo credentials - shown to make it easy for reviewers
const DEMO_USERS = [
  { label: 'Admin User', email: 'admin@debales.ai', password: 'admin123', role: 'admin' },
  { label: 'Member User', email: 'member@debales.ai', password: 'member123', role: 'member' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      router.push('/projects');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loginAs = (user: typeof DEMO_USERS[0]) => {
    setEmail(user.email);
    setPassword(user.password);
  };

  return (
    <div
      data-testid="login-page"
      className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4"
    >
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 mb-4 shadow-lg shadow-violet-500/30">
            <Bot size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Debales AI</h1>
          <p className="text-white/40 text-sm mt-1">Multi-tenant AI Assistant Platform</p>
        </div>

        {/* Card */}
        <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-5">Sign in to your account</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-violet-500/60 focus:bg-white/8 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 pr-10 text-sm text-white placeholder-white/25 outline-none focus:border-violet-500/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              data-testid="login-btn"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Quick login for demo */}
          <div className="mt-5 pt-5 border-t border-white/8">
            <p className="text-xs text-white/30 text-center mb-3">Quick login (demo)</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.email}
                  data-testid={`quick-login-${u.role}`}
                  onClick={() => loginAs(u)}
                  className="p-2.5 rounded-lg border border-white/8 bg-white/3 hover:bg-white/8 text-left transition-colors"
                >
                  <p className="text-xs font-medium text-white/80">{u.label}</p>
                  <p className="text-[10px] text-white/35 mt-0.5">{u.role}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-white/20 mt-4">
          Debales AI · Full Stack Internship Assignment
        </p>
      </div>
    </div>
  );
}
