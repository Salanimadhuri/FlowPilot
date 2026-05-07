package com.flowpilot.exception;

public class AccessDeniedException extends RuntimeException {
    public AccessDeniedException() {
        super("You don't have permission to perform this action");
    }
    public AccessDeniedException(String msg) {
        super(msg);
    }
}
