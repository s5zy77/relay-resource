import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Bot, Bell, User, Camera, LogOut, Package, FileText, Store } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useSessionStore } from '../stores/sessionStore';
import { NotificationDrawer } from './NotificationDrawer';

interface NavbarProps {
  onOpenAI: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAI }) => {
  const navigate = useNavigate();
  const { getTotals } = useCartStore();
  const { user, isAuthenticated, role, clearSession } = useSessionStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const { itemCount } = getTotals();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-pastel-lavender/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 bg-clip-text text-transparent">
                RELAY
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                AI Operations
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-700">
            <Link to="/products" className="hover:text-purple-600 transition-colors">Catalog</Link>
            {isAuthenticated && (
              <>
                <Link to="/portal/rentals" className="hover:text-purple-600 transition-colors">My Rentals</Link>
                <Link to="/portal/invoices" className="hover:text-purple-600 transition-colors">Invoices</Link>
              </>
            )}
            <Link to="/vendor/signup" className="text-purple-700 hover:text-purple-800 font-semibold flex items-center gap-1">
              <Store className="w-4 h-4" /> Partner / Vendor
            </Link>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            
            {/* AI Operations Assistant Button */}
            <button
              onClick={onOpenAI}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-xs shadow-soft hover:shadow-soft-hover transition-all hover:scale-105"
            >
              <Bot className="w-4 h-4 animate-pulse" />
              <span className="hidden sm:inline">AI Concierge</span>
            </button>

            {/* Cart Drawer Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Notifications Button */}
            {isAuthenticated && (
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full animate-ping" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full" />
              </button>
            )}

            {/* User Profile / Auth */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
                <Link to="/portal/profile" className="flex items-center space-x-2">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full border border-purple-300 object-cover"
                  />
                  <span className="hidden lg:inline text-xs font-semibold text-gray-800">{user?.name}</span>
                </Link>
                <button
                  onClick={() => {
                    clearSession();
                    navigate('/login');
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
              >
                Sign In
              </Link>
            )}

          </div>

        </div>
      </div>

      {/* Notification Drawer Modal */}
      {showNotifs && <NotificationDrawer onClose={() => setShowNotifs(false)} />}
    </header>
  );
};
