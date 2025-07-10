package com.eticket.railway.Entity;

import java.util.Date;

import org.springframework.data.relational.core.mapping.Table;
/*
CREATE TABLE AVAILABLE_DATES(
  TravelDate DATE NOT NULL,
  PRIMARY KEY (TravelDate)
);
 */
@Table("AVAILABLE_DATES")
public class TravelDate {
    private Date date;

    public TravelDate(Date date) {
        this.date = date;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }
    
}
