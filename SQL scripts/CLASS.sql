-- CLASS.sql

CREATE TABLE CLASS (
  ClassId VARCHAR2(6) PRIMARY KEY,
  ClassName VARCHAR2(50) NOT NULL,
  ClassDetails VARCHAR2(200)
);

-- Insert data for common Bangladesh Railway classes

INSERT INTO CLASS VALUES ('C1', 'AC_Berth', 'Air-conditioned sleeping compartment');
INSERT INTO CLASS VALUES ('C2', 'S_Chair', 'Economy class seating (non-AC)');
INSERT INTO CLASS VALUES ('C3', 'Snigdha', 'AC seating compartment');
INSERT INTO CLASS VALUES ('C4', 'F_SEAT', 'Non-AC semi-luxury seating');
INSERT INTO CLASS VALUES ('C5', 'AC_S', 'Air-conditioned');
