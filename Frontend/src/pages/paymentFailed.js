import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/navBar';

const PaymentFailed = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [failureDetails, setFailureDetails] = useState({
        invoice: '',
        reason: '',
        status: '',
        error: ''
    });

    useEffect(() => {
        // Extract failure details from URL parameters
        const invoice = searchParams.get('invoice') || '';
        const reason = searchParams.get('reason') || '';
        const status = searchParams.get('status') || '';
        const error = searchParams.get('error') || '';

        setFailureDetails({
            invoice,
            reason,
            status,
            error
        });

        // Optional: Clear URL parameters after a delay for cleaner URL
        setTimeout(() => {
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 5000);
    }, [searchParams]);

    const handleRetryPayment = () => {
        // Navigate back to booking or payment page
        if (failureDetails.invoice) {
            navigate(`/booking/payment?invoice=${failureDetails.invoice}`);
        } else {
            navigate('/booking');
        }
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const handleContactSupport = () => {
        // You can implement contact support functionality here
        // For now, we'll just show an alert
        alert('আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন support@eticket.com অথবা কল করুন +৮৮০১XXXXXXX সাহায্যের জন্য।');
    };

    const getFailureMessage = () => {
        if (failureDetails.error === 'missing_params') {
            return 'প্রয়োজনীয় তথ্য অনুপস্থিত থাকার কারণে পেমেন্ট ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
        }
        if (failureDetails.error === 'processing_error') {
            return 'আপনার পেমেন্ট প্রক্রিয়াকরণে একটি ত্রুটি ঘটেছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।';
        }
        if (failureDetails.reason) {
            return `পেমেন্ট ব্যর্থ: ${failureDetails.reason}`;
        }
        return 'আপনার পেমেন্ট প্রক্রিয়া করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন অথবা সাপোর্টের সাথে যোগাযোগ করুন।';
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
                        {/* Failed Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                            className="flex justify-center mb-8"
                        >
                            <div className="w-24 h-24 bg-red-100/50 backdrop-blur-sm border border-red-200 rounded-full flex items-center justify-center">
                                <svg
                                    width="48"
                                    height="48"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#dc2626"
                                    strokeWidth="2"
                                    className="animate-pulse"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M15 9l-6 6" />
                                    <path d="M9 9l6 6" />
                                </svg>
                            </div>
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl font-bold text-center text-red-800 mb-4 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                        >
                            পেমেন্ট ব্যর্থ হয়েছে
                        </motion.h1>

                        {/* Message */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-lg text-center text-blue-700 mb-8 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]"
                        >
                            {getFailureMessage()}
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

                            {failureDetails.invoice && (
                                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                    <span className="font-semibold text-blue-700">ইনভয়েস আইডি:</span>
                                    <span className="text-blue-600 font-mono">{failureDetails.invoice}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                <span className="font-semibold text-blue-700">স্ট্যাটাস:</span>
                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                                    ব্যর্থ
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                <span className="font-semibold text-blue-700">তারিখ:</span>
                                <span className="text-blue-600">{new Date().toLocaleString('bn-BD')}</span>
                            </div>

                            {failureDetails.reason && (
                                <div className="flex justify-between items-center py-2">
                                    <span className="font-semibold text-blue-700">কারণ:</span>
                                    <span className="text-blue-600">{failureDetails.reason}</span>
                                </div>
                            )}
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
                                <span className="mr-2">🔄</span>
                                আবার চেষ্টা করুন
                            </button>
                            <button
                                className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                onClick={handleContactSupport}
                            >
                                <span className="mr-2">📞</span>
                                সাপোর্ট যোগাযোগ
                            </button>
                            <button
                                className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                onClick={handleGoHome}
                            >
                                <span className="mr-2">🏠</span>
                                হোমে যান
                            </button>
                        </motion.div>

                        {/* Troubleshooting Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="bg-orange-50/50 backdrop-blur-sm border border-orange-200 rounded-2xl p-6"
                        >
                            <div className="flex items-start">
                                <span className="text-2xl mr-3">🔧</span>
                                <div>
                                    <h4 className="text-lg font-bold text-orange-800 mb-4 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                        সাধারণ সমস্যা ও সমাধান:
                                    </h4>
                                    <ul className="space-y-2 text-orange-700">
                                        <li className="flex items-start">
                                            <span className="text-orange-500 mr-2 mt-1">•</span>
                                            <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                আপনার কার্ডে পর্যাপ্ত ব্যালেন্স আছে কিনা চেক করুন
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-orange-500 mr-2 mt-1">•</span>
                                            <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                আপনার কার্ডের তথ্য সঠিক আছে কিনা যাচাই করুন
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-orange-500 mr-2 mt-1">•</span>
                                            <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                ভিন্ন পেমেন্ট পদ্ধতি ব্যবহার করে দেখুন
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-orange-500 mr-2 mt-1">•</span>
                                            <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                আপনার ইন্টারনেট সংযোগ স্থিতিশীল আছে কিনা চেক করুন
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-orange-500 mr-2 mt-1">•</span>
                                            <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                সমস্যা অব্যাহত থাকলে আপনার ব্যাংকের সাথে যোগাযোগ করুন
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default PaymentFailed;
