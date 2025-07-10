package com.eticket.railway.DTO;
import java.util.List;

public class TrainSearchResponseDTO {
    private List<TrainInfoDTO> trains;
    private List<AvailabilityDTO> availability;

    public TrainSearchResponseDTO(List<TrainInfoDTO> trains, List<AvailabilityDTO> availability) {
        this.trains = trains;
        this.availability = availability;
    }

    public List<TrainInfoDTO> getTrains() {
        return trains;
    }

    public List<AvailabilityDTO> getAvailability() {
        return availability;
    }

    public void setTrains(List<TrainInfoDTO> trains) {
        this.trains = trains;
    }

    public void setAvailability(List<AvailabilityDTO> availability) {
        this.availability = availability;
    }
}
