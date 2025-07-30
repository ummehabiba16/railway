import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/navBar';

const PaymentCancelled = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [cancellationDetails, setCancellationDetails] = useState({
        invoice: ''
    });

    useEffect(() => {
        // Extract cancellation details from URL parameters
        const invoice = searchParams.get('invoice') || '';

        setCancellationDetails({
            invoice
        });

        // Optional: Clear URL parameters after a delay for cleaner URL
        setTimeout(() => {
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 5000);
    }, [searchParams]);

    const handleRetryPayment = () => {
        // Navigate back to booking or payment page
        if (cancellationDetails.invoice) {
            navigate(`/booking/payment?invoice=${cancellationDetails.invoice}`);
        } else {
            navigate('/booking');
        }
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const handleViewBookings = () => {
        navigate('/bookings');
    };

    return (
        <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
            <Navbar />
            <main className="relative min-h-screen px-6 pt-24 pb-12">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white/40 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl"
                    >
                        {/* Cancellation Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                            className="flex justify-center mb-8"
                        >
                            <div className="w-24 h-24 bg-yellow-100/50 backdrop-blur-sm border border-yellow-200 rounded-full flex items-center justify-center">
                                <svg
                                    width="48"
                                    height="48"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#f59e0b"
                                    strokeWidth="2"
                                    className="animate-pulse"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 16v-4" />
                                    <path d="M12 8h.01" />
                                </svg>
                            </div>
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl font-bold text-center text-yellow-800 mb-4 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                        >
                            পেমেন্ট বাতিল হয়েছে
                        </motion.h1>

                        {/* Message */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-lg text-center text-blue-700 mb-8 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                        >
                            আপনি পেমেন্ট প্রক্রিয়া বাতিল করেছেন। আপনার বুকিং এখনও অপেক্ষমাণ এবং কোন চার্জ করা হয়নি।
                        </motion.p>

                        {/* Payment Details */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white/30 backdrop-blur-sm border border-blue-200 rounded-2xl p-6 mb-8"
                        >
                            <h3 className="text-xl font-bold text-blue-800 mb-4 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                লেনদেনের বিবরণ
                            </h3>

                            {cancellationDetails.invoice && (
                                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                    <span className="font-semibold text-blue-700">ইনভয়েস আইডি:</span>
                                    <span className="text-blue-600 font-mono">{cancellationDetails.invoice}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                <span className="font-semibold text-blue-700">স্ট্যাটাস:</span>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                                    বাতিল হয়েছে
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2">
                                <span className="font-semibold text-blue-700">তারিখ:</span>
                                <span className="text-blue-600">{new Date().toLocaleString('bn-BD')}</span>
                            </div>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-col sm:flex-row gap-4 mb-8"
                        >
                            <button
                                className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                onClick={handleRetryPayment}
                            >
                                <span className="mr-2">💳</span>
                                পেমেন্ট সম্পূর্ণ করুন
                            </button>
                            <button
                                className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                onClick={handleViewBookings}
                            >
                                <span className="mr-2">📋</span>
                                আমার বুকিং দেখুন
                            </button>
                            <button
                                className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                onClick={handleGoHome}
                            >
                                <span className="mr-2">🏠</span>
                                হোমে যান
                            </button>
                        </motion.div>

                        {/* Additional Information */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="space-y-6"
                        >
                            {/* What happens next */}
                            <div className="bg-blue-50/50 backdrop-blur-sm border border-blue-200 rounded-2xl p-6">
                                <h4 className="text-lg font-bold text-blue-800 mb-4 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                    এরপর কী হবে?
                                </h4>
                                <ul className="space-y-2 text-blue-700">
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2 mt-1">•</span>
                                        <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                            আপনার বুকিং রিজার্ভেশন সীমিত সময়ের জন্য এখনও সক্রিয় রয়েছে
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2 mt-1">•</span>
                                        <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                            আপনি পরে পেমেন্ট সম্পূর্ণ করে আপনার বুকিং নিশ্চিত করতে পারেন
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2 mt-1">•</span>
                                        <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                            অসম্পূর্ণ বুকিং ৩০ মিনিট পর স্বয়ংক্রিয়ভাবে বাতিল হয়ে যেতে পারে
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2 mt-1">•</span>
                                        <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                            আপনার অ্যাকাউন্ট থেকে কোন চার্জ করা হয়নি
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            {/* Help Section */}
                            <div className="bg-cyan-50/50 backdrop-blur-sm border border-cyan-200 rounded-2xl p-6">
                                <div className="flex items-start">
                                    <span className="text-2xl mr-3">💡</span>
                                    <div>
                                        <h4 className="font-bold text-cyan-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                            সাহায্য প্রয়োজন?
                                        </h4>
                                        <p className="text-cyan-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                            যদি পেমেন্ট প্রক্রিয়ার সময় কোন সমস্যার সম্মুখীন হন, তাহলে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন{' '}
                                            <a href="mailto:support@eticket.com" className="text-cyan-600 hover:text-cyan-800 underline transition-colors duration-200">
                                                support@eticket.com
                                            </a>{' '}
                                            অথবা কল করুন{' '}
                                            <a href="tel:+8801XXXXXXX" className="text-cyan-600 hover:text-cyan-800 underline transition-colors duration-200">
                                                +৮৮০১XXXXXXX
                                            </a>
                                            ।
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default PaymentCancelled;
