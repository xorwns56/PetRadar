package com.example.PetRadar.global.error;

import lombok.Getter;

import java.util.Map;

/**
 * 실패한 요청에 공통으로 내려주는 본문.
 *
 * 예전에는 엔드포인트마다 응답 모양이 제각각이었고, 대부분은 아예 본문이
 * 없었다. 프론트는 무엇이 잘못됐는지 알 수 없어 "실패했습니다"만 띄웠다.
 *
 * 상태 코드는 HTTP가 이미 싣고 있으므로 본문에 또 넣지 않는다.
 */
@Getter
public class ErrorResponse {
    /** 사용자에게 그대로 보여줘도 되는 문장 */
    private final String message;

    /** 입력값 검증 실패일 때만: 필드 이름 → 사유 */
    private final Map<String, String> errors;

    public ErrorResponse(String message) {
        this(message, null);
    }

    public ErrorResponse(String message, Map<String, String> errors) {
        this.message = message;
        this.errors = errors;
    }
}
