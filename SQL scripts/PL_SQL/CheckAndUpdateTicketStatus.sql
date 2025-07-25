CREATE OR REPLACE FUNCTION Check_And_Update_Ticket_Status(p_ticket_id IN VARCHAR2)
RETURN VARCHAR2
IS
    v_status VARCHAR2(20);
    v_bookingHoldTime NUMBER;
BEGIN
    SELECT TICKETSTATUS INTO v_status
    FROM TICKET
    WHERE TICKETID = p_ticket_id;

    SELECT BOOKINGHOLDTIME INTO v_bookingHoldTime
    FROM BUSINESSRULE
    WHERE APPLIEDFROM = (SELECT MAX(APPLIEDFROM) FROM BUSINESSRULE);

    IF v_status = 'AVAILABLE' THEN
        UPDATE TICKET
        SET TICKETSTATUS = 'IN PROGRESS',
            BOOKINGHOLDUNTIL = CURRENT_TIMESTAMP + NUMTODSINTERVAL(v_bookingHoldTime, 'MINUTE')
        WHERE TICKETID = p_ticket_id;
    END IF;

    RETURN v_status;

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        -- Raised if ticket ID or business rule not found
        RAISE_APPLICATION_ERROR(-20001, 'Ticket or business rule not found.');

    WHEN OTHERS THEN
        -- Handle all other unexpected exceptions
        RAISE_APPLICATION_ERROR(-20002, 'Unexpected error: ' || SQLERRM);
END;
/
-- DECLARE
--     v_status VARCHAR2(15);
-- BEGIN
--     v_status := CHECK_AND_UPDATE_TICKET_STATUS('328');
--     DBMS_OUTPUT.PUT_LINE(V_STATUS);
-- END;
-- /


