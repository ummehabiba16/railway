CREATE OR REPLACE FUNCTION check_ticket_limit (
    ID_TYPE      IN VARCHAR2,
    ID_VALUE     IN VARCHAR2,
    NUM_TICKETS  IN NUMBER
) RETURN VARCHAR2 IS
    V_ALREADY_PURCHASED NUMBER := 0;
    V_VERIFIED          VARCHAR2(6) := 'Y';
    V_MONTHLY_LIMIT     NUMBER := 10;
    V_USERID            VARCHAR2(10) := NULL;
    V_BANNED_COUNT      NUMBER := 0;
BEGIN 
    -- Get USERID if exists for the given ID_TYPE and ID_VALUE
    BEGIN
        SELECT USERID
        INTO V_USERID
        FROM USER_INFO
        WHERE (
            (ID_TYPE = 'NID' AND NID = ID_VALUE)
            OR
            (ID_TYPE = 'BRN' AND Birth_Reg_Num = ID_VALUE)
        );
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            V_USERID := NULL;
        WHEN TOO_MANY_ROWS THEN
            -- If multiple users found, take the first one
            SELECT USERID
            INTO V_USERID
            FROM USER_INFO
            WHERE (
                (ID_TYPE = 'NID' AND NID = ID_VALUE)
                OR
                (ID_TYPE = 'BRN' AND Birth_Reg_Num = ID_VALUE)
            )
            AND ROWNUM = 1;
    END;

    -- CHECK IF REGISTERED AND BANNED
    SELECT COUNT(*)
    INTO V_BANNED_COUNT
    FROM USER_INFO
    WHERE (
        (ID_TYPE = 'NID' AND NID = ID_VALUE)
        OR
        (ID_TYPE = 'BRN' AND Birth_Reg_Num = ID_VALUE)
    )
    AND BANNEDUNTIL > CURRENT_TIMESTAMP;
    
    IF V_BANNED_COUNT > 0 THEN
        V_VERIFIED := 'N';
        RETURN V_VERIFIED;
    END IF;

    -- Count existing tickets for this month by NID or USERID
    SELECT COUNT(T.TICKETID)
    INTO V_ALREADY_PURCHASED
    FROM BOOKING B
    JOIN TICKET T ON B.BOOKINGID = T.BOOKINGID
    WHERE B.STATUS = 'SUCCESSFUL' 
    AND TRUNC(B.BOOKINGTIME, 'MM') = TRUNC(SYSDATE, 'MM')
    AND (
        B.NID = ID_VALUE 
        OR 
        (V_USERID IS NOT NULL AND B.USERID = V_USERID)
    );

    -- Check against monthly limit
    IF (V_ALREADY_PURCHASED + NUM_TICKETS) > V_MONTHLY_LIMIT THEN
        V_VERIFIED := 'N';
    END IF;

    RETURN V_VERIFIED;

EXCEPTION
    WHEN OTHERS THEN
        -- Log error if needed (DBMS_OUTPUT.PUT_LINE or proper logging)
        -- DBMS_OUTPUT.PUT_LINE('Error in check_ticket_limit: ' || SQLERRM);
        RETURN 'N';
END check_ticket_limit;
/

-- Test the function
--SELECT check_ticket_limit('NID', '9584741234', 1) AS result FROM DUAL;