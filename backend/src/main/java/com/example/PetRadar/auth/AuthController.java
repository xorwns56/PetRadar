package com.example.PetRadar.auth;

import com.example.PetRadar.security.JwtTokenProvider;
import com.example.PetRadar.user.User;
import com.example.PetRadar.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

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
        Optional<User> userOptional = userService.findByLoginId(authDTO.getId());
        // 사용자가 존재하지 않는 경우
        if (userOptional.isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid username or password");
            return ResponseEntity.status(401).body(errorResponse);
        }
        User user = userOptional.get();
        // PasswordEncoder를 사용하여 비밀번호 비교
        // 사용자가 입력한 평문 비밀번호와 DB의 암호화된 비밀번호를 비교
        if (!passwordEncoder.matches(authDTO.getPw(), user.getPwHash())) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid username or password");
            return ResponseEntity.status(401).body(errorResponse);
        }
        // 액세스 토큰 생성
        String accessToken = jwtTokenProvider.createAccessToken(String.valueOf(user.getId()));
        // 리프레시 토큰 생성
        String refreshToken = jwtTokenProvider.createRefreshToken(String.valueOf(user.getId()));
        // 서버에도 보관해 재발급 때 대조한다 (로그아웃으로 무효화하기 위함)
        userService.saveRefreshToken(user.getId(), refreshToken);
        // 리프레시 토큰을 HttpOnly 쿠키로 설정
        ResponseCookie cookie = refreshTokenCookie(refreshToken, jwtTokenProvider.getRefreshTokenExpSec());
        // 액세스 토큰은 JSON 응답으로, 리프레시 토큰은 쿠키 헤더에 담아 전송
        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", accessToken);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
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
        if (refreshToken != null && jwtTokenProvider.validateRefreshToken(refreshToken)) {
            userService.clearRefreshToken(Long.parseLong(jwtTokenProvider.getUserIdFromRefreshToken(refreshToken)));
        }
        // 만료된 빈 쿠키로 덮어써 브라우저에서도 지운다
        // (속성이 로그인 때와 같아야 브라우저가 같은 쿠키로 인식해 덮어쓴다)
        ResponseCookie expired = refreshTokenCookie("", 0);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expired.toString())
                .build();
    }
}
