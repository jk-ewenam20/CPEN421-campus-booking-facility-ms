package com.mvc.facilitybookingms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponseDTO {

    private Long id;
    private String email;
    private String role;
    private String name;
    private String message;
    private String token;
}
