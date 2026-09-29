package com.example.PetRadar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.EnableAsync;

// 보호소에 새로 들어온 아이를 주기적으로 살피려면 필요하다
@EnableScheduling
@SpringBootApplication
@EnableAsync
public class PetRadarApplication {
	public static void main(String[] args) {
		SpringApplication.run(PetRadarApplication.class, args);
	}
}
