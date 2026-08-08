import React, { useState } from 'react';
import { useRentals } from '../hooks/useRentals';
import { QRScannerModal } from '../components/QRScannerModal';
import { Package, Clock, Calendar, QrCode, AlertTriangle, RefreshCw, FileText, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';
import { Rental } from '../types';

const STATUS_TABS = ['All', 'Active', 'Overdue', 'Pickup Pending', 'Completed'];

export const MyRentalsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const { rentals, isLoading, extendRental, confirmPickup, confirmReturn, isExtending } = useRentals(activeTab);

  const [selectedRentalForQR, setSelectedRentalForQR] = useState<{ rental: Rental; type: 'pickup' | 'return' } | null>(null);
  const [extendingRentalId, setExtendingRentalId] = useState<string | null>(null);
  const [extensionDate, setExtensionDate] = useState('');

  const handleExtendSubmit = async (rentalId: string) => {
    if (!extensionDate) return;
    await extendRental({ rentalId, newEndDate: extensionDate });
    setExtendingRentalId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">My Rentals & Equipment Lifecycle</h1>
        <p className="text-xs text-gray-500 mt-1">
          Monitor your active camera & production gear rentals, present QR pickup passes, or extend rental durations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab
                ? 'bg-purple-600 text-white shadow-soft'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Rental Cards List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-48 bg-white rounded-3xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : rentals.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-gray-100 shadow-xs">
          <Package className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No rentals found in this category</h3>
          <p className="text-xs text-gray-500">Rent cameras, lighting, or audio equipment from the storefront catalog.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {rentals.map((rental) => (
            <div
              key={rental.id}
              className={`p-6 bg-white rounded-3xl border shadow-soft transition-all space-y-6 ${
                rental.status === 'Overdue' ? 'border-red-200 bg-red-50/20' : 'border-pastel-lavender/60'
              }`}
            >
              
              {/* Top Details & Badges */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={rental.productImage}
                    alt={rental.productTitle}
                    className="w-16 h-16 rounded-2xl object-cover border border-gray-100"
                  />
                  <div>
                    <span className="text-[10px] font-mono font-bold text-purple-700 block">{rental.id}</span>
                    <h3 className="text-base font-bold text-gray-900">{rental.productTitle}</h3>
                    <span className="text-xs text-gray-500 font-medium">
                      {rental.startDate} → {rental.endDate} ({rental.durationDays} Days)
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end space-y-1">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-xs ${
                      rental.status === 'Active'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : rental.status === 'Overdue'
                        ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
                        : rental.status === 'Pickup Pending'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    ● {rental.status}
                  </span>
                  <span className="text-xs font-extrabold text-gray-900">
                    Total: ₹{rental.totalRate.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Overdue Exception Banner */}
              {rental.isOverdue && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-red-800 text-xs">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold">Overdue Return Warning ({rental.overdueHours}h)</h4>
                      <p className="text-[11px] text-red-600">Estimated accrued late fee: ₹{rental.estimatedLateFee}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setExtendingRentalId(rental.id);
                      const d = new Date(rental.endDate);
                      d.setDate(d.getDate() + 2);
                      setExtensionDate(d.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700"
                  >
                    Extend Now
                  </button>
                </div>
              )}

              {/* Lifecycle Stepper */}
              <div className="py-2">
                <span className="text-[10px] font-bold text-gray-400 block mb-2 uppercase">Lifecycle Progress Timeline</span>
                <div className="flex items-center space-x-2 overflow-x-auto text-[11px]">
                  {['Confirmed', 'Pickup Pending', 'Active', 'Return Pending', 'Completed'].map((step, idx) => {
                    const isDone = rental.timeline.some(t => t.status === step);
                    return (
                      <React.Fragment key={step}>
                        <div className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap flex items-center gap-1 ${
                          isDone ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {isDone && <CheckCircle2 className="w-3 h-3 text-purple-700" />}
                          <span>{step}</span>
                        </div>
                        {idx < 4 && <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setSelectedRentalForQR({ rental, type: 'pickup' })}
                  className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs hover:bg-purple-100 border border-purple-200 flex items-center space-x-1.5"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Show QR Pass</span>
                </button>

                {rental.status === 'Active' && (
                  <>
                    <button
                      onClick={() => {
                        setExtendingRentalId(rental.id);
                        const d = new Date(rental.endDate);
                        d.setDate(d.getDate() + 1);
                        setExtensionDate(d.toISOString().split('T')[0]);
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center space-x-1.5 shadow-xs"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Request AI Extension</span>
                    </button>

                    <button
                      onClick={() => setSelectedRentalForQR({ rental, type: 'return' })}
                      className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 font-bold text-xs hover:bg-gray-200"
                    >
                      Initiate Return
                    </button>
                  </>
                )}
              </div>

              {/* Extension Request Inline Input */}
              {extendingRentalId === rental.id && (
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-3">
                  <h4 className="text-xs font-bold text-purple-900">Select New Extended Return Date</h4>
                  <div className="flex items-center space-x-3">
                    <input
                      type="date"
                      value={extensionDate}
                      min={rental.endDate}
                      onChange={(e) => setExtensionDate(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold"
                    />
                    <button
                      onClick={() => handleExtendSubmit(rental.id)}
                      disabled={isExtending}
                      className="px-4 py-2 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 disabled:opacity-50"
                    >
                      {isExtending ? 'Processing...' : 'Confirm Extension & Update Quote'}
                    </button>
                    <button
                      onClick={() => setExtendingRentalId(null)}
                      className="px-3 py-2 text-xs text-gray-500 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* QR Scanner Modal */}
      {selectedRentalForQR && (
        <QRScannerModal
          rentalId={selectedRentalForQR.rental.id}
          qrCodeData={selectedRentalForQR.rental.qrCodeData}
          type={selectedRentalForQR.type}
          onConfirm={async () => {
            if (selectedRentalForQR.type === 'pickup') {
              await confirmPickup(selectedRentalForQR.rental.id);
            } else {
              await confirmReturn(selectedRentalForQR.rental.id);
            }
          }}
          onClose={() => setSelectedRentalForQR(null)}
        />
      )}

    </div>
  );
};
