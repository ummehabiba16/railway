package com.eticket.railway.DTO;

import org.springframework.data.annotation.Id;

public class StationDTO {
    @Id
    private String stationId;
    private String name;
    
    public StationDTO(String stationId, String name) {
        this.stationId = stationId;
        this.name = name;
    }

    public String getStationId() {
        return stationId;
    }

    public void setStationId(String stationId) {
        this.stationId = stationId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
