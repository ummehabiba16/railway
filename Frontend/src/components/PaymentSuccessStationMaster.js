import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Barcode from 'react-barcode';
import 'bootstrap/dist/css/bootstrap.min.css';
import './PaymentResult.css';
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
            // Use a timeout to ensure any existing images are loaded before capturing
            setTimeout(() => {
                html2canvas(ticketRef.current, {
                    useCORS: true,
                    allowTaint: true,
                    scale: 1,
                    logging: false
                }).then((canvas) => {
                    try {
                        const imgData = canvas.toDataURL('image/png', 0.8);
                        const pdf = new jsPDF();
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                        pdf.save('ticket.pdf');
                    } catch (error) {
                        console.error('PDF generation error:', error);
                        alert('Error generating PDF. Please try again.');
                    }
                }).catch(error => {
                    console.error('Canvas generation error:', error);
                    alert('Error generating ticket PDF. Please try again.');
                });
            }, 500);
        }
    };

    return (
        <>
        <Navbar/>
        <div className="container mt-4">
            <div className="text-center mb-4">
                <h2 className="text-success">Payment Successful</h2>
                <p>Your payment has been processed successfully.</p>
                <button className="btn btn-primary" onClick={() => navigate('/')}>Go to Home</button>
                <button className="btn btn-secondary ms-2" onClick={downloadPDF} disabled={loading}>
                    {loading ? 'Loading...' : 'Download Ticket as PDF'}
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading ticket details...</p>
                </div>
            ) : tickets.length === 0 ? (
                <div className="text-center py-5">
                    <div className="text-muted display-6">No tickets found</div>
                    <p className="text-muted mt-2">Unable to load ticket details.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/')}>Go to Home</button>
                </div>
            ) : (
                <div ref={ticketRef}>
                {tickets.map((ticket, index) => (
                    <div key={index} className="card mb-4 shadow-lg">
                        <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                            <h4 className="mb-0">{ticket.trainName} - {ticket.className}</h4>
                            {ticket.bookingId && (
                                <div>
                                    <Barcode value={ticket.bookingId} width={1.5} height={40} fontSize={12} />
                                </div>
                            )}
                        </div>
                        <div className="card-body">
                            <div className="row">
                                {/* Info Section */}
                                <div className="col-md-12">
                                    <div className="mb-3">
                                        <h5>Booking Details</h5>
                                        <p><strong>Booking ID:</strong> {ticket.bookingId}</p>
                                        <p><strong>NID:</strong> {ticket.nid}</p>
                                    </div>
                                    <div className="mb-3">
                                        <h5>Travel Info</h5>
                                        <p><strong>Date:</strong> {ticket.travelDate}</p>
                                        <p><strong>Time:</strong> {ticket.travelTime}</p>
                                        <p><strong>From:</strong> {ticket.starting}</p>
                                        <p><strong>To:</strong> {ticket.destination}</p>
                                    </div>
                                    <div className="mb-3">
                                        <h5>Passenger List</h5>
                                        <p><strong>Passengers:</strong></p>
                                        <ul className="list-group list-group-flush">
                                            {ticket.passengerName?.split(',').map((name, idx) => (
                                                <li key={idx} className="list-group-item">
                                                    {name.trim()} - {ticket.passengerType?.split(',')[idx]?.toUpperCase() === 'A' ? 'Adult' : 'Child'}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <p><strong>Seats:</strong> {ticket.coachName}-{ticket.seatNum}</p>
                                    <p><strong>Berth Position:</strong> {ticket.berthPosition || 'N/A'}</p>
                                    <p><strong>Total Paid:</strong> ৳ {ticket.total}</p>
                                    <p><strong>Transaction ID:</strong> {ticket.trxId || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            )}
        </div>
        </>
    );
};

export default PaymentSuccessStationMaster;