package com.mvc.facilitybookingms.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRequestDTO {

    @NotBlank
    private String name;

    @Email
    private String email;

    @NotBlank
    private String role; // STUDENT or ADMIN
}

