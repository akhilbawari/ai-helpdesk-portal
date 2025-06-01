package com.helpdesk.controller;

import com.helpdesk.dto.ApiResponse;
import com.helpdesk.model.Profile;
import com.helpdesk.service.AuthService;
import com.helpdesk.service.dto.AuthRequest;
import com.helpdesk.service.dto.AuthResponse;
import com.helpdesk.service.dto.OAuthRequest;
import com.helpdesk.service.dto.RegisterRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody RegisterRequest request) {
        log.info("Received registration request for email: {}", request.getEmail());
        try {
            AuthResponse response = authService.register(request);
            log.info("Registration successful for email: {}", request.getEmail());
            return ResponseEntity.ok(ApiResponse.success(response, "User registered successfully"));
        } catch (Exception e) {
            log.error("Registration failed for email: {}, error: {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody AuthRequest request) {
        log.info("Received login request for email: {}", request.getEmail());
        try {
            AuthResponse response = authService.authenticate(request);
            log.info("Login successful for email: {}", request.getEmail());
            return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
        } catch (Exception e) {
            log.error("Login failed for email: {}, error: {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }
    
    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleAuth(@RequestBody OAuthRequest request) {
        log.info("Received Google authentication request");
        try {
            AuthResponse response = authService.authenticateWithGoogle(request);
            log.info("Google authentication successful for email: {}", response.getEmail());
            return ResponseEntity.ok(ApiResponse.success(response, "Google authentication successful"));
        } catch (Exception e) {
            log.error("Google authentication failed, error: {}", e.getMessage());
            throw e;
        }
    }
}
