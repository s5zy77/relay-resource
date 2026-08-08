import React from 'react';
import { Camera, ShieldCheck, Clock, RefreshCw, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-pastel-lavender/60 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Badges */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-gray-100">
          <div className="flex items-center space-x-3 p-4 rounded-2xl bg-purple-50/50">
            <ShieldCheck className="w-8 h-8 text-purple-600 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-gray-900">Protected Deposits</h4>
              <p className="text-[11px] text-gray-500">100% automated refund processing</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 rounded-2xl bg-blue-50/50">
            <Clock className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-gray-900">Real-Time Dates</h4>
              <p className="text-[11px] text-gray-500">Instant inventory verification</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 rounded-2xl bg-pink-50/50">
            <Sparkles className="w-8 h-8 text-pink-600 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-gray-900">AI Concierge</h4>
              <p className="text-[11px] text-gray-500">Natural language rental search</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 rounded-2xl bg-indigo-50/50">
            <RefreshCw className="w-8 h-8 text-indigo-600 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-gray-900">Instant Extensions</h4>
              <p className="text-[11px] text-gray-500">Extend rentals in one click</p>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <Camera className="w-4 h-4 text-purple-600" />
            <span className="font-semibold text-gray-700">Relay — Autonomous Rental Operations Platform</span>
          </div>
          <p className="mt-4 md:mt-0">© 2026 Relay Systems Inc. Built for Hackathon Excellence.</p>
        </div>

      </div>
    </footer>
  );
};
