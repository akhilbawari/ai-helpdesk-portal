package com.helpdesk.service.dto;

import com.helpdesk.model.Profile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String email;
    private String password;
    private String fullName;
    private Profile.Role role;
    private Profile.Department department;
}
