CREATE OR REPLACE PROCEDURE populate_tickets_for_range_by_trainId (
  p_travel_date  IN DATE,
  p_train_id IN VARCHAR2
) IS
  CURSOR seat_alloc_cursor IS
    SELECT sa.TrainSeatId
    FROM SEAT_ALLOCATION sa WHERE sa.TRAINID = p_train_id;
    
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