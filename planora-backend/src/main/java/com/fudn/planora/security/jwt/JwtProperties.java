package com.fudn.planora.security.jwt;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

    private String secret = "c3VwZXJfc2VjcmV0X2tleV9wbGFub3JhX3BsYXRmb3JtX2tleV8xMjM0NTY3ODkw";

    private long expiration = 86400000L; // 24 hours in milliseconds

    private String issuer = "planora.vn";
}
