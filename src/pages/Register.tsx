import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, User as UserIcon, Lock } from 'lucide-react';

const Register: React.FC = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '', loginType: 'parent' as 'parent' | 'staff' | 'student' });
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loginTypeOptions: Array<{ id: 'parent' | 'staff' | 'student'; title: string; desc: string }> = [
    { id: 'parent', title: 'Parent Login', desc: 'Access your child\'s academic progress, attendance, fees, and communication.' },
    { id: 'staff', title: 'Staff Login', desc: 'Administrative tools, student management, and internal communications.' },
    { id: 'student', title: 'Student Login', desc: 'Assignments, grades, resources, and class schedule.' },
  ];

  const validatePassword = (pwd: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pwd);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!form.firstName.trim() || !form.lastName.trim()) return setError('First and last name are required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Enter a valid email');
    if (!validatePassword(form.password)) return setError('Password must be 8+ chars with upper, lower, number, and symbol');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    try {
      setLoading(true);
      setLoading(false);
      setInfo('Confirmed: Signed in. (Demo only — no account data is stored.)');
      setTimeout(() => navigate('/login', { replace: true, state: { registered: true } }), 800);
    } catch (err: unknown) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-lg p-8">
        <h1 className="text-2xl font-semibold text-maroon-800 mb-6">Create Your Account</h1>
        {error && <div className="mb-4 text-sm text-maroon-800">{error}</div>}
        {info && <div className="mb-4 rounded-lg bg-green-50 text-green-800 border border-green-200 px-4 py-3 text-sm">{info}</div>}
        <form onSubmit={submit} className="space-y-4">
          {/* Login type selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Login Type</label>
            <div className="grid grid-cols-1 gap-3">
              {loginTypeOptions.map((opt) => (
                <label key={opt.id} className={`border rounded-lg p-3 cursor-pointer transition-all ${form.loginType === opt.id ? 'border-maroon-600 bg-maroon-50' : 'border-gray-200 hover:border-maroon-300'}`}>
                  <div className="flex items-start">
                    <input type="radio" name="loginType" value={opt.id} checked={form.loginType === opt.id} onChange={() => setForm({ ...form, loginType: opt.id })} className="mt-1 text-maroon-600 focus:ring-maroon-500" />
                    <div className="ml-3">
                      <div className="font-medium text-maroon-800">{opt.title}</div>
                      <div className="text-xs text-gray-600">{opt.desc}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UserIcon className="h-4 w-4 text-gray-400"/></div>
                <input className="block w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent" value={form.firstName} onChange={(e)=>setForm({...form, firstName: e.target.value})} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UserIcon className="h-4 w-4 text-gray-400"/></div>
                <input className="block w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent" value={form.lastName} onChange={(e)=>setForm({...form, lastName: e.target.value})} required />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-gray-400"/></div>
              <input type="email" className="block w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} required />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-gray-400"/></div>
                <input type="password" className="block w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-gray-400"/></div>
                <input type="password" className="block w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent" value={form.confirm} onChange={(e)=>setForm({...form, confirm: e.target.value})} required />
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">Password must be 8+ chars with upper, lower, number, and symbol.</div>
          <button type="submit" disabled={loading} className="w-full bg-maroon-700 hover:bg-maroon-800 disabled:opacity-60 text-white py-3 rounded-lg font-medium">{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <div className="mt-4 text-center">
          <button className="text-sm text-maroon-700 hover:text-maroon-900 font-medium" onClick={()=>navigate('/login')}>Back to Login</button>
        </div>
      </div>
    </div>
  );
};

export default Register;
