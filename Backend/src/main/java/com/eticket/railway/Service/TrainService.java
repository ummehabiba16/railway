package com.eticket.railway.Service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eticket.railway.DTO.StationDTO;
import com.eticket.railway.DTO.TrainManagementDTO;
import com.eticket.railway.Repository.StationRepository;
import com.eticket.railway.Repository.TrainRepository;

@Service
public class TrainService {

    @Autowired
    private TrainRepository trainRepository;

    @Autowired
    private StationRepository stationRepository;

    public List<TrainManagementDTO> getAllTrains() {
        return trainRepository.findAllTrains();
    }

    public TrainManagementDTO getTrainById(String trainId) {
        if (trainId == null || trainId.trim().isEmpty()) {
            throw new RuntimeException("Train ID is required");
        }
        
        TrainManagementDTO train = trainRepository.findTrainById(trainId);
        if (train == null) {
            throw new RuntimeException("Train not found with ID: " + trainId);
        }
        
        return train;
    }

    public List<StationDTO> getFromStations() {
        return stationRepository.findAllFromStationsStationMaster();
    }

    public List<StationDTO> getToStations() {
        return stationRepository.findAllToStations();
    }

    @Transactional
    public void updateTrain(String trainId, String trainNum, String trainName, 
                           String fromStationId, String toStationId, String offDay) {
        // Validate train number uniqueness for update
        if (trainRepository.trainNumExistsForUpdate(trainNum, trainId)) {
            throw new RuntimeException("Train number already exists");
        }

        // Validate required fields
        if (trainNum == null || trainNum.trim().isEmpty()) {
            throw new RuntimeException("Train number is required");
        }
        if (trainName == null || trainName.trim().isEmpty()) {
            throw new RuntimeException("Train name is required");
        }
        if (fromStationId == null || fromStationId.trim().isEmpty()) {
            throw new RuntimeException("From station is required");
        }
        if (toStationId == null || toStationId.trim().isEmpty()) {
            throw new RuntimeException("To station is required");
        }
        if (fromStationId.equals(toStationId)) {
            throw new RuntimeException("From station and To station cannot be the same");
        }

        trainRepository.updateTrain(trainId, trainNum.trim(), trainName.trim(), 
                                   fromStationId, toStationId, offDay);
    }

    @Transactional
    public void createTrain(String trainNum, String trainName, 
                           String fromStationId, String toStationId, String offDay) {
        // Validate train number uniqueness
        if (trainRepository.trainNumExists(trainNum)) {
            throw new RuntimeException("Train number already exists");
        }

        // Validate required fields
        if (trainNum == null || trainNum.trim().isEmpty()) {
            throw new RuntimeException("Train number is required");
        }
        if (trainName == null || trainName.trim().isEmpty()) {
            throw new RuntimeException("Train name is required");
        }
        if (fromStationId == null || fromStationId.trim().isEmpty()) {
            throw new RuntimeException("From station is required");
        }
        if (toStationId == null || toStationId.trim().isEmpty()) {
            throw new RuntimeException("To station is required");
        }
        if (fromStationId.equals(toStationId)) {
            throw new RuntimeException("From station and To station cannot be the same");
        }

        // Generate new train ID
        String trainId = trainRepository.generateTrainId();

        trainRepository.createTrain(trainId, trainNum.trim(), trainName.trim(), 
                                   fromStationId, toStationId, offDay);
    }

    public List<Map<String, String>> getCoachesByTrainId(String trainId) {
        if (trainId == null || trainId.trim().isEmpty()) {
            throw new RuntimeException("Train ID is required");
        }
        return trainRepository.getCoachesByTrainId(trainId);
    }
}
