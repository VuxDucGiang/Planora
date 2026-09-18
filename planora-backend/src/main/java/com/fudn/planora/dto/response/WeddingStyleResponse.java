// WeddingStyleResponse.java
package com.fudn.planora.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeddingStyleResponse {
    private Long id;
    private String name;
    private String description;
}