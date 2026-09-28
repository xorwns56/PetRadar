package com.example.PetRadar.security;

import com.example.PetRadar.global.error.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Security 필터 단계의 실패를 컨트롤러와 같은 모양으로 내려준다.
 *
 * 필터는 @RestControllerAdvice보다 앞에 있어 GlobalExceptionHandler가 닿지 않는다.
 * 그대로 두면 인증 실패만 {timestamp, status, error, path} 라는 Spring 기본 본문으로
 * 나가고, 프론트의 toMessage()가 읽는 message 필드가 없어 안내 문구가 비어 버린다.
 *
 * sendError()를 쓰면 컨테이너가 /error로 에러 디스패치를 해 상태 코드가 뒤바뀌므로,
 * 상태와 본문을 직접 쓴다.
 */
@Component
@RequiredArgsConstructor
public class SecurityErrorResponder {
    private final ObjectMapper objectMapper;

    public void write(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        objectMapper.writeValue(response.getWriter(), new ErrorResponse(message));
    }
}
