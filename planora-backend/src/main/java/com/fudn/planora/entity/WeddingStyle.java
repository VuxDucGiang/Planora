package com.fudn.planora.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "wedding_styles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeddingStyle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

}
