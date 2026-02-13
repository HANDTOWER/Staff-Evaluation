package com.company.appearance.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI/Swagger configuration for API documentation.
 * Part of the config layer - defines API documentation and security scheme.
 * 
 * This configuration:
 * - Sets up Swagger UI at /swagger-ui/index.html
 * - Defines HTTP Bearer security scheme for JWT authentication
 * - Enables "Authorize" button in Swagger UI to input access tokens
 * 
 * Usage in Swagger UI:
 * 1. Call POST /api/auth/login to get access token
 * 2. Click "Authorize" button in Swagger UI
 * 3. Enter access token (without "Bearer " prefix)
 * 4. Test protected endpoints
 */
@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME = "bearerAuth";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Appearance Evaluation API")
                        .description("REST API for employee appearance evaluation system with JWT authentication")
                        .version("1.0"))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME))
                .components(new Components().addSecuritySchemes(
                        SECURITY_SCHEME,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter JWT access token (obtained from /api/auth/login)")
                ));
    }
}
