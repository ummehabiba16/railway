package com.eticket.railway.Service;


import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.eticket.railway.DTO.BookingDetailsResponse;
import com.eticket.railway.DTO.BookingResponseDTO;
import com.eticket.railway.DTO.TicketResponseDTO;
import com.eticket.railway.DTO.UserBookingResponse;
import com.eticket.railway.Exception.NoDataFoundException;
import com.eticket.railway.Repository.BookingRepository;
import com.eticket.railway.Repository.TrainInfoRepository;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;
    private final TrainInfoRepository trainInfoRepository;
    public BookingService(TrainInfoRepository trainInfoRepository) {
        this.trainInfoRepository = trainInfoRepository;
    }
    public List<BookingResponseDTO> coachwiseAvailabilityCount(String trainId, String classId, String date, String fromStation, String toStation) {
        //Date travelDate = Date.valueOf(date);
        List<BookingResponseDTO> availabilityList = trainInfoRepository.coachwiseAvailabilityCount(trainId, classId, date, fromStation, toStation);
        if (availabilityList == null || availabilityList.isEmpty()) {
            throw new NoDataFoundException("No availability data found for the given train and date");
        }
        return availabilityList;
    }

    public List<TicketResponseDTO> getTicketsByCoach(String trainId, String classId, String date, String coachId, String fromStation, String toStation) {
        List<TicketResponseDTO> tickets = trainInfoRepository.ticketStatusByCoach(trainId, classId, date, coachId, fromStation, toStation);
        if (tickets == null || tickets.isEmpty()) {
            throw new NoDataFoundException("No tickets found for the given coach");
        }
        return tickets;
    }

    public String selectSeat(String ticketId){
        String seatStatus = trainInfoRepository.selectSeat(ticketId);
        if (seatStatus == null || seatStatus.isEmpty()) {
            throw new NoDataFoundException("No seat found for the given ticket ID");
        }
        return seatStatus;
    }

    public String createBooking(String userId, String travelDate, List<String> ticketIds) {
        String bookingId = generateBookingId();
        boolean isBookingCreated = trainInfoRepository.createBooking(bookingId, userId, travelDate, ticketIds);
        if (!isBookingCreated) {
            throw new NoDataFoundException("Failed to create booking for the given user and tickets");
        }
        return bookingId;
    }

    private String generateBookingId() {
        return "BKG" + UUID.randomUUID().toString().replaceAll("-", "").substring(0, 12);
    }

    public List<BookingDetailsResponse> getBookingDetails(String bookingId) {
        List<BookingDetailsResponse> bookingDetails = trainInfoRepository.getBookingDetails(bookingId);
        if (bookingDetails == null || bookingDetails.isEmpty()) {
            throw new NoDataFoundException("No booking details found for the given booking ID");
        }
        return bookingDetails;
    }

    public List<UserBookingResponse> getBookingsByUser(String userId) {
        List<UserBookingResponse> userBookings = bookingRepository.getBookingsByUser(userId);
        if (userBookings == null || userBookings.isEmpty()) {
            throw new NoDataFoundException("No bookings found for the given user ID");
        }
        return userBookings;
    }

    public String getBookingHoldTime(String bookingId) {
        String holdTime = bookingRepository.findHoldTime(bookingId);
        if (holdTime == null || holdTime.isEmpty()) {
            throw new NoDataFoundException("No hold time found for the given booking ID");
        }
        return holdTime;
    }

}
