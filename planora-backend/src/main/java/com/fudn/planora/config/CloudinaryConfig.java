package com.fudn.planora.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", (cloudName != null && !cloudName.isBlank()) ? cloudName : "planora-cloud");
        config.put("api_key", (apiKey != null && !apiKey.isBlank()) ? apiKey : "1234567890");
        config.put("api_secret", (apiSecret != null && !apiSecret.isBlank()) ? apiSecret : "abcdefghijk");
        config.put("secure", "true");
        return new Cloudinary(config);
    }
}
