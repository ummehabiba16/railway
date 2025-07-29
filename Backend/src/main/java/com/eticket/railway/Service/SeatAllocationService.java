package com.eticket.railway.Service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eticket.railway.DTO.SeatAllocationDTO;
import com.eticket.railway.DTO.SeatDTO;
import com.eticket.railway.Repository.SeatAllocationRepository;
import com.eticket.railway.Repository.SeatRepository;

@Service
public class SeatAllocationService {

    @Autowired
    private SeatAllocationRepository seatAllocationRepository;
    
    @Autowired
    private SeatRepository seatRepository;

    public List<SeatDTO> getSeatsByCoachId(String coachId) {
        return seatRepository.getSeatsByCoachId(coachId);
    }

    @Transactional
    public void addBulkSeatAllocations(String trainId, String classId, List<String> seatIds, 
                                     String fromStationId, String toStationId, double fare) {
        
        List<SeatAllocationDTO> allocations = new ArrayList<>();
        
        for (String seatId : seatIds) {
            // Check if allocation already exists
            if (seatAllocationRepository.seatAllocationExists(seatId, fromStationId, toStationId)) {
                System.out.println("Seat allocation already exists for seat: " + seatId + 
                                 " from " + fromStationId + " to " + toStationId);
                continue;
            }
            
            String trainSeatId = seatAllocationRepository.generateTrainSeatId();
            
            SeatAllocationDTO allocation = new SeatAllocationDTO(
                trainSeatId, seatId, trainId, fromStationId, toStationId, classId, fare
            );
            
            allocations.add(allocation);
        }
        
        if (!allocations.isEmpty()) {
            seatAllocationRepository.addBulkSeatAllocations(allocations);
            System.out.println("Added " + allocations.size() + " seat allocations for train: " + trainId);
        } else {
            System.out.println("No new seat allocations to add - all already exist");
        }
    }

    public List<SeatAllocationDTO> getSeatAllocationsByTrainId(String trainId) {
        return seatAllocationRepository.getSeatAllocationsByTrainId(trainId);
    }
}
