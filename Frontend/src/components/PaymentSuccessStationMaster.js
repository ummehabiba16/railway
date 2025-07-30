import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Barcode from 'react-barcode';
import Navbar from './navBar';

const PaymentSuccessStationMaster = () => {
    const [tickets, setTickets] = useState([]);
    const { paymentId } = useParams();
    const navigate = useNavigate();
    const ticketRef = useRef();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setLoading(true);
                // Use the station master specific endpoint
                const response = await api.post("/stationmaster/ticket", { paymentId });
                setTickets(response.data);
            } catch (error) {
                console.error('Error fetching ticket:', error);
                // Show an error message to user
                setTickets([]);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, [paymentId]);

    const downloadPDF = () => {
        if (ticketRef.current) {
            // Use higher scale for better quality
            html2canvas(ticketRef.current, {
                scale: 3, // Higher scale for better resolution
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                imageTimeout: 15000,
                removeContainer: true,
                logging: false,
                width: ticketRef.current.scrollWidth,
                height: ticketRef.current.scrollHeight,
                windowWidth: ticketRef.current.scrollWidth,
                windowHeight: ticketRef.current.scrollHeight
            }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png', 1.0); // Max quality

                // Calculate dimensions for A4 landscape or appropriate size
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: 'a4'
                });

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();

                // Calculate aspect ratio to maintain proportions
                const canvasAspectRatio = canvas.width / canvas.height;
                const pdfAspectRatio = pdfWidth / pdfHeight;

                let imgWidth, imgHeight, xOffset = 0, yOffset = 0;

                if (canvasAspectRatio > pdfAspectRatio) {
                    // Canvas is wider - fit to width
                    imgWidth = pdfWidth;
                    imgHeight = pdfWidth / canvasAspectRatio;
                    yOffset = (pdfHeight - imgHeight) / 2;
                } else {
                    // Canvas is taller - fit to height
                    imgHeight = pdfHeight;
                    imgWidth = pdfHeight * canvasAspectRatio;
                    xOffset = (pdfWidth - imgWidth) / 2;
                }

                pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight, '', 'FAST');
                pdf.save('railway-ticket.pdf');
            }).catch((error) => {
                console.error('Error generating PDF:', error);
                alert('PDF generation failed. Please try again.');
            });
        }
    };

    return (
        <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
            <Navbar />

            {/* Main Content */}
            <main className="relative min-h-screen px-6 pt-24 pb-12">
                <div className="max-w-6xl mx-auto">
                    {/* Success Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2 }}
                        className="text-center mb-12"
                    >
                        <div className="text-8xl mb-6">🎉</div>
                        <h1 className="text-5xl md:text-6xl font-black text-green-800 mb-4 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                            পেমেন্ট সফল!
                        </h1>
                        <p className="text-xl text-green-600 max-w-2xl mx-auto mb-8 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                            আপনার পেমেন্ট সফলভাবে সম্পন্ন হয়েছে। (স্টেশন মাস্টার)
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/')}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-blue-300 transition-all duration-300 flex items-center space-x-3"
                            >
                                <span className="text-xl">🏠</span>
                                <span>হোমে ফিরে যান</span>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={downloadPDF}
                                disabled={loading}
                                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-orange-300 transition-all duration-300 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="text-xl">📄</span>
                                <span>{loading ? 'লোড হচ্ছে...' : 'টিকিট ডাউনলোড করুন'}</span>
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Loading State */}
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16"
                        >
                            <motion.div
                                className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <h2 className="text-2xl font-bold text-blue-800 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                টিকিটের বিবরণ লোড হচ্ছে...
                            </h2>
                        </motion.div>
                    )}

                    {/* No Tickets Found */}
                    {!loading && tickets.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center py-16"
                        >
                            <div className="text-6xl mb-6">📋</div>
                            <h3 className="text-2xl font-bold text-red-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                কোন টিকিট পাওয়া যায়নি
                            </h3>
                            <p className="text-red-600 mb-6 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                টিকিটের বিবরণ লোড করতে সমস্যা হয়েছে।
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/')}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-blue-300 transition-all duration-300"
                            >
                                হোমে ফিরে যান
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Tickets Section */}
                    {!loading && tickets.length > 0 && (
                        <div ref={ticketRef}>
                            {tickets.map((ticket, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: index * 0.2 }}
                                    className="bg-white rounded-2xl shadow-2xl mb-8 overflow-hidden border-2 border-gray-200"
                                >
                                    {/* Ticket Header */}
                                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h2 className="text-2xl font-bold font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                    বাংলাদেশ রেলওয়ে
                                                </h2>
                                                <p className="text-orange-100 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                    ই-টিকিট (নিশ্চিত) - স্টেশন মাস্টার
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-orange-100 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                    বুকিং আইডি
                                                </p>
                                                <p className="text-xl font-bold">{ticket.bookingId}</p>
                                                {ticket.bookingId && (
                                                    <div className="bg-white p-2 rounded-lg mt-2 inline-block">
                                                        <Barcode
                                                            value={ticket.bookingId}
                                                            width={1.5}
                                                            height={40}
                                                            fontSize={12}
                                                            background="#ffffff"
                                                            lineColor="#000000"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ticket Body */}
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            {/* Train and Journey Details */}
                                            <div className="lg:col-span-1">
                                                <h3 className="text-lg font-bold text-orange-800 mb-4 text-center font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                    যাত্রার বিবরণ
                                                </h3>

                                                <div className="space-y-3">
                                                    <div className="flex justify-between border-b border-gray-200 pb-2">
                                                        <span className="text-sm text-gray-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">ট্রেন:</span>
                                                        <span className="font-medium text-gray-800">{ticket.trainName} - {ticket.className}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-gray-200 pb-2">
                                                        <span className="text-sm text-gray-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">তারিখ:</span>
                                                        <span className="font-medium text-gray-800">{ticket.travelDate}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-gray-200 pb-2">
                                                        <span className="text-sm text-gray-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">সময়:</span>
                                                        <span className="font-medium text-gray-800">{ticket.travelTime}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-gray-200 pb-2">
                                                        <span className="text-sm text-gray-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">থেকে:</span>
                                                        <span className="font-medium text-gray-800">{ticket.starting}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-gray-200 pb-2">
                                                        <span className="text-sm text-gray-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">গন্তব্য:</span>
                                                        <span className="font-medium text-gray-800">{ticket.destination}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-gray-200 pb-2">
                                                        <span className="text-sm text-gray-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">আসন:</span>
                                                        <span className="font-medium text-gray-800">{ticket.coachName}-{ticket.seatNum}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-gray-200 pb-2">
                                                        <span className="text-sm text-gray-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">বার্থ অবস্থান:</span>
                                                        <span className="font-medium text-gray-800">{ticket.berthPosition || 'প্রযোজ্য নয়'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Booking Details */}
                                            <div className="lg:col-span-1">
                                                <h3 className="text-lg font-bold text-orange-800 mb-4 text-center font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                    বুকিং বিবরণ
                                                </h3>

                                                <div className="space-y-3">
                                                    <div className="flex justify-between border-b border-gray-200 pb-2">
                                                        <span className="text-sm text-gray-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">বুকিং আইডি:</span>
                                                        <span className="font-medium text-gray-800 font-mono">{ticket.bookingId}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-gray-200 pb-2">
                                                        <span className="text-sm text-gray-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">জাতীয় পরিচয়পত্র:</span>
                                                        <span className="font-medium text-gray-800 font-mono">{ticket.nid}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-gray-200 pb-2">
                                                        <span className="text-sm text-gray-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">মোট পেমেন্ট:</span>
                                                        <span className="font-bold text-orange-800 text-lg">৳{ticket.total}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-gray-200 pb-2">
                                                        <span className="text-sm text-gray-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">ট্রানজেকশন আইডি:</span>
                                                        <span className="font-medium text-gray-800 font-mono">{ticket.trxId || 'প্রযোজ্য নয়'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* All Passengers List */}
                                            <div className="lg:col-span-1">
                                                <h3 className="text-lg font-bold text-orange-800 mb-4 text-center font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                    সকল যাত্রী তালিকা
                                                </h3>

                                                <div className="space-y-3">
                                                    {ticket.passengerName?.split(',').map((name, passengerIndex) => (
                                                        <div key={passengerIndex} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-sm font-medium text-orange-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                                    যাত্রী {passengerIndex + 1}
                                                                </span>
                                                                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                                                    আসন {ticket.seatNum}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-800">
                                                                {name.trim()}
                                                            </p>
                                                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                                                                <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                                    {ticket.passengerType?.split(',')[passengerIndex]?.toUpperCase() === 'A' ? 'প্রাপ্তবয়স্ক' : 'শিশু'}
                                                                </span>
                                                                <span>কোচ: {ticket.coachName}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ticket Footer */}
                                        <div className="mt-6 pt-4 border-t border-gray-200">
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                    ইস্যুর তারিখ: {new Date().toLocaleDateString('bn-BD')}
                                                </span>
                                                <span>
                                                    Bangladesh Railway E-Ticket System (CONFIRMED) - Station Master
                                                </span>
                                            </div>
                                            <div className="text-center mt-2">
                                                <p className="text-xs text-gray-500 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                    এই টিকিট যাত্রার সময় অবশ্যই সাথে রাখুন। ভ্রমণের আগে আপনার পরিচয়পত্র নিশ্চিত করুন।
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Footer Message */}
                    {!loading && tickets.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="text-center bg-white/40 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl"
                        >
                            <div className="text-4xl mb-4">🎊</div>
                            <h3 className="text-2xl font-bold text-green-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                আপনার যাত্রা শুভ হোক!
                            </h3>
                            <p className="text-green-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                নিরাপদ ভ্রমণের জন্য ধন্যবাদ। স্টেশন মাস্টার সেবা ব্যবহার করার জন্য কৃতজ্ঞতা।
                            </p>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PaymentSuccessStationMaster;