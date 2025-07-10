ALTER TABLE BUSINESSRULE ADD bookingHoldTime NUMBER(3); --in minutes


INSERT INTO BUSINESSRULE (
    AppliedFrom,
    TicketAvailableBefore,
    bookingHoldTime
) VALUES (
    TO_DATE('2025-07-01', 'YYYY-MM-DD'),  -- AppliedFrom date
    10,                                    -- TicketAvailableBefore (e.g., hours before departure)
    5                                    -- bookingHoldTime in minutes
);


--10 July
ALTER TABLE BUSINESSRULE ADD childFarePercentage NUMBER(3); --in minutes


INSERT INTO BUSINESSRULE (
    AppliedFrom,
    TicketAvailableBefore,
    bookingHoldTime,
    childFarePercentage
) VALUES (
    TO_DATE('2025-07-10', 'YYYY-MM-DD'),  -- AppliedFrom date
    10,                                    -- TicketAvailableBefore (e.g., hours before departure)
    5,                                   -- bookingHoldTime in minutes
    60
);
