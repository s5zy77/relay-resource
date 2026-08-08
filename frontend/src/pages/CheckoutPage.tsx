import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useCheckoutStore, CheckoutStep } from '../stores/checkoutStore';
import { processCustomerCheckout } from '../services/checkout';
import { ShieldCheck, MapPin, Store, CreditCard, CheckCircle2, Lock, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotals } = useCartStore();
  const {
    currentStep,
    deliveryType,
    shippingAddress,
    pickupWindow,
    paymentMethod,
    isSubmitting,
    setStep,
    setDeliveryType,
    setShippingAddress,
    setPickupWindow,
    setPaymentMethod
  } = useCheckoutStore();

  const { rentalSubtotal, securityDeposit, taxes, estimatedTotal } = getTotals();
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleNextStep = () => {
    if (currentStep === 'customer_info') setStep('delivery_pickup');
    else if (currentStep === 'delivery_pickup') setStep('dates_review');
    else if (currentStep === 'dates_review') setStep('payment');
  };

  const handlePrevStep = () => {
    if (currentStep === 'delivery_pickup') setStep('customer_info');
    else if (currentStep === 'dates_review') setStep('delivery_pickup');
    else if (currentStep === 'payment') setStep('dates_review');
  };

  const handleSubmitOrder = async () => {
    setErrorMsg(null);
    try {
      const order = await processCustomerCheckout();
      setCompletedOrder(order);
      setStep('confirmation');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to process order checkout. Please try again.');
    }
  };

  if (completedOrder) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl text-center space-y-6 border border-purple-100 shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div>
          <span className="text-xs font-mono font-bold text-purple-700 px-3 py-1 bg-purple-50 rounded-full border border-purple-200">
            Order #{completedOrder.id}
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-2">Rental Booking Confirmed!</h2>
          <p className="text-xs text-gray-500 mt-1">
            Payment verified. Your rental lifecycle has moved to <b>Pickup Pending</b>.
          </p>
        </div>

        <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 text-left text-xs space-y-2">
          <div className="flex justify-between text-gray-700">
            <span>Fulfilment Method:</span>
            <span className="font-bold capitalize">{completedOrder.deliveryType}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Total Paid (incl. deposit):</span>
            <span className="font-extrabold text-purple-800">₹{completedOrder.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => navigate('/portal/rentals')}
            className="flex-1 py-3 rounded-2xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-soft"
          >
            Go to My Rentals
          </button>
          <button
            onClick={() => navigate('/products')}
            className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-800 font-bold text-xs hover:bg-gray-200"
          >
            Continue Renting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Stepper Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-extrabold text-gray-900">Checkout</h1>
        <div className="flex items-center space-x-2 text-xs font-bold text-gray-500">
          <Lock className="w-4 h-4 text-purple-600" />
          <span>Idempotent 256-Bit Encrypted Order</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Stepper Form */}
        <div className="lg:col-span-8 space-y-6">
          
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: Customer Info */}
          {currentStep === 'customer_info' && (
            <div className="bg-white rounded-3xl p-6 border border-pastel-lavender/60 shadow-soft space-y-4">
              <h3 className="text-base font-bold text-gray-900">1. Customer Identification</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Anushka Ghosh"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    defaultValue="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>
              <button
                onClick={handleNextStep}
                className="w-full py-3.5 rounded-2xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-soft flex items-center justify-center space-x-2"
              >
                <span>Continue to Delivery / Pickup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Delivery vs Store Pickup */}
          {currentStep === 'delivery_pickup' && (
            <div className="bg-white rounded-3xl p-6 border border-pastel-lavender/60 shadow-soft space-y-6">
              <h3 className="text-base font-bold text-gray-900">2. Fulfilment Method</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setDeliveryType('pickup')}
                  className={`p-4 rounded-2xl border text-left space-y-2 transition-all ${
                    deliveryType === 'pickup'
                      ? 'border-purple-600 bg-purple-50/80 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Store className="w-6 h-6 text-purple-600" />
                  <h4 className="text-sm font-bold text-gray-900">Self Pickup at Store</h4>
                  <p className="text-xs text-gray-500">Pick up from Relay Tech Hub & scan QR pass.</p>
                </button>

                <button
                  onClick={() => setDeliveryType('delivery')}
                  className={`p-4 rounded-2xl border text-left space-y-2 transition-all ${
                    deliveryType === 'delivery'
                      ? 'border-purple-600 bg-purple-50/80 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <MapPin className="w-6 h-6 text-purple-600" />
                  <h4 className="text-sm font-bold text-gray-900">Doorstep Delivery</h4>
                  <p className="text-xs text-gray-500">Express delivery to your shooting location.</p>
                </button>
              </div>

              {deliveryType === 'pickup' ? (
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3 text-xs">
                  <span className="font-bold text-gray-700 block">Select Store Location:</span>
                  <select
                    value={pickupWindow.location}
                    onChange={(e) => setPickupWindow(e.target.value, pickupWindow.timeSlot)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-semibold text-xs"
                  >
                    <option value="Relay Tech Hub — Store #4, MG Road, Bengaluru">Store #4, MG Road, Bengaluru</option>
                    <option value="Relay Tech Hub — Indiranagar Studio Hub">Indiranagar Studio Hub</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <span className="font-bold text-gray-700 block">Shipping Address:</span>
                  <input
                    type="text"
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ street: e.target.value })}
                    placeholder="Street Address"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-semibold"
                  />
                </div>
              )}

              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrevStep}
                  className="px-4 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="flex-1 py-3.5 rounded-2xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-soft flex items-center justify-center space-x-2"
                >
                  <span>Continue to Order Review</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Rental Dates & Order Review */}
          {currentStep === 'dates_review' && (
            <div className="bg-white rounded-3xl p-6 border border-pastel-lavender/60 shadow-soft space-y-4">
              <h3 className="text-base font-bold text-gray-900">3. Review Rental Order Items</h3>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="p-3.5 rounded-2xl bg-gray-50 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <img src={item.image} alt={item.title} className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <h4 className="font-bold text-gray-900">{item.title}</h4>
                        <span className="text-[10px] text-gray-500 font-semibold block">
                          Dates: {item.startDate} to {item.endDate} ({item.durationDays} days)
                        </span>
                      </div>
                    </div>
                    <span className="font-extrabold text-gray-900">₹{(item.dailyRate * item.durationDays).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={handlePrevStep}
                  className="px-4 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="flex-1 py-3.5 rounded-2xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-soft flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Payment */}
          {currentStep === 'payment' && (
            <div className="bg-white rounded-3xl p-6 border border-pastel-lavender/60 shadow-soft space-y-6">
              <h3 className="text-base font-bold text-gray-900">4. Select Payment Method</h3>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                {['upi', 'card', 'netbanking', 'net_30'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method as any)}
                    className={`p-4 rounded-2xl border text-left capitalize font-bold transition-all ${
                      paymentMethod === method
                        ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {method === 'net_30' ? 'Net 30 Corporate Credit' : method.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={handlePrevStep}
                  disabled={isSubmitting}
                  className="px-4 py-3.5 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-soft hover:shadow-soft-hover transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Order & Verifying Payment...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Pay ₹{estimatedTotal.toLocaleString()} & Authorize Booking</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Summary Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-pastel-lavender/60 shadow-soft space-y-4 text-xs">
            <h3 className="text-base font-bold text-gray-900">Order Summary</h3>

            <div className="space-y-2 border-b border-gray-100 pb-4">
              <div className="flex justify-between text-gray-600">
                <span>Rental Subtotal:</span>
                <span className="font-bold text-gray-900">₹{rentalSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-purple-700">
                <span className="flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-4 h-4" /> Security Deposit:
                </span>
                <span className="font-extrabold">₹{securityDeposit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Taxes (18% GST):</span>
                <span className="font-semibold">₹{taxes.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between text-sm font-extrabold text-gray-900">
              <span>Total Payable:</span>
              <span className="text-purple-700 text-base">₹{estimatedTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
