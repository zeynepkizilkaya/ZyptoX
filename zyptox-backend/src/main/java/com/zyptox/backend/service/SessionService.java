package com.zyptox.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zyptox.backend.dto.UserSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String SESSION_KEY_PREFIX = "session:";
    private static final Duration SESSION_TTL = Duration.ofMinutes(30);

    public String createSession(UserSession session) {
        String token = UUID.randomUUID().toString();
        String key = SESSION_KEY_PREFIX + token;
        try {
            String json = objectMapper.writeValueAsString(session);
            redisTemplate.opsForValue().set(key, json, SESSION_TTL);
            return token;
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize session", e);
            throw new RuntimeException("Session creation failed", e);
        }
    }

    public Optional<UserSession> getSession(String token) {
        String key = SESSION_KEY_PREFIX + token;
        Object val = redisTemplate.opsForValue().get(key);
        if (val == null) {
            return Optional.empty();
        }
        try {
            UserSession session = objectMapper.readValue((String) val, UserSession.class);
            return Optional.of(session);
        } catch (JsonProcessingException e) {
            log.error("Failed to deserialize session", e);
            return Optional.empty();
        }
    }

    public void deleteSession(String token) {
        String key = SESSION_KEY_PREFIX + token;
        redisTemplate.delete(key);
    }
}
