package com.fudn.planora.repository;

import com.fudn.planora.entity.User;
import com.fudn.planora.enums.ERole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findUserByEmail(String email);

    Optional<User> findUserByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    long countByRoleRoleName(ERole roleName);
}
