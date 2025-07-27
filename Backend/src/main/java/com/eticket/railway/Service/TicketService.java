package com.eticket.railway.Service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.eticket.railway.DTO.TicketDetailsDTO;
import com.eticket.railway.Exception.NoDataFoundException;
import com.eticket.railway.Repository.TicketRepository;

@Service
public class TicketService {
    private final TicketRepository ticketRepository;
    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }
    public List<TicketDetailsDTO> getTicketDetails(String paymentId) {
        List<TicketDetailsDTO> ticketDetails = ticketRepository.findByPaymentId(paymentId);
        if (ticketDetails == null || ticketDetails.isEmpty()) {
            throw new NoDataFoundException("No ticket found for the given payment ID");
        }
        return ticketDetails;
    }

    public List<TicketDetailsDTO> getTicketDetailsByBookingId(String bookingId) {
        List<TicketDetailsDTO> ticketDetails = ticketRepository.findByBookingId(bookingId);
        if (ticketDetails == null || ticketDetails.isEmpty()) {
            throw new NoDataFoundException("No ticket found for the given booking ID");
        }
        return ticketDetails;
    }

    public Map<String, Object> verifyTicketLimit(String type, String value, Integer numberOfTickets) {
        return ticketRepository.checkTicketLimit(type, value, numberOfTickets);
    }

    public boolean releaseTicketsByBookingId(String bookingId) {
        return ticketRepository.releaseTicketsByBookingId(bookingId);
    }
    
}
