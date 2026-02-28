package com.mvc.facilitybookingms.config;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.core.env.Environment;

public class DatabaseUrlCondition implements Condition {

    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        Environment env = context.getEnvironment();
        return hasValue(env, "DATABASE_URL") || hasValue(env, "DB_URL") || hasValue(env, "SPRING_DATASOURCE_URL");
    }

    private boolean hasValue(Environment env, String name) {
        String v = env.getProperty(name);
        return v != null && !v.isBlank();
    }
}
