package com.eticket.railway.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eticket.railway.DTO.CoachDTO;
import com.eticket.railway.DTO.RouteDTO;
import com.eticket.railway.DTO.SeatDTO;
import com.eticket.railway.DTO.StationDTO;
import com.eticket.railway.Service.CoachService;
import com.eticket.railway.Service.RouteService;
import com.eticket.railway.Service.SeatAllocationService;
import com.eticket.railway.Service.StationService;
import com.eticket.railway.Service.TicketService;

@RestController
@RequestMapping("/api/admin/routes")
@CrossOrigin(origins = "http://localhost:3000")
public class RouteController {

    @Autowired
    private RouteService routeService;
    
    @Autowired
    private StationService stationService;
    
    @Autowired
    private TicketService ticketService;
    
    @Autowired
    private CoachService coachService;
    
    @Autowired
    private SeatAllocationService seatAllocationService;

    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addRoute(@RequestBody RouteDTO route) {
        Map<String, Object> response = new HashMap<>();
        
        System.out.println("=== ADD ROUTE REQUEST ===");
        System.out.println("Train ID: " + route.getTrainId());
        System.out.println("Station ID: " + route.getFromStationId());
        System.out.println("Route Sequence: " + route.getRouteSequence());
        System.out.println("Arrival Time: " + route.getArrivalTime());
        System.out.println("Departure Time: " + route.getDepartureTime());
        System.out.println("Halt: " + route.getHalt());
        System.out.println("Route Duration: " + route.getRouteDuration());
        
        try {
            // Validate required fields
            if (route.getTrainId() == null || route.getTrainId().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Train ID is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (route.getFromStationId() == null || route.getFromStationId().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Station selection is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (route.getRouteSequence() <= 0) {
                response.put("success", false);
                response.put("message", "Route sequence must be a positive number");
                return ResponseEntity.badRequest().body(response);
            }
            
            // For first station, departure time is required
            if (route.getRouteSequence() == 1) {
                if (route.getDepartureTime() == null || route.getDepartureTime().trim().isEmpty()) {
                    response.put("success", false);
                    response.put("message", "Departure time is required for the first station");
                    return ResponseEntity.badRequest().body(response);
                }
            } else {
                // For other stations, arrival time is required
                if (route.getArrivalTime() == null || route.getArrivalTime().trim().isEmpty()) {
                    response.put("success", false);
                    response.put("message", "Arrival time is required for station sequence " + route.getRouteSequence());
                    return ResponseEntity.badRequest().body(response);
                }
            }
            
            // Add the route
            routeService.addRoute(route);
            
            System.out.println("Route added successfully for train " + route.getTrainId());
            
            response.put("success", true);
            response.put("message", "Route added successfully for sequence " + route.getRouteSequence());
            response.put("routeSequence", route.getRouteSequence());
            response.put("nextSequence", routeService.getNextRouteSequence(route.getTrainId()));
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error in add route: " + e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            System.err.println("Error in add route: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Failed to add route: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/train/{trainId}")
    public ResponseEntity<Map<String, Object>> getRoutesByTrainId(@PathVariable String trainId) {
        Map<String, Object> response = new HashMap<>();
        
        System.out.println("=== GET ROUTES REQUEST ===");
        System.out.println("Train ID: " + trainId);
        
        try {
            List<RouteDTO> routes = routeService.getRoutesByTrainId(trainId);
            
            response.put("success", true);
            response.put("routes", routes);
            response.put("totalRoutes", routes.size());
            response.put("nextSequence", routeService.getNextRouteSequence(trainId));
            response.put("hasRoutes", !routes.isEmpty());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error in get routes: " + e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            System.err.println("Error in get routes: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Failed to fetch routes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/stations")
    public ResponseEntity<Map<String, Object>> getStations() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<StationDTO> stations = stationService.getFromStationsStationMaster();
            
            response.put("success", true);
            response.put("stations", stations);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error fetching stations: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Failed to fetch stations: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/trains")
    public ResponseEntity<Map<String, Object>> getTrains() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<String> trainNames = ticketService.getAllTrainNames();
            
            response.put("success", true);
            response.put("trains", trainNames);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error fetching trains: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Failed to fetch trains: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Coach Management Endpoints
    @GetMapping("/train/{trainId}/coaches")
    public ResponseEntity<Map<String, Object>> getCoachesByTrainId(@PathVariable String trainId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<CoachDTO> coaches = coachService.getCoachesByTrainId(trainId);
            
            response.put("success", true);
            response.put("coaches", coaches);
            response.put("totalCoaches", coaches.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error fetching coaches: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Failed to fetch coaches: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/coaches/add")
    public ResponseEntity<Map<String, Object>> addCoach(@RequestBody CoachDTO coach) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            coachService.addCoach(coach);
            
            response.put("success", true);
            response.put("message", "Coach added successfully with " + coach.getSeatCount() + " seats");
            response.put("coachId", coach.getCoachId());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error adding coach: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Failed to add coach: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/classes")
    public ResponseEntity<Map<String, Object>> getClasses() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<CoachDTO> classes = coachService.getAllClasses();
            
            response.put("success", true);
            response.put("classes", classes);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error fetching classes: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Failed to fetch classes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Seat Management Endpoints
    @GetMapping("/coach/{coachId}/seats")
    public ResponseEntity<Map<String, Object>> getSeatsByCoachId(@PathVariable String coachId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<SeatDTO> seats = seatAllocationService.getSeatsByCoachId(coachId);
            
            response.put("success", true);
            response.put("seats", seats);
            response.put("totalSeats", seats.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error fetching seats: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Failed to fetch seats: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Seat Allocation Endpoints
    @PostMapping("/seat-allocations/add")
    public ResponseEntity<Map<String, Object>> addSeatAllocations(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String trainId = (String) request.get("trainId");
            String classId = (String) request.get("classId");
            @SuppressWarnings("unchecked")
            List<String> seatIds = (List<String>) request.get("seatIds");
            String fromStationId = (String) request.get("fromStationId");
            String toStationId = (String) request.get("toStationId");
            Double fare = Double.valueOf(request.get("fare").toString());
            
            seatAllocationService.addBulkSeatAllocations(trainId, classId, seatIds, fromStationId, toStationId, fare);
            
            response.put("success", true);
            response.put("message", "Seat allocations added successfully for " + seatIds.size() + " seats");
            response.put("allocatedSeats", seatIds.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error adding seat allocations: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Failed to add seat allocations: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
