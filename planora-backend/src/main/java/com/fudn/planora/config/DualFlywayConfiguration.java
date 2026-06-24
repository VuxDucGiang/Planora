package com.fudn.planora.config;

import jakarta.annotation.PostConstruct;
import org.flywaydb.core.Flyway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DualFlywayConfiguration {

    private static final Logger log = LoggerFactory.getLogger(DualFlywayConfiguration.class);

    @Value("${AIVEN_DATASOURCE_URL:}")
    private String aivenUrl;

    @Value("${AIVEN_DATASOURCE_USERNAME:}")
    private String aivenUsername;

    @Value("${AIVEN_DATASOURCE_PASSWORD:}")
    private String aivenPassword;

    @PostConstruct
    public void migrateAivenDatabase() {
        if (aivenUrl == null || aivenUrl.trim().isEmpty()) {
            log.info("Aiven database URL is not configured (AIVEN_DATASOURCE_URL is empty). Skipping Aiven migration.");
            return;
        }

        log.info("-----------------------------------------------------------------");
        log.info("Starting secondary Flyway migration for Aiven database: {}", aivenUrl);
        log.info("-----------------------------------------------------------------");

        try {
            Flyway flyway = Flyway.configure()
                    .dataSource(aivenUrl, aivenUsername, aivenPassword)
                    .locations("classpath:db/migration")
                    .baselineOnMigrate(true)
                    .load();
            flyway.migrate();
            log.info("-----------------------------------------------------------------");
            log.info("Aiven database migration completed successfully.");
            log.info("-----------------------------------------------------------------");
        } catch (Exception e) {
            log.error("-----------------------------------------------------------------");
            log.error("Failed to run Flyway migration on Aiven database: {}", e.getMessage());
            log.error("-----------------------------------------------------------------", e);
        }
    }
}
