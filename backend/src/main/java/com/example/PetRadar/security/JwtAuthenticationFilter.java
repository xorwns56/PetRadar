package com.example.PetRadar.security;

import com.example.PetRadar.auth.AuthService;
import com.example.PetRadar.user.User;
import com.example.PetRadar.user.UserDTO;
import com.example.PetRadar.user.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    /** 알림 스트림(SSE). 이 경로만 쿠키로 인증한다 — 아래 authenticateFromCookie 참고 */
    private static final String STREAM_PATH = "/api/notification/stream";

    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;
    private final AuthService authService;
    private final SecurityErrorResponder responder;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken == null && STREAM_PATH.equals(request.getRequestURI())) {
            // 실패하면 인증 없이 통과시킨다. 이 경로는 SecurityConfig에서
            // authenticated()라 EntryPoint가 다른 경로와 같은 모양의 401을 돌려준다
            authenticateFromCookie(request);
        } else if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String accessToken = bearerToken.substring(7);
            try {
                if (jwtTokenProvider.validateAccessToken(accessToken)) {
                    authenticate(accessToken, request);
                } else {
                    String refreshToken = extractRefreshTokenFromCookie(request);
                    // 서명·만료가 유효해도 서버가 마지막에 발급한 토큰이 아니면 거부한다
                    // (로그아웃했거나 다른 기기에서 새로 로그인한 경우)
                    if (refreshToken != null && jwtTokenProvider.validateRefreshToken(refreshToken)
                            && authService.isIssuedRefreshToken(refreshToken)) {
                        String userId = jwtTokenProvider.getUserIdFromRefreshToken(refreshToken);
                        String newAccessToken = jwtTokenProvider.createAccessToken(userId);
                        response.setHeader("Authorization", newAccessToken);
                        authenticate(newAccessToken, request);
                    }else {
                        unauthorized(response);
                        return;
                    }
                }
            }catch (Exception e) {
                unauthorized(response);
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    /**
     * 알림 스트림을 HttpOnly 쿠키만으로 인증한다.
     *
     * 브라우저의 EventSource는 요청에 헤더를 붙일 수 없다. 예전 소켓은 같은 제약을
     * 쿼리 파라미터(`?token=`)로 피했는데, 그러면 액세스 토큰이 URL에 실려 nginx
     * 액세스 로그와 브라우저 히스토리에 남는다. 쿠키는 그 경로로 새지 않는다.
     *
     * 리프레시 토큰을 쓰는 것은 서버가 **마지막에 발급한 것인지 DB와 맞춰볼 수**
     * 있어서다(로그아웃하면 즉시 끊긴다). 받아들이는 곳은 이 경로 하나이고,
     * 하는 일은 읽기뿐이다.
     */
    private void authenticateFromCookie(HttpServletRequest request) {
        String refreshToken = extractRefreshTokenFromCookie(request);
        if (refreshToken == null) {
            return;
        }
        try {
            if (jwtTokenProvider.validateRefreshToken(refreshToken)
                    && authService.isIssuedRefreshToken(refreshToken)) {
                String userId = jwtTokenProvider.getUserIdFromRefreshToken(refreshToken);
                authenticate(jwtTokenProvider.createAccessToken(userId), request);
            }
        } catch (Exception e) {
            // 인증 없이 통과한다. 끝나지 않는 응답을 여기서 직접 쓰기 시작하면
            // 클라이언트가 스트림으로 오해하므로 응답에 손대지 않는다
        }
    }

    /**
     * 인증 실패 응답.
     * sendError()를 쓰면 컨테이너가 /error로 에러 디스패치를 하는데, 그 경로가 404를 돌려주는 탓에
     * 클라이언트에 401이 아닌 404가 전달됐다. 프론트는 401일 때만 로그아웃 처리를 하므로
     * 상태 코드를 직접 지정해 에러 디스패치를 타지 않게 한다.
     */
    private void unauthorized(HttpServletResponse response) throws IOException {
        responder.write(response, HttpStatus.UNAUTHORIZED, "로그인이 만료되었습니다. 다시 로그인해주세요.");
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        for (Cookie cookie : request.getCookies()) {
            if ("refreshToken".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private void authenticate(String accessToken, HttpServletRequest request) {
        String userId = jwtTokenProvider.getUserIdFromAccessToken(accessToken);
        UserDTO userDTO = userService.findById(Long.parseLong(userId));
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                String.valueOf(userDTO.getId()),
                "",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}