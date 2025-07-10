-- TRAIN.sql

CREATE TABLE TRAIN (
  TrainId VARCHAR2(6) PRIMARY KEY,
  TrainNum VARCHAR2(6) UNIQUE NOT NULL,
  TrainName VARCHAR2(100) NOT NULL,
  FromStationId VARCHAR2(6),
  ToStationId VARCHAR2(6),
  OffDay VARCHAR2(10),
  CONSTRAINT fk_train_from FOREIGN KEY (FromStationId) REFERENCES STATION(StationId),
  CONSTRAINT fk_train_to FOREIGN KEY (ToStationId) REFERENCES STATION(StationId)
);

-- Insert Data for All 4 Trains

-- 1. Dhumketu Express
INSERT INTO TRAIN VALUES (
  'T770',        -- TrainId
  '770',         -- TrainNum
  'DHUMKETU EXPRESS', 
  'RAJ',         -- From: Rajshahi
  'DHK',         -- To: Dhaka
  'Wed'          -- Off Day
);

-- 2. Padma Express
INSERT INTO TRAIN VALUES (
  'T760',
  '760',
  'PADMA EXPRESS',
  'RAJ',
  'DHK',
  'Tue'
);

-- 3. Banalata Express
INSERT INTO TRAIN VALUES (
  'T792',
  '792',
  'BANALATA EXPRESS',
  'CHP',         -- From: Chapainawabganj
  'DHK',
  'Fri'
);

-- 4. Madhumati Express
INSERT INTO TRAIN VALUES (
  'T756',
  '756',
  'MADHUMATI EXPRESS',
  'RAJ',
  'DHK',
  'Sat'
);
