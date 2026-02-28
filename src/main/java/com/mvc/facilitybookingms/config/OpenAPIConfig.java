package com.mvc.facilitybookingms.config;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@SecurityScheme(
        name = "cookieAuth",
        type = SecuritySchemeType.APIKEY,
        in = SecuritySchemeIn.COOKIE,
        paramName = "JSESSIONID",
        description = "Session cookie obtained by logging in via POST /auth/login"
)
@Configuration
public class OpenAPIConfig {

    @Value("${app.server.url:http://localhost:8080}")
    private String serverUrl;

    @Bean
    public OpenAPI openAPI() {
        Server localServer = new Server()
                .url("http://localhost:8080")
                .description("Development Server");

        Server configuredServer = new Server()
                .url(serverUrl)
                .description("Configured Server");

        Contact contact = new Contact()
                .name("Facility Booking Team")
                .email("support@facilitybooking.com");

        Info info = new Info()
                .title("Facility Booking Microservice API")
                .version("1.0.0")
                .description("API documentation for managing facility bookings, facilities, and users. " +
                        "Login via POST /auth/login to receive a session cookie, then use it for authenticated requests.")
                .contact(contact)
                .license(new License()
                        .name("Apache 2.0")
                        .url("https://www.apache.org/licenses/LICENSE-2.0.html"));

        return new OpenAPI()
                .info(info)
                .servers(List.of(localServer, configuredServer))
                .addSecurityItem(new SecurityRequirement().addList("cookieAuth"));
    }
}
