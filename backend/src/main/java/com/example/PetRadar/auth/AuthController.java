package com.example.PetRadar.auth;

import com.example.PetRadar.security.JwtTokenProvider;
import com.example.PetRadar.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    // HTTPS 환경에서만 쿠키를 전송할지 여부. HTTP로 서비스하는 동안 켜면 쿠키가 실리지 않으므로
    // TLS를 붙이는 시점에 .env에서 true로 바꾼다
    @Value("${app.cookie.secure}")
    private boolean cookieSecure;

    // 크로스 사이트 요청에 쿠키를 실을지. 브라우저 기본값에 기대지 않고 명시한다
    @Value("${app.cookie.same-site}")
    private String cookieSameSite;

    // Refresh Token 쿠키는 로그인/로그아웃 양쪽에서 만들므로 한곳에서 조립한다
    private ResponseCookie refreshTokenCookie(String value, long maxAgeSeconds) {
        return ResponseCookie.from("refreshToken", value)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/api")
                .maxAge(maxAgeSeconds)
                .build();
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody AuthDTO authDTO) {
        AuthService.Tokens tokens;
        try {
            tokens = authService.login(authDTO.getId(), authDTO.getPw());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
        // 액세스 토큰은 JSON 응답으로, 리프레시 토큰은 HttpOnly 쿠키로 전송
        ResponseCookie cookie = refreshTokenCookie(tokens.refreshToken(), jwtTokenProvider.getRefreshTokenExpSec());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("accessToken", tokens.accessToken()));
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody AuthDTO authDTO) {
        userService.registerUser(authDTO);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check-exist")
    public ResponseEntity<Boolean> checkExist(@RequestParam String id) {
        boolean isExist = userService.findByLoginId(id).isPresent();
        return ResponseEntity.ok(isExist);
    }

    /**
     * 로그아웃 - 저장된 Refresh Token을 지우고 쿠키를 만료시킨다.
     * 클라이언트에서 액세스 토큰만 지우면 쿠키의 Refresh Token으로 재발급이 되므로
     * 서버 쪽 토큰을 없애야 실제로 로그아웃된다.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(value = "refreshToken", required = false) String refreshToken) {
        authService.logout(refreshToken);
        // 만료된 빈 쿠키로 덮어써 브라우저에서도 지운다
        // (속성이 로그인 때와 같아야 브라우저가 같은 쿠키로 인식해 덮어쓴다)
        ResponseCookie expired = refreshTokenCookie("", 0);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expired.toString())
                .build();
    }
}
