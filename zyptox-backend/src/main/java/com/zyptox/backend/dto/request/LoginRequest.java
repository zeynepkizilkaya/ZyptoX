package com.zyptox.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank
    private String username; // Can be username or email

    @NotBlank
    private String password;
}
