package com.eticket.railway.Exception;

public class NoDataFoundException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public NoDataFoundException(String message) {
        super(message);
    }

    public NoDataFoundException(String message, Throwable cause) {
        super(message, cause);
    }
    
}
