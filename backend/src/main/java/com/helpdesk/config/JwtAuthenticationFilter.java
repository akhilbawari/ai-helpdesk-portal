package com.helpdesk.config;

import com.helpdesk.repository.ProfileRepository;
import com.helpdesk.service.JwtService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtService jwtService;
    private final ProfileRepository profileRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            final String authHeader = request.getHeader("Authorization");
            final String jwt;
            final String userId;
            
            // Skip token validation for paths that don't require authentication
            String requestPath = request.getServletPath();
            if (requestPath.startsWith("/auth/") || requestPath.startsWith("/oauth/") || 
                requestPath.equals("/ai/route-ticket")) {
                filterChain.doFilter(request, response);
                return;
            }
            
            // Check if Authorization header exists and has the correct format
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }
            
            // Extract and validate the JWT token
            jwt = authHeader.substring(7);
            try {
                // Now extractUsername actually returns the user ID
                userId = jwtService.extractUsername(jwt);
            } catch (ExpiredJwtException e) {
                logger.error("JWT token has expired: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("JWT token has expired");
                return;
            } catch (MalformedJwtException e) {
                logger.error("Invalid JWT token: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Invalid JWT token");
                return;
            } catch (UnsupportedJwtException e) {
                logger.error("JWT token is unsupported: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("JWT token is unsupported");
                return;
            } catch (SignatureException e) {
                logger.error("Invalid JWT signature: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Invalid JWT signature");
                return;
            } catch (IllegalArgumentException e) {
                logger.error("JWT claims string is empty: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("JWT claims string is empty");
                return;
            }
            
            // If we have a valid token and no authentication is set yet
            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                var userProfile = this.profileRepository.findById(userId).orElse(null);
                
                if (userProfile != null) {
                    UserDetails userDetails = new UserDetailsImpl(userProfile);
                    
                    if (jwtService.isTokenValid(jwt, userDetails)) {
                        // Create authentication token with user details and authorities
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                        
                        // Add request details to the authentication token
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        
                        // Set the authentication in the security context
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        logger.debug("User authenticated successfully: {}", userId);
                    } else {
                        logger.info("JWT token is valid for user: {}", userId);
                    }
                } else {
                    logger.warn("User not found for ID: {}", userId);
                }
            }
            
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Internal server error during authentication");
        }
    }
}
