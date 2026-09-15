package com.fudn.planora.configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import lombok.Getter;
import lombok.Setter;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import static io.swagger.v3.oas.models.security.SecurityScheme.Type.HTTP;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "swagger")
public class SwaggerConfiguration {

    private String appName = "Planora Wedding Planning API";
    private String appDescription = "Planora Wedding Planning Platform API - Comprehensive Wedding Coordination System";
    private String appVersion = "1.0.0";
    private String appLicense = "Apache 2.0";
    private String appLicenseUrl = "https://www.apache.org/licenses/LICENSE-2.0.html";
    private String contactName = "Planora Team";
    private String contactUrl = "https://planora.vn";
    private String contactMail = "contact@planora.vn";

    @Bean
    public OpenAPI openAPI() {
        final Info apiInformation = getApiInformation();
        final Components components = new Components();

        final String schemeName = "bearerAuth";
        components.addSecuritySchemes(schemeName,
                new SecurityScheme()
                        .name(schemeName)
                        .type(HTTP)
                        .scheme("Bearer")
                        .bearerFormat("JWT"));

        final OpenAPI openAPI = new OpenAPI();
        openAPI.setInfo(apiInformation);
        openAPI.setComponents(components);
        openAPI.addSecurityItem(new SecurityRequirement().addList(schemeName));

        return openAPI;
    }

    private Info getApiInformation() {
        final License license = new License();
        license.setName(appLicense);
        license.setUrl(appLicenseUrl);

        final Contact contact = new Contact();
        contact.setName(contactName);
        contact.setUrl(contactUrl);
        contact.setEmail(contactMail);

        final Info info = new Info();
        info.setTitle(appName);
        info.setVersion(appVersion);
        info.setDescription(appDescription);
        info.setLicense(license);
        info.setContact(contact);

        return info;
    }

    @Bean
    public GroupedOpenApi defaultApi() {
        return GroupedOpenApi.builder()
                .group("Planora API")
                .pathsToMatch("/api/**")
                .build();
    }

    @Bean
    public GroupedOpenApi managementApi() {
        return GroupedOpenApi.builder()
                .group("Actuator Management")
                .pathsToMatch("/actuator/**")
                .build();
    }
}
