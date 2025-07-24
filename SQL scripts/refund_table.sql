-- Enhanced REFUND table with additional fields for SSLCommerz integration
CREATE TABLE REFUND (
   PaymentId VARCHAR2(15),
   BookingId VARCHAR2(15),
   RefundAmount NUMBER(10,0), -- Changed to integer (no decimal places)
   RefundStatus VARCHAR2(20) DEFAULT 'Requested',
   RequestTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   ProcessedTime TIMESTAMP,
   RefundTransId VARCHAR2(30), -- Our generated refund transaction ID
   RefundRefId VARCHAR2(50),   -- SSLCommerz refund reference ID
   BankTranId VARCHAR2(80),    -- Bank transaction ID (TrxId from Payment table)
   PRIMARY KEY (PaymentId, BookingId),
   CONSTRAINT fk_refund_payment FOREIGN KEY (PaymentId) REFERENCES PAYMENT(PaymentId),
   CONSTRAINT fk_refund_booking FOREIGN KEY (BookingId) REFERENCES BOOKING(BookingId)
);

-- Index for faster lookups
CREATE INDEX idx_refund_booking ON REFUND(BookingId);
CREATE INDEX idx_refund_ref_id ON REFUND(RefundRefId);
CREATE INDEX idx_refund_trans_id ON REFUND(RefundTransId);
