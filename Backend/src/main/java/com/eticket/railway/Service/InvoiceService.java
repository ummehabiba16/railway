package com.eticket.railway.Service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.eticket.railway.DTO.TicketDTO;
import com.eticket.railway.Entity.Invoice;
import com.eticket.railway.Exception.NoDataFoundException;
import com.eticket.railway.Repository.InvoiceRepository;
import com.eticket.railway.Repository.TicketRepository;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;
    @Autowired
    private TicketRepository ticketRepository;

    public String getBookingId(String ticketId) {
        return ticketRepository.getBookingId(ticketId);
    }
    public Boolean updateTicket(String ticketId, String PassengerName, String PassengerType) {
        return ticketRepository.updateTicket(ticketId, PassengerName, PassengerType); //returns bookingId
    }

    public Invoice createInvoice(List<TicketDTO> tickets) {
        if (tickets == null || tickets.isEmpty()) {
            throw new NoDataFoundException("No tickets found for the booking.");
        }
        double baseFare = 0.0;
        double childFarePercentage = getChildFarePercentage();
        double beddingCharge = 0;

        for (TicketDTO ticket : tickets) {
            if (ticket.getTicketId() == null || ticket.getTicketId().isEmpty()) {
                throw new NoDataFoundException("Ticket ID cannot be null or empty.");
            }
            updateTicket(ticket.getTicketId(), ticket.getPassengerName(), ticket.getPassengerType());
            beddingCharge += getBeddingCharge(ticket.getTicketId());
            if(ticket.getPassengerType().equals("C")) {
                baseFare += ticket.getFare() * childFarePercentage /100;
            } else {
                baseFare += ticket.getFare();
            }
        }
        String invoiceId = generateInvoiceId();
        String bookingId = getBookingId(tickets.get(0).getTicketId());
        double vatPercentage = getVatPercentage();
        double serviceCharge = getServiceCharge();

        double vat = (baseFare * vatPercentage) / 100;

        double total = baseFare + vat + serviceCharge + beddingCharge;

        Invoice invoice = new Invoice(
                invoiceId,
                bookingId,
                baseFare,
                vat,
                serviceCharge,
                beddingCharge,
                total
        );
        return invoice; // don't save it to the database yet
        //return invoiceRepository.save(invoice);
    }

    public Invoice saveInvoice(Invoice invoice) {
        if (invoice == null || invoice.getBookingId() == null || invoice.getBookingId().isEmpty()) {
            throw new NoDataFoundException("Invalid invoice data.");
        }
        return invoiceRepository.save(invoice);
    }

    private String generateInvoiceId() {
        return "INV" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }

    public double getVatPercentage() {
        return 10.0; // Can be changed later
    }

    public double getServiceCharge() {
        return 20.0; // Fixed for now
    }

    public double getBeddingCharge(String ticketId) {
        return 0.0; // Fixed for now, can be changed later
    }

    public double getChildFarePercentage() {
        return 60.0; // Fixed for now, can be changed later
    }
}

