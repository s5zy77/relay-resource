import React, { useState } from 'react';
import { useSessionStore } from '../stores/sessionStore';
import { User, Mail, Phone, MapPin, Shield, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useSessionStore();
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(user?.name || 'Anushka Ghosh');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [street, setStreet] = useState(user?.address?.street || 'Indiranagar 100ft Road');
  const [city, setCity] = useState(user?.address?.city || 'Bengaluru');
  const [zip, setZip] = useState(user?.address?.zip || '560038');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      phone,
      address: { street, city, state: 'Karnataka', zip, country: 'India' }
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Customer Profile & Security</h1>
        <p className="text-xs text-gray-500 mt-1">Manage contact information, primary shipping address, and security verification.</p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-green-50 text-green-700 text-xs font-bold border border-green-200 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>Profile information updated successfully!</span>
        </div>
      )}

      <div className="bg-white rounded-3xl p-8 border border-pastel-lavender/60 shadow-soft space-y-6">
        
        <div className="flex items-center space-x-4 pb-6 border-b border-gray-100">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'}
            alt="User avatar"
            className="w-16 h-16 rounded-full border-2 border-purple-300 object-cover shadow-soft"
          />
          <div>
            <h3 className="text-lg font-bold text-gray-900">{user?.name}</h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 uppercase">
              {user?.role} Account
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="font-bold text-gray-700 block mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-3">
            <h4 className="font-bold text-sm text-gray-900">Default Shipping Address</h4>
            
            <div>
              <label className="font-bold text-gray-700 block mb-1">Street Address</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold focus:outline-none focus:border-purple-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">PIN / ZIP Code</label>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-soft transition-all"
          >
            Save Profile Changes
          </button>
        </form>

      </div>

    </div>
  );
};
