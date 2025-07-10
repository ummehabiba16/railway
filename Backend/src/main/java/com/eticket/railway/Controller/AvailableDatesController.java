package com.eticket.railway.Controller;

import java.sql.Date;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eticket.railway.Exception.NoDataFoundException;
import com.eticket.railway.Service.AvailableDateService;

@RestController
@RequestMapping("/api")
public class AvailableDatesController {
    private final AvailableDateService travelDateService;
    public AvailableDatesController(AvailableDateService travelDateService) {
        this.travelDateService = travelDateService;
    }
    @GetMapping("/public/date")
    public ResponseEntity<?> getAvailableDates() {
        try{
            List<Date> availableDates = travelDateService.getAvailableDates();
            return ResponseEntity.ok(availableDates);
        }catch(NoDataFoundException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No available dates found");
        }
        catch(Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
    }
}