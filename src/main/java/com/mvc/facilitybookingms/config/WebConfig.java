package com.mvc.facilitybookingms.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class WebConfig {
    // Jackson is fully configured via application.properties:
    //   spring.jackson.serialization.write-dates-as-timestamps=false
    //   spring.jackson.time-zone=UTC
    //   spring.jackson.default-property-inclusion=non_null
    // JavaTimeModule is auto-registered by Spring Boot when
    // jackson-datatype-jsr310 is present on the classpath.
}
