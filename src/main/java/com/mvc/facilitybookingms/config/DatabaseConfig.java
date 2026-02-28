package com.mvc.facilitybookingms.config;

import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Configuration
@Conditional(DatabaseUrlCondition.class)
public class DatabaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);

    @Bean
    @Primary
    public DataSource dataSource(Environment env) {
        String raw = firstNonBlank(env.getProperty("SPRING_DATASOURCE_URL"), env.getProperty("DB_URL"), env.getProperty("DATABASE_URL"));
        if (!StringUtils.hasText(raw)) {
            // Fallback: let Spring Boot auto-configure using spring.datasource.* properties (no override)
            // Build DataSource from spring.datasource.url if present
            String fallbackUrl = env.getProperty("spring.datasource.url");
            if (!StringUtils.hasText(fallbackUrl)) {
                // No datasource configuration available
                throw new IllegalStateException("No database configuration found. Set DATABASE_URL or SPRING_DATASOURCE_URL or spring.datasource.url");
            }
            logger.info("No DATABASE_URL detected; using spring.datasource.url fallback");
            DataSourceBuilder<?> fb = DataSourceBuilder.create().url(fallbackUrl).driverClassName("org.postgresql.Driver");
            String fu = env.getProperty("spring.datasource.username");
            String fp = env.getProperty("spring.datasource.password");
            if (StringUtils.hasText(fu)) fb.username(fu);
            if (StringUtils.hasText(fp)) fb.password(fp);
            logger.info("Using JDBC URL: {}", fallbackUrl);
            return fb.build();
        }

        String jdbcUrl = raw;
        String username = env.getProperty("SPRING_DATASOURCE_USERNAME", env.getProperty("DB_USERNAME"));
        String password = env.getProperty("SPRING_DATASOURCE_PASSWORD", env.getProperty("DB_PASSWORD"));

        try {
            if (!raw.startsWith("jdbc:")) {
                // Parse postgres://user:pass@host:port/db
                URI uri = new URI(raw);

                String userInfo = uri.getUserInfo();
                if (userInfo != null && userInfo.contains(":")) {
                    String[] up = userInfo.split(":", 2);
                    username = URLDecoder.decode(up[0], StandardCharsets.UTF_8);
                    password = URLDecoder.decode(up[1], StandardCharsets.UTF_8);
                }

                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath(); // includes leading '/'
                if (path == null || path.isBlank()) {
                    path = "/";
                }

                jdbcUrl = String.format("jdbc:postgresql://%s:%d%s", host, port, path);

                // If the URI contains query parameters (e.g. ?sslmode=require) append them to JDBC URL
                String query = uri.getQuery();
                if (query != null && !query.isBlank()) {
                    jdbcUrl = jdbcUrl + "?" + query;
                }
            }
        } catch (Exception ex) {
            logger.warn("Failed to parse database URI; falling back to using the raw value as JDBC URL. Error: {}", ex.getMessage());
            // If we fail to parse, fall back to using the raw value as jdbc URL and let the driver fail with clear error
        }

        logger.info("Detected database configuration; using JDBC URL: {}", jdbcUrl);

        DataSourceBuilder<?> builder = DataSourceBuilder.create()
                .url(jdbcUrl)
                .driverClassName("org.postgresql.Driver");

        if (StringUtils.hasText(username)) builder.username(username);
        if (StringUtils.hasText(password)) builder.password(password);

        return builder.build();
    }

    private static String firstNonBlank(String... vals) {
        for (String v : vals) {
            if (v != null && !v.isBlank()) return v;
        }
        return null;
    }
}
