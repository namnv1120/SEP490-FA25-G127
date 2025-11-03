package com.g127.snapbuy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SnapbuyApplication {
	public static void main(String[] args) {
		SpringApplication.run(SnapbuyApplication.class, args);
	}
}
