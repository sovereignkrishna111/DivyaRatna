import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useFlash } from '../../components/Flash';

type LocationState = {
  from?: {
    pathname?: string;
  };
};

const Login: React.FC = () => {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation() as { state?: LocationState };
  const { success } = useFlash();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      success('Successfully logged in');
      const to = location.state?.from?.pathname || '/admin';
      navigate(to, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-maroon-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur rounded-2xl shadow-2xl ring-1 ring-black/5 p-6 sm:p-8 w-full max-w-md">
        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-widest text-gray-500">DRESS</div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Admin Login</h1>
          <p className="mt-1 text-sm text-gray-600">Sign in to manage your website content.</p>
        </div>
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-red-700 text-sm mb-4">{error}</div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-maroon-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-maroon-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-maroon-700 hover:bg-maroon-800 text-white rounded-lg py-2.5 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon-500">
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
