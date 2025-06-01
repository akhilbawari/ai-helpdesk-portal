package com.helpdesk.config;

import com.helpdesk.model.Profile;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserDetailsImpl implements UserDetails {
    
    private final String id;
    private final String email;
    private final String password;
    private final String role;
    private final Profile profile;
    
    public UserDetailsImpl(Profile profile) {
        this.id = profile.getId();
        this.email = profile.getEmail();
        this.password = profile.getPassword();
        this.role = profile.getRole().name();
        this.profile = profile;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }
    
    @Override
    public String getPassword() {
        return password;
    }
    
    @Override
    public String getUsername() {
        // Use email as username for Spring Security
        return email;
    }
    
    // Additional method to get the user's ID
    public String getId() {
        return id;
    }
    
    // Method to get the user's profile
    public Profile getProfile() {
        return profile;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
}
