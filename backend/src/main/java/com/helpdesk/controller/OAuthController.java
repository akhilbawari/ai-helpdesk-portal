package com.helpdesk.controller;

import com.helpdesk.dto.ApiResponse;
import com.helpdesk.dto.ErrorResponse;
import com.helpdesk.service.AuthService;
import com.helpdesk.service.dto.AuthResponse;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/oauth")
@RequiredArgsConstructor
@Slf4j
public class OAuthController {
    
    // Cache to store recently processed authorization codes and their responses
    private final ConcurrentHashMap<String, AuthResponse> authCodeCache = new ConcurrentHashMap<>();
    // Cache expiration time in milliseconds (5 minutes)
    private static final long CACHE_EXPIRATION_MS = TimeUnit.MINUTES.toMillis(5);

    private final AuthService authService;
    
    @Value("${oauth.google.client-id}")
    private String googleClientId;
    
    @Value("${oauth.google.redirect-uri}")
    private String googleRedirectUri;
    
    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    /**
     * Initiates Google OAuth flow by redirecting to Google's authorization endpoint
     */
    @GetMapping("/google")
    public void initiateGoogleAuth(HttpServletResponse response) throws IOException {
        log.info("Initiating Google OAuth flow");
        
        // Build the Google OAuth URL
        String googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";
        String scope = "email profile";
        
        String url = googleAuthUrl + "?client_id=" + googleClientId + 
                     "&redirect_uri=" + URLEncoder.encode(googleRedirectUri, StandardCharsets.UTF_8) + 
                     "&response_type=code" + 
                     "&scope=" + URLEncoder.encode(scope, StandardCharsets.UTF_8) + 
                     "&access_type=offline" + 
                     "&prompt=consent";
        
        log.info("Redirecting to Google OAuth URL " +url);
        response.sendRedirect(url);
    }
    
    /**
     * Handles the OAuth callback from Google
     * This endpoint receives the authorization code from Google and exchanges it for a token
     */
    @GetMapping("/google/callback")
    public ResponseEntity<ApiResponse<AuthResponse>> handleGoogleCallback(
            @RequestParam("code") String code, 
            @RequestParam(value = "error", required = false) String error) {
        
        log.info("Google OAuth callback received with code: {}", 
                code != null ? "[REDACTED]" : "null");
        
        try {
            if (error != null) {
                log.error("Google OAuth error: {}", error);
                return ResponseEntity.ok(ApiResponse.error("Authentication failed",HttpStatus.UNAUTHORIZED));

            }
            
            // Check if we've already processed this code recently
            AuthResponse cachedResponse = authCodeCache.get(code);
            if (cachedResponse != null) {
                log.info("Using cached token for authorization code");
                return ResponseEntity.ok(ApiResponse.success(cachedResponse, "Login successfully"));
            }
            
            // Process the code and get a JWT token
            AuthResponse authResponse = authService.handleGoogleCallback(code);
            
            // Cache the response for this authorization code
            authCodeCache.put(code, authResponse);
            
            // Schedule removal of cached code after expiration time
            new Thread(() -> {
                try {
                    Thread.sleep(CACHE_EXPIRATION_MS);
                    authCodeCache.remove(code);
                    log.info("Removed authorization code from cache after expiration");
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }).start();
            
            // Return JSON response with the token
            log.info("Returning token as JSON response");
            return ResponseEntity.ok(ApiResponse.success(cachedResponse, "Login successfully"));
            
        } catch (Exception e) {
            log.error("Error processing Google OAuth callback", e);
            return ResponseEntity.ok(ApiResponse.error("Authentication failed",HttpStatus.UNAUTHORIZED));

        }
    }
}
