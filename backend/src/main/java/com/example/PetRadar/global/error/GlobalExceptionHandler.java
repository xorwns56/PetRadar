package com.example.PetRadar.global.error;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.HashMap;
import java.util.Map;

/**
 * 모든 요청의 예외를 한곳에서 응답으로 바꾼다.
 *
 * 이게 없을 때는 예외가 그대로 올라가 500이 되고, Spring이 /error로 포워딩한
 * 뒤 SpaErrorController가 다시 "/"로 넘겨 결국 본문 없는 404가 나갔다.
 * 프론트는 무엇이 잘못됐는지 알 방법이 없어 모든 실패에 같은 문구를 띄웠다.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage()));
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(ForbiddenException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(e.getMessage()));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(e.getMessage()));
    }

    /** 직접 던진 검증 실패. IllegalArgumentException도 여기로 모은다 */
    @ExceptionHandler({InvalidRequestException.class, IllegalArgumentException.class})
    public ResponseEntity<ErrorResponse> handleInvalid(RuntimeException e) {
        return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    }

    /** @Valid 가 걸러낸 것. 어느 칸이 왜 틀렸는지까지 내려준다 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));

        // 대표 문장은 첫 번째 사유를 쓴다. 화면이 칸별로 보여줄 수 없을 때를 위한 것
        String message = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("입력값을 확인해주세요.");

        return ResponseEntity.badRequest().body(new ErrorResponse(message, errors));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleUploadSize(MaxUploadSizeExceededException e) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(new ErrorResponse("사진 용량이 너무 큽니다. 10MB 이하로 올려주세요."));
    }

    /**
     * 아래 세 묶음은 "서버가 아니라 요청이 잘못된" 경우다.
     * 여기서 받아주지 않으면 맨 아래 Exception 핸들러가 삼켜 전부 500으로 나가는데,
     * 그러면 프론트는 재시도해야 할 장애와 고쳐야 할 요청을 구분할 수 없고
     * 서버 로그에도 ERROR로 쌓여 진짜 장애가 묻힌다.
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResource(NoResourceFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("요청한 경로를 찾을 수 없습니다."));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupported(HttpRequestMethodNotSupportedException e) {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(new ErrorResponse("지원하지 않는 요청 방식입니다."));
    }

    /**
     * 본문·파라미터가 형식에 안 맞는 경우.
     * 깨진 JSON, /api/missing/abc 처럼 타입이 안 맞는 경로변수,
     * multipart 파트 누락이 여기로 온다.
     */
    @ExceptionHandler({
            HttpMessageNotReadableException.class,
            MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class,
            MissingServletRequestPartException.class
    })
    public ResponseEntity<ErrorResponse> handleMalformedRequest(Exception e) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse("요청 형식이 올바르지 않습니다."));
    }

    /**
     * 예상하지 못한 나머지.
     * 원인은 로그에만 남기고 사용자에게는 내부 사정을 노출하지 않는다.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception e) {
        log.error("처리하지 못한 예외", e);
        return ResponseEntity.internalServerError()
                .body(new ErrorResponse("일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요."));
    }
}
