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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eticket.railway.DTO.StationDTO;
import com.eticket.railway.DTO.TrainManagementDTO;
import com.eticket.railway.Service.TrainService;

@RestController
@RequestMapping("/api/admin/trains")
@CrossOrigin(origins = "http://localhost:3000")
public class TrainController {

    @Autowired
    private TrainService trainService;

    @GetMapping
    public ResponseEntity<?> getAllTrains() {
        try {
            List<TrainManagementDTO> trains = trainService.getAllTrains();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("trains", trains);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch trains: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{trainId}")
    public ResponseEntity<?> getTrainById(@PathVariable String trainId) {
        try {
            TrainManagementDTO train = trainService.getTrainById(trainId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("train", train);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @GetMapping("/stations/from")
    public ResponseEntity<?> getFromStations() {
        try {
            List<StationDTO> stations = trainService.getFromStations();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("stations", stations);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch from stations: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/stations/to")
    public ResponseEntity<?> getToStations() {
        try {
            List<StationDTO> stations = trainService.getToStations();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("stations", stations);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch to stations: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/{trainId}")
    public ResponseEntity<?> updateTrain(
            @PathVariable String trainId,
            @RequestBody Map<String, String> trainData) {
        try {
            String trainNum = trainData.get("trainNum");
            String trainName = trainData.get("trainName");
            String fromStationId = trainData.get("fromStationId");
            String toStationId = trainData.get("toStationId");
            String offDay = trainData.get("offDay");

            trainService.updateTrain(trainId, trainNum, trainName, fromStationId, toStationId, offDay);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Train updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<?> createTrain(@RequestBody Map<String, String> trainData) {
        try {
            String trainNum = trainData.get("trainNum");
            String trainName = trainData.get("trainName");
            String fromStationId = trainData.get("fromStationId");
            String toStationId = trainData.get("toStationId");
            String offDay = trainData.get("offDay");

            trainService.createTrain(trainNum, trainName, fromStationId, toStationId, offDay);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Train created successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/{trainId}/coaches")
    public ResponseEntity<Map<String, Object>> getCoachesByTrainId(@PathVariable String trainId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Map<String, String>> coaches = trainService.getCoachesByTrainId(trainId);
            response.put("success", true);
            response.put("coaches", coaches);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch coaches: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
