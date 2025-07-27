package com.eticket.railway.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.eticket.railway.DTO.StationDTO;
import com.eticket.railway.Exception.NoDataFoundException;
import com.eticket.railway.Repository.StationRepository;

@Service
public class StationService {
    private final StationRepository stationRepository;

    public StationService(StationRepository stationRepository) {
        this.stationRepository = stationRepository;
    }

    public List<StationDTO> getFromStations() {
        List<StationDTO> fromStations = stationRepository.findAllFromStations();
        if (fromStations == null || fromStations.isEmpty()) {
            throw new NoDataFoundException("No 'from' stations found");
        }
        return fromStations;
    }

    public List<StationDTO> getFromStationsStationMaster() {
        List<StationDTO> fromStations = stationRepository.findAllFromStationsStationMaster();
        if (fromStations == null || fromStations.isEmpty()) {
            throw new NoDataFoundException("No 'from' stations found");
        }
        return fromStations;
    }

    public List<StationDTO> getToStations() {
        List<StationDTO> toStations = stationRepository.findAllToStations();
        if (toStations == null || toStations.isEmpty()) {
            throw new NoDataFoundException("No 'to' stations found");
        }
        return toStations;
    }
    
}
