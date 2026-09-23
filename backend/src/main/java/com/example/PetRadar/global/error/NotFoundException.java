package com.example.PetRadar.global.error;

/** 요청한 것이 없다 → 404 */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
