package com.eticket.railway.Controller;


import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eticket.railway.DTO.StationDTO;
import com.eticket.railway.Exception.NoDataFoundException;
import com.eticket.railway.Service.StationService;

@RestController
@RequestMapping("/api")
public class StationController {
    private final StationService stationService;

    public StationController(StationService stationService) {
        this.stationService = stationService;
    }

    @GetMapping("/public/stations/from")
    public ResponseEntity<?> getFromStations(){
        try {
            List<StationDTO> fromStations = stationService.getFromStations();
            return ResponseEntity.ok(fromStations);
        } catch (NoDataFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No from stations available");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
    }

    @GetMapping("/stations/from/stationmaster")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STATION_MASTER')")
    public ResponseEntity<?> getFromStationsStationMaster(){
        try {
            List<StationDTO> fromStations = stationService.getFromStationsStationMaster();
            return ResponseEntity.ok(fromStations);
        } catch (NoDataFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No from stations available");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
    }
    
    @GetMapping("/public/stations/to")
    public ResponseEntity<?> getToStations(){
        try {
            List<StationDTO> toStations = stationService.getToStations();
            return ResponseEntity.ok(toStations);
        } catch (NoDataFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No to stations available");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
        }
    }
    
}
