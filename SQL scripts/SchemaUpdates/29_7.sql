
ALTER TABLE businessRule 
ADD ( 
  Service_Charge NUMBER(3) DEFAULT 20, 
  Bedding_Charge NUMBER(3) DEFAULT 50, 
  Monthly_Booking_Limit NUMBER(3) DEFAULT 10, 
  Blocking_Time NUMBER(3) DEFAULT 5
);

ALTER TABLE businessRule 
MODIFY ChildFarePercentage DEFAULT 60;

update BUSINESSRULE set ChildFarePercentage= 60;