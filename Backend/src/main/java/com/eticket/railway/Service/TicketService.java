package com.eticket.railway.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eticket.railway.DTO.TicketDetailsDTO;
import com.eticket.railway.Exception.NoDataFoundException;
import com.eticket.railway.Repository.AvailableDateRepository;
import com.eticket.railway.Repository.TicketRepository;
import com.eticket.railway.Repository.TrainRepository;

@Service
public class TicketService {
    private final TicketRepository ticketRepository;
    
    @Autowired
    private AvailableDateRepository availableDateRepository;

    @Autowired
    private TrainRepository trainRepository;
    
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
    
    @Transactional
    public void releaseTicketsForAllTrains(LocalDate travelDate) {
        // Validate date - allow today and future dates
        if (travelDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot release tickets for past dates");
        }

        // Check if date already exists
        if (availableDateRepository.dateExists(travelDate)) {
            throw new IllegalArgumentException("Tickets are already released for this date");
        }

        // Insert available date
        availableDateRepository.insertAvailableDate(travelDate);
    }

    @Transactional
    public void releaseTicketsForTrain(String trainId, LocalDate travelDate) {
        // Validate date - allow today and future dates
        if (travelDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot release tickets for past dates");
        }

        // Validate train exists
        if (trainRepository.findTrainById(trainId) == null) {
            throw new IllegalArgumentException("Train not found");
        }

        // Convert LocalDate to String format for the stored procedure
        String formattedDate = travelDate.format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));
        ticketRepository.releaseTicketsForTrain(trainId, formattedDate);
    }

    public List<String> getAllTrainNames() {
        return trainRepository.findAllTrainNames();
    }
    
    @Transactional
    public int cancelTicketsByTrainCoachAndDate(String trainId, String travelDate, String coachId) {
        // Validate train exists
        if (trainRepository.findTrainById(trainId) == null) {
            throw new IllegalArgumentException("Train not found");
        }
        
        System.out.println("Cancelling tickets for Train: " + trainId + ", Date: " + travelDate + ", Coach: " + coachId);
        
        // Call repository method to update ticket status
        return ticketRepository.cancelTicketsByTrainCoachAndDate(trainId, travelDate, coachId);
    }
    
}
