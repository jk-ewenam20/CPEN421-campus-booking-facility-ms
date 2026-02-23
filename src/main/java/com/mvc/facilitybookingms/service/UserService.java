package com.mvc.facilitybookingms.service;

import com.mvc.facilitybookingms.dto.UserRequestDTO;
import com.mvc.facilitybookingms.dto.UserResponseDTO;

import java.util.List;

public interface UserService {

    UserResponseDTO createUser(UserRequestDTO request);

    List<UserResponseDTO> getAllUsers();

    UserResponseDTO getUserById(Long id);

    void deleteUser(Long id);

    UserResponseDTO updateUser(Long id, UserRequestDTO request);
}
