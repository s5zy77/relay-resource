import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode, CheckCircle, Scan, ArrowRight } from 'lucide-react';

interface QRScannerModalProps {
  rentalId: string;
  qrCodeData: string;
  type: 'pickup' | 'return';
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  rentalId,
  qrCodeData,
  type,
  onConfirm,
  onClose
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleScanAction = async () => {
    setIsVerifying(true);
    setTimeout(async () => {
      await onConfirm();
      setIsVerifying(false);
      setCompleted(true);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-purple-100">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 capitalize">
            Customer {type} Pass
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Show this QR code at store pickup or to the delivery executive for instant verification.
          </p>
        </div>

        {/* QR Code Container */}
        <div className="my-6 p-6 bg-purple-50/60 rounded-2xl border border-purple-100 flex flex-col items-center justify-center">
          {completed ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
              <h4 className="text-base font-bold text-gray-900 capitalize">
                {type} Verified Successfully!
              </h4>
              <p className="text-xs text-gray-500">Rental status updated in backend audit trail.</p>
            </div>
          ) : (
            <>
              <div className="p-4 bg-white rounded-xl shadow-md border border-gray-100">
                <QRCodeSVG value={qrCodeData} size={180} level="H" includeMargin />
              </div>
              <span className="text-[11px] font-mono font-bold text-purple-800 mt-3 px-3 py-1 bg-white rounded-full border border-purple-200">
                {rentalId}
              </span>
            </>
          )}
        </div>

        {/* Mock Verification Trigger for Hackathon Demo */}
        {!completed && (
          <div className="space-y-3">
            <button
              onClick={handleScanAction}
              disabled={isVerifying}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-soft hover:shadow-soft-hover transition-all flex items-center justify-center space-x-2"
            >
              {isVerifying ? (
                <>
                  <Scan className="w-4 h-4 animate-spin" />
                  <span>Scanning & Verifying with Backend...</span>
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  <span>Simulate {type === 'pickup' ? 'Store Pickup Scan' : 'Return Dropoff Scan'}</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-gray-400 text-center">
              Member 2 QR verification pipeline connects directly to Member 3 audit endpoint.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
