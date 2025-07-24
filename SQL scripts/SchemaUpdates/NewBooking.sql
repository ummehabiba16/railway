CREATE TABLE BOOKING (
  BookingId VARCHAR2(15) PRIMARY KEY,
  UserId VARCHAR2(10),
  TravelDate DATE,
  BookingTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Status VARCHAR2(20) DEFAULT 'PENDING' 
    CHECK(Status IN ('PENDING', 'SUCCESSFUL', 'FAILED', 'RefundInProgress', 'Refunded')),
  SoldBy CHAR(1) DEFAULT 'U' 
    CHECK(SoldBy IN ('U', 'S')),
  NID VARCHAR2(20),
  CONSTRAINT fk_booking_user FOREIGN KEY (UserId) REFERENCES USER_INFO(UserId)
);

--to update sql

SELECT uc.constraint_name
FROM user_constraints uc
JOIN user_cons_columns ucc ON uc.constraint_name = ucc.constraint_name
WHERE uc.table_name = 'BOOKING' AND ucc.column_name = 'STATUS';

ALTER TABLE BOOKING DROP CONSTRAINT CONSTRAINT_NAME_HERE;

ALTER TABLE BOOKING 
ADD CONSTRAINT chk_booking_status 
CHECK (Status IN ('PENDING', 'SUCCESSFUL', 'FAILED', 'RefundPgr', 'Refunded'));

