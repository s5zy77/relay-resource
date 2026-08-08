import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invoicesApi } from '../api/invoices';
import { paymentsApi } from '../api/payments';
import { FileText, Download, ShieldCheck, Sparkles, X, Printer, CheckCircle } from 'lucide-react';
import { Invoice, DepositStatus } from '../types';

export const InvoicesPage: React.FC = () => {
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesApi.getInvoices()
  });

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [depositData, setDepositData] = useState<DepositStatus | null>(null);
  const [loadingDeposit, setLoadingDeposit] = useState(false);

  const handleInspectDeposit = async (rentalId: string) => {
    setLoadingDeposit(true);
    const res = await paymentsApi.getDepositStatus(rentalId);
    setDepositData(res);
    setLoadingDeposit(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Invoices & Security Deposit Statements</h1>
        <p className="text-xs text-gray-500 mt-1">
          Inspect authoritative payment receipts, tax breakdowns, and AI deposit refund audit trail explanations.
        </p>
      </div>

      {isLoading ? (
        <div className="h-48 bg-white rounded-3xl animate-pulse border border-gray-100" />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="p-5 bg-white rounded-3xl border border-pastel-lavender/60 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-purple-700">{inv.id}</span>
                  <h3 className="text-sm font-bold text-gray-900">Rental Invoice for {inv.rentalId}</h3>
                  <span className="text-xs text-gray-400 block">{inv.date}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Total Amount</span>
                  <span className="text-base font-extrabold text-gray-900">₹{inv.totalAmount.toLocaleString()}</span>
                </div>

                <button
                  onClick={() => {
                    setSelectedInvoice(inv);
                    handleInspectDeposit(inv.rentalId);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-soft"
                >
                  View Details & Audit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative border border-purple-100 space-y-6">
            
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-purple-700">{selectedInvoice.id}</span>
                <h3 className="text-lg font-bold text-gray-900">Tax Invoice & Deposit Audit</h3>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                {selectedInvoice.status}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <span className="font-bold text-gray-700 block">Itemized Line Breakdown:</span>
              {selectedInvoice.items.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b border-gray-100 text-gray-600">
                  <span>{item.description}</span>
                  <span className="font-bold text-gray-900">₹{item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* AI Deposit Breakdown Section */}
            {depositData && (
              <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-100 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-purple-900 font-bold">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>AI Deposit Breakdown Explanation</span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {depositData.aiExplanation || '100% of your security deposit was returned smoothly after equipment return inspection.'}
                </p>
              </div>
            )}

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => alert(`Downloading official PDF for invoice ${selectedInvoice.id}`)}
                className="flex-1 py-3 rounded-2xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 flex items-center justify-center space-x-2 shadow-soft"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Statement</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
