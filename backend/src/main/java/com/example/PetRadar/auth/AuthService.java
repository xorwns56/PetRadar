package com.example.PetRadar.auth;

import com.example.PetRadar.security.JwtTokenProvider;
import com.example.PetRadar.user.User;
import com.example.PetRadar.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 로그인·로그아웃·재발급 검증 등 인증 흐름을 담당한다.
 * 컨트롤러는 HTTP 매핑만 하고, 사용자 CRUD는 UserService가 맡는다.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /** 로그인 결과로 발급된 토큰 한 쌍 */
    public record Tokens(String accessToken, String refreshToken) {
    }

    /**
     * 아이디와 비밀번호를 확인하고 토큰을 발급한다.
     * Refresh Token은 서버에도 보관해 로그아웃 시 무효화할 수 있게 한다.
     *
     * @throws IllegalArgumentException 아이디가 없거나 비밀번호가 틀린 경우
     */
    @Transactional
    public Tokens login(String loginId, String password) {
        User user = userRepository.findByLoginId(loginId)
                .filter(u -> passwordEncoder.matches(password, u.getPwHash()))
                // 아이디가 없는 경우와 비밀번호가 틀린 경우를 구분하지 않는다 (계정 존재 여부 노출 방지)
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        String userId = String.valueOf(user.getId());
        String refreshToken = jwtTokenProvider.createRefreshToken(userId);
        user.setRefreshToken(refreshToken);

        return new Tokens(jwtTokenProvider.createAccessToken(userId), refreshToken);
    }

    /**
     * 저장된 Refresh Token을 지워 재발급을 막는다.
     * 토큰이 없거나 이미 유효하지 않으면 아무 것도 하지 않는다.
     */
    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || !jwtTokenProvider.validateRefreshToken(refreshToken)) {
            return;
        }
        Long userId = Long.parseLong(jwtTokenProvider.getUserIdFromRefreshToken(refreshToken));
        userRepository.findById(userId).ifPresent(user -> user.setRefreshToken(null));
    }

    /**
     * 서명과 만료가 유효해도, 서버가 마지막에 발급한 토큰과 다르면 거부한다.
     * 로그아웃했거나 다른 기기에서 새로 로그인한 뒤의 옛 토큰이 여기서 걸린다.
     */
    @Transactional(readOnly = true)
    public boolean isIssuedRefreshToken(String refreshToken) {
        Long userId = Long.parseLong(jwtTokenProvider.getUserIdFromRefreshToken(refreshToken));
        return userRepository.findById(userId)
                .map(user -> refreshToken.equals(user.getRefreshToken()))
                .orElse(false);
    }
}
