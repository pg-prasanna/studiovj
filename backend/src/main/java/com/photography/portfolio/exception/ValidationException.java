package com.photography.portfolio.exception;

public class ValidationException extends RuntimeException {

    private final String fieldName;
    private final Object rejectedValue;
    private final String errorCode;

    public ValidationException(String message) {
        super(message);
        this.fieldName = null;
        this.rejectedValue = null;
        this.errorCode = "VALIDATION_ERROR";
    }

    public ValidationException(String message, String fieldName, Object rejectedValue, String errorCode) {
        super(message);
        this.fieldName = fieldName;
        this.rejectedValue = rejectedValue;
        this.errorCode = errorCode;
    }

    public String getFieldName() {
        return fieldName;
    }

    public Object getRejectedValue() {
        return rejectedValue;
    }

    public String getErrorCode() {
        return errorCode;
    }

}
