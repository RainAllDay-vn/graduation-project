package com.gr2.noc.settings.repository;

import com.gr2.noc.settings.model.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserPreferenceRepository extends JpaRepository<UserPreference, String> {

    Optional<UserPreference> findByEmailIgnoreCase(String email);
}
