package com.mvc.facilitybookingms.security;

import com.mvc.facilitybookingms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component("userSecurity")
@RequiredArgsConstructor
public class UserSecurityService {

    private final UserRepository userRepository;

    public boolean isSelf(Long userId, String email) {
        return userRepository.findByEmail(email)
                .map(user -> user.getId().equals(userId))
                .orElse(false);
    }
}
