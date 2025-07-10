CREATE OR REPLACE PROCEDURE populate_tickets_for_range (
  p_travel_date  IN DATE
) IS
  CURSOR seat_alloc_cursor IS
    SELECT sa.TrainSeatId
    FROM SEAT_ALLOCATION sa;
    
  v_trainSeatId SEAT_ALLOCATION.TrainSeatId%TYPE;
BEGIN
  FOR seat_alloc_record IN seat_alloc_cursor LOOP
    v_trainSeatId := seat_alloc_record.TrainSeatId;

    INSERT INTO TICKET (
      TicketId, PassengerName, PassengerType, TrainSeatId, TicketStatus,
      TravelDate, BookingId, BookingHoldUntil
    ) VALUES (
      TO_CHAR(sequence3.NEXTVAL),
      NULL,
      NULL,
      v_trainSeatId,
      DEFAULT,
      p_travel_date,
      NULL,
      NULL
    );
  END LOOP;

  COMMIT;
END;
/

-- BEGIN
--   populate_tickets_for_range(TO_DATE('26-06-2025', 'DD-MM-YYYY'));
-- END;
-- /
