package com.eticket.railway.Controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eticket.railway.DTO.FullDetailsDTO;
import com.eticket.railway.DTO.SearchDTO;
import com.eticket.railway.DTO.SearchResponseDTO;
import com.eticket.railway.DTO.TrainDTO;
import com.eticket.railway.DTO.TrainIDDTO;
import com.eticket.railway.Exception.NoDataFoundException;
import com.eticket.railway.Service.TrainInfoService;

@RestController
@RequestMapping("/api")
public class TrainInfoController {

    private final TrainInfoService trainInfoService;

    public TrainInfoController(TrainInfoService trainInfoService) {
        this.trainInfoService = trainInfoService;
    }

    @PostMapping("/public/search")
    public ResponseEntity<?> searchTrains(@RequestBody SearchDTO searchDTO) {
        try {

            List<SearchResponseDTO> responseDTO = trainInfoService.searchTrains(searchDTO.getFromStation(), searchDTO.getToStation(), searchDTO.getDate(), searchDTO.getClass_()); //trainInfoService.searchTrains(fromStation, toStation, date, class_);
            return ResponseEntity.ok(responseDTO);

        } catch (NoDataFoundException e) {
            // Return an empty response data for NoDataFoundException
            return ResponseEntity.status(HttpStatus.OK).body(Collections.emptyList());
        } catch (Exception e) {
            // Return 404 or other relevant status code for other exceptions
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/public/trains")
    public ResponseEntity<?> getTrains(@RequestBody TrainDTO trainDTO) {
        try {
            List<TrainIDDTO> trains = trainInfoService.getTrainIds(trainDTO.getFromStation(), trainDTO.getToStation());
            return ResponseEntity.ok(trains);
        } catch (NoDataFoundException e) {
            return ResponseEntity.status(HttpStatus.OK).body(Collections.emptyList());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/public/fullDetails")
    public ResponseEntity<?> getFullDetails(@RequestBody Map<String, String> request) {
        try {
            String trainId = request.get("trainId"); // Extract trainId from the request body
            List<FullDetailsDTO> trains = trainInfoService.getFullDetails(trainId);
            return ResponseEntity.ok(trains);
        } catch (NoDataFoundException e) {
            return ResponseEntity.status(HttpStatus.OK).body(Collections.emptyList());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

}

// @RestController
// @RequestMapping("/api")
// public class TrainInfoController {
//     private final TrainInfoService trainInfoService;
//     public TrainInfoController(TrainInfoService trainInfoService) {
//         this.trainInfoService = trainInfoService;
//     }
//     @PostMapping("/search")
//     ResponseEntity<?> searchTrains(@RequestBody SearchDTO searchDTO){ {
//         try {
//             List<TrainInfoDTO> trains = trainInfoService.getAllTrains(
//                     searchDTO.getFromStation(),
//                     searchDTO.getToStation(),
//                     searchDTO.getDate()
//             );
//             List<AvailabilityDTO> availability = trainInfoService.getAvailability(
//                     searchDTO.getFromStation(),
//                     searchDTO.getToStation(),
//                     searchDTO.getDate(),
//                     searchDTO.getClass_()
//             );
//             TrainSearchResponseDTO responseDTO = new TrainSearchResponseDTO(trains, availability);
//             return ResponseEntity.ok(responseDTO);
//         } catch (NoDataFoundException e) {
//             return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
//         }
//     }
// }
// List<TrainInfoDTO> trains = trainInfoService.getAllTrains(
//         searchDTO.getFromStation(),
//         searchDTO.getToStation(),
//         searchDTO.getDate()
// );
// List<AvailabilityDTO> availability = trainInfoService.getAvailability(
//         searchDTO.getFromStation(),
//         searchDTO.getToStation(),
//         searchDTO.getDate(),
//         searchDTO.getClass_()
            // );
