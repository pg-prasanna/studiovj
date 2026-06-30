package com.photography.portfolio.exception;

public class CloudinaryException extends RuntimeException {

    private final String errorCode;
    private final Object details;

    public CloudinaryException(String message) {
        super(message);
        this.errorCode = "CLOUDINARY_ERROR";
        this.details = null;
    }

    public CloudinaryException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.details = null;
    }

    // ADD THIS CONSTRUCTOR
    public CloudinaryException(
            String message,
            String errorCode,
            Object details) {

        super(message);
        this.errorCode = errorCode;
        this.details = details;
    }

    public CloudinaryException(
            String message,
            Throwable cause,
            String errorCode,
            Object details) {

        super(message, cause);
        this.errorCode = errorCode;
        this.details = details;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public Object getDetails() {
        return details;
    }
}