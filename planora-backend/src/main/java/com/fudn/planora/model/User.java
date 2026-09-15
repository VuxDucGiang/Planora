package com.fudn.planora.model;

import com.fudn.planora.enums.ERole;
import com.fudn.planora.enums.EUserProvider;
import com.fudn.planora.enums.EUserStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity(name = "User")
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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private UserAddress userAddress;

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

    // ==========================================
    // Nested Entity: Role
    // ==========================================
    @Entity(name = "Role")
    @Table(name = "roles")
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Role {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Enumerated(EnumType.STRING)
        @Column(name = "role_name", nullable = false, unique = true)
        private ERole roleName;
    }

    // ==========================================
    // Nested Entity: UserAddress
    // ==========================================
    @Entity(name = "UserAddress")
    @Table(name = "user_addresses")
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class UserAddress {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @OneToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id")
        private User user;

        private String city;
        private String district;
        private String ward;

        @Column(name = "detail_address")
        private String detailAddress;

        @Column(name = "created_at", updatable = false)
        private LocalDateTime createAt;

        @PrePersist
        public void onCreate() {
            createAt = LocalDateTime.now();
        }
    }
}
