import React, { useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { MdPayment, MdInfo } from 'react-icons/md';

export const Home = () => {
  // Simulated data that could come from props or context
  const serviceDetails = {
    serviceName: "Pro Plan",
    dueDate: "01/27/2026",
    amountDue: "$85",
    supportEmail: "support@company.com",
    supportPhone: "+1 (800) 123-4567"
  };

  const [showPaymentInfo, setShowPaymentInfo] = useState(false);

  const handlePaymentClick = () => {
    // Show payment information instead of redirecting
    setShowPaymentInfo(true);
    
    // Hide the message after 5 seconds
    setTimeout(() => {
      setShowPaymentInfo(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="bg-red-600/20 p-6 flex flex-col items-center border-b border-red-500/30">
          <div className="bg-red-500/20 p-4 rounded-full mb-4">
            <FaExclamationTriangle className="text-red-400 text-4xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-100 text-center">
            Service Temporarily Suspended
          </h1>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-300 text-center">
            Your service <span className="font-semibold text-white">{serviceDetails.serviceName}</span> has been suspended due to non-payment.
          </p>

          <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Due Date:</span>
              <span className="text-gray-200 font-medium">{serviceDetails.dueDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Amount Due:</span>
              <span className="text-red-400 font-bold text-lg">{serviceDetails.amountDue}</span>
            </div>
          </div>

          {/* Payment Information Alert */}
          {showPaymentInfo && (
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 animate-fadeIn">
              <div className="flex items-start">
                <MdInfo className="text-blue-400 text-xl mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-300 mb-1">Payment Instructions</h3>
                  <p className="text-gray-300 text-sm">
                    Please make your payment from your user account dashboard. 
                    Navigate to <span className="font-semibold text-white">Billing → Payment Methods</span> 
                    to complete your payment and restore service.
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handlePaymentClick}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-blue-500/20"
          >
            <MdPayment className="text-xl" />
            <span>Make Payment Now</span>
          </button>
        </div>

        {/* Footer */}
        <div className="bg-gray-900/50 p-4 flex justify-center border-t border-gray-700">
          <div className="flex items-center">
            <img
              src="https://vercel.com/favicon.ico"
              alt="Company Logo"
              className="w-6 h-6 mr-2"
            />
            <span className="text-gray-400 text-sm">© 2026 Vercel</span>
          </div>
        </div>
      </div>
    </div>
  );
};
