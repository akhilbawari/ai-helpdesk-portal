package com.helpdesk.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OAuthRequest {
    private String idToken;
    private String provider; // "google", "github", etc.
    private String email;
    private String name;
    private String picture;
}
