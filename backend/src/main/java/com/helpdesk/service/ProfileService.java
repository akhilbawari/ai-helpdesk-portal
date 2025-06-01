package com.helpdesk.service;

import com.helpdesk.model.Profile;
import com.helpdesk.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ProfileService {
    
    private final ProfileRepository profileRepository;
    
    @Transactional(readOnly = true)
    public List<Profile> getAllProfiles() {
        return profileRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Profile getProfileById(String id) {
        return profileRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Profile not found with id: " + id));
    }
    
    @Transactional(readOnly = true)
    public Profile getProfileByEmail(String email) {
        return profileRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("Profile not found with email: " + email));
    }
    
    @Transactional(readOnly = true)
    public List<Profile> getProfilesByDepartment(Profile.Department department) {
        return profileRepository.findByDepartment(department);
    }
    
    @Transactional(readOnly = true)
    public List<Profile> getProfilesByRole(Profile.Role role) {
        return profileRepository.findByRole(role);
    }
    
    @Transactional
    public Profile createProfile(Profile profile) {
        return profileRepository.save(profile);
    }
    
    @Transactional
    public Profile updateProfile(String id, Profile profileDetails) {
        Profile profile = getProfileById(id);
        
        if (profileDetails.getFullName() != null) {
            profile.setFullName(profileDetails.getFullName());
        }
        
        if (profileDetails.getRole() != null) {
            profile.setRole(profileDetails.getRole());
        }
        
        if (profileDetails.getDepartment() != null) {
            profile.setDepartment(profileDetails.getDepartment());
        }
        
        return profileRepository.save(profile);
    }
    
    @Transactional
    public void deleteProfile(String id) {
        Profile profile = getProfileById(id);
        profileRepository.delete(profile);
    }
}
