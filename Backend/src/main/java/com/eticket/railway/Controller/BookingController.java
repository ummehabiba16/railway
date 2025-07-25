package com.eticket.railway.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eticket.railway.DTO.BookingDetailsResponse;
import com.eticket.railway.DTO.BookingRequestDTO;
import com.eticket.railway.DTO.BookingResponseDTO;
import com.eticket.railway.DTO.CoachTicketDTO;
import com.eticket.railway.DTO.SeatSelectionDTO;
import com.eticket.railway.DTO.TicketResponseDTO;
import com.eticket.railway.DTO.UserBookingResponse;
import com.eticket.railway.Exception.NoDataFoundException;
import com.eticket.railway.Service.BookingService;

@RestController
@RequestMapping("/api")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/book")
    public ResponseEntity<?> getAvailability(
            @RequestParam String trainId,
            @RequestParam String classId,
            @RequestParam String date
            , @RequestParam String fromStation,
            @RequestParam String toStation) {

        try {
            List<BookingResponseDTO> result = bookingService.coachwiseAvailabilityCount(trainId, classId, date, fromStation, toStation);
            return ResponseEntity.ok(result);
        } catch (NoDataFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No info available");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
    }

    @PostMapping("/book/coach")
    public ResponseEntity<?> getTicketsByCoach(@RequestBody CoachTicketDTO request) {
        try {
            List<TicketResponseDTO> result = bookingService.getTicketsByCoach(request.getTrainId(), request.getClassId(), request.getDate(), request.getCoachId(), request.getFromStation(), request.getToStation());
            return ResponseEntity.ok(result);
        } catch (NoDataFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No info available");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");

        }
    }

    @PostMapping("/book/seat/select")
    public ResponseEntity<?> selectSeat(@RequestBody SeatSelectionDTO request) {
        try {
            String result = bookingService.selectSeat(request.getTicketId());
            return ResponseEntity.ok(result);
        } catch (NoDataFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No info available");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
    }

    @PostMapping("/booking/create")
    public ResponseEntity<?> createBooking(@RequestBody BookingRequestDTO bookingRequest) {
        try {
            String result = bookingService.createBooking(bookingRequest.getUserId(), bookingRequest.getTravelDate(), bookingRequest.getTicketIds());
            return ResponseEntity.ok(result);
        } catch (NoDataFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No info available");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
    }

    @GetMapping("/booking/details")
    public ResponseEntity<?> getBookingDetails(@RequestParam String bookingId) {
        try {
            // Assuming a method exists in BookingService to fetch booking details
            List<BookingDetailsResponse> bookingDetails = bookingService.getBookingDetails(bookingId);
            return ResponseEntity.ok(bookingDetails);
        } catch (NoDataFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No booking found with the given ID");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
    }
    

    //RETURN ALLbookings of a user
    @GetMapping("/bookings")
    public ResponseEntity<?> getAllBookings(@RequestParam String userId) {
        try {
            List<UserBookingResponse> bookings = bookingService.getBookingsByUser(userId);
            return ResponseEntity.ok(bookings);
        } catch (NoDataFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No bookings found for the user");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
    }

    @GetMapping("/booking/holdtime")
    public ResponseEntity<?> getBookingHoldTime(@RequestParam String bookingId) {
        try {
            String holdTime = bookingService.getBookingHoldTime(bookingId);
            return ResponseEntity.ok(java.util.Map.of("holdTime", holdTime));
        } catch (NoDataFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No hold time found for the booking");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
    }
    
}
