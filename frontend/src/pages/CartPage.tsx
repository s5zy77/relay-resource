import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useAIRecommendations } from '../hooks/useAI';
import { ShoppingBag, Trash2, Plus, Minus, ShieldCheck, ArrowRight, Sparkles, Calendar } from 'lucide-react';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, updateItemDates, getTotals } = useCartStore();
  const { rentalSubtotal, securityDeposit, taxes, estimatedTotal, itemCount } = getTotals();

  // AI Context Recommendations
  const cartContext = items.map(i => ({ productId: i.productId, category: 'Cameras' }));
  const { data: recommendations = [] } = useAIRecommendations(cartContext);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-white rounded-3xl text-center space-y-4 border border-purple-100 shadow-soft">
        <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Your Rental Cart is Empty</h2>
        <p className="text-xs text-gray-500">Explore cinema cameras, gimbals, and production gear in our catalog.</p>
        <Link
          to="/products"
          className="inline-block px-6 py-3 rounded-2xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-soft"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Rental Cart ({itemCount} items)</h1>
          <p className="text-xs text-gray-500 mt-1">Review items, rental duration dates, and refundable security deposits.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart Item List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-white rounded-3xl border border-pastel-lavender/60 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-20 rounded-2xl object-cover border border-gray-100 flex-shrink-0"
                />
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                  {item.variantName && (
                    <span className="text-[11px] font-semibold text-purple-700 block">
                      Variant: {item.variantName}
                    </span>
                  )}
                  <span className="text-xs font-extrabold text-gray-900 block mt-1">
                    ₹{item.dailyRate.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">/day</span>
                  </span>
                </div>
              </div>

              {/* Rental Dates Control */}
              <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-center space-x-2 text-xs">
                <Calendar className="w-4 h-4 text-purple-600" />
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold">RENTAL DATES</span>
                  <span className="font-semibold text-gray-800">
                    {item.startDate} → {item.endDate} ({item.durationDays} days)
                  </span>
                </div>
              </div>

              {/* Quantity & Delete */}
              <div className="flex items-center space-x-4 self-end sm:self-center">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 text-gray-600 hover:bg-white rounded-lg"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold px-2">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 text-gray-600 hover:bg-white rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}

          {/* AI Recommendations Bar */}
          {recommendations.length > 0 && (
            <div className="p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <h3 className="text-sm font-bold">AI Smart Rental Recommendations</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendations.map((rec) => (
                  <div key={rec.productId} className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={rec.image} alt={rec.title} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{rec.title}</h4>
                        <span className="text-[10px] text-purple-200 block">₹{rec.dailyRate}/day</span>
                      </div>
                    </div>
                    <Link
                      to={`/products/${rec.productId}`}
                      className="px-2.5 py-1 bg-white text-purple-900 text-[10px] font-extrabold rounded-lg hover:bg-purple-100"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Financial Summary Box */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-pastel-lavender/60 shadow-soft space-y-4">
            <h3 className="text-base font-bold text-gray-900">Financial Breakdown</h3>

            <div className="space-y-2 text-xs border-b border-gray-100 pb-4">
              <div className="flex justify-between text-gray-600">
                <span>Rental Subtotal:</span>
                <span className="font-bold text-gray-900">₹{rentalSubtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-purple-700">
                <span className="flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-4 h-4" /> Refundable Security Deposit:
                </span>
                <span className="font-extrabold">₹{securityDeposit.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>GST (18%):</span>
                <span className="font-semibold">₹{taxes.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between text-base font-extrabold text-gray-900">
              <span>Estimated Total:</span>
              <span className="text-purple-700 text-lg">₹{estimatedTotal.toLocaleString()}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-soft hover:shadow-soft-hover transition-all flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-gray-400 text-center leading-normal">
              Final totals calculated authoritatively by Member 3 backend logic upon order creation.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
