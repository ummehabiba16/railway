package com.eticket.railway.DTO;

import java.sql.Timestamp;

public class RefundStatusResponse {
    private String apiConnect;
    private String bankTranId;
    private String tranId;
    private String refundRefId;
    private Timestamp initiatedOn;
    private Timestamp refundedOn;
    private String status;
    private String errorReason;

    public RefundStatusResponse() {
        // Default constructor
    }

    public RefundStatusResponse(String apiConnect, String bankTranId, String tranId, String refundRefId,
                              Timestamp initiatedOn, Timestamp refundedOn, String status, String errorReason) {
        this.apiConnect = apiConnect;
        this.bankTranId = bankTranId;
        this.tranId = tranId;
        this.refundRefId = refundRefId;
        this.initiatedOn = initiatedOn;
        this.refundedOn = refundedOn;
        this.status = status;
        this.errorReason = errorReason;
    }

    public String getApiConnect() {
        return apiConnect;
    }

    public void setApiConnect(String apiConnect) {
        this.apiConnect = apiConnect;
    }

    public String getBankTranId() {
        return bankTranId;
    }

    public void setBankTranId(String bankTranId) {
        this.bankTranId = bankTranId;
    }

    public String getTranId() {
        return tranId;
    }

    public void setTranId(String tranId) {
        this.tranId = tranId;
    }

    public String getRefundRefId() {
        return refundRefId;
    }

    public void setRefundRefId(String refundRefId) {
        this.refundRefId = refundRefId;
    }

    public Timestamp getInitiatedOn() {
        return initiatedOn;
    }

    public void setInitiatedOn(Timestamp initiatedOn) {
        this.initiatedOn = initiatedOn;
    }

    public Timestamp getRefundedOn() {
        return refundedOn;
    }

    public void setRefundedOn(Timestamp refundedOn) {
        this.refundedOn = refundedOn;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getErrorReason() {
        return errorReason;
    }

    public void setErrorReason(String errorReason) {
        this.errorReason = errorReason;
    }
}
