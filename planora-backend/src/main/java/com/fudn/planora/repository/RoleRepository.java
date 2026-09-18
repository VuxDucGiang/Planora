package com.fudn.planora.repository;

import com.fudn.planora.entity.Role;
import com.fudn.planora.enums.ERole;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByRoleName(ERole roleName);
}
