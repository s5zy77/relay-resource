import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductDetail } from '../hooks/useProducts';
import { useAvailability } from '../hooks/useAvailability';
import { useCartStore } from '../stores/cartStore';
import { Calendar, ShieldCheck, CheckCircle2, AlertCircle, ShoppingBag, ArrowLeft, Clock, Info } from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProductDetail(id);
  const { addItem } = useCartStore();

  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);

  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    durationDays,
    isValidRange,
    isAvailable,
    availableStock,
    estimatedRentalPrice,
    securityDeposit,
    isLoading: isCheckingAvailability
  } = useAvailability(id, selectedVariantId);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-500 font-semibold">Loading product specifications & availability...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-white rounded-3xl text-center space-y-4 border border-red-100 shadow-lg">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-gray-900">Product Not Found</h3>
        <button onClick={() => navigate('/products')} className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs">
          Back to Catalog
        </button>
      </div>
    );
  }

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0];
  const activeDailyRate = product.dailyRate + (selectedVariant ? selectedVariant.priceModifier : 0);
  const calculatedRentalTotal = activeDailyRate * durationDays;
  const estimatedTax = Math.round(calculatedRentalTotal * 0.18);
  const estimatedGrandTotal = calculatedRentalTotal + securityDeposit + estimatedTax;

  const handleAddToCart = () => {
    addItem(product, selectedVariant?.id, startDate, endDate);
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/products')}
        className="flex items-center space-x-2 text-xs font-bold text-gray-600 hover:text-purple-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Product Media & Description */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-4 border border-pastel-lavender/60 shadow-soft overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-96 object-cover rounded-2xl"
            />
          </div>

          <div className="bg-white rounded-3xl p-6 border border-pastel-lavender/60 shadow-soft space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Equipment Specifications</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(product.attributes).map(([key, val]) => (
                <div key={key} className="p-3 rounded-2xl bg-purple-50/50 border border-purple-100">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">{key}</span>
                  <span className="text-xs font-bold text-gray-800">{val}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {product.rentalTerms && (
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-900 leading-relaxed font-medium">
                  {product.rentalTerms}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Variant & Date Engine & Summary */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-pastel-lavender/60 shadow-soft space-y-6">
            
            <div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">{product.brand}</span>
              <h1 className="text-2xl font-extrabold text-gray-900 mt-1">{product.title}</h1>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-2xl font-extrabold text-gray-900">₹{activeDailyRate.toLocaleString()}</span>
                <span className="text-xs text-gray-500">/day</span>
              </div>
            </div>

            {/* Variant Selector */}
            {product.variants.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">Select Variant Kit</label>
                <div className="grid grid-cols-1 gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        (selectedVariantId === v.id || (!selectedVariantId && v.id === product.variants[0].id))
                          ? 'border-purple-600 bg-purple-50/80 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">{v.name}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{v.sku}</span>
                      </div>
                      {v.priceModifier !== 0 && (
                        <span className="text-xs font-semibold text-purple-700">
                          +{v.priceModifier > 0 ? `₹${v.priceModifier}` : `-₹${Math.abs(v.priceModifier)}`}/day
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Rental Date Engine */}
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="text-xs font-bold text-gray-900">Select Rental Period</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">START DATE</label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">END DATE</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-purple-200/60 text-xs">
                <span className="font-semibold text-gray-600">Calculated Duration:</span>
                <span className="font-extrabold text-purple-800 bg-white px-2.5 py-1 rounded-full border border-purple-200">
                  {durationDays} Day(s)
                </span>
              </div>
            </div>

            {/* Authoritative Financial Display Summary */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Rental Charge ({durationDays} days @ ₹{activeDailyRate.toLocaleString()}):</span>
                <span className="font-bold text-gray-900">₹{calculatedRentalTotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-purple-700">
                <span className="flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-4 h-4" /> Refundable Security Deposit:
                </span>
                <span className="font-extrabold">₹{securityDeposit.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Estimated GST (18%):</span>
                <span className="font-semibold">₹{estimatedTax.toLocaleString()}</span>
              </div>

              <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-extrabold text-gray-900">
                <span>Estimated Total Due:</span>
                <span className="text-purple-700 text-base">₹{estimatedGrandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Availability Indicator & CTA Button */}
            {!isAvailable ? (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>Selected dates are unavailable in backend inventory.</span>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={!isValidRange || isCheckingAvailability}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-soft hover:shadow-soft-hover transition-all flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Add to Rental Cart</span>
              </button>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
