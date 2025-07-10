CREATE OR REPLACE PROCEDURE allocate_seats_in_range (
  p_coachId   IN SEAT.coachId%TYPE,
  p_start_no  IN NUMBER,
  p_end_no    IN NUMBER
) IS
  CURSOR seat_cursor IS
    SELECT seatId
    FROM SEAT
    WHERE coachId = p_coachId
      AND TO_NUMBER(seatNum) BETWEEN p_start_no AND p_end_no;

  v_seatId SEAT.seatId%TYPE;
BEGIN
  FOR seat_record IN seat_cursor LOOP
    v_seatId := seat_record.seatId;

    INSERT INTO SEAT_ALLOCATION 
    VALUES (sequence2.nextval, v_seatId, 'T760', 'RAJ', 'JYP', 'C5', 943);
    INSERT INTO SEAT_ALLOCATION 
    VALUES (sequence2.nextval, v_seatId, 'T760', 'JYP', 'DHK', 'C5', 150);

  END LOOP;

  COMMIT;
END;
/

-- BEGIN
--   allocate_seats_in_range('C76002', 44, 48);
-- END;
-- /


