package com.helpdesk.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security configuration for WebSocket connections
 */
@Configuration
public class WebSocketSecurityConfig {

    @Bean
    public SecurityFilterChain websocketSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.ignoringRequestMatchers("/ws/**"))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/ws/**").authenticated()
            );
            
        return http.build();
    }
}
