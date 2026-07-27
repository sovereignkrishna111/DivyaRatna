import React, { useMemo, useState } from 'react';
import { User, Lock, Eye, EyeOff, Shield, Users, BookOpen } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../auth/UserAuthProvider';
import { useFlash } from '../components/Flash';
import { SiteLogoIcon } from '../components/SiteLogo';

type LocationState = {
  registered?: boolean;
};

const Login: React.FC = () => {
  const [loginType, setLoginType] = useState('parent');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const navigate = useNavigate();
  const location = useLocation() as { state?: LocationState };
  const { login } = useUserAuth();
  const [errorMsg, setErrorMsg] = useState<string | ''>('');
  const [infoMsg, setInfoMsg] = useState<string | ''>('');
  const { success } = useFlash();

  const successMessage = useMemo(() => {
    return location.state?.registered ? 'Account created successfully. Please sign in.' : '';
  }, [location.state]);

  const loginTypes = [
    { 
      id: 'parent', 
      title: 'Parent Login', 
      description: 'Access your child\'s academic progress, attendance records, fee information, and communicate with teachers',
      icon: <Users className="h-6 w-6 text-blue-600" />,
      features: ['Academic Progress Reports', 'Attendance Tracking', 'Fee Management', 'Teacher Communication', 'Event Updates']
    },
    { 
      id: 'staff', 
      title: 'Staff Login', 
      description: 'Access staff resources, administrative tools, student management systems, and internal communications',
      icon: <Shield className="h-6 w-6 text-green-600" />,
      features: ['Student Management', 'Grade Entry', 'Attendance Management', 'Resource Access', 'Staff Communications']
    },
    { 
      id: 'student', 
      title: 'Student Login', 
      description: 'Access your academic portal, assignments, grades, school resources, and connect with classmates',
      icon: <BookOpen className="h-6 w-6 text-purple-600" />,
      features: ['Assignment Portal', 'Grade Tracking', 'Digital Library', 'Class Schedule', 'Peer Collaboration']
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMsg('');
      setInfoMsg('');
      void login;
      success('Confirmed: Logged in');
      setInfoMsg('Confirmed: You are logged in. (Demo only — no account data is stored.)');
      navigate('/');
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : String(err || 'Login failed');
      let pretty = raw;
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.error_code === 'email_not_confirmed') {
          pretty = 'Please confirm your email address to continue. Check your inbox for the verification email.';
        }
      } catch {
        void 0;
      }
      setErrorMsg(pretty);
    }
  };

  const selectedLoginType = loginTypes.find(type => type.id === loginType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-maroon-700 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
              <SiteLogoIcon className="h-16 w-16" alt="Logo" />
            </div>
          </div>
          <h2 className="text-4xl font-light text-maroon-800 mb-2">Welcome to DRESS</h2>
          <p className="text-gray-600 text-lg">Please sign in to access your account</p>
        </div>

        <div className="max-w-4xl w-full mx-auto mb-8 flex justify-center">
          <a
            href="https://app.inschoolerp.com/"
            target="_blank"
            rel="noreferrer"
            className="block w-full max-w-xs text-center rounded-xl border-2 border-maroon-700 bg-maroon-700 text-white px-4 py-2.5 text-sm font-semibold shadow-lg hover:bg-maroon-800 hover:border-maroon-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon-700 animate-cta-breathe-sm sm:max-w-sm sm:px-5 sm:py-3 sm:text-base sm:animate-cta-breathe"
          >
            Login School App
          </a>
        </div>

        {successMessage && (
          <div className="max-w-4xl w-full mx-auto mb-4">
            <div className="rounded-lg bg-green-50 text-green-800 border border-green-200 px-4 py-3 text-sm">{successMessage}</div>
          </div>
        )}
        {infoMsg && (
          <div className="max-w-4xl w-full mx-auto mb-4">
            <div className="rounded-lg bg-green-50 text-green-800 border border-green-200 px-4 py-3 text-sm">{infoMsg}</div>
          </div>
        )}
        {errorMsg && (
          <div className="max-w-4xl w-full mx-auto mb-4">
            <div className="rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200 px-4 py-3 text-sm">{errorMsg}</div>
          </div>
        )}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Login Type Selection */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h3 className="text-2xl font-semibold text-maroon-800 mb-6">Select Login Type</h3>
            <div className="space-y-4">
              {loginTypes.map((type) => (
                <div key={type.id} className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  loginType === type.id 
                    ? 'border-maroon-600 bg-maroon-50' 
                    : 'border-gray-200 hover:border-maroon-300'
                }`}>
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="radio"
                      name="loginType"
                      value={type.id}
                      checked={loginType === type.id}
                      onChange={(e) => setLoginType(e.target.value)}
                      className="mt-1 text-maroon-600 focus:ring-maroon-500"
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex items-center mb-2">
                        {type.icon}
                        <div className="font-semibold text-maroon-800 ml-2">{type.title}</div>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">{type.description}</div>
                      {loginType === type.id && (
                        <div className="space-y-1">
                          {type.features.map((feature, index) => (
                            <div key={index} className="flex items-center text-xs text-gray-500">
                              <div className="w-1 h-1 bg-maroon-600 rounded-full mr-2"></div>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8">
            <h3 className="text-2xl font-semibold text-maroon-800 mb-6">
              {selectedLoginType?.title}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent transition-colors"
                    placeholder="Enter your username or email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-maroon-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-maroon-600 focus:ring-maroon-500 border-gray-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm text-maroon-600 hover:text-maroon-800 transition-colors">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-maroon-700 hover:bg-maroon-800 text-white py-3 px-4 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-maroon-500 focus:ring-offset-2 transform hover:scale-105"
              >
                Sign In to {selectedLoginType?.title}
              </button>
            </form>
            <div className="mt-4 text-center">
              <button
                className="text-sm text-maroon-700 hover:text-maroon-900 font-medium"
                onClick={() => navigate('/register')}
              >
                Create New Account
              </button>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Need Help?</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• First time users should contact the school office for account setup</p>
                <p>• For technical issues, email: support@divyaratna.edu.np</p>
                <p>• Office hours: Monday-Friday, 8:00 AM - 4:00 PM</p>
              </div>
            </div>

            {/* Contact Support */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Need help accessing your account?{' '}
                <a href="#" className="text-maroon-600 hover:text-maroon-800 font-medium transition-colors">
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 mt-8">
          <p>© 2025 Divya Ratna English Secondary School</p>
          <p>All rights reserved • Secure login protected by SSL encryption</p>
        </div>
      </div>
    </div>
  );
};

export default Login;