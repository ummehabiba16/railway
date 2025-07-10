package com.eticket.railway.Service;
import java.sql.Date;
import java.util.List;

import org.springframework.stereotype.Service;

import com.eticket.railway.Exception.NoDataFoundException;
import com.eticket.railway.Repository.AvailableDateRepository;

@Service
public class AvailableDateService {
    private final AvailableDateRepository travelDateRepository;
    public AvailableDateService(AvailableDateRepository travelDateRepository) {
        this.travelDateRepository = travelDateRepository;
    }
    public List<Date> getAvailableDates() {
        List<Date> availableDates = travelDateRepository.findAllAvailableDates();
        if(availableDates == null || availableDates.isEmpty()) {
            throw new NoDataFoundException("No available dates found");
        }
        return availableDates;
    }
}
