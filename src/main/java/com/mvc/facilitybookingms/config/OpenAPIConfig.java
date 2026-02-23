package com.mvc.facilitybookingms.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI openAPI() {
        Server server = new Server()
                .url("http://localhost:8080")
                .description("Development Server");

        Contact contact = new Contact()
                .name("Facility Booking Team")
                .email("support@facilitybooking.com");

        Info info = new Info()
                .title("Facility Booking Microservice API")
                .version("1.0.0")
                .description("API documentation for managing facility bookings, facilities, and users")
                .contact(contact)
                .license(new License()
                        .name("Apache 2.0")
                        .url("https://www.apache.org/licenses/LICENSE-2.0.html"));

        return new OpenAPI()
                .info(info)
                .servers(List.of(server));
    }
}
