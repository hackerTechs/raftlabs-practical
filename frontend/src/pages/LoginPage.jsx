import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Button from '../components/UI/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmed = email.trim();
    if (!trimmed) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }

    login(trimmed);
    toast.success(`Welcome! Signed in as ${trimmed.toLowerCase()}`);
    navigate('/');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-5xl">🍕</span>
          <h1 className="text-3xl font-bold mt-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            RaftFoodLab
          </h1>
          <p className="text-gray-500 mt-2">Enter your email to get started</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="you@example.com"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                    error
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  } focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition`}
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-500" role="alert">
                  {error}
                </p>
              )}
            </div>

            <Button type="submit" fullWidth>
              Continue
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs text-blue-700 font-medium mb-1">💡 Demo Accounts</p>
            <p className="text-xs text-blue-600">
              <strong>User:</strong> any email (e.g., user@test.com)
            </p>
            <p className="text-xs text-blue-600">
              <strong>Admin:</strong> admin@mail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
