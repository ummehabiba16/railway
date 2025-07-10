CREATE OR REPLACE PROCEDURE UPDATE_AVAILABLE_DATES AS
  v_days NUMBER;
BEGIN
  -- Step 1: Delete old dates
  DELETE FROM AVAILABLE_DATES
  WHERE TravelDate < TRUNC(SYSDATE);

  -- Step 2: Get latest TicketAvailableBefore value
  SELECT TicketAvailableBefore
  INTO v_days
  FROM BUSINESSRULE
  WHERE AppliedFrom = (SELECT MAX(AppliedFrom) FROM BUSINESSRULE);

  -- Step 3: Insert missing dates from today to today + v_days - 1
  FOR i IN 0 .. v_days - 1 LOOP
    BEGIN
      INSERT INTO AVAILABLE_DATES (TravelDate)
      SELECT TRUNC(SYSDATE) + i FROM DUAL
      WHERE NOT EXISTS (
        SELECT 1 FROM AVAILABLE_DATES
        WHERE TravelDate = TRUNC(SYSDATE) + i
      );
    EXCEPTION
      WHEN DUP_VAL_ON_INDEX THEN
        NULL; -- Ignore if the date already exists
    END;
  END LOOP;
END;
/

-- BEGIN
--   UPDATE_AVAILABLE_DATES;
-- END;
-- /
