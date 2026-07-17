package com.zyptox.backend.controller;

import com.zyptox.backend.dto.UserSession;
import com.zyptox.backend.dto.request.LoginRequest;
import com.zyptox.backend.dto.request.RegisterRequest;
import com.zyptox.backend.dto.response.LoginResponse;
import com.zyptox.backend.dto.response.RegisterResponse;
import com.zyptox.backend.dto.response.UserInfoResponse;
import com.zyptox.backend.entity.User;
import com.zyptox.backend.repository.UserRepository;
import com.zyptox.backend.service.SessionService;
import com.zyptox.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final SessionService sessionService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        return userService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return userService.login(request);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            sessionService.deleteSession(token);
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public UserInfoResponse getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserSession)) {
            throw new IllegalArgumentException("Not authenticated");
        }
        UserSession session = (UserSession) authentication.getPrincipal();
        User user = userRepository.findById(session.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String token = "";
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        return new UserInfoResponse(user.getUsername(), user.getBalance(), token);
    }
}