package com.mvc.facilitybookingms.security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TokenStore {

    private final ConcurrentHashMap<String, Authentication> store = new ConcurrentHashMap<>();

    public String store(Authentication authentication) {
        String token = UUID.randomUUID().toString();
        store.put(token, authentication);
        return token;
    }

    public Optional<Authentication> find(String token) {
        return Optional.ofNullable(store.get(token));
    }

    public void remove(String token) {
        if (token != null) {
            store.remove(token);
        }
    }
}
