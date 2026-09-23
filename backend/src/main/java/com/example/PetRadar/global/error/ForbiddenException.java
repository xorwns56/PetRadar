package com.example.PetRadar.global.error;

/**
 * 로그인은 했지만 그 자원에 대한 권한이 없다 → 403
 *
 * 404(없음)와 구분해야 한다. 예전에는 둘 다 IllegalArgumentException이라
 * 남의 글을 지우려 해도 "없는 글"과 같은 응답이 나왔다.
 */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
