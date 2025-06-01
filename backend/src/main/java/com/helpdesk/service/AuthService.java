package com.helpdesk.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.helpdesk.model.Profile;
import com.helpdesk.repository.ProfileRepository;
import com.helpdesk.service.dto.AuthRequest;
import com.helpdesk.service.dto.AuthResponse;
import com.helpdesk.service.dto.OAuthRequest;
import com.helpdesk.service.dto.RegisterRequest;
import lombok.RequiredArgsConstructor;
import com.helpdesk.config.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    

    
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    
    @Value("${oauth.google.client-id}")
    private String googleClientId;
    
    @Value("${oauth.google.redirect-uri}")
    private String googleRedirectUri;
    
    // Google uses a client secret in production, but for this demo we're using a public client
    private static final String GOOGLE_CLIENT_SECRET = "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"; // Empty for public clients
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (profileRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }
        
        // Create profile in our database with encrypted password
        Profile profile = Profile.builder()
                .id(UUID.randomUUID().toString())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole() != null ? request.getRole() : Profile.Role.EMPLOYEE)
                .department(request.getDepartment())
                .authProvider("local")
                .emailVerified(false)
                .build();
        
        profileRepository.save(profile);
        
        // Generate JWT token
        UserDetailsImpl userDetails = new UserDetailsImpl(profile);
        String jwtToken = jwtService.generateToken(userDetails);
        
        return AuthResponse.builder()
                .token(jwtToken)
                .userId(profile.getId())
                .email(profile.getEmail())
                .role(profile.getRole().name())
                .name(profile.getFullName())
                .profilePicture(profile.getProfilePicture())
                .build();
    }
    
    @Transactional(readOnly = true)
    public AuthResponse authenticate(AuthRequest request) {
        try {
            // Authenticate with Spring Security
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            // Find profile in our database
            Profile profile = profileRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            
            // Generate JWT token
            String jwtToken = jwtService.generateToken(userDetails);
            
            return AuthResponse.builder()
                    .token(jwtToken)
                    .userId(profile.getId())
                    .email(profile.getEmail())
                    .role(profile.getRole().name())
                    .name(profile.getFullName())
                    .profilePicture(profile.getProfilePicture())
                    .build();
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid email or password");
        }
    }
    
    @Transactional
    public AuthResponse authenticateWithGoogle(OAuthRequest request) {
        try {
            // Verify the Google ID token
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();
            
            GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken == null) {
                throw new BadCredentialsException("Invalid Google ID token");
            }
            
            // Get user information from the token
            Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");
            String googleId = payload.getSubject();
            boolean emailVerified = payload.getEmailVerified();
            
            // Check if user exists
            Profile profile = profileRepository.findByEmail(email).orElse(null);
            
            if (profile == null) {
                // Create new user
                Map<String, Object> providerData = new HashMap<>();
                providerData.put("sub", googleId);
                providerData.put("picture", pictureUrl);
                
                profile = Profile.builder()
                        .id(UUID.randomUUID().toString())
                        .email(email)
                        .fullName(name)
                        .profilePicture(pictureUrl)
                        .role(Profile.Role.EMPLOYEE) // Default role
                        .authProvider("google")
                        .providerId(googleId)
                        .emailVerified(emailVerified)
                        .providerData(providerData)
                        .build();
                
                profileRepository.save(profile);
            } else {
                // Update existing user with Google info if they're using Google auth
                if (profile.getAuthProvider() == null || profile.getAuthProvider().equals("google")) {
                    Map<String, Object> providerData = new HashMap<>();
                    providerData.put("sub", googleId);
                    providerData.put("picture", pictureUrl);
                    
                    profile.setAuthProvider("google");
                    profile.setProviderId(googleId);
                    profile.setFullName(name);
                    profile.setProfilePicture(pictureUrl);
                    profile.setEmailVerified(emailVerified);
                    profile.setProviderData(providerData);
                    
                    profileRepository.save(profile);
                } else if (!profile.getAuthProvider().equals("google")) {
                    // User exists but used a different auth method
                    throw new BadCredentialsException("Email already registered with a different authentication method");
                }
            }
            
            // Generate JWT token
            UserDetailsImpl userDetails = new UserDetailsImpl(profile);
            String jwtToken = jwtService.generateToken(userDetails);
            
            return AuthResponse.builder()
                    .token(jwtToken)
                    .userId(profile.getId())
                    .email(profile.getEmail())
                    .role(profile.getRole().name())
                    .name(profile.getFullName())
                    .profilePicture(profile.getProfilePicture())
                    .build();
            
        } catch (GeneralSecurityException | IOException e) {
            throw new BadCredentialsException("Google authentication failed: " + e.getMessage());
        }
    }
    
    /**
     * Handle the OAuth callback from Google
     * Exchanges the authorization code for tokens and user info
     * 
     * @param code The authorization code from Google
     * @return AuthResponse containing the JWT token and user info
     */
    @Transactional
    public AuthResponse handleGoogleCallback(String code) {
        try {
            // Exchange the authorization code for tokens
            GoogleTokenResponse tokenResponse = new GoogleAuthorizationCodeTokenRequest(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance(),
                    googleClientId,
                    GOOGLE_CLIENT_SECRET,
                    code,
                    googleRedirectUri)
                    .execute();
            
            // Get ID token and verify it
            String idTokenString = tokenResponse.getIdToken();
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();
            
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new BadCredentialsException("Invalid Google ID token");
            }
            
            // Get user information from the token
            Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");
            String googleId = payload.getSubject();
            boolean emailVerified = payload.getEmailVerified();
            
            // Check if user exists
            Profile profile = profileRepository.findByEmail(email).orElse(null);
            
            if (profile == null) {
                // Create new user
                Map<String, Object> providerData = new HashMap<>();
                providerData.put("sub", googleId);
                providerData.put("picture", pictureUrl);
                
                profile = Profile.builder()
                        .id(UUID.randomUUID().toString())
                        .email(email)
                        .fullName(name)
                        .profilePicture(pictureUrl)
                        .role(Profile.Role.EMPLOYEE) // Default role
                        .authProvider("google")
                        .providerId(googleId)
                        .emailVerified(emailVerified)
                        .providerData(providerData)
                        .build();
                
                profileRepository.save(profile);
            } else {
                // Update existing user with Google info if they're using Google auth
                if (profile.getAuthProvider() == null || profile.getAuthProvider().equals("google")) {
                    Map<String, Object> providerData = new HashMap<>();
                    providerData.put("sub", googleId);
                    providerData.put("picture", pictureUrl);
                    
                    profile.setAuthProvider("google");
                    profile.setProviderId(googleId);
                    profile.setFullName(name);
                    profile.setProfilePicture(pictureUrl);
                    profile.setEmailVerified(emailVerified);
                    profile.setProviderData(providerData);
                    
                    profileRepository.save(profile);
                } else if (!profile.getAuthProvider().equals("google")) {
                    // User exists but used a different auth method
                    throw new BadCredentialsException("Email already registered with a different authentication method");
                }
            }
            
            // Generate JWT token
            UserDetailsImpl userDetails = new UserDetailsImpl(profile);
            String jwtToken = jwtService.generateToken(userDetails);

            System.out.println("Google OAuth callback: " + jwtToken);
            
            return AuthResponse.builder()
                    .token(jwtToken)
                    .userId(profile.getId())
                    .email(profile.getEmail())
                    .role(profile.getRole().name())
                    .name(profile.getFullName())
                    .profilePicture(profile.getProfilePicture())
                    .build();
            
        } catch (GeneralSecurityException | IOException e) {
            throw new BadCredentialsException("Google authentication failed: " + e.getMessage());
        }
    }
}
