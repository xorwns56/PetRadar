package com.example.PetRadar.global.error;

/** 누구인지 확인되지 않았다 (로그인 실패, 토큰 없음·만료) → 401 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
