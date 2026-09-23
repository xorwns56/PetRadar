package com.example.PetRadar.global.error;

/** 보낸 값이 규칙에 맞지 않다 → 400 */
public class InvalidRequestException extends RuntimeException {
    public InvalidRequestException(String message) {
        super(message);
    }
}
