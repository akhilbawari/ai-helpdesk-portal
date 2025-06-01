package com.helpdesk.repository;

import com.helpdesk.model.Profile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfileRepository extends MongoRepository<Profile, String> {
    Optional<Profile> findByEmail(String email);
    List<Profile> findByDepartment(Profile.Department department);
    List<Profile> findByRole(Profile.Role role);
}
