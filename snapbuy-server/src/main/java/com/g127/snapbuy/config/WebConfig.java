package com.g127.snapbuy.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // cho tất cả API
                .allowedOrigins("http://localhost:5173") // cho React được gọi
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // các method được phép
                .allowedHeaders("*"); // cho tất cả headers
    }
}
