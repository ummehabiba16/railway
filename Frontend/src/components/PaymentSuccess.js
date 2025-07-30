import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Barcode from 'react-barcode';
import Navbar from './navBar';

const PaymentSuccess = () => {
    const [tickets, setTickets] = useState([]);
    const { paymentId } = useParams();
    const navigate = useNavigate();
    const ticketRef = useRef();

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await api.post("/ticket", { paymentId });
                setTickets(response.data);
            } catch (error) {
                console.error('Error fetching ticket:', error);
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
                            আপনার পেমেন্ট সফলভাবে সম্পন্ন হয়েছে।
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
                                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-orange-300 transition-all duration-300 flex items-center space-x-3"
                            >
                                <span className="text-xl">📄</span>
                                <span>টিকিট ডাউনলোড করুন</span>
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Tickets Section */}
                    <div ref={ticketRef}>
                        {tickets.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
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
                                                ই-টিকিট (নিশ্চিত)
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-orange-100 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                বুকিং আইডি
                                            </p>
                                            <p className="text-xl font-bold">{tickets[0].bookingId}</p>
                                            {tickets[0].bookingId && (
                                                <div className="bg-white p-2 rounded-lg mt-2 inline-block">
                                                    <Barcode
                                                        value={tickets[0].bookingId}
                                                        width={1}
                                                        height={30}
                                                        fontSize={10}
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
                                        {/* Primary Passenger Photo and Details */}
                                        <div className="lg:col-span-1">
                                            <div className="text-center mb-4">
                                                <div className="w-32 h-40 mx-auto bg-gray-200 border-2 border-gray-300 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                                                    {tickets[0].profileImage ? (
                                                        <img
                                                            src={`data:image/jpeg;base64,${tickets[0].profileImage}`}
                                                            alt="Profile"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center">
                                                            <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                    বুকিং নিশ্চিতকারীর ছবি
                                                </p>
                                            </div>

                                            <div className="text-center">
                                                <h3 className="text-lg font-bold text-orange-800 mb-2 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                    বুকিং নিশ্চিতকারী


                                                </h3>
                                                <p className="text-gray-700 font-medium mb-1">
                                                    {tickets[0].fullName}
                                                </p>
                                                <p className="text-sm text-gray-500 mb-1">
                                                    NID: {tickets[0].nid}
                                                </p>
                                                <p className="text-sm text-gray-500 mb-1">
                                                    ফোন: {tickets[0].phoneNum}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    ইমেইল: {tickets[0].email}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Journey Details */}
                                        <div className="lg:col-span-1">
                                            <h3 className="text-lg font-bold text-orange-800 mb-4 text-center font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                যাত্রার বিবরণ
                                            </h3>

                                            <div className="space-y-3">
                                                <div className="flex justify-between border-b border-gray-200 pb-2">
                                                    <span className="text-sm text-gray-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">ট্রেন:</span>
                                                    <span className="font-medium text-gray-800">{tickets[0].trainName}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-200 pb-2">
                                                    <span className="text-sm text-gray-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">তারিখ:</span>
                                                    <span className="font-medium text-gray-800">{tickets[0].travelDate}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-200 pb-2">
                                                    <span className="text-sm text-gray-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">সময়:</span>
                                                    <span className="font-medium text-gray-800">{tickets[0].travelTime}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-200 pb-2">
                                                    <span className="text-sm text-gray-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">থেকে:</span>
                                                    <span className="font-medium text-gray-800">{tickets[0].starting}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-200 pb-2">
                                                    <span className="text-sm text-gray-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">গন্তব্য:</span>
                                                    <span className="font-medium text-gray-800">{tickets[0].destination}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-200 pb-2">
                                                    <span className="text-sm text-gray-600 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">শ্রেণী:</span>
                                                    <span className="font-medium text-gray-800">{tickets[0].className}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* All Passengers List and Seat Details */}
                                        <div className="lg:col-span-1">
                                            <h3 className="text-lg font-bold text-orange-800 mb-4 text-center font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                সকল যাত্রী তালিকা
                                            </h3>

                                            <div className="space-y-3">
                                                {tickets.map((ticket, ticketIndex) => {
                                                    const passengerNames = ticket.passengerName?.split(',') || [];
                                                    const passengerTypes = ticket.passengerType?.split(',') || [];
                                                    const seatNumbers = ticket.seatNum?.split ? ticket.seatNum.split(',') : [ticket.seatNum];

                                                    return passengerNames.map((name, nameIndex) => (
                                                        <div key={`${ticketIndex}-${nameIndex}`} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-sm font-medium text-orange-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                                    যাত্রী {ticketIndex * passengerNames.length + nameIndex + 1}
                                                                </span>
                                                                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                                                    আসন {seatNumbers[nameIndex] || ticket.seatNum}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-800">
                                                                {name.trim()}
                                                            </p>
                                                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                                                                <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                                    {passengerTypes[nameIndex]?.toUpperCase() === 'A' ? 'প্রাপ্তবয়স্ক' : 'শিশু'}
                                                                </span>
                                                                <span>কোচ: {ticket.coachName}</span>
                                                            </div>
                                                        </div>
                                                    ));
                                                })}
                                            </div>

                                            {/* Payment Details */}
                                            <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-medium text-orange-700 font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                            মোট পেমেন্ট
                                                        </span>
                                                        <span className="text-lg font-bold text-orange-800">
                                                            ৳{tickets[0].total}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-gray-600">
                                                        <span className="font-['Noto_Sans_Bengali',_'SolaimanLipi',_'Kalpurush',_serif]">
                                                            ট্রানজেকশন আইডি
                                                        </span>
                                                        <span>{tickets[0].trxId}</span>
                                                    </div>
                                                </div>
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
                                                Bangladesh Railway E-Ticket System (CONFIRMED)
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
                        )}
                    </div>

                    {/* Footer Message */}
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
                            নিরাপদ ভ্রমণের জন্য ধন্যবাদ। আমাদের সেবা ব্যবহার করার জন্য কৃতজ্ঞতা।
                        </p>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default PaymentSuccess;
