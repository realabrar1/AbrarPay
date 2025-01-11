import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import QRCode from 'react-qr-code';
import { Tab } from '@headlessui/react';
import clsx from 'clsx';

function App() {
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const generateLink = () => {
    if (!upiId) {
      toast.error('Please enter UPI ID or phone number');
      return;
    }

    // If input is a phone number, format it as a UPI ID
    const formattedUpiId = upiId.includes('@') ? upiId : `${upiId}@paytm`;
    
    // Add gpay:// scheme for Google Pay redirection
    const upiLink = `gpay://upi/pay?pa=${formattedUpiId}${amount ? `&am=${amount}` : ''}`;
    setGeneratedLink(upiLink);
    setActiveTab(1);
    toast.success('Payment link generated!');
  };

  const handleUpiIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    
    // Always update the input value
    setUpiId(value);
    
    // Clear any previous error if the input is empty
    if (!value) return;
    
    // Validate only when the input is complete
    if (value.includes('@')) {
      // For UPI ID format
      if (!/^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z]{2,}$/i.test(value)) {
        toast.error('Please enter a valid UPI ID');
      }
    } else if (value.length === 10) {
      // For phone number format
      if (!/^\d{10}$/.test(value)) {
        toast.error('Please enter a valid 10-digit phone number');
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    toast.success('Link copied to clipboard!');
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Abrar-Pay Payment Link',
          text: `Pay using UPI: ${generatedLink}`,
          url: generatedLink
        });
      } else {
        copyToClipboard();
      }
    } catch (error) {
      copyToClipboard();
    }
  };

  const handlePayment = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      const paymentTimeout = setTimeout(() => {
        toast.error(
          <div>
            <p>No UPI payment app found!</p>
            <div className="mt-2">
              <a 
                href="https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                Download Google Pay
              </a>
            </div>
          </div>,
          { duration: 5000 }
        );
      }, 2500);

      window.location.href = generatedLink;

      window.addEventListener('blur', () => {
        clearTimeout(paymentTimeout);
      });
    } else {
      toast(
        <div>
          <p>Please scan the QR code with your mobile UPI app to pay</p>
          <p className="text-sm mt-1">or use the copied link on your mobile device</p>
        </div>,
        { duration: 4000 }
      );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto p-4 pt-8">
        <h1 className="text-4xl font-bold text-center mb-2">Abrar-Pay</h1>
        <p className="text-center text-gray-400 mb-8">Shareable Payment's Link for UPI</p>

        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-800 p-1 shadow-sm mb-6">
            <Tab className={({ selected }) =>
              clsx(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-black shadow'
                  : 'text-gray-400 hover:bg-gray-700'
              )
            }>
              Create
            </Tab>
            <Tab className={({ selected }) =>
              clsx(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-black shadow'
                  : 'text-gray-400 hover:bg-gray-700'
              )
            }>
              Pay
            </Tab>
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>
              <div className="bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6 text-center">
                  Create Shareable Link for UPI Payment
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Enter Your VPA (UPI ID) or Phone Number
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={handleUpiIdChange}
                      placeholder="example@upi or 10-digit number"
                      className="w-full p-2 border bg-gray-700 text-white border-gray-600 rounded-lg focus:ring-2 focus:ring-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Amount (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-400">₹</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="w-full p-2 pl-8 border bg-gray-700 text-white border-gray-600 rounded-lg focus:ring-2 focus:ring-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={generateLink}
                    className="w-full bg-white text-black py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    CREATE
                  </button>
                </div>
              </div>
            </Tab.Panel>

            <Tab.Panel>
              {generatedLink ? (
                <div className="bg-gray-800 rounded-xl shadow-sm p-6 text-center">
                  <div className="bg-white p-4 rounded-lg inline-block mb-4">
                    <QRCode value={generatedLink} size={200} />
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-4">
                    Scan with any UPI app to pay or click the Pay button below
                  </p>
                  
                  <p className="mb-2">
                    You are paying {amount ? `₹${amount}` : 'custom amount'}
                  </p>
                  <p className="text-gray-400 mb-4">to</p>
                  <p className="text-sm mb-6">{upiId}</p>

                  <div className="space-y-3">
                    <button
                      onClick={handlePayment}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      PAY
                    </button>

                    <button
                      onClick={handleShare}
                      className="w-full bg-white text-black py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                      </svg>
                      Share Payment Link
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  Generate a payment link first
                </div>
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        <footer className="mt-8 text-center text-sm text-gray-400">
          <p>
            If you have any questions about security or privacy,{' '}
            
          </p>
          <a href="https://www.linkedin.com/in/syed-shoaib-abrar-a33561201/" className="text-blue-400">Connect to Abrar</a>
          <p className="mt-4 text-lg font-semibold"># Go Cashless</p>
        </footer>
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
}

export default App;