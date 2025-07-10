package com.eticket.railway.Repository;

import java.sql.CallableStatement;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.CallableStatementCallback;
import org.springframework.jdbc.core.CallableStatementCreator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.eticket.railway.DTO.AvailabilityDTO;
import com.eticket.railway.DTO.AvailabilityPerClassDTO;
import com.eticket.railway.DTO.BookingDetailsResponse;
import com.eticket.railway.DTO.BookingResponseDTO;
import com.eticket.railway.DTO.FullDetailsDTO;
import com.eticket.railway.DTO.SearchResponseDTO;
import com.eticket.railway.DTO.TicketResponseDTO;
import com.eticket.railway.DTO.TrainIDDTO;
import com.eticket.railway.DTO.TrainInfoDTO;

@Repository
public class TrainInfoRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<SearchResponseDTO> searchTrains(String fromStation, String toStation, String date, String class_) {
        String sql = """
                SELECT
    T.TRAINID,
    T.TRAINNAME,
    TO_CHAR(R1.DEPARTURETIME, 'HH:MI:SS AM') AS DEPARTURE_TIME,
    TO_CHAR(R2.ARRIVALTIME, 'HH:MI:SS AM') AS ARRIVAL_TIME,
    C.CLASSID,
    C.CLASSNAME,
    SA.FARE,
    COUNT(TICKET.TICKETID) AS AVAILABLECOUNT
FROM TICKET
JOIN SEAT_ALLOCATION SA ON SA.TRAINSEATID = TICKET.TRAINSEATID
    AND SA.FROMSTATIONID = ?
    AND SA.TOSTATIONID = ?
JOIN TRAIN T ON T.TRAINID = SA.TRAINID
    AND TO_CHAR(TICKET.TRAVELDATE, 'Dy') <> T.OFFDAY
JOIN CLASS C ON C.CLASSID = SA.CLASSID
JOIN ROUTE R1 ON R1.TRAINID = T.TRAINID AND R1.FROMSTATIONID = ?
JOIN ROUTE R2 ON R2.TRAINID = T.TRAINID AND R2.FROMSTATIONID = ?
WHERE
    TICKET.TRAVELDATE = TO_DATE(?, 'DD-MM-YYYY')
    AND TICKET.TicketStatus = 'AVAILABLE'
GROUP BY
    T.TRAINID, T.TRAINNAME, R1.DEPARTURETIME, R2.ARRIVALTIME, C.CLASSID, C.CLASSNAME, SA.FARE
ORDER BY T.TRAINID

                """;
        Map<String, SearchResponseDTO> trainMap = new LinkedHashMap<>();

        jdbcTemplate.query(
                sql,
                new Object[]{fromStation, toStation, fromStation, toStation, date},
                rs -> {
                    try {
                        String trainId = rs.getString("TRAINID");

                        SearchResponseDTO trainDTO = trainMap.computeIfAbsent(trainId, id -> {
                            try {
                                return new SearchResponseDTO(
                                        rs.getString("TRAINID"),
                                        rs.getString("TRAINNAME"),
                                        rs.getString("DEPARTURE_TIME"),
                                        rs.getString("ARRIVAL_TIME")
                                );
                            } catch (SQLException e) {
                                throw new RuntimeException("Failed to extract train data", e);
                            }
                        });

                        try {
                            AvailabilityPerClassDTO classDTO = new AvailabilityPerClassDTO(
                                    rs.getString("CLASSID"),
                                    rs.getString("CLASSNAME"),
                                    rs.getInt("FARE"),
                                    rs.getInt("AVAILABLECOUNT")
                            );

                            trainDTO.addClassInfo(classDTO);
                        } catch (SQLException e) {
                            throw new RuntimeException("Failed to extract class data", e);
                        }

                    } catch (SQLException e) {
                        throw new RuntimeException("Failed to process result set", e);
                    }
                }
        );

        return new ArrayList<>(trainMap.values());

    }

    public List<TrainInfoDTO> findAllTrains(String fromStation, String toStation, String date) {
        String sql = """
            SELECT T.TRAINID, T.TRAINNAME,
                   (SELECT TO_CHAR(DEPARTURETIME, 'HH:MI:SS AM') 
                    FROM ROUTE R1 
                    WHERE R1.FROMSTATIONID = ? AND R1.TRAINID = T.TRAINID) AS DEPARTURE_TIME,
                   (SELECT TO_CHAR(ARRIVALTIME, 'HH:MI:SS AM') 
                    FROM ROUTE R2 
                    WHERE R2.FROMSTATIONID = ? AND R2.TRAINID = T.TRAINID) AS ARRIVAL_TIME
            FROM SEAT_ALLOCATION SA 
            JOIN TRAIN T ON T.TRAINID = SA.TRAINID
            WHERE SA.FROMSTATIONID = ?
              AND SA.TOSTATIONID = ?
              AND TO_CHAR(TO_DATE(?, 'DD-MM-YYYY'), 'Dy') <> T.OFFDAY
            GROUP BY T.TRAINID, T.TRAINNAME
        """;

        try {
            return jdbcTemplate.query(sql,
                    new Object[]{fromStation, toStation, fromStation, toStation, date},
                    (rs, rowNum) -> new TrainInfoDTO(
                            rs.getString("TRAINID"),
                            rs.getString("TRAINNAME"),
                            rs.getString("DEPARTURE_TIME"),
                            rs.getString("ARRIVAL_TIME")
                    )
            );
        } catch (DataAccessException e) {
            throw new RuntimeException("Error fetching train information", e);
        }
    }

    public List<AvailabilityDTO> findAvailability(String fromStationId, String toStationId, String date, String classId) {
        String sql = """
            SELECT C.CLASSNAME, SA.FARE, COUNT(TICKET.TICKETID) AS AVAILABLECOUNT
            FROM TICKET
            JOIN SEAT_ALLOCATION SA 
                ON SA.TRAINSEATID = TICKET.TRAINSEATID
                AND SA.FROMSTATIONID = ?
                AND SA.TOSTATIONID = ?
            JOIN TRAIN T 
                ON T.TRAINID = SA.TRAINID 
                AND TO_CHAR(TICKET.TRAVELDATE, 'Dy') <> T.OFFDAY
            JOIN CLASS C 
                ON C.CLASSID = SA.CLASSID
            WHERE TICKET.TRAVELDATE = TO_DATE(?, 'DD-MM-YYYY')
              AND TICKET.TicketStatus = 'AVAILABLE'
              AND SA.CLASSID = ?
            GROUP BY SA.CLASSID, C.CLASSNAME, SA.FARE
        """;

        try {
            return jdbcTemplate.query(
                    sql,
                    new Object[]{fromStationId, toStationId, date, classId},
                    (rs, rowNum) -> new AvailabilityDTO(
                            rs.getString("CLASSNAME"),
                            rs.getInt("FARE"),
                            rs.getInt("AVAILABLECOUNT")
                    )
            );
        } catch (DataAccessException e) {
            throw new RuntimeException("Error fetching seat availability", e);
        }
    }

    public List<TrainIDDTO> findTrains(String fromStation, String toStation) {
        String sql = """
                        SELECT DISTINCT T.TRAINID, T.TRAINNUM, T.TRAINNAME
                        FROM SEAT_ALLOCATION SA 
                        JOIN TRAIN T ON T.TRAINID = SA.TRAINID
                        WHERE SA.FROMSTATIONID = ?
                        AND SA.TOSTATIONID = ?
                        GROUP BY T.TRAINID, T.TRAINNUM, T.TRAINNAME
                    """;

        try {
            return jdbcTemplate.query(
                    sql,
                    new Object[]{fromStation, toStation},
                    (rs, rowNum) -> new TrainIDDTO(
                            rs.getString("TRAINID"),
                            rs.getString("TRAINNUM"),
                            rs.getString("TRAINNAME")
                    )
            );
        } catch (DataAccessException e) {
            throw new RuntimeException("Error fetching train information", e);
        }
    }

    public List<FullDetailsDTO> getFullDetails(String trainId) {
        String sql = """
                SELECT ROUTESEQUENCE, S.NAME, ARRIVALTIME, DEPARTURETIME, HALT, ROUTEDURATION 
                FROM ROUTE R JOIN STATION S ON (S.STATIONID = R.FROMSTATIONID)
                WHERE TRAINID = ? 
                AND ISACTIVE = 'Y' 
                ORDER BY ROUTESEQUENCE
                """;
        try {
            return jdbcTemplate.query(
                    sql,
                    new Object[]{trainId},
                    (rs, rowNum) -> new FullDetailsDTO(
                            trainId,
                            rs.getInt("ROUTESEQUENCE"),
                            rs.getString("NAME"),
                            rs.getString("ARRIVALTIME"),
                            rs.getString("DEPARTURETIME"),
                            rs.getInt("HALT"),
                            rs.getInt("ROUTEDURATION")
                    )
            );
        } catch (DataAccessException e) {
            throw new RuntimeException("Error fetching train information", e);
        }
    }

    public List<BookingResponseDTO> coachwiseAvailabilityCount(String trainId, String classId, String date, String fromStation, String toStation) {
        String sql = """
            SELECT C.COACHID, C.COACHNAME, COUNT(T.TICKETID) AS TICKET_COUNT, C.SEATCOUNT
            FROM TICKET T
            JOIN SEAT_ALLOCATION SA ON T.trainSeatId = SA.trainSeatId
            JOIN SEAT S ON SA.SEATID = S.SEATID
            JOIN COACH C ON S.COACHID = C.COACHID
            WHERE SA.TRAINID = ?
               AND SA.CLASSID = ?
               AND T.TRAVELDATE = TO_DATE(?, 'DD-MM-YYYY')
                AND SA.FROMSTATIONID = ?
                AND SA.TOSTATIONID = ?
               AND T.TICKETSTATUS = 'AVAILABLE'
            GROUP BY C.COACHID, C.COACHNAME, C.SEATCOUNT
        """;

        try {
            List<BookingResponseDTO> result = jdbcTemplate.query(
                    sql,
                    new Object[]{trainId, classId, date, fromStation, toStation},
                    (rs, rowNum) -> new BookingResponseDTO(
                            rs.getString("COACHID"),
                            rs.getString("COACHNAME"),
                            rs.getInt("TICKET_COUNT"),
                            rs.getInt("SEATCOUNT")
                    )
            );

            return result != null ? result : new ArrayList<>();

        } catch (DataAccessException e) {
            throw new RuntimeException("Error fetching ticket availability", e);
        }
    }

    public List<TicketResponseDTO> ticketStatusByCoach(String trainId, String classId, String date, String coachId, String fromStation, String toStation) {
        String sql = """
        SELECT T.TICKETID, S.SEATNUM, S.BERTHPOSITION, T.TICKETSTATUS
        FROM TICKET T
        JOIN SEAT_ALLOCATION SA ON T.TRAINSEATID = SA.TRAINSEATID
        JOIN SEAT S ON SA.SEATID = S.SEATID
        WHERE SA.TRAINID = ?
          AND SA.CLASSID = ?
          AND S.COACHID = ?
          AND T.TRAVELDATE = TO_DATE(?, 'DD-MM-YYYY')
            AND SA.FROMSTATIONID = ?
            AND SA.TOSTATIONID = ?
    """;

        try {
            List<TicketResponseDTO> result = jdbcTemplate.query(
                    sql,
                    new Object[]{trainId, classId, coachId, date, fromStation, toStation},
                    (rs, rowNum) -> {
                        String berthStr = rs.getString("BERTHPOSITION");
                        char berthPosition = (berthStr != null && !berthStr.isEmpty()) ? berthStr.charAt(0) : ' ';
                        return new TicketResponseDTO(
                                rs.getString("TICKETID"),
                                rs.getString("SEATNUM"),
                                berthPosition,
                                rs.getString("TICKETSTATUS")
                        );
                    }
            );

            return result != null ? result : new ArrayList<>();

        } catch (DataAccessException e) {
            throw new RuntimeException("Error fetching ticket status by coach", e);
        }
    }

    // public String selectSeat(String ticketId){
    //     String sql = """ 
    //             SELECT TICKETSTATUS from TICKET where TICKETID = ?
    //             """;
    //     try {
    //         return jdbcTemplate.queryForObject(sql, String.class, ticketId);
    //     } catch (DataAccessException e) {
    //         throw new RuntimeException("Error fetching ticket status", e);
    //     }
    // }
    public String selectSeat(String ticketId) {
        String sql = "{ ? = call Check_And_Update_Ticket_Status(?) }";
        try {
            return jdbcTemplate.execute((CallableStatementCreator) con -> {
                CallableStatement cs = con.prepareCall(sql);
                cs.registerOutParameter(1, Types.VARCHAR); // Return value
                cs.setString(2, ticketId);                  // Input param
                return cs;
            }, (CallableStatementCallback<String>) cs -> {
                cs.execute();
                return cs.getString(1); // Get function return value
            });
        } catch (Exception e) {
            throw new RuntimeException("Error executing PL/SQL function", e);
        }
    }

    public boolean createBooking(String bookingId, String userId, String travelDate, List<String> ticketIds) {
        String insertBookingSql = """
            INSERT INTO BOOKING (BookingId, UserId, TravelDate)
            VALUES (?, ?, TO_DATE(?, 'DD-MM-YYYY'))
        """;
        // other fields have defaults, which applies in this case

        String updateTicketSql = """
            UPDATE TICKET
            SET BOOKINGID = ?
            WHERE TICKETID = ?
        """;

        try {
            // Insert into BOOKING table
            jdbcTemplate.update(insertBookingSql, bookingId, userId, travelDate);

            // Update each TICKET with the booking ID
            for (String ticketId : ticketIds) {
                jdbcTemplate.update(updateTicketSql, bookingId, ticketId);
            }

            return true;

        } catch (DataAccessException e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<BookingDetailsResponse> getBookingDetails(String bookingId) {
        String sql = """
            SELECT T.TICKETID , SA.FARE, S.SEATNUM, C.COACHNAME
            FROM TICKET T JOIN SEAT_ALLOCATION SA ON (SA.TRAINSEATID = T.TRAINSEATID)
            JOIN SEAT S ON(SA.SEATID = S.SEATID) JOIN COACH C ON(C.COACHID = S.COACHID)
            WHERE T.BOOKINGID = ?
        """;

        try {
            return jdbcTemplate.query(
                    sql,
                    new Object[]{bookingId},
                    (rs, rowNum) -> new BookingDetailsResponse(
                            rs.getString("TICKETID"),
                            rs.getInt("FARE"),
                            rs.getString("SEATNUM"),
                            rs.getString("COACHNAME")
                    )
            );
        } catch (DataAccessException e) {
            throw new RuntimeException("Error fetching booking details", e);
        }
    }

}
