import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { loginSchema, signupSchema, vendorSignupSchema } from '../validators/auth';
import { Camera, Lock, Mail, User, Phone, Store, Building, FileCheck, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('anushka@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    try {
      await login({ email, password });
      navigate('/products');
    } catch (err: any) {
      setError(err?.message || 'Login failed.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-pastel-lavender/60 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mx-auto shadow-soft">
            <Camera className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">Welcome Back to Relay</h2>
          <p className="text-xs text-gray-500">Sign in to manage active rentals and equipment orders.</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 font-semibold focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 font-semibold focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-soft transition-all"
          >
            {isLoading ? 'Signing In...' : 'Sign In to Portal'}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          <span>Don't have an account? </span>
          <Link to="/signup" className="text-purple-700 font-bold hover:underline">
            Create Account
          </Link>
        </div>

      </div>
    </div>
  );
};

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();

  const [name, setName] = useState('Anushka Ghosh');
  const [email, setEmail] = useState('anushka@example.com');
  const [password, setPassword] = useState('password123');
  const [phone, setPhone] = useState('9876543210');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = signupSchema.safeParse({ name, email, password, phone });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    try {
      await signup({ name, email, password, phone });
      navigate('/products');
    } catch (err: any) {
      setError(err?.message || 'Signup failed.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-pastel-lavender/60 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-gray-900">Create Customer Account</h2>
          <p className="text-xs text-gray-500">Rent high-end cameras & cinema production equipment.</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold focus:outline-none focus:border-purple-600"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-soft transition-all"
          >
            {isLoading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          <span>Already have an account? </span>
          <Link to="/login" className="text-purple-700 font-bold hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export const VendorSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { vendorSignup, isLoading } = useAuth();

  const [companyName, setCompanyName] = useState('Apex Film Rentals Pvt Ltd');
  const [email, setEmail] = useState('partner@apexfilms.com');
  const [phone, setPhone] = useState('9876543210');
  const [gstNumber, setGstNumber] = useState('29ABCDE1234F1Z5');
  const [category, setCategory] = useState('Cameras & Optics');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = vendorSignupSchema.safeParse({ companyName, email, phone, gstNumber, category });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    try {
      await vendorSignup({ companyName, email, phone, gstNumber, category });
      alert('Vendor registration submitted! Welcome to Relay Partner Network.');
      navigate('/products');
    } catch (err: any) {
      setError(err?.message || 'Vendor onboarding failed.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-pastel-lavender/60 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-soft">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">Partner & Vendor Onboarding</h2>
          <p className="text-xs text-gray-500">List your rental equipment inventory on Relay's operations platform.</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Company / Studio Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold focus:outline-none focus:border-purple-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Business Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold focus:outline-none focus:border-purple-600"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">GST / Business Tax ID</label>
            <input
              type="text"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold focus:outline-none focus:border-purple-600 uppercase font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Primary Inventory Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold focus:outline-none focus:border-purple-600"
            >
              <option value="Cameras & Optics">Cameras & Optics</option>
              <option value="Lighting & Grip">Lighting & Grip</option>
              <option value="Audio Equipment">Audio Equipment</option>
              <option value="Gimbals & Stabilization">Gimbals & Stabilization</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-soft transition-all"
          >
            {isLoading ? 'Submitting Vendor Application...' : 'Register Vendor Profile'}
          </button>
        </form>

      </div>
    </div>
  );
};
