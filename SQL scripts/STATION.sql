-- STATION.sql

CREATE TABLE STATION (
  StationId VARCHAR2(6) PRIMARY KEY,
  Name VARCHAR2(50) NOT NULL,
  isOnline CHAR(1) DEFAULT 'Y' CHECK (isOnline IN ('Y', 'N')),
  location VARCHAR2(100),
  division VARCHAR2(50),
  contactNum VARCHAR2(14),
  status VARCHAR2(8) DEFAULT 'ACTIVE' CHECK (STATUS IN ('ACTIVE', 'INACTIVE'))
);

CREATE INDEX idx_station_name ON STATION(Name);

-- FULL INSERT DATA FOR ALL STATIONS

INSERT INTO STATION VALUES ('RAJ', 'Rajshahi', 'Y', 'Rajshahi City', 'Rajshahi', '0721770000', 'ACTIVE');
INSERT INTO STATION VALUES ('DHK', 'Dhaka', 'Y', 'Dhaka City', 'Dhaka', '0291234567', 'ACTIVE');
INSERT INTO STATION VALUES ('ARA', 'Arani', 'Y', 'Arani, Rajshahi', 'Rajshahi', '0721880000', 'ACTIVE');
INSERT INTO STATION VALUES ('ABD', 'Abdulpur', 'Y', 'Abdulpur, Rajshahi', 'Rajshahi', '0721990000', 'ACTIVE');
INSERT INTO STATION VALUES ('ISB', 'Ishwardi Bypass', 'Y', 'Ishwardi, Pabna', 'Pabna', '0731900000', 'ACTIVE');
INSERT INTO STATION VALUES ('CHT', 'Chatmohar', 'Y', 'Chatmohar, Pabna', 'Pabna', '0731888888', 'ACTIVE');
INSERT INTO STATION VALUES ('BRB', 'Boral_Bridge', 'Y', 'Boral Bridge, Pabna', 'Pabna', '0731777000', 'ACTIVE');
INSERT INTO STATION VALUES ('SMM', 'SH M Monsur Ali', 'Y', 'Sirajganj', 'Sirajganj', '0751777333', 'ACTIVE');
INSERT INTO STATION VALUES ('IBD', 'Ibrahimabad', 'Y', 'Ibrahimabad, Sirajganj', 'Sirajganj', '0751666222', 'ACTIVE');
INSERT INTO STATION VALUES ('JYP', 'Joydebpur', 'Y', 'Gazipur', 'Dhaka', '0921122334', 'ACTIVE');
INSERT INTO STATION VALUES ('SAR', 'Sardah_Road', 'Y', 'Sardah Road, Rajshahi', 'Rajshahi', '0721001100', 'ACTIVE');
INSERT INTO STATION VALUES ('ULL', 'Ullapara', 'Y', 'Ullapara, Sirajganj', 'Rajshahi', '0751111222', 'ACTIVE');
INSERT INTO STATION VALUES ('TNG', 'Tangail', 'Y', 'Tangail Sadar', 'Dhaka', '0921001001', 'ACTIVE');
INSERT INTO STATION VALUES ('CHP', 'Chapainawabganj', 'Y', 'Chapainawabganj Sadar', 'Rajshahi', '0781122334', 'ACTIVE');
INSERT INTO STATION VALUES ('ISD', 'Ishwardi', 'Y', 'Ishwardi', 'Pabna', '0731900001', 'ACTIVE');
INSERT INTO STATION VALUES ('PKS', 'Paksey', 'Y', 'Paksey', 'Pabna', '0731900002', 'ACTIVE');
INSERT INTO STATION VALUES ('BHR', 'Bheramara', 'Y', 'Bheramara', 'Kushtia', '0711222333', 'ACTIVE');
INSERT INTO STATION VALUES ('MRP', 'Mirpur', 'Y', 'Mirpur', 'Kushtia', '0711222444', 'ACTIVE');
INSERT INTO STATION VALUES ('PRD', 'Poradaha', 'Y', 'Poradaha', 'Kushtia', '0711222555', 'ACTIVE');
INSERT INTO STATION VALUES ('KCT', 'Kushtia_Court', 'Y', 'Kushtia Court', 'Kushtia', '0711222666', 'ACTIVE');
INSERT INTO STATION VALUES ('KMK', 'Kumarkhali', 'Y', 'Kumarkhali', 'Kushtia', '0711222777', 'ACTIVE');
INSERT INTO STATION VALUES ('KHS', 'Khoksha', 'Y', 'Khoksha', 'Kushtia', '0711222888', 'ACTIVE');
INSERT INTO STATION VALUES ('PNG', 'Pangsha', 'Y', 'Pangsha', 'Rajbari', '0641222111', 'ACTIVE');
INSERT INTO STATION VALUES ('KLK', 'Kalukhali', 'Y', 'Kalukhali', 'Rajbari', '0641222222', 'ACTIVE');
INSERT INTO STATION VALUES ('RJB', 'Rajbari', 'Y', 'Rajbari', 'Rajbari', '0641222333', 'ACTIVE');
INSERT INTO STATION VALUES ('PCH', 'Pachuria', 'Y', 'Pachuria', 'Faridpur', '0631222111', 'ACTIVE');
INSERT INTO STATION VALUES ('AMR', 'Amirabad', 'Y', 'Amirabad', 'Faridpur', '0631222222', 'ACTIVE');
INSERT INTO STATION VALUES ('FDP', 'Faridpur', 'Y', 'Faridpur', 'Faridpur', '0631222333', 'ACTIVE');
INSERT INTO STATION VALUES ('TLM', 'Talma', 'Y', 'Talma', 'Faridpur', '0631222444', 'ACTIVE');
INSERT INTO STATION VALUES ('PKR', 'Pukuria', 'Y', 'Pukuria', 'Faridpur', '0631222555', 'ACTIVE');
INSERT INTO STATION VALUES ('BHG', 'Bhanga', 'Y', 'Bhanga', 'Faridpur', '0631222666', 'ACTIVE');
INSERT INTO STATION VALUES ('SBC', 'Shibchar', 'Y', 'Shibchar', 'Madaripur', '0661222777', 'ACTIVE');
INSERT INTO STATION VALUES ('PDM', 'Padma', 'Y', 'Padma Station', 'Munshiganj', '0661222888', 'ACTIVE');
INSERT INTO STATION VALUES ('MWA', 'Mawa', 'Y', 'Mawa', 'Munshiganj', '0661222999', 'ACTIVE');
INSERT INTO STATION VALUES ('MWA', 'Mawa', 'Y', 'Mawa', 'Munshiganj', '0661222999', 'ACTIVE');
INSERT INTO STATION VALUES ('BBR', 'Biman_Bandar', 'Y', 'Dhaka', 'Dhaka', '0661222999', 'ACTIVE');
