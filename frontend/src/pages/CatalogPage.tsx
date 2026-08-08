import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { Search, Filter, Sparkles, Tag, SlidersHorizontal, ArrowUpDown, Calendar, ShieldCheck } from 'lucide-react';

const CATEGORIES = ['All', 'Cameras', 'Gimbals', 'Lighting', 'Audio'];
const BRANDS = ['All', 'Sony', 'RED', 'DJI', 'Aputure', 'Sennheiser'];

export const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL State
  const categoryParam = searchParams.get('category') || 'All';
  const brandParam = searchParams.get('brand') || 'All';
  const sortParam = searchParams.get('sortBy') || 'popular';
  const searchParam = searchParams.get('search') || '';
  const maxPriceParam = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 150000;

  const [searchQuery, setSearchQuery] = useState(searchParam);

  const { data, isLoading, isError } = useProducts({
    category: categoryParam,
    brand: brandParam,
    search: searchParam,
    maxPrice: maxPriceParam,
    sortBy: sortParam as any
  });

  const products = data?.products || [];

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchQuery);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-900 text-white p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="px-3 py-1 rounded-full bg-white/20 text-purple-100 font-semibold text-xs inline-flex items-center gap-1 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Real-Time Inventory Catalog
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Premium Cinema & Production Gear
          </h1>
          <p className="text-purple-100 text-sm md:text-base leading-relaxed">
            Rent high-end cameras, gimbals, lighting, and audio equipment with automated security deposit refunds and instant rental duration calculations.
          </p>

          {/* Natural Language Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex items-center">
            <div className="relative w-full">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Try natural search (e.g. '4K cameras under ₹3,000/day')..."
                className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white text-gray-900 text-sm focus:outline-none focus:ring-4 ring-purple-300 shadow-lg font-medium"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition-all"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 bg-white rounded-2xl border border-pastel-lavender/60 shadow-soft flex flex-wrap items-center justify-between gap-4">
        
        {/* Category Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => updateParam('category', cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                categoryParam === cat
                  ? 'bg-purple-600 text-white shadow-soft'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Brand Dropdown & Sorting */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-gray-700">Brand:</span>
            <select
              value={brandParam}
              onChange={(e) => updateParam('brand', e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50 focus:outline-none"
            >
              {BRANDS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-gray-700">Sort:</span>
            <select
              value={sortParam}
              onChange={(e) => updateParam('sortBy', e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50 focus:outline-none"
            >
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-80 bg-white rounded-3xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-gray-100 shadow-xs">
          <Tag className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-gray-800">No products match your filters</h3>
          <p className="text-xs text-gray-500">Try adjusting your brand, category, or budget search query.</p>
          <button
            onClick={() => setSearchParams(new URLSearchParams())}
            className="px-4 py-2 rounded-xl bg-purple-100 text-purple-700 font-bold text-xs hover:bg-purple-200"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/products/${product.id}`)}
              className="group bg-white rounded-3xl border border-pastel-lavender/50 shadow-soft hover:shadow-soft-hover transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between"
            >
              {/* Product Image & Badges */}
              <div className="relative h-56 bg-gray-100 overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-gray-800 font-extrabold text-[10px] shadow-xs">
                    {product.brand}
                  </span>
                  {product.highDemand && (
                    <span className="px-2.5 py-1 rounded-full bg-pink-600 text-white font-extrabold text-[10px] shadow-xs animate-pulse">
                      🔥 High Demand
                    </span>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                    {product.category}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Rates & Deposits */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold">DAILY RENTAL</span>
                    <span className="text-base font-extrabold text-gray-900">
                      ₹{product.dailyRate.toLocaleString()}
                      <span className="text-xs font-normal text-gray-500">/day</span>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block font-semibold">DEPOSIT</span>
                    <span className="text-xs font-bold text-purple-700 flex items-center gap-0.5 justify-end">
                      <ShieldCheck className="w-3.5 h-3.5" /> ₹{product.securityDeposit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
