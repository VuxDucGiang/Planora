package com.fudn.planora.entity;


import com.fudn.planora.enums.EUserProvider;
import com.fudn.planora.enums.EUserStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String email;

    private String password;
    @Column(name = "full_name", nullable = false)
    private String fullname;
    private String phone;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider")
    private EUserProvider eUserProvider;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EUserStatus eUserStatus;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (eUserProvider == null) {
            eUserProvider = EUserProvider.LOCAL;
        }

        if (eUserStatus == null) {
            eUserStatus = EUserStatus.ACTIVE;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
