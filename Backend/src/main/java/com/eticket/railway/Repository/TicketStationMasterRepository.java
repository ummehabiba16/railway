package com.eticket.railway.Repository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.eticket.railway.DTO.TicketDetailsStationMasterDTO;

@Repository
public class TicketStationMasterRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<TicketDetailsStationMasterDTO> findByBookingIdStationMaster(String bookingId) {
        String sql = """     
            SELECT  T.BOOKINGID,
                    TR.TRAINNAME,
                    T.TRAVELDATE,
                    TO_CHAR(R.DEPARTURETIME, 'HH24:MI:SS') AS TRAVELTIME, 
                    FS.NAME AS STARTING,
                    TS.NAME AS DESTINATION,
                    T.PASSENGERNAME, 
                    T.PASSENGERTYPE, 
                    C.COACHNAME,
                    CL.CLASSNAME,
                    S.SEATNUM,
                    S.BERTHPOSITION,
                    B.NID, 
                    NVL(I.TOTAL, 0) AS TOTAL,
                    NVL(P.TRXID, 'N/A') AS TRXID
            FROM TICKET T JOIN SEAT_ALLOCATION SA ON(T.TRAINSEATID = SA.TRAINSEATID)
            JOIN SEAT S ON(S.SEATID = SA.SEATID)
            JOIN CLASS CL ON(SA.CLASSID = CL.CLASSID)
            JOIN COACH C ON(C.COACHID = S.COACHID)
            JOIN TRAIN TR ON(C.TRAINID = TR.TRAINID)
            JOIN BOOKING B ON(T.BOOKINGID = B.BOOKINGID)
            LEFT JOIN INVOICE I ON(B.BOOKINGID = I.BOOKINGID)
            LEFT JOIN PAYMENT P ON(P.INVOICEID = I.INVOICEID)
            JOIN STATION FS ON (FS.STATIONID = SA.FROMSTATIONID)
            JOIN STATION TS ON (TS.STATIONID = SA.TOSTATIONID)
            JOIN ROUTE R ON(R.FROMSTATIONID = SA.FROMSTATIONID AND R.TRAINID = C.TRAINID)
            WHERE B.BOOKINGID = ?
            ORDER BY T.TICKETID
        """;

        try {
            return jdbcTemplate.query(
                    sql,
                    (rs, rowNum) -> {
                        return new TicketDetailsStationMasterDTO(
                                rs.getString("BOOKINGID"),
                                rs.getString("TRAINNAME"),
                                rs.getString("TRAVELDATE"),
                                rs.getString("TRAVELTIME"),
                                rs.getString("STARTING"),
                                rs.getString("DESTINATION"),
                                rs.getString("PASSENGERNAME"),
                                rs.getString("PASSENGERTYPE"),
                                rs.getString("COACHNAME"),
                                rs.getString("CLASSNAME"),
                                rs.getString("SEATNUM"),
                                rs.getString("BERTHPOSITION"),
                                rs.getString("NID"),
                                rs.getDouble("TOTAL"),
                                rs.getString("TRXID")
                        );
                    },
                    bookingId
            );

        } catch (DataAccessException e) {
            throw new RuntimeException("Error fetching station master ticket details", e);
        }
    }

    public List<TicketDetailsStationMasterDTO> findByPaymentIdStationMaster(String paymentId) {
        String sql = """     
            SELECT  T.BOOKINGID,
                    TR.TRAINNAME,
                    T.TRAVELDATE,
                    TO_CHAR(R.DEPARTURETIME, 'HH24:MI:SS') AS TRAVELTIME, 
                    FS.NAME AS STARTING,
                    TS.NAME AS DESTINATION,
                    T.PASSENGERNAME, 
                    T.PASSENGERTYPE, 
                    C.COACHNAME,
                    CL.CLASSNAME,
                    S.SEATNUM,
                    S.BERTHPOSITION,
                    B.NID, 
                    NVL(I.TOTAL, 0) AS TOTAL,
                    NVL(P.TRXID, 'N/A') AS TRXID
            FROM TICKET T JOIN SEAT_ALLOCATION SA ON(T.TRAINSEATID = SA.TRAINSEATID)
            JOIN SEAT S ON(S.SEATID = SA.SEATID)
            JOIN CLASS CL ON(SA.CLASSID = CL.CLASSID)
            JOIN COACH C ON(C.COACHID = S.COACHID)
            JOIN TRAIN TR ON(C.TRAINID = TR.TRAINID)
            JOIN BOOKING B ON(T.BOOKINGID = B.BOOKINGID)
            LEFT JOIN INVOICE I ON(B.BOOKINGID = I.BOOKINGID)
            LEFT JOIN PAYMENT P ON(P.INVOICEID = I.INVOICEID)
            JOIN STATION FS ON (FS.STATIONID = SA.FROMSTATIONID)
            JOIN STATION TS ON (TS.STATIONID = SA.TOSTATIONID)
            JOIN ROUTE R ON(R.FROMSTATIONID = SA.FROMSTATIONID AND R.TRAINID = C.TRAINID)
            WHERE P.PAYMENTID = ?
            ORDER BY T.TICKETID
        """;

        try {
            return jdbcTemplate.query(
                    sql,
                    (rs, rowNum) -> {
                        return new TicketDetailsStationMasterDTO(
                                rs.getString("BOOKINGID"),
                                rs.getString("TRAINNAME"),
                                rs.getString("TRAVELDATE"),
                                rs.getString("TRAVELTIME"),
                                rs.getString("STARTING"),
                                rs.getString("DESTINATION"),
                                rs.getString("PASSENGERNAME"),
                                rs.getString("PASSENGERTYPE"),
                                rs.getString("COACHNAME"),
                                rs.getString("CLASSNAME"),
                                rs.getString("SEATNUM"),
                                rs.getString("BERTHPOSITION"),
                                rs.getString("NID"),
                                rs.getDouble("TOTAL"),
                                rs.getString("TRXID")
                        );
                    },
                    paymentId
            );

        } catch (DataAccessException e) {
            throw new RuntimeException("Error fetching station master ticket details by payment ID", e);
        }
    }
}
