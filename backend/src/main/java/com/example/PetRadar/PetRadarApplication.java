package com.example.PetRadar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

// 보호소에 새로 들어온 아이를 주기적으로 살피려면 필요하다
// (@EnableAsync는 전체 발송 알림과 함께 없앴다 — 비동기로 돌릴 것이 남지 않았다)
@EnableScheduling
@SpringBootApplication
public class PetRadarApplication {
	public static void main(String[] args) {
		SpringApplication.run(PetRadarApplication.class, args);
	}
}
