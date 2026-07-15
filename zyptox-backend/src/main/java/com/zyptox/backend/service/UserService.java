package com.zyptox.backend.service;

import com.zyptox.backend.dto.request.RegisterRequest;
import com.zyptox.backend.dto.response.RegisterResponse;
import com.zyptox.backend.dto.request.LoginRequest;
import com.zyptox.backend.dto.response.LoginResponse;
import com.zyptox.backend.dto.UserSession;
import com.zyptox.backend.entity.User;
import com.zyptox.backend.repository.UserRepository;
import com.zyptox.backend.exception.ResourceAlreadyExistsException;
import com.zyptox.backend.exception.InvalidCredentialsException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessionService sessionService;

    public RegisterResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already exists");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResourceAlreadyExistsException("Username already exists");
        }

        // Generate starting balance between 1000 and 10000
        double minBalance = 1000.0;
        double maxBalance = 10000.0;
        double randomValue = minBalance + new Random().nextDouble() * (maxBalance - minBalance);
        BigDecimal startingBalance = BigDecimal.valueOf(randomValue).setScale(8, RoundingMode.HALF_UP);

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .balance(startingBalance)
                .createdAt(Instant.now())
                .build();

        User savedUser = userRepository.save(user);

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail()
        );
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new InvalidCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        UserSession session = new UserSession(user.getId(), user.getUsername(), user.getEmail());
        String token = sessionService.createSession(session);

        return new LoginResponse(token, user.getUsername(), user.getEmail());
    }
}