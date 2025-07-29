package com.eticket.railway.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eticket.railway.DTO.CoachDTO;
import com.eticket.railway.Repository.CoachRepository;
import com.eticket.railway.Repository.SeatRepository;
import com.eticket.railway.Repository.TrainRepository;

@Service
public class CoachService {

    @Autowired
    private CoachRepository coachRepository;
    
    @Autowired
    private TrainRepository trainRepository;
    
    @Autowired
    private SeatRepository seatRepository;

    @Transactional
    public void addCoach(CoachDTO coach) {
        // Validate train exists
        if (trainRepository.findTrainById(coach.getTrainId()) == null) {
            throw new IllegalArgumentException("Train not found with ID: " + coach.getTrainId());
        }
        
        // Generate coach ID if not provided
        if (coach.getCoachId() == null || coach.getCoachId().trim().isEmpty()) {
            coach.setCoachId(coachRepository.generateCoachId());
        }
        
        // Validate seat count
        if (coach.getSeatCount() <= 0) {
            throw new IllegalArgumentException("Seat count must be greater than 0");
        }
        
        System.out.println("Adding coach: " + coach.getCoachId() + 
                         " for Train: " + coach.getTrainId() + 
                         " with " + coach.getSeatCount() + " seats");
        
        // Add coach
        coachRepository.addCoach(coach);
        
        // Generate seats for the coach
        seatRepository.generateSeatsForCoach(coach.getCoachId(), coach.getSeatCount());
    }

    public List<CoachDTO> getCoachesByTrainId(String trainId) {
        // Validate train exists
        if (trainRepository.findTrainById(trainId) == null) {
            throw new IllegalArgumentException("Train not found with ID: " + trainId);
        }
        
        return coachRepository.getCoachesByTrainId(trainId);
    }

    public List<CoachDTO> getAllClasses() {
        return coachRepository.getAllClasses();
    }

    public boolean hasCoaches(String trainId) {
        List<CoachDTO> coaches = getCoachesByTrainId(trainId);
        return coaches != null && !coaches.isEmpty();
    }
}
