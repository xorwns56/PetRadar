package com.example.PetRadar.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {
    // 보안 강화를 위해 액세스 토큰과 리프레시 토큰에 다른 서명 키를 사용
    // 설정값에서 주입받는다. 이전처럼 기동 시마다 새로 만들면 재배포할 때마다
    // 모든 사용자의 토큰이 무효가 되고, 인스턴스를 늘리면 서로 검증하지 못한다
    private final Key accessTokenKey;
    private final Key refreshTokenKey;

    // 액세스 토큰 유효 기간 (10분)
    private static final long ACCESS_TOKEN_EXPIRATION = 1000 * 60 * 10;
    // 리프레시 토큰 유효 기간 (하루)
    private static final long REFRESH_TOKEN_EXPIRATION = 1000 * 60 * 60 * 24;

    public JwtTokenProvider(
            @Value("${jwt.access-secret}") String accessSecret,
            @Value("${jwt.refresh-secret}") String refreshSecret) {
        this.accessTokenKey = toKey(accessSecret, "jwt.access-secret");
        this.refreshTokenKey = toKey(refreshSecret, "jwt.refresh-secret");
    }

    // HS256은 최소 256비트(32바이트) 키를 요구한다. 짧으면 기동 시점에 바로 알 수 있게 막는다
    private Key toKey(String secret, String propertyName) {
        byte[] bytes = secret == null ? new byte[0] : secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException(propertyName + " 값이 32바이트 이상이어야 합니다.");
        }
        return Keys.hmacShaKeyFor(bytes);
    }

    public long getRefreshTokenExpSec() {
        return REFRESH_TOKEN_EXPIRATION / 1000; // 밀리초 -> 초 변환
    }

    public String createAccessToken(String userId) {
        Date now = new Date();
        return Jwts.builder()
                .setSubject(userId)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + ACCESS_TOKEN_EXPIRATION))
                .signWith(accessTokenKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String createRefreshToken(String userId) {
        Date now = new Date();
        return Jwts.builder()
                .setSubject(userId)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + REFRESH_TOKEN_EXPIRATION))
                .signWith(refreshTokenKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateAccessToken(String accessToken) {
        try {
            Jwts.parserBuilder().setSigningKey(accessTokenKey).build().parseClaimsJws(accessToken);
            return true;
        } catch (SignatureException | ExpiredJwtException e) {
            // 토큰 서명이 유효하지 않거나 만료된 경우
            return false;
        } catch (Exception e) {
            // 기타 다른 예외 처리
            return false;
        }
    }

    public boolean validateRefreshToken(String refreshToken) {
        try {
            Jwts.parserBuilder().setSigningKey(refreshTokenKey).build().parseClaimsJws(refreshToken);
            return true;
        } catch (SignatureException | ExpiredJwtException e) {
            return false;
        } catch (Exception e){
            // 기타 예외
            return false;
        }
    }


    public String getUserIdFromAccessToken(String accessToken) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(accessTokenKey)
                .build()
                .parseClaimsJws(accessToken)
                .getBody();
        return claims.getSubject();
    }

    public String getUserIdFromRefreshToken(String refreshToken) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(refreshTokenKey)
                .build()
                .parseClaimsJws(refreshToken)
                .getBody();
        return claims.getSubject();
    }
}
