package com.eticket.railway.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.eticket.railway.DTO.AvailabilityDTO;
import com.eticket.railway.DTO.FullDetailsDTO;
import com.eticket.railway.DTO.SearchResponseDTO;
import com.eticket.railway.DTO.TrainIDDTO;
import com.eticket.railway.DTO.TrainInfoDTO;
import com.eticket.railway.Exception.NoDataFoundException;
import com.eticket.railway.Repository.TrainInfoRepository;

@Service
public class TrainInfoService {
    private final TrainInfoRepository trainInfoRepository;

    public TrainInfoService(TrainInfoRepository trainInfoRepository) {
        this.trainInfoRepository = trainInfoRepository;
    }

    public List<SearchResponseDTO> searchTrains(String fromStation, String toStation, String date, String class_) {
        List<SearchResponseDTO> searchResults = trainInfoRepository.searchTrains(fromStation, toStation, date, class_);
        if (searchResults == null || searchResults.isEmpty()) {
            throw new NoDataFoundException("No trains found for the given route and date");
        }
        return searchResults;
    }

    public List<TrainInfoDTO> getAllTrains(String fromStation, String toStation, String date) {
        List<TrainInfoDTO> trains = trainInfoRepository.findAllTrains(fromStation, toStation, date);
        if (trains == null || trains.isEmpty()) {
            throw new NoDataFoundException("No trains found for the given route and date");
        }
        return trains;
    }
    public List<AvailabilityDTO> getAvailability(String fromStationId, String toStationId, String date, String classId) {
        List<AvailabilityDTO> availability = trainInfoRepository.findAvailability(fromStationId, toStationId, date, classId);
        if (availability == null || availability.isEmpty()) {
            throw new NoDataFoundException("No availability found for the given route and date");
        }
        return availability;
    }

    public List<TrainIDDTO> getTrainIds(String fromStation, String toStation) {
        List<TrainIDDTO> trainIds = trainInfoRepository.findTrains(fromStation, toStation);
        if (trainIds == null || trainIds.isEmpty()) {
            throw new NoDataFoundException("No train found");
        }
        return trainIds;
    }

    public List<FullDetailsDTO> getFullDetails(String trainId) {
        List<FullDetailsDTO> fullDetails = trainInfoRepository.getFullDetails(trainId);
        if (fullDetails == null || fullDetails.isEmpty()) {
            throw new NoDataFoundException("No full details found for the given train ID");
        }
        return fullDetails;
    }
    
}
