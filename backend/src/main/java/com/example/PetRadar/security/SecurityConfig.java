package com.example.PetRadar.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;
    private final RestAccessDeniedHandler accessDeniedHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // @AuthenticationPrincipal로 로그인 사용자를 전제하는 곳은 전부 여기서 막는다.
                // 빠뜨리면 인증 없이 들어와 userDetails가 null인 채로 컨트롤러에 닿아 500이 된다
                .authorizeHttpRequests(authz -> authz
                        // 내 글 목록은 /api/missing/{id} 공개 조회보다 먼저 걸러야 한다
                        .requestMatchers(HttpMethod.GET, "/api/missing/me").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/missing").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/missing/*").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/missing/*").authenticated()
                        // 제보에도 작성자를 남긴다. 익명 제보는 받지 않는다 (조회는 공개)
                        .requestMatchers(HttpMethod.POST, "/api/report/missing/*").authenticated()
                        .requestMatchers("/api/user/me").authenticated()
                        .requestMatchers("/api/notification/**").authenticated()
                        .anyRequest().permitAll()
                )
                // 필터 단계 실패는 GlobalExceptionHandler가 닿지 않아 Spring 기본 본문으로 나간다.
                // 컨트롤러와 같은 {message, errors} 형식으로 맞춘다
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public static PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}