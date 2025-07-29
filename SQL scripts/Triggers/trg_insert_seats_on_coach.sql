CREATE OR REPLACE TRIGGER trg_insert_seats_on_coach
AFTER INSERT ON COACH
FOR EACH ROW
DECLARE
  v_seat_id  VARCHAR2(6);
  v_berth    CHAR(1);
BEGIN
  FOR i IN 1 .. :NEW.SeatCount LOOP
    -- Generate SeatId: CoachId + padded seat number
    v_seat_id := :NEW.CoachId || LPAD(i, 3, '0');

    -- Determine berth only if CoachName is 'AC_Berth'
    IF :NEW.CoachName = 'AC_Berth' THEN
      IF MOD(i, 2) = 0 THEN
        v_berth := 'H';
      ELSE
        v_berth := 'L';
      END IF;
    ELSE
      v_berth := NULL;
    END IF;

    -- Insert seat
    INSERT INTO SEAT (SeatId, SeatNum, BerthPosition, CoachId)
    VALUES (v_seat_id, TO_CHAR(i), v_berth, :NEW.CoachId);
  END LOOP;
END;
/
