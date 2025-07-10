package com.eticket.railway.Repository;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Blob;
import java.util.Base64;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.eticket.railway.DTO.TicketDetailsDTO;

@Repository
public class TicketRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public Boolean updateTicket(String ticketId, String PassengerName, String PassengerType) {
        String sql = "UPDATE TICKET SET PassengerName = ?, PassengerType = ? WHERE TicketId = ?";
        try {
            jdbcTemplate.update(sql, PassengerName, PassengerType, ticketId);
            return true;
        } catch (Exception e) {
            return false;
        }

    }

    public String getBookingId(String ticketId) {
        String sql = "SELECT BookingId FROM TICKET WHERE TicketId = ?";
        return jdbcTemplate.queryForObject(sql, String.class, ticketId);
    }

    public List<TicketDetailsDTO> findByPaymentId(String paymentId) {
        String sql = """     
            SELECT  T.BOOKINGID,
                    TR.TRAINNAME,
                    T.TRAVELDATE,
                    TO_CHAR(R.DEPARTURETIME, 'HH:MM:SS') AS TRAVELTIME, 
                    FS.NAME AS STARTING,
                    TS.NAME AS DESTINATION,
                    T.PASSENGERNAME, 
                    T.PASSENGERTYPE, 
                    C.COACHNAME,
                    CL.CLASSNAME,
                    S.SEATNUM,
                    S.BERTHPOSITION,
                    U.NID, 
                    U.PHONENUM, 
                    U.EMAIL, 
                    (U.FIRSTNAME||' '||U.LASTNAME) AS FULLNAME,
                    U.PROFILEIMAGE,
                    I.TOTAL,
                    P.TRXID
            FROM TICKET T JOIN SEAT_ALLOCATION SA ON(T.TRAINSEATID = SA.TRAINSEATID)
            JOIN SEAT S ON(S.SEATID = SA.SEATID)
            JOIN CLASS CL ON(SA.CLASSID = CL.CLASSID)
            JOIN COACH C ON(C.COACHID = S.COACHID)
            JOIN TRAIN TR ON(C.TRAINID = TR.TRAINID)
            JOIN BOOKING B ON(T.BOOKINGID = B.BOOKINGID)
            JOIN USER_INFO U ON(B.USERID = U.USERID)
            JOIN INVOICE I ON(B.BOOKINGID = I.BOOKINGID)
            JOIN PAYMENT P ON(P.INVOICEID = I.INVOICEID)
            JOIN STATION FS ON (FS.STATIONID = SA.FROMSTATIONID)
            JOIN STATION TS ON (TS.STATIONID = SA.TOSTATIONID)
            JOIN ROUTE R ON(R.FROMSTATIONID = SA.FROMSTATIONID AND R.TRAINID = C.TRAINID)
            WHERE P.PAYMENTID = ?
        """;

        try {
            return jdbcTemplate.query(
                    sql,
                    new Object[]{paymentId},
                    (rs, rowNum) -> {
                        String base64Image = ""; // Default to empty string
                        Blob blob = rs.getBlob("PROFILEIMAGE");
                        if (blob != null) {
                            try (InputStream inputStream = blob.getBinaryStream()) {
                                byte[] imageBytes = inputStream.readAllBytes(); // Java 9+
                                base64Image = Base64.getEncoder().encodeToString(imageBytes);
                            } catch (IOException e) {
                                // Log the error but do not throw
                                //e.printStackTrace();
                            }
                        }

                        return new TicketDetailsDTO(
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
                                rs.getString("PHONENUM"),
                                rs.getString("EMAIL"),
                                rs.getString("FULLNAME"),
                                base64Image, // always non-null: either actual base64 or ""
                                rs.getDouble("TOTAL"),
                                rs.getString("TRXID")
                        );
                    }
            );

        } catch (DataAccessException e) {
            throw new RuntimeException("Error fetching ticket Details", e);
        }
    }

    public List<TicketDetailsDTO> findByBookingId(String bookingId) {
        String sql = """     
            SELECT  T.BOOKINGID,
                    TR.TRAINNAME,
                    T.TRAVELDATE,
                    TO_CHAR(R.DEPARTURETIME, 'HH:MM:SS') AS TRAVELTIME, 
                    FS.NAME AS STARTING,
                    TS.NAME AS DESTINATION,
                    T.PASSENGERNAME, 
                    T.PASSENGERTYPE, 
                    C.COACHNAME,
                    CL.CLASSNAME,
                    S.SEATNUM,
                    S.BERTHPOSITION,
                    U.NID, 
                    U.PHONENUM, 
                    U.EMAIL, 
                    (U.FIRSTNAME||' '||U.LASTNAME) AS FULLNAME,
                    U.PROFILEIMAGE,
                    I.TOTAL,
                    P.TRXID
            FROM TICKET T JOIN SEAT_ALLOCATION SA ON(T.TRAINSEATID = SA.TRAINSEATID)
            JOIN SEAT S ON(S.SEATID = SA.SEATID)
            JOIN CLASS CL ON(SA.CLASSID = CL.CLASSID)
            JOIN COACH C ON(C.COACHID = S.COACHID)
            JOIN TRAIN TR ON(C.TRAINID = TR.TRAINID)
            JOIN BOOKING B ON(T.BOOKINGID = B.BOOKINGID)
            JOIN USER_INFO U ON(B.USERID = U.USERID)
            JOIN INVOICE I ON(B.BOOKINGID = I.BOOKINGID)
            JOIN PAYMENT P ON(P.INVOICEID = I.INVOICEID)
            JOIN STATION FS ON (FS.STATIONID = SA.FROMSTATIONID)
            JOIN STATION TS ON (TS.STATIONID = SA.TOSTATIONID)
            JOIN ROUTE R ON(R.FROMSTATIONID = SA.FROMSTATIONID AND R.TRAINID = C.TRAINID)
            WHERE B.BOOKINGID = ?
        """;

        try {
            return jdbcTemplate.query(
                    sql,
                    new Object[]{bookingId},
                    (rs, rowNum) -> {
                        String base64Image = ""; // Default to empty string
                        Blob blob = rs.getBlob("PROFILEIMAGE");
                        if (blob != null) {
                            try (InputStream inputStream = blob.getBinaryStream()) {
                                byte[] imageBytes = inputStream.readAllBytes(); // Java 9+
                                base64Image = Base64.getEncoder().encodeToString(imageBytes);
                            } catch (IOException e) {
                                // Log the error but do not throw
                                //e.printStackTrace();
                            }
                        }

                        return new TicketDetailsDTO(
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
                                rs.getString("PHONENUM"),
                                rs.getString("EMAIL"),
                                rs.getString("FULLNAME"),
                                base64Image, // always non-null: either actual base64 or ""
                                rs.getDouble("TOTAL"),
                                rs.getString("TRXID")
                        );
                    }
            );

        } catch (DataAccessException e) {
            throw new RuntimeException("Error fetching ticket Details", e);
        }
    }

}
