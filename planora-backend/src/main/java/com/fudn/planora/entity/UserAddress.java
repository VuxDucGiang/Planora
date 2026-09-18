package com.fudn.planora.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_addresses")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class UserAddress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    private User user;

    private String city;
    private String district;
    private String ward;

    @Column(name = "detail_address")
    private String detailAddress;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createAt;

    @PrePersist
    public void onCreate(){
        createAt = LocalDateTime.now();
    }
}
