import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Barcode from 'react-barcode';
import 'bootstrap/dist/css/bootstrap.min.css';
import './PaymentResult.css';
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
            html2canvas(ticketRef.current).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF();
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save('ticket.pdf');
            });
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
                <button className="btn btn-secondary ms-2" onClick={downloadPDF}>Download Ticket as PDF</button>
            </div>

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
                                {/* Info Left */}
                                <div className="col-md-9">
                                    <div className="mb-3">
                                        <h5>Passenger Details</h5>
                                        <p><strong>Name:</strong> {ticket.fullName}</p>
                                        <p><strong>NID:</strong> {ticket.nid}</p>
                                        <p><strong>Phone:</strong> {ticket.phoneNum}</p>
                                        <p><strong>Email:</strong> {ticket.email}</p>
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
                                    <p><strong>Transaction ID:</strong> {ticket.trxId}</p>
                                </div>

                                {/* Image Right */}
                                <div className="col-md-3 text-center">
                                    {ticket.profileImage ? (
                                        <img src={`data:image/jpeg;base64,${ticket.profileImage}`} alt="Profile" className="img-thumbnail mb-2" />
                                    ) : (
                                        <img src="https://via.placeholder.com/150" alt="No Profile" className="img-thumbnail mb-2" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        </>
    );
};

export default PaymentSuccess;
