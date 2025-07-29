package com.eticket.railway.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eticket.railway.DTO.RouteDTO;
import com.eticket.railway.Repository.RouteRepository;
import com.eticket.railway.Repository.StationRepository;
import com.eticket.railway.Repository.TrainRepository;

@Service
public class RouteService {

    @Autowired
    private RouteRepository routeRepository;
    
    @Autowired
    private TrainRepository trainRepository;
    
    @Autowired
    private StationRepository stationRepository;

    @Transactional
    public void addRoute(RouteDTO route) {
        // Validate train exists
        if (trainRepository.findTrainById(route.getTrainId()) == null) {
            throw new IllegalArgumentException("Train not found with ID: " + route.getTrainId());
        }
        
        // Validate that route sequence is not duplicate
        if (routeRepository.routeSequenceExists(route.getTrainId(), route.getRouteSequence())) {
            throw new IllegalArgumentException("Route sequence " + route.getRouteSequence() + 
                                             " already exists for train " + route.getTrainId());
        }
        
        // Validate route sequence is logical (should be max + 1 for new routes)
        int maxSequence = routeRepository.getMaxRouteSequence(route.getTrainId());
        if (route.getRouteSequence() > maxSequence + 1) {
            throw new IllegalArgumentException("Route sequence must be sequential. Next available sequence is: " + (maxSequence + 1));
        }
        
        // Validate times format if provided
        if (route.getArrivalTime() != null && !route.getArrivalTime().trim().isEmpty()) {
            if (!isValidTimeFormat(route.getArrivalTime())) {
                throw new IllegalArgumentException("Invalid arrival time format. Use HH:MM format (24-hour)");
            }
        }
        
        if (route.getDepartureTime() != null && !route.getDepartureTime().trim().isEmpty()) {
            if (!isValidTimeFormat(route.getDepartureTime())) {
                throw new IllegalArgumentException("Invalid departure time format. Use HH:MM format (24-hour)");
            }
        }
        
        // Validate sequence 1 should not have arrival time, last sequence should not have departure time
        if (route.getRouteSequence() == 1 && route.getArrivalTime() != null && !route.getArrivalTime().trim().isEmpty()) {
            throw new IllegalArgumentException("First station (sequence 1) should not have arrival time");
        }
        
        // Set default values
        if (route.getIsActive() == null) {
            route.setIsActive("Y");
        }
        
        System.out.println("Adding route for Train: " + route.getTrainId() + 
                         ", Station: " + route.getFromStationId() + 
                         ", Sequence: " + route.getRouteSequence());
        
        routeRepository.addRoute(route);
    }

    public List<RouteDTO> getRoutesByTrainId(String trainId) {
        // Validate train exists
        if (trainRepository.findTrainById(trainId) == null) {
            throw new IllegalArgumentException("Train not found with ID: " + trainId);
        }
        
        return routeRepository.getRoutesByTrainId(trainId);
    }

    public int getNextRouteSequence(String trainId) {
        return routeRepository.getMaxRouteSequence(trainId) + 1;
    }

    public boolean hasRoutes(String trainId) {
        List<RouteDTO> routes = getRoutesByTrainId(trainId);
        return routes != null && !routes.isEmpty();
    }

    private boolean isValidTimeFormat(String time) {
        if (time == null || time.trim().isEmpty()) {
            return true; // null or empty is valid (optional)
        }
        
        // Check format HH:MM
        if (!time.matches("^([01]?[0-9]|2[0-3]):[0-5][0-9]$")) {
            return false;
        }
        
        return true;
    }
}
