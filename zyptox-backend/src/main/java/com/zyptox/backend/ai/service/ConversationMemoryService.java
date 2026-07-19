package com.zyptox.backend.ai.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import com.zyptox.backend.ai.service.ConversationMemoryService;

@Service
public class ConversationMemoryService {

    private final Map<Long, List<String>> conversations = new ConcurrentHashMap<>();

    public List<String> getConversation(Long userId) {
        return conversations.computeIfAbsent(userId, k -> new ArrayList<>());
    }

    public void addUserMessage(Long userId, String message) {

        List<String> history = getConversation(userId);

        history.add("User: " + message);

        trim(history);
    }

    public void addAssistantMessage(Long userId, String message) {

        List<String> history = getConversation(userId);

        history.add("Assistant: " + message);

        trim(history);
    }

    private void trim(List<String> history) {

        while (history.size() > 10) {
            history.remove(0);
        }
    }

}