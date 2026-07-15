package com.zyptox.backend.controller;

import com.zyptox.backend.dto.request.RegisterRequest;
import com.zyptox.backend.dto.response.RegisterResponse;
import com.zyptox.backend.dto.request.LoginRequest;
import com.zyptox.backend.dto.response.LoginResponse;
import com.zyptox.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        return userService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return userService.login(request);
    }
}