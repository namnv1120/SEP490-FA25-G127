package com.g127.snapbuy.admin.controller;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class TestPasswordController {
    
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    
    @GetMapping("/hash/{password}")
    public String hashPassword(@PathVariable String password) {
        String hash = encoder.encode(password);
        boolean matches = encoder.matches(password, hash);
        return String.format("Password: %s\nHash: %s\nMatches: %s", password, hash, matches);
    }
}
