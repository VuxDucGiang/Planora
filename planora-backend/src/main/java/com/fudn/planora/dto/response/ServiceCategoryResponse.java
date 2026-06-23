// ServiceCategoryResponse.java
package com.fudn.planora.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceCategoryResponse {
    private Long id;
    private String name;
}